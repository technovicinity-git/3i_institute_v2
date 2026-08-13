import { prisma } from "#/lib/prisma";
import { ForbiddenError, NotFoundError } from "#/shared/errors";

interface SendMessageInput {
  courseId: string;
  batchId?: string;
  senderId: string; // account ID (not learner profile ID)
  senderType: "ACCOUNT" | "GUARDIAN";
  displayName: string;
  message: string;
}

export class ChatService {
  async sendMessage(input: SendMessageInput) {
    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Determine chat room type
    // FR-CHAT-06/07: Under-13 courses = guardian-only
    const isGuardianOnly = course.minimumAge < 13;

    if (isGuardianOnly && input.senderType !== "GUARDIAN") {
      throw new ForbiddenError(
        "This chat is guardian-only due to age restrictions",
      );
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

    // Store message (for now, we use a simple approach with AuditLog as message store)
    // In production, you'd have a ChatMessage table
    const messageRecord = await prisma.auditLog.create({
      data: {
        userId: input.senderId,
        action: "CHAT_MESSAGE",
        resource: "chat",
        resourceId: input.courseId,
        details: {
          batchId: input.batchId ?? null,
          senderType: input.senderType,
          displayName: input.displayName,
          message: input.message,
          guardianOnly: isGuardianOnly,
        },
      },
    });

    return {
      id: messageRecord.id,
      courseId: input.courseId,
      batchId: input.batchId ?? null,
      senderId: input.senderId,
      senderType: input.senderType,
      displayName: input.displayName,
      message: input.message,
      createdAt: messageRecord.createdAt,
    };
  }

  async getCourseMessages(courseId: string, batchId?: string) {
    const messages = await prisma.auditLog.findMany({
      where: {
        action: "CHAT_MESSAGE",
        resourceId: courseId,
        ...(batchId
          ? {
              details: {
                equals: { batchId },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return messages.map((m) => ({
      id: m.id,
      courseId: m.resourceId,
      senderId: m.userId,
      senderType: (m.details as any)?.senderType ?? "ACCOUNT",
      displayName: (m.details as any)?.displayName ?? "Unknown",
      message: (m.details as any)?.message ?? "",
      createdAt: m.createdAt,
    }));
  }

  async reportMessage(reporterId: string, messageId: string, reason: string) {
    const message = await prisma.auditLog.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Create moderation report
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
    const reports = await prisma.auditLog.findMany({
      where: {
        action: "CHAT_REPORT",
      },
      orderBy: { createdAt: "asc" },
    });

    return reports;
  }

  async moderateMessage(
    moderatorId: string,
    messageId: string,
    action: "DELETE" | "MUTE" | "REMOVE",
  ) {
    const message = await prisma.auditLog.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    // Log moderation action
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
