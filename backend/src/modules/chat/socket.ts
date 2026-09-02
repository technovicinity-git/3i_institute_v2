import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { verifyAccessToken } from "#/lib/jwt";
import { chatService } from "#/modules/chat/service";
import { env } from "#/config/env";

let io: SocketIOServer | null = null;

function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  // ──────────────────────────────────
  // Authentication middleware
  // ──────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ──────────────────────────────────
  // Connection handler
  // ──────────────────────────────────
  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`🔌 User connected: ${user.email} (${socket.id})`);

    // ────────────────────────────────
    // Join course chat room
    // ────────────────────────────────
    socket.on("join-course", (data: { courseId: string; batchId?: string }) => {
      const { courseId, batchId } = data;
      const roomName = batchId
        ? `course:${courseId}:batch:${batchId}`
        : `course:${courseId}`;

      socket.join(roomName);
      socket.data.roomName = roomName;

      console.log(`📝 ${user.email} joined ${roomName}`);

      // Send recent messages to the joining user only
      chatService
        .getCourseMessages(courseId, batchId)
        .then((messages) => {
          socket.emit("message-history", messages);
        })
        .catch((error) => {
          console.error("Failed to load message history:", error);
        });
    });

    // ────────────────────────────────
    // Leave course chat room
    // ────────────────────────────────
    socket.on("leave-course", () => {
      if (socket.data.roomName) {
        socket.leave(socket.data.roomName);
        console.log(`📤 ${user.email} left ${socket.data.roomName}`);
        socket.data.roomName = null;
      }
    });

    // ────────────────────────────────
    // Send message
    // ────────────────────────────────
    socket.on(
      "send-message",
      async (data: { courseId: string; batchId?: string; message: string }) => {
        try {
          const { courseId, batchId, message } = data;

          if (!message || message.trim().length === 0) {
            socket.emit("error", { message: "Message cannot be empty" });
            return;
          }

          if (message.length > 2000) {
            socket.emit("error", {
              message: "Message too long (max 2000 characters)",
            });
            return;
          }

          const savedMessage = await chatService.sendMessage({
            courseId,
            batchId: batchId ?? null,
            senderId: user.sub,
            senderType: "ACCOUNT",
            displayName: user.email, // Should use learner profile name
            message: message.trim(),
          });

          const roomName = batchId
            ? `course:${courseId}:batch:${batchId}`
            : `course:${courseId}`;

          io!.to(roomName).emit("new-message", savedMessage);
        } catch (error: any) {
          socket.emit("error", {
            message: error.message ?? "Failed to send message",
          });
        }
      },
    );

    // ────────────────────────────────
    // Disconnect
    // ────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${user.email}`);
    });
  });

  return io;
}

function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
}

export { initializeSocket, getIO };
