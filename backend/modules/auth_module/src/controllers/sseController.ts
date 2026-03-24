/**
 * SSE (Server-Sent Events) Controller
 * Handles real-time event streaming for connected clients
 * Optimized for multi-user scalability
 */

import { Request, Response } from "express";
import { verifyAccessToken } from "../config/jwt";
import {
  addSSEConnection,
  removeSSEConnection,
  updateSSEActivity,
  getUserSSEConnections,
  getUserSSEConnectionCount,
  SSE_HEARTBEAT_INTERVAL,
  MAX_SSE_CONNECTIONS_PER_USER,
} from "../utils/sseManager";
import { redisClient } from "../config/redis";

const SSE_SUBSCRIBER_KEY = "sse:subscriber:";
const SSE_CHANNEL_PREFIX = "sse:user:";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const sendSSE = (res: Response, event: string, data: unknown): boolean => {
  if (res.writableEnded) return false;
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch {
    return false;
  }
};

const sendHeartbeat = (res: Response): boolean => {
  return sendSSE(res, "heartbeat", { timestamp: Date.now() });
};

/**
 * Notification stream endpoint
 * GET /api/v1/sse/notifications
 */
export const notificationStream = async (req: Request, res: Response): Promise<void> => {
  const token = req.query["token"] as string;
  if (!token) {
    res.status(401).json({ error: "Authentication token required" });
    return;
  }

  let userId: string;
  try {
    const decoded = verifyAccessToken(token);
    userId = decoded.userId;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const connectionId = `notif:${userId}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
  const added = await addSSEConnection(connectionId, userId, {
    ip: req.ip ?? null,
    userAgent: (req.headers["user-agent"] as string | undefined) ?? null,
  });
  if (!added) {
    res.status(429).json({
      error: "Maximum SSE connections reached",
      maxConnections: MAX_SSE_CONNECTIONS_PER_USER,
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  sendSSE(res, "connected", {
    connectionId,
    userId,
    connectedAt: new Date().toISOString(),
  });

  const subscriber = redisClient.duplicate();
  let subscriberReady = false;

  subscriber.on("error", (err) => {
    console.error(`[SSE] Subscriber error (${connectionId}):`, err);
  });

  subscriber.on("ready", async () => {
    if (subscriberReady) return;
    subscriberReady = true;

    await subscriber.subscribe(`${SSE_CHANNEL_PREFIX}${userId}`, (message) => {
      if (!res.writableEnded) {
        res.write(`data: ${message}\n\n`);
      }
    });
  });

  await subscriber.connect().catch((err) => {
    console.error(`[SSE] subscriber.connect() failed (${connectionId}):`, err);
  });

  await redisClient.set(`${SSE_SUBSCRIBER_KEY}${connectionId}`, userId, { EX: 86400 });

  let heartbeatCount = 0;
  const heartbeatInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeatInterval);
      return;
    }

    heartbeatCount++;
    if (sendHeartbeat(res)) {
      if (heartbeatCount % 2 === 0) {
        updateSSEActivity(connectionId);
      }
    } else {
      clearInterval(heartbeatInterval);
    }
  }, SSE_HEARTBEAT_INTERVAL);

  let cleanedUp = false;
  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeatInterval);

    try {
      await subscriber.unsubscribe(`${SSE_CHANNEL_PREFIX}${userId}`);
    } catch {
      // ignore
    }

    try {
      await subscriber.quit();
    } catch {
      // ignore
    }

    await removeSSEConnection(connectionId);
    await redisClient.del(`${SSE_SUBSCRIBER_KEY}${connectionId}`);
  };

  req.on("close", () => void cleanup());
  req.on("error", () => void cleanup());
};

/**
 * Session sync stream endpoint
 * GET /api/v1/sse/session
 */
export const sessionStream = async (req: Request, res: Response): Promise<void> => {
  const token = req.query["token"] as string;
  if (!token) {
    res.status(401).json({ error: "Authentication token required" });
    return;
  }

  let userId: string;
  try {
    const decoded = verifyAccessToken(token);
    userId = decoded.userId;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const connectionId = `session:${userId}:${Date.now()}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const sessionCount = await getUserSSEConnectionCount(userId);
  sendSSE(res, "connected", {
    connectionId,
    userId,
    activeSessions: sessionCount,
    connectedAt: new Date().toISOString(),
  });

  const subscriber = redisClient.duplicate();
  let subscriberReady = false;

  subscriber.on("error", (err) => {
    console.error(`[SSE] Session subscriber error (${connectionId}):`, err);
  });

  subscriber.on("ready", async () => {
    if (subscriberReady) return;
    subscriberReady = true;

    await subscriber.subscribe(`${SSE_CHANNEL_PREFIX}${userId}`, (message) => {
      if (res.writableEnded) return;

      try {
        const event = JSON.parse(message);
        if (event.type === "session_sync" || event.type === "notification") {
          res.write(`data: ${message}\n\n`);
        }
      } catch {
        res.write(`data: ${message}\n\n`);
      }
    });
  });

  await subscriber.connect().catch((err) => {
    console.error(`[SSE] Session subscriber.connect() failed (${connectionId}):`, err);
  });

  const heartbeatInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeatInterval);
      return;
    }

    if (!sendHeartbeat(res)) {
      clearInterval(heartbeatInterval);
    }
  }, SSE_HEARTBEAT_INTERVAL);

  let cleanedUp = false;
  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeatInterval);

    try {
      await subscriber.unsubscribe(`${SSE_CHANNEL_PREFIX}${userId}`);
    } catch {
      // ignore
    }

    try {
      await subscriber.quit();
    } catch {
      // ignore
    }
  };

  req.on("close", () => void cleanup());
  req.on("error", () => void cleanup());
};

/**
 * Get active connections for a user
 * GET /api/v1/sse/connections
 */
export const getActiveConnections = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const connections = await getUserSSEConnections(authReq.user.id);

  res.json({
    connections: connections.map((conn) => ({
      id: conn.id,
      createdAt: conn.createdAt,
      lastActivity: conn.lastActivity,
      ip: conn.ip,
      userAgent: conn.userAgent,
    })),
    activeCount: connections.length,
    maxConnections: MAX_SSE_CONNECTIONS_PER_USER,
  });
};
