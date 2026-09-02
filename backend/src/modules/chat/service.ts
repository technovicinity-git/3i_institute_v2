import { prisma } from "#/lib/prisma";
import { ForbiddenError, NotFoundError } from "#/shared/errors";

interface SendMessageInput {
  courseId: string;
  batchId?: string | null;
  senderId: string;
  senderType: "ACCOUNT" | "GUARDIAN";
  displayName: string;
  message: string;
}

export class ChatService {
  async sendMessage(input: SendMessageInput) {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // For batch courses, validate batch if provided
    if (input.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: input.batchId },
      });

      if (!batch) {
        throw new NotFoundError("Batch not found");
      }
    }

    // Under-13 courses = guardian-only chat
    const isGuardianOnly = course.minimumAge < 13;

    if (isGuardianOnly && input.senderType !== "GUARDIAN") {
      throw new ForbiddenError(
        "This chat is guardian-only due to age restrictions",
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        courseId: input.courseId,
        batchId: input.batchId ?? null,
        senderId: input.senderId,
        senderType: input.senderType,
        displayName: input.displayName,
        message: input.message,
      },
    });

    return message;
  }

  async getCourseMessages(courseId: string, batchId?: string) {
    const messages = await prisma.chatMessage.findMany({
      where: {
        courseId,
        ...(batchId ? { batchId } : { batchId: null }),
      },
      orderBy: { createdAt: "asc" },
      take: 500,
    });

    return messages;
  }

  async reportMessage(reporterId: string, messageId: string, reason: string) {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    const report = await prisma.auditLog.create({
      data: {
        userId: reporterId,
        action: "CHAT_REPORT",
        resource: "chat_moderation",
        resourceId: messageId,
        details: {
          reason,
          reportedAt: new Date().toISOString(),
        },
      },
    });

    return report;
  }

  async getModerationQueue() {
    return prisma.auditLog.findMany({
      where: { action: "CHAT_REPORT" },
      orderBy: { createdAt: "asc" },
    });
  }

  async moderateMessage(
    moderatorId: string,
    messageId: string,
    action: "DELETE" | "MUTE" | "REMOVE",
  ) {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    const moderation = await prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: "CHAT_MODERATION",
        resource: "chat_moderation",
        resourceId: messageId,
        details: {
          action,
          moderatedAt: new Date().toISOString(),
        },
      },
    });

    return moderation;
  }
}

export const chatService = new ChatService();
