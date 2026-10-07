import { prisma } from "#/lib/prisma";
import { isPushConfigured } from "#/lib/firebase";
import {
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "#/shared/errors";
import {
  notificationService,
  type NotificationRecipient,
} from "#/modules/notification/service";
import {
  countPushDevices,
  sendPushToUsers,
} from "#/modules/notification/push";

export type BroadcastChannel = "IN_APP" | "PUSH";
export type AdminAudience = "INSTRUCTORS" | "LEARNERS" | "ALL";

export interface BroadcastContent {
  title: string;
  body: string;
  channels: BroadcastChannel[];
}

interface ResolvedAudience {
  audience: string;
  recipients: NotificationRecipient[];
  courseId?: string;
  courseTitle?: string;
  batchId?: string;
  batchName?: string;
}

// Instructors may send at most this many notifications per hour.
const INSTRUCTOR_HOURLY_LIMIT = 10;

// ──────────────────────────────────
// Recipients
// ──────────────────────────────────

async function activeInstructors(): Promise<NotificationRecipient[]> {
  const users = await prisma.user.findMany({
    where: { role: { name: "Instructor" }, isActive: true },
    select: { id: true },
  });
  return users.map((u) => ({ userId: u.id }));
}

// Every learner profile whose account is active. Each profile gets its own
// in-app notification (it is that profile's feed); push is sent once per
// account.
async function activeLearners(): Promise<NotificationRecipient[]> {
  const profiles = await prisma.learnerProfile.findMany({
    where: { deletedAt: null, account: { isActive: true } },
    select: { id: true, accountId: true },
  });
  return profiles.map((p) => ({ userId: p.accountId, learnerProfileId: p.id }));
}

async function courseLearners(
  courseId: string,
  batchId?: string,
): Promise<NotificationRecipient[]> {
  const enrolments = await prisma.enrolment.findMany({
    where: {
      courseId,
      ...(batchId ? { batchId } : {}),
      waitlisted: false,
      learnerProfile: { deletedAt: null, account: { isActive: true } },
    },
    select: { learnerProfile: { select: { id: true, accountId: true } } },
  });
  return enrolments.map((e) => ({
    userId: e.learnerProfile.accountId,
    learnerProfileId: e.learnerProfile.id,
  }));
}

async function resolveAdminAudience(
  audience: AdminAudience,
): Promise<ResolvedAudience> {
  const [instructors, learners] = await Promise.all([
    audience === "LEARNERS" ? [] : activeInstructors(),
    audience === "INSTRUCTORS" ? [] : activeLearners(),
  ]);
  return { audience, recipients: [...instructors, ...learners] };
}

async function resolveInstructorAudience(
  instructorId: string,
  courseId: string,
  batchId?: string,
): Promise<ResolvedAudience> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, type: true, instructorId: true },
  });
  if (!course) throw new NotFoundError("Course not found");
  if (course.instructorId !== instructorId) {
    throw new ForbiddenError("You can only notify students of your own courses");
  }

  if (!batchId) {
    return {
      audience: "COURSE",
      recipients: await courseLearners(course.id),
      courseId: course.id,
      courseTitle: course.title,
    };
  }

  if (course.type === "REGULAR") {
    throw new ValidationError("Regular courses do not have batches");
  }
  const batch = await prisma.batch.findFirst({
    where: { id: batchId, courseId: course.id },
    select: { id: true, name: true },
  });
  if (!batch) throw new NotFoundError("Batch not found in this course");

  return {
    audience: "BATCH",
    recipients: await courseLearners(course.id, batch.id),
    courseId: course.id,
    courseTitle: course.title,
    batchId: batch.id,
    batchName: batch.name,
  };
}

const uniqueUserIds = (recipients: NotificationRecipient[]) => [
  ...new Set(recipients.map((r) => r.userId)),
];

// ──────────────────────────────────
// Sending
// ──────────────────────────────────

async function deliver(
  sender: { id: string; role: "admin" | "instructor" },
  target: ResolvedAudience,
  content: BroadcastContent,
) {
  const channels = [...new Set(content.channels)];
  if (channels.includes("PUSH") && !isPushConfigured()) {
    throw new ValidationError(
      "Push notifications are not configured on the server yet",
    );
  }
  if (target.recipients.length === 0) {
    throw new ValidationError("There is no one to notify in this audience");
  }

  const userIds = uniqueUserIds(target.recipients);
  const broadcast = await prisma.notificationBroadcast.create({
    data: {
      senderId: sender.id,
      senderRole: sender.role,
      audience: target.audience,
      courseId: target.courseId ?? null,
      courseTitle: target.courseTitle ?? null,
      batchId: target.batchId ?? null,
      batchName: target.batchName ?? null,
      title: content.title,
      body: content.body,
      channels,
      recipientCount: userIds.length,
    },
  });

  const data = {
    broadcastId: broadcast.id,
    ...(target.courseId ? { courseId: target.courseId } : {}),
    ...(target.batchId ? { batchId: target.batchId } : {}),
  };

  if (channels.includes("IN_APP")) {
    await notificationService.notify({
      type:
        sender.role === "admin"
          ? "announcement.admin"
          : "announcement.instructor",
      recipients: target.recipients,
      title: content.title,
      body: content.body,
      data,
      dedupeKey: `broadcast:${broadcast.id}`,
    });
  }

  let push = { devices: 0, sent: 0, failed: 0 };
  if (channels.includes("PUSH")) {
    push = await sendPushToUsers(userIds, {
      title: content.title,
      body: content.body,
      data: {
        ...data,
        type: "announcement",
        // Tells the app an in-app copy arrives too, so it can skip a
        // duplicate banner while open.
        inApp: channels.includes("IN_APP") ? "1" : "0",
      },
    });
    await prisma.notificationBroadcast.update({
      where: { id: broadcast.id },
      data: { pushDeviceCount: push.devices, pushSentCount: push.sent },
    });
  }

  return {
    id: broadcast.id,
    recipientCount: userIds.length,
    pushDevices: push.devices,
    pushSent: push.sent,
    pushFailed: push.failed,
  };
}

async function preview(target: ResolvedAudience) {
  const userIds = uniqueUserIds(target.recipients);
  return {
    recipientCount: userIds.length,
    pushDeviceCount: await countPushDevices(userIds),
    pushConfigured: isPushConfigured(),
  };
}

async function assertInstructorQuota(instructorId: string) {
  const sentLastHour = await prisma.notificationBroadcast.count({
    where: {
      senderId: instructorId,
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (sentLastHour >= INSTRUCTOR_HOURLY_LIMIT) {
    throw new RateLimitError(
      `You can send up to ${INSTRUCTOR_HOURLY_LIMIT} notifications per hour. Please try again later.`,
    );
  }
}

// ──────────────────────────────────
// Public API
// ──────────────────────────────────

export const broadcastService = {
  async previewAdmin(audience: AdminAudience) {
    return preview(await resolveAdminAudience(audience));
  },

  async sendAdmin(
    adminId: string,
    input: BroadcastContent & { audience: AdminAudience },
  ) {
    return deliver(
      { id: adminId, role: "admin" },
      await resolveAdminAudience(input.audience),
      input,
    );
  },

  async previewInstructor(
    instructorId: string,
    courseId: string,
    batchId?: string,
  ) {
    return preview(
      await resolveInstructorAudience(instructorId, courseId, batchId),
    );
  },

  async sendInstructor(
    instructorId: string,
    input: BroadcastContent & { courseId: string; batchId?: string },
  ) {
    await assertInstructorQuota(instructorId);
    return deliver(
      { id: instructorId, role: "instructor" },
      await resolveInstructorAudience(
        instructorId,
        input.courseId,
        input.batchId,
      ),
      input,
    );
  },

  // Sent history. Admins see every broadcast; instructors only their own.
  async list(
    page: number,
    limit: number,
    filter: { senderId?: string } = {},
  ) {
    const where = filter.senderId ? { senderId: filter.senderId } : {};
    const [total, broadcasts] = await Promise.all([
      prisma.notificationBroadcast.count({ where }),
      prisma.notificationBroadcast.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    return { broadcasts, total, page, limit, hasMore: page * limit < total };
  },
};
