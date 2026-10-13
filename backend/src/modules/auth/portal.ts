import { prisma } from "#/lib/prisma";

// Which web portal an account signs in through, so email links and
// post-verification redirects land on the right pages. Applicants keep the
// "Account Holder" role until approved, so they are recognised by their
// instructor application instead.

export type AccountPortal = "learner" | "instructor";

export interface AccountPortalInfo {
  portal: AccountPortal;
  // Applied to teach and still waiting for a decision.
  instructorApplicationPending: boolean;
}

const APPLICATION_ACTIONS = [
  "INSTRUCTOR_APPLICATION_SUBMITTED",
  "INSTRUCTOR_APPROVED",
  "INSTRUCTOR_REJECTED",
];

export async function getAccountPortal(
  userId: string,
): Promise<AccountPortalInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });

  if (user?.role.name === "Instructor") {
    return { portal: "instructor", instructorApplicationPending: false };
  }

  const latestApplicationEvent = await prisma.auditLog.findFirst({
    where: {
      resource: "instructor_application",
      resourceId: userId,
      action: { in: APPLICATION_ACTIONS },
    },
    orderBy: { createdAt: "desc" },
    select: { action: true },
  });

  if (!latestApplicationEvent) {
    return { portal: "learner", instructorApplicationPending: false };
  }

  return {
    portal: "instructor",
    instructorApplicationPending:
      latestApplicationEvent.action === "INSTRUCTOR_APPLICATION_SUBMITTED",
  };
}
