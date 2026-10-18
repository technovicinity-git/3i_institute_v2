import { prisma } from "#/lib/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "#/shared/errors";
import { seatService } from "#/modules/seat/service";
import { notificationEvents } from "#/modules/notification/events";

export const MODERATION_ACTIONS = ["DELETE", "REMOVE"] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

type MessageDeletedListener = (
  courseId: string,
  batchId: string | null,
  messageId: string,
) => void;

let messageDeletedListener: MessageDeletedListener | null = null;

/**
 * Who may post in a course chat: its instructor, an admin, or a learner of
 * this account who is enrolled (in the batch, for batch rooms) and whose
 * subscription is active or in its grace period. Returns the learner
 * profile to post as (null for staff).
 */
export async function assertCanPostInChat(input: {
  userId: string;
  role?: string;
  courseId: string;
  batchId?: string | null;
  learnerProfileId?: string | null;
}): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { instructorId: true },
  });
  if (!course) throw new NotFoundError("Course not found");
  if (course.instructorId === input.userId || input.role === "Admin") {
    return null;
  }

  if (!input.learnerProfileId) {
    throw new ValidationError("learnerProfileId is required");
  }
  const enrolment = await prisma.enrolment.findFirst({
    where: {
      learnerProfileId: input.learnerProfileId,
      learnerProfile: { accountId: input.userId, deletedAt: null },
      courseId: input.courseId,
      ...(input.batchId ? { batchId: input.batchId } : {}),
      waitlisted: false,
    },
    select: { learnerProfileId: true },
  });
  if (!enrolment) throw new ForbiddenError("Not enrolled in this course");

  // Reading stays open; sending needs an active subscription (or grace).
  await seatService.assertLearningAccess(enrolment.learnerProfileId);
  return enrolment.learnerProfileId;
}

/** Lets the socket layer broadcast deletions without a circular import. */
export function onChatMessageDeleted(listener: MessageDeletedListener) {
  messageDeletedListener = listener;
}

function emitMessageDeleted(
  courseId: string,
  batchId: string | null,
  messageId: string,
) {
  messageDeletedListener?.(courseId, batchId, messageId);
}

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

    // const isGuardianOnly = course.minimumAge < 13;

    // if (isGuardianOnly && input.senderType !== "GUARDIAN") {
    //   throw new ForbiddenError(
    //     "This chat is guardian-only due to age restrictions",
    //   );
    // }

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

    notificationEvents.chatMessageReported(messageId);

    return report;
  }

  /**
   * Open chat reports grouped by message. A report is open when no
   * moderation action was recorded on its message after it was filed.
   */
  async getModerationQueue() {
    const events = await prisma.auditLog.findMany({
      where: { action: { in: ["CHAT_REPORT", "CHAT_MODERATION"] } },
      orderBy: { createdAt: "asc" },
    });

    const lastModeratedAt = new Map<string, Date>();
    for (const e of events) {
      if (e.action === "CHAT_MODERATION" && e.resourceId) {
        lastModeratedAt.set(e.resourceId, e.createdAt);
      }
    }

    const openReports = events.filter((e) => {
      if (e.action !== "CHAT_REPORT" || !e.resourceId) return false;
      const moderatedAt = lastModeratedAt.get(e.resourceId);
      return !moderatedAt || moderatedAt < e.createdAt;
    });

    if (openReports.length === 0) return [];

    const messageIds = [...new Set(openReports.map((r) => r.resourceId!))];
    const messages = await prisma.chatMessage.findMany({
      where: { id: { in: messageIds } },
    });
    const messageMap = new Map(messages.map((m) => [m.id, m]));

    const courseIds = [...new Set(messages.map((m) => m.courseId))];
    const batchIds = [
      ...new Set(
        messages.map((m) => m.batchId).filter((id): id is string => !!id),
      ),
    ];
    const userIds = [
      ...new Set([
        ...messages.map((m) => m.senderId),
        ...openReports
          .map((r) => r.userId)
          .filter((id): id is string => !!id),
      ]),
    ];

    const [courses, batches, users] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, title: true },
      }),
      prisma.batch.findMany({
        where: { id: { in: batchIds } },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
        },
      }),
    ]);
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const batchMap = new Map(batches.map((b) => [b.id, b]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    const grouped = new Map<string, typeof openReports>();
    for (const report of openReports) {
      const list = grouped.get(report.resourceId!) ?? [];
      list.push(report);
      grouped.set(report.resourceId!, list);
    }

    return [...grouped.entries()]
      .map(([messageId, reports]) => {
        const message = messageMap.get(messageId) ?? null;
        const latest = reports[reports.length - 1]!;
        return {
          messageId,
          message: message && {
            id: message.id,
            text: message.message,
            displayName: message.displayName,
            createdAt: message.createdAt,
          },
          sender: message ? (userMap.get(message.senderId) ?? null) : null,
          course: message ? (courseMap.get(message.courseId) ?? null) : null,
          batch: message?.batchId
            ? (batchMap.get(message.batchId) ?? null)
            : null,
          reportCount: reports.length,
          firstReportedAt: reports[0]!.createdAt,
          lastReportedAt: latest.createdAt,
          reports: reports.map((r) => {
            const details = (r.details ?? {}) as { reason?: string };
            const reporter = r.userId ? userMap.get(r.userId) : undefined;
            return {
              id: r.id,
              reason: details.reason ?? "",
              reportedAt: r.createdAt,
              reporter: reporter
                ? {
                    id: reporter.id,
                    firstName: reporter.firstName,
                    lastName: reporter.lastName,
                    email: reporter.email,
                  }
                : null,
            };
          }),
        };
      })
      .sort(
        (a, b) => b.lastReportedAt.getTime() - a.lastReportedAt.getTime(),
      );
  }

  /**
   * DELETE removes the message from the chat; REMOVE dismisses the reports
   * and keeps the message. Either way the open reports are closed.
   */
  async moderateMessage(
    moderatorId: string,
    messageId: string,
    action: ModerationAction,
  ) {
    if (!messageId) {
      throw new ValidationError("messageId is required");
    }
    if (!MODERATION_ACTIONS.includes(action)) {
      throw new ValidationError(
        `action must be one of ${MODERATION_ACTIONS.join(", ")}`,
      );
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (action === "DELETE") {
      if (!message) {
        throw new NotFoundError("Message not found");
      }
      await prisma.chatMessage.delete({ where: { id: messageId } });
      emitMessageDeleted(message.courseId, message.batchId, messageId);
    } else {
      // Dismissing is allowed even if the message is already gone.
      const hasReports = await prisma.auditLog.count({
        where: { action: "CHAT_REPORT", resourceId: messageId },
      });
      if (!message && hasReports === 0) {
        throw new NotFoundError("Message not found");
      }
    }

    return prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: "CHAT_MODERATION",
        resource: "chat_moderation",
        resourceId: messageId,
        details: {
          action,
          moderatedAt: new Date().toISOString(),
          ...(message && {
            courseId: message.courseId,
            batchId: message.batchId,
            senderId: message.senderId,
            message: message.message,
          }),
        },
      },
    });
  }
}

export const chatService = new ChatService();
