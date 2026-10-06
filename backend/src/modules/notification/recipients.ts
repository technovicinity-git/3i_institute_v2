import { prisma } from "#/lib/prisma";
import type { NotificationRecipient } from "#/modules/notification/service";

// Active (non-waitlisted, non-deleted) learner profiles enrolled in a course,
// optionally limited to one batch.
export async function enrolledLearners(
  courseId: string,
  batchId?: string | null,
): Promise<NotificationRecipient[]> {
  const enrolments = await prisma.enrolment.findMany({
    where: {
      courseId,
      ...(batchId ? { batchId } : {}),
      waitlisted: false,
      learnerProfile: { deletedAt: null },
    },
    select: {
      learnerProfile: { select: { id: true, accountId: true } },
    },
  });
  return enrolments.map((e) => ({
    userId: e.learnerProfile.accountId,
    learnerProfileId: e.learnerProfile.id,
  }));
}

export async function batchLearners(batchId: string) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { courseId: true },
  });
  return batch ? enrolledLearners(batch.courseId, batchId) : [];
}

export async function learnerRecipient(
  learnerProfileId: string,
): Promise<NotificationRecipient | null> {
  const profile = await prisma.learnerProfile.findFirst({
    where: { id: learnerProfileId, deletedAt: null },
    select: { id: true, accountId: true },
  });
  return profile
    ? { userId: profile.accountId, learnerProfileId: profile.id }
    : null;
}

export async function admins(): Promise<NotificationRecipient[]> {
  const users = await prisma.user.findMany({
    where: { role: { name: "Admin" } },
    select: { id: true },
  });
  return users.map((u) => ({ userId: u.id }));
}
