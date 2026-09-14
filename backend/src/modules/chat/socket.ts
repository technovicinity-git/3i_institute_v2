import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { verifyAccessToken } from "#/lib/jwt";
import { chatService } from "#/modules/chat/service";
import { env } from "#/config/env";
import { prisma } from "#/lib/prisma";

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

    // Join course chat room
    socket.on(
      "join-course",
      async (data: {
        courseId: string;
        batchId?: string;
        learnerProfileId?: string;
      }) => {
        const { courseId, batchId, learnerProfileId } = data;

        // Verify instructor owns the course OR learner is enrolled
        const user = socket.data.user;

        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { instructorId: true },
        });

        const isInstructor = course?.instructorId === user.sub;
        const isAdmin = user.role === "Admin";

        // If not instructor/admin, verify learner is enrolled
        if (!isInstructor && !isAdmin) {
          if (!learnerProfileId) {
            socket.emit("error", { message: "learnerProfileId required" });
            return;
          }

          const enrolment = await prisma.enrolment.findFirst({
            where: {
              learnerProfileId,
              courseId,
              ...(batchId ? { batchId } : {}),
              waitlisted: false,
            },
          });

          if (!enrolment) {
            socket.emit("error", { message: "Not enrolled in this course" });
            return;
          }
        }
        const roomName = batchId
          ? `course:${courseId}:batch:${batchId}`
          : `course:${courseId}`;

        socket.join(roomName);
        socket.data.roomName = roomName;
        socket.data.learnerProfileId = learnerProfileId ?? null;

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
      },
    );

    // Send message
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

          // Get learner profile display name
          let displayName = user.email;
          let avatarUrl = null;

          if (
            socket.data.isInstructor ||
            socket.data.isInstructor === undefined
          ) {
            // Instructor — use their profile
            const instructor = await prisma.user.findUnique({
              where: { id: user.sub },
              select: { firstName: true, lastName: true, avatarUrl: true },
            });
            if (instructor) {
              displayName = `${instructor.firstName} ${instructor.lastName}`;
              avatarUrl = instructor.avatarUrl;
            }
          } else if (socket.data.learnerProfileId) {
            // Learner — use learner profile
            const profile = await prisma.learnerProfile.findUnique({
              where: { id: socket.data.learnerProfileId },
              select: { displayName: true, avatarUrl: true },
            });
            if (profile) {
              displayName = profile.displayName;
              avatarUrl = profile.avatarUrl;
            }
          }
          if (socket.data.learnerProfileId) {
            const profile = await prisma.learnerProfile.findUnique({
              where: { id: socket.data.learnerProfileId },
              select: { displayName: true },
            });
            if (profile) {
              displayName = profile.displayName;
            }
          }

          // Service now returns avatarUrl
          const savedMessage = await chatService.sendMessage({
            courseId,
            batchId: batchId ?? null,
            senderId: user.sub,
            senderType: "ACCOUNT",
            displayName,
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
