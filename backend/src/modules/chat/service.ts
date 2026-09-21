import { prisma } from "#/lib/prisma";
import { ForbiddenError, NotFoundError } from "#/shared/errors";

interface SendMessageInput {
  courseId: string;
  batchId?: string | null;
  senderId: string;
  senderType: "ACCOUNT" | "GUARDIAN";
  displayName: string;
  message: string;
  learnerProfileId?: string | null;
}

export class ChatService {
  async sendMessage(input: SendMessageInput) {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (input.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: input.batchId },
      });
      if (!batch) {
        throw new NotFoundError("Batch not found");
      }
    }

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
        learnerProfileId: input.learnerProfileId ?? null, // NEW
        message: input.message,
      },
    });

    // Fetch sender avatar
    const sender = await prisma.user.findUnique({
      where: { id: input.senderId },
      select: { avatarUrl: true },
    });

    let learnerProfile = null;
    if (input.learnerProfileId) {
      learnerProfile = await prisma.learnerProfile.findUnique({
        where: { id: input.learnerProfileId },
        select: { avatarUrl: true },
      });
    }

    return {
      ...message,
      avatarUrl: learnerProfile?.avatarUrl ?? sender?.avatarUrl ?? null,
      isInstructor: course.instructorId === input.senderId,
    };
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const learnerProfileIds = messages
      .map((m) => m.learnerProfileId)
      .filter((id): id is string => id !== null);

    const senderProfiles = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, avatarUrl: true },
    });
    const senderMap = Object.fromEntries(senderProfiles.map((u) => [u.id, u]));

    const learnerProfiles = await prisma.learnerProfile.findMany({
      where: { id: { in: learnerProfileIds } },
      select: { id: true, avatarUrl: true },
    });
    const learnerProfileMap = Object.fromEntries(
      learnerProfiles.map((lp) => [lp.id, lp]),
    );

    return messages.map((message) => {
      const sender = senderMap[message.senderId];
      const learnerProfile = message.learnerProfileId
        ? learnerProfileMap[message.learnerProfileId]
        : null;

      return {
        ...message,
        avatarUrl: learnerProfile?.avatarUrl ?? sender?.avatarUrl ?? null,
        isInstructor: course?.instructorId === message.senderId,
      };
    });
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
