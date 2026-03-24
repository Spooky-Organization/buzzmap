/**
 * SSE (Server-Sent Events) Connection Manager
 * Manages active SSE connections per user and handles broadcasting
 * Optimized for multi-user scalability
 */

import { redisClient } from "../config/redis";

const SSE_CONNECTIONS_KEY = "sse:connections";
const SSE_PREFIX = "sse:conn:";
const SSE_HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MAX_SSE_CONNECTIONS_PER_USER = 5; // Max SSE connections per user
const CONNECTION_TTL = 86400; // 24 hours in seconds

export interface SSEConnection {
  id: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  ip: string;
  userAgent: string;
  [key: string]: string | number;
}

export interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: string;
  id?: string;
}

export interface SSEStats {
  totalConnections: number;
  totalUsers: number;
  connectionsByUser: Record<string, number>;
}

/**
 * Check if user can add more SSE connections
 */
export const canAddSSEConnection = async (userId: string): Promise<boolean> => {
  const count = await getUserSSEConnectionCount(userId);
  return count < MAX_SSE_CONNECTIONS_PER_USER;
};

/**
 * Get current SSE connection count for a user
 */
export const getUserSSEConnectionCount = async (userId: string): Promise<number> => {
  return await redisClient.sCard(`${SSE_CONNECTIONS_KEY}:${userId}`);
};

/**
 * Add a new SSE connection
 */
export const addSSEConnection = async (
  connectionId: string,
  userId: string,
  metadata?: { ip?: string | null; userAgent?: string | null }
): Promise<boolean> => {
  const canAdd = await canAddSSEConnection(userId);
  if (!canAdd) {
    console.log(`[SSE] Connection limit reached for user ${userId}`);
    return false;
  }

  const connection: SSEConnection = {
    id: connectionId,
    userId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    ip: metadata?.ip ?? "",
    userAgent: metadata?.userAgent ?? "",
  };

  const pipeline = redisClient.multi();
  
  pipeline.set(`${SSE_PREFIX}${connectionId}`, JSON.stringify(connection), { EX: CONNECTION_TTL });
  pipeline.sAdd(`${SSE_CONNECTIONS_KEY}:${userId}`, connectionId);
  
  await pipeline.exec();
  return true;
};

/**
 * Remove an SSE connection
 */
export const removeSSEConnection = async (
  connectionId: string
): Promise<string | null> => {
  const connectionData = await redisClient.get(`${SSE_PREFIX}${connectionId}`);
  if (!connectionData) return null;

  const connection: SSEConnection = JSON.parse(connectionData);
  
  const pipeline = redisClient.multi();
  
  pipeline.del(`${SSE_PREFIX}${connectionId}`);
  pipeline.sRem(`${SSE_CONNECTIONS_KEY}:${connection.userId}`, connectionId);
  
  await pipeline.exec();
  
  return connection.userId;
};

/**
 * Get all SSE connections for a user (optimized with pipeline)
 */
export const getUserSSEConnections = async (
  userId: string
): Promise<SSEConnection[]> => {
  const connectionIds = await redisClient.sMembers(`${SSE_CONNECTIONS_KEY}:${userId}`);
  
  if (connectionIds.length === 0) return [];
  
  const pipeline = redisClient.multi();
  connectionIds.forEach((connId) => {
    pipeline.get(`${SSE_PREFIX}${connId}`);
  });
  
  const results = await pipeline.exec();
  if (!results) return [];
  
  const connections: SSEConnection[] = [];
  const staleIds: string[] = [];
  
  results.forEach((result, index) => {
    if (!Array.isArray(result)) return;
    const data = result[1] as string | null;
    if (!data) {
      staleIds.push(connectionIds[index] ?? "");
      return;
    }
    
    try {
      connections.push(JSON.parse(data));
    } catch {
      staleIds.push(connectionIds[index] ?? "");
    }
  });
  
  if (staleIds.length > 0) {
    const deletePipeline = redisClient.multi();
    staleIds.forEach((id) => {
      if (id) deletePipeline.sRem(`${SSE_CONNECTIONS_KEY}:${userId}`, id);
    });
    deletePipeline.exec().catch(() => {});
  }
  
  return connections;
};

/**
 * Update last activity for a connection (fire and forget for performance)
 */
export const updateSSEActivity = async (connectionId: string): Promise<void> => {
  const data = await redisClient.get(`${SSE_PREFIX}${connectionId}`);
  if (!data) return;
  
  try {
    const connection: SSEConnection = JSON.parse(data);
    connection.lastActivity = Date.now();
    
    redisClient.set(
      `${SSE_PREFIX}${connectionId}`,
      JSON.stringify(connection),
      { EX: CONNECTION_TTL }
    ).catch(() => {});
  } catch {
    // Ignore parse errors
  }
};

/**
 * Check if user has active SSE connection
 */
export const hasActiveSSEConnection = async (userId: string): Promise<boolean> => {
  const count = await getUserSSEConnectionCount(userId);
  return count > 0;
};

/**
 * Clean up stale connections using SCAN (memory efficient for large datasets)
 */
export const cleanupStaleConnections = async (): Promise<number> => {
  let cleaned = 0;
  const staleThreshold = Date.now() - (CONNECTION_TTL * 1000);
  let cursor = 0;
  
  do {
    const scanResult = await redisClient.scan(cursor.toString(), {
      MATCH: `${SSE_PREFIX}*`,
      COUNT: 100,
    });
    cursor = parseInt(scanResult.cursor, 10);
    const keys = scanResult.keys;
    
    if (keys.length === 0) continue;
    
    for (let i = 0; i < keys.length; i += 50) {
      const batch = keys.slice(i, i + 50);
      const pipeline = redisClient.multi();
      
      batch.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      
      if (!results) continue;
      
      const cleanupPipeline = redisClient.multi();
      let hasCleanup = false;
      
      results.forEach((result, index) => {
        if (!Array.isArray(result)) return;
        const data = result[1] as string | null;
        if (!data) return;
        
        try {
          const connection: SSEConnection = JSON.parse(data);
          if (connection.lastActivity < staleThreshold) {
            const batchKey = batch[index];
            if (batchKey) {
              cleanupPipeline.del(batchKey);
              cleanupPipeline.sRem(`${SSE_CONNECTIONS_KEY}:${connection.userId}`, connection.id);
              hasCleanup = true;
              cleaned++;
            }
          }
        } catch {
          const batchKey = batch[index];
          if (batchKey) {
            cleanupPipeline.del(batchKey);
            hasCleanup = true;
            cleaned++;
          }
        }
      });
      
      if (hasCleanup) {
        cleanupPipeline.exec().catch(() => {});
      }
    }
  } while (cursor !== 0);
  
  return cleaned;
};

/**
 * Broadcast event to all connections of a specific user (single Redis publish)
 */
export const broadcastToUser = async (
  userId: string,
  event: SSEEvent
): Promise<number> => {
  const count = await getUserSSEConnectionCount(userId);
  
  if (count === 0) return 0;
  
  const channel = `sse:user:${userId}`;
  const published = await redisClient.publish(channel, JSON.stringify(event));
  
  return published;
};

/**
 * Broadcast event to all connected users (optimized with Redis SCAN)
 */
export const broadcastToAll = async (
  event: SSEEvent
): Promise<number> => {
  let userCount = 0;
  const message = JSON.stringify(event);
  let cursor = 0;
  
  do {
    const scanResult = await redisClient.scan(cursor.toString(), {
      MATCH: `${SSE_CONNECTIONS_KEY}:*`,
      COUNT: 100,
    });
    cursor = parseInt(scanResult.cursor, 10);
    const userKeys = scanResult.keys;
    
    if (userKeys.length === 0) continue;
    
    const pipeline = redisClient.multi();
    userKeys.forEach((key) => {
      const userId = key.replace(`${SSE_CONNECTIONS_KEY}:`, "");
      pipeline.publish(`sse:user:${userId}`, message);
    });
    
    const results = await pipeline.exec();
    if (results) {
      results.forEach((result) => {
        if (Array.isArray(result)) {
          const count = result[1] as number;
          if (count > 0) userCount++;
        }
      });
    }
  } while (cursor !== 0);
  
  return userCount;
};

/**
 * Get SSE statistics for monitoring
 */
export const getSSEStats = async (): Promise<SSEStats> => {
  let totalConnections = 0;
  let totalUsers = 0;
  const connectionsByUser: Record<string, number> = {};
  
  let cursor = 0;
  do {
    const scanResult = await redisClient.scan(cursor.toString(), {
      MATCH: `${SSE_CONNECTIONS_KEY}:*`,
      COUNT: 100,
    });
    cursor = parseInt(scanResult.cursor, 10);
    const userKeys = scanResult.keys;
    
    for (const key of userKeys) {
      const userId = key.replace(`${SSE_CONNECTIONS_KEY}:`, "");
      const count = await redisClient.sCard(key);
      connectionsByUser[userId] = count;
      totalConnections += count;
      totalUsers++;
    }
  } while (cursor !== 0);
  
  return { totalConnections, totalUsers, connectionsByUser };
};

/**
 * Publish a notification event
 */
export const publishNotification = async (
  userId: string,
  notification: {
    type: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    actionUrl?: string;
  }
): Promise<void> => {
  const event: SSEEvent = {
    type: "notification",
    data: notification,
    timestamp: new Date().toISOString(),
  };
  
  await broadcastToUser(userId, event);
};

/**
 * Publish a session sync event (for multi-device support)
 */
export const publishSessionSync = async (
  userId: string,
  action: "login" | "logout" | "refresh"
): Promise<void> => {
  const event: SSEEvent = {
    type: "session_sync",
    data: { action },
    timestamp: new Date().toISOString(),
  };
  
  await broadcastToUser(userId, event);
};

/**
 * Publish a user update event
 */
export const publishUserUpdate = async (
  userId: string,
  update: Record<string, unknown>
): Promise<void> => {
  const event: SSEEvent = {
    type: "user_update",
    data: update,
    timestamp: new Date().toISOString(),
  };
  
  await broadcastToUser(userId, event);
};

/**
 * Publish system message
 */
export const publishSystemMessage = async (
  userId: string,
  message: string
): Promise<void> => {
  const event: SSEEvent = {
    type: "system",
    data: { message },
    timestamp: new Date().toISOString(),
  };
  
  await broadcastToUser(userId, event);
};

export { SSE_HEARTBEAT_INTERVAL, MAX_SSE_CONNECTIONS_PER_USER };
