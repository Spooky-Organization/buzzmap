import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload, UserRole } from "../types";
import { logSecurityEvent, SecurityEventType } from "../../modules/auth_module/src/utils/securityLogger";

const JWT_SECRET = process.env["JWT_SECRET"] || "default-secret-change-in-production";

interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: SocketIOServer | null = null;
  private chatNamespace: string = "/chat";

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public initialize(httpServer: HTTPServer): SocketIOServer {
    if (this.io) {
      console.log(`[${new Date().toISOString()}] WebSocketManager: Already initialized`);
      return this.io;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env["CORS_ORIGIN"] || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/socket.io",
    });

    this.setupChatNamespace();
    console.log(`[${new Date().toISOString()}] WebSocketManager: Initialized with /chat namespace`);
    return this.io;
  }

  private setupChatNamespace(): void {
    if (!this.io) return;

    const chatNamespace = this.io.of(this.chatNamespace);

    chatNamespace.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers["authorization"]?.split(" ")[1];

      if (!token) {
        const ip = socket.handshake.address;
        logSecurityEvent({
          eventType: SecurityEventType.TOKEN_INVALID,
          ip,
          message: "WebSocket authentication failed: No token provided",
          metadata: { socketId: socket.id },
        });
        return next(new Error("Authentication required"));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        (socket as AuthenticatedSocket).user = decoded;
        next();
      } catch (error) {
        const ip = socket.handshake.address;
        logSecurityEvent({
          eventType: SecurityEventType.TOKEN_INVALID,
          ip,
          message: "WebSocket authentication failed: Invalid token",
          metadata: { socketId: socket.id },
        });
        next(new Error("Invalid token"));
      }
    });

    chatNamespace.on("connection", (socket: AuthenticatedSocket) => {
      const user = socket.user;
      console.log(`[${new Date().toISOString()}] WebSocketManager: User connected - ${user?.userId} (${socket.id})`);

      socket.on("join_conversation", (data: { conversationId: string }) => {
        if (!data?.conversationId) {
          socket.emit("error", { message: "conversationId is required" });
          return;
        }
        socket.join(`conversation:${data.conversationId}`);
        console.log(`[${new Date().toISOString()}] WebSocketManager: User ${user?.userId} joined conversation ${data.conversationId}`);
        socket.emit("joined", { conversationId: data.conversationId });
      });

      socket.on("leave_conversation", (data: { conversationId: string }) => {
        if (!data?.conversationId) {
          socket.emit("error", { message: "conversationId is required" });
          return;
        }
        socket.leave(`conversation:${data.conversationId}`);
        console.log(`[${new Date().toISOString()}] WebSocketManager: User ${user?.userId} left conversation ${data.conversationId}`);
        socket.emit("left", { conversationId: data.conversationId });
      });

      socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
        if (!data?.conversationId) return;
        socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
          userId: user?.userId,
          conversationId: data.conversationId,
          isTyping: data.isTyping,
        });
      });

      socket.on("disconnect", (reason) => {
        console.log(`[${new Date().toISOString()}] WebSocketManager: User ${user?.userId} disconnected - ${reason}`);
      });

      socket.on("error", (error) => {
        console.error(`[${new Date().toISOString()}] WebSocketManager: Socket error for user ${user?.userId}`, error);
      });
    });
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("WebSocketManager not initialized. Call initialize() first.");
    }
    return this.io;
  }

  public getChatNamespace(): SocketIOServer | null {
    return this.io?.of(this.chatNamespace) || null;
  }

  public emitToConversation(conversationId: string, event: string, data: unknown): void {
    if (!this.io) return;
    this.io.of(this.chatNamespace).to(`conversation:${conversationId}`).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) return;
    this.io.of(this.chatNamespace).emit(`user:${userId}`, event, data);
  }
}

export const webSocketManager = WebSocketManager.getInstance();