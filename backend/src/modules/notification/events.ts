// Domain events → notifications. Each function loads what it needs from the
// ids it is given, so callers only add a single line after their write:
//
//   notificationEvents.sessionScheduled(session.id);
//
// Every function runs in the background and never throws: a notification
// failure must not fail the user's action. Rules: docs/notification-rules.md.

import { prisma } from "#/lib/prisma";
import {
  notificationService,
  type NotificationContent,
  type NotificationRecipient,
  type NotifyInput,
} from "#/modules/notification/service";
import {
  admins,
  batchLearners,
  enrolledLearners,
  learnerRecipient,
} from "#/modules/notification/recipients";
import {
  emailAccountHolders,
  type AccountHolder,
} from "#/modules/notification/account-emails";
import { emailLinks } from "#/modules/email/links";

// ──────────────────────────────────
// Helpers
// ──────────────────────────────────

function background(name: string, task: () => Promise<unknown>): void {
  void task().catch((error) => {
    console.error(`[notifications] ${name} failed:`, error);
  });
}

function formatDateTime(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return formatDateTime(date, "UTC");
  }
}

function formatDate(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone,
    }).format(date);
  } catch {
    return formatDate(date, "UTC");
  }
}

// Sends one notification per recipient timezone so dates read in local time.
async function notifyLocalized(
  input: Omit<NotifyInput, keyof NotificationContent>,
  build: (timeZone: string) => NotificationContent,
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(input.recipients.map((r) => r.userId))] } },
    select: { id: true, timezone: true },
  });
  const zoneByUser = new Map(users.map((u) => [u.id, u.timezone || "UTC"]));
  const byZone = new Map<string, NotificationRecipient[]>();
  for (const recipient of input.recipients) {
    const zone = zoneByUser.get(recipient.userId) ?? "UTC";
    byZone.set(zone, [...(byZone.get(zone) ?? []), recipient]);
  }
  for (const [zone, recipients] of byZone) {
    await notificationService.notify({ ...input, ...build(zone), recipients });
  }
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

// ──────────────────────────────────
// Learner: sessions & batches
// ──────────────────────────────────

interface SessionSnapshot {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
}

async function loadSession(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  });
}

function sessionData(session: {
  id: string;
  batch: { id: string; course: { id: string } };
}) {
  return {
    sessionId: session.id,
    batchId: session.batch.id,
    courseId: session.batch.course.id,
    route: `/online-classes/${session.batch.id}`,
  };
}

type LoadedSession = NonNullable<Awaited<ReturnType<typeof loadSession>>>;

// Template data shared by the session emails, in the account's timezone.
function sessionEmailData(session: LoadedSession, account: AccountHolder) {
  return {
    firstName: account.firstName,
    learnerNames: account.learnerNames,
    sessionTitle: session.title,
    courseTitle: session.batch.course.title,
    batchName: session.batch.name,
    startsAt: session.scheduledAt,
    durationMinutes: session.durationMinutes,
    timeZone: account.timezone,
    scheduleUrl: emailLinks.onlineClass(session.batch.id),
  };
}

function sessionScheduled(sessionId: string) {
  background("sessionScheduled", async () => {
    const session = await loadSession(sessionId);
    if (!session || session.scheduledAt <= new Date()) return;
    const recipients = await batchLearners(session.batch.id);
    await notifyLocalized(
      {
        type: "session.scheduled",
        recipients,
        dedupeKey: `session.scheduled:${session.id}`,
      },
      (zone) => ({
        title: "New class scheduled",
        body: `"${session.title}" in ${session.batch.course.title} on ${formatDateTime(session.scheduledAt, zone)}`,
        data: sessionData(session),
      }),
    );
    await emailAccountHolders({
      recipients,
      category: "schedule",
      template: "learner.session-scheduled",
      data: (account) => sessionEmailData(session, account),
    });
  });
}

// Call with the session as it was before the update.
function sessionUpdated(before: SessionSnapshot) {
  background("sessionUpdated", async () => {
    const session = await loadSession(before.id);
    if (!session) return;

    const timeChanged =
      session.scheduledAt.getTime() !== before.scheduledAt.getTime() ||
      session.durationMinutes !== before.durationMinutes;
    const linkChanged =
      (session.meetingLink ?? "") !== (before.meetingLink ?? "") &&
      !!session.meetingLink;
    const detailsChanged =
      session.title !== before.title ||
      (session.notes ?? "") !== (before.notes ?? "");
    if (!timeChanged && !linkChanged && !detailsChanged) return;

    // Past sessions don't need updates.
    if (session.scheduledAt.getTime() + session.durationMinutes * 60_000 < Date.now()) {
      return;
    }

    const recipients = await batchLearners(session.batch.id);
    const data = sessionData(session);

    if (timeChanged) {
      await notifyLocalized(
        { type: "session.rescheduled", recipients },
        (zone) => ({
          title: "Class time changed",
          body: `"${session.title}" is now on ${formatDateTime(session.scheduledAt, zone)} (${session.durationMinutes} min)`,
          data,
        }),
      );
      await emailAccountHolders({
        recipients,
        category: "schedule",
        template: "learner.session-rescheduled",
        data: (account) => ({
          ...sessionEmailData(session, account),
          previousStartsAt: before.scheduledAt,
        }),
      });
    } else if (linkChanged) {
      await notificationService.notify({
        type: "session.link_updated",
        recipients,
        title: "Meeting link ready",
        body: `The join link for "${session.title}" has been ${before.meetingLink ? "updated" : "added"}`,
        data,
      });
    } else {
      await notificationService.notify({
        type: "session.updated",
        recipients,
        title: "Class updated",
        body: `Details for "${session.title}" in ${session.batch.course.title} were updated`,
        data,
      });
    }
  });
}

// Call with data captured before the session row is deleted.
function sessionCancelled(snapshot: {
  title: string;
  scheduledAt: Date;
  batchId: string;
  batchName: string;
  courseId: string;
  courseTitle: string;
}) {
  background("sessionCancelled", async () => {
    if (snapshot.scheduledAt <= new Date()) return;
    const recipients = await enrolledLearners(
      snapshot.courseId,
      snapshot.batchId,
    );
    await notifyLocalized(
      {
        type: "session.cancelled",
        recipients,
      },
      (zone) => ({
        title: "Class cancelled",
        body: `"${snapshot.title}" on ${formatDateTime(snapshot.scheduledAt, zone)} has been cancelled`,
        data: {
          batchId: snapshot.batchId,
          courseId: snapshot.courseId,
          route: `/online-classes/${snapshot.batchId}`,
        },
      }),
    );
    await emailAccountHolders({
      recipients,
      category: "schedule",
      template: "learner.session-cancelled",
      data: (account) => ({
        firstName: account.firstName,
        learnerNames: account.learnerNames,
        sessionTitle: snapshot.title,
        courseTitle: snapshot.courseTitle,
        batchName: snapshot.batchName,
        scheduledAt: snapshot.scheduledAt,
        timeZone: account.timezone,
        scheduleUrl: emailLinks.onlineClass(snapshot.batchId),
      }),
    });
  });
}

function batchClosed(batchId: string) {
  background("batchClosed", async () => {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: { id: true, name: true, course: { select: { id: true, title: true } } },
    });
    if (!batch) return;
    await notificationService.notify({
      type: "batch.closed",
      recipients: await batchLearners(batch.id),
      dedupeKey: `batch.closed:${batch.id}`,
      title: "Batch closed",
      body: `"${batch.name}" for ${batch.course.title} has been closed`,
      data: {
        batchId: batch.id,
        courseId: batch.course.id,
        route: `/online-classes/${batch.id}`,
      },
    });
  });
}

// ──────────────────────────────────
// Learner: exams, assignments, materials
// ──────────────────────────────────

function examPublished(examId: string) {
  background("examPublished", async () => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: { select: { id: true, title: true, type: true } } },
    });
    if (!exam) return;
    const recipients = await enrolledLearners(exam.course.id);
    const data = {
      examId: exam.id,
      courseId: exam.course.id,
      route: `/my-courses/${exam.course.id}/exams`,
    };
    const base = {
      type: "exam.published" as const,
      recipients,
      dedupeKey: `exam.published:${exam.id}`,
    };

    if (exam.openDate && exam.openDate > new Date()) {
      await notifyLocalized(base, (zone) => ({
        title: "New exam scheduled",
        body: `"${exam.title}" in ${exam.course.title} starts ${formatDateTime(exam.openDate!, zone)}`,
        data,
      }));
    } else {
      await notificationService.notify({
        ...base,
        title: "New exam available",
        body: `"${exam.title}" is now available in ${exam.course.title}`,
        data,
      });
    }

    // Courses with live classes also email the exam to account holders;
    // self-paced (regular) courses keep it to the in-app notification.
    if (exam.course.type !== "REGULAR") {
      await emailAccountHolders({
        recipients,
        category: "learning",
        template: "learner.exam-published",
        data: (account) => ({
          firstName: account.firstName,
          learnerNames: account.learnerNames,
          examTitle: exam.title,
          courseTitle: exam.course.title,
          opensAt: exam.openDate,
          closesAt: exam.closeDate,
          durationMinutes: exam.duration,
          maxAttempts: exam.maxAttempts,
          timeZone: account.timezone,
          examsUrl: emailLinks.courseExams(exam.course.id),
        }),
      });
    }
  });
}

// Call with the exam's open date before the update.
function examUpdated(examId: string, previousOpenDate: Date | null) {
  background("examUpdated", async () => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: { select: { id: true, title: true, type: true } } },
    });
    if (!exam?.openDate || exam.openDate <= new Date()) return;
    if (previousOpenDate?.getTime() === exam.openDate.getTime()) return;
    const opensAt = exam.openDate;

    const recipients = await enrolledLearners(exam.course.id);
    await notifyLocalized(
      {
        type: "exam.rescheduled",
        recipients,
      },
      (zone) => ({
        title: "Exam time changed",
        body: `"${exam.title}" now starts ${formatDateTime(opensAt, zone)}`,
        data: {
          examId: exam.id,
          courseId: exam.course.id,
          route: `/my-courses/${exam.course.id}/exams`,
        },
      }),
    );

    // Same rule as new exams: email only for courses with live classes.
    if (exam.course.type !== "REGULAR") {
      await emailAccountHolders({
        recipients,
        category: "learning",
        template: "learner.exam-rescheduled",
        data: (account) => ({
          firstName: account.firstName,
          learnerNames: account.learnerNames,
          examTitle: exam.title,
          courseTitle: exam.course.title,
          opensAt,
          previousOpensAt: previousOpenDate,
          closesAt: exam.closeDate,
          durationMinutes: exam.duration,
          timeZone: account.timezone,
          examsUrl: emailLinks.courseExams(exam.course.id),
        }),
      });
    }
  });
}

// Learner submitted an exam: tell the instructor if written answers need
// grading. Fully auto-graded attempts send nothing.
function examSubmitted(attemptId: string) {
  background("examSubmitted", async () => {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        learnerProfile: { select: { displayName: true } },
        exam: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, instructorId: true } },
          },
        },
      },
    });
    if (!attempt || attempt.graded) return;
    const { exam } = attempt;
    await notificationService.notify({
      type: "exam.needs_grading",
      recipients: [{ userId: exam.course.instructorId }],
      dedupeKey: `exam.needs_grading:${attempt.id}`,
      title: "Exam needs grading",
      body: `${attempt.learnerProfile.displayName} submitted "${exam.title}"`,
      data: {
        examId: exam.id,
        attemptId: attempt.id,
        courseId: exam.course.id,
        route: `/instructor/courses/${exam.course.id}/exams/${exam.id}/attempts/${attempt.id}/grade`,
      },
    });
  });
}

function examGraded(attemptId: string) {
  background("examGraded", async () => {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { select: { id: true, title: true, courseId: true } },
      },
    });
    if (!attempt?.graded) return;
    const recipient = await learnerRecipient(attempt.learnerProfileId);
    if (!recipient) return;
    await notificationService.notify({
      type: "exam.graded",
      recipients: [recipient],
      dedupeKey: `exam.graded:${attempt.id}`,
      title: "Exam graded",
      body: `Your "${attempt.exam.title}" result is ready`,
      data: {
        examId: attempt.exam.id,
        attemptId: attempt.id,
        courseId: attempt.exam.courseId,
        route: `/my-courses/${attempt.exam.courseId}/exams/${attempt.exam.id}/result`,
      },
    });
  });
}

function assignmentPublished(assignmentId: string) {
  background("assignmentPublished", async () => {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: { select: { id: true, title: true } } },
    });
    if (!assignment || assignment.status !== "PUBLISHED") return;
    const recipients = await enrolledLearners(
      assignment.course.id,
      assignment.batchId,
    );
    const data = {
      assignmentId: assignment.id,
      courseId: assignment.course.id,
      route: `/my-courses/${assignment.course.id}/assignments`,
    };
    const base = {
      type: "assignment.published" as const,
      recipients,
      dedupeKey: `assignment.published:${assignment.id}`,
    };
    if (assignment.dueDate) {
      await notifyLocalized(base, (zone) => ({
        title: "New assignment",
        body: `"${assignment.title}" in ${assignment.course.title} is due ${formatDate(assignment.dueDate!, zone)}`,
        data,
      }));
    } else {
      await notificationService.notify({
        ...base,
        title: "New assignment",
        body: `"${assignment.title}" was posted in ${assignment.course.title}`,
        data,
      });
    }
  });
}

function assignmentSubmitted(submissionId: string) {
  background("assignmentSubmitted", async () => {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, instructorId: true } },
          },
        },
      },
    });
    if (!submission) return;
    const { assignment } = submission;
    await notificationService.notifyGrouped({
      type: "assignment.submitted",
      recipients: [{ userId: assignment.course.instructorId }],
      groupKey: `assignment.submitted:${assignment.id}`,
      build: (count) => ({
        title: "New submissions",
        body: `${plural(count, "new submission")} for "${assignment.title}"`,
        data: {
          assignmentId: assignment.id,
          courseId: assignment.course.id,
          route: `/instructor/courses/${assignment.course.id}/assignments/${assignment.id}`,
        },
      }),
    });
  });
}

function assignmentGraded(submissionId: string) {
  background("assignmentGraded", async () => {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });
    if (!submission?.graded) return;
    const recipient = await learnerRecipient(submission.learnerProfileId);
    if (!recipient) return;
    // Re-grading with different marks sends a fresh notification; repeating
    // the same grade is a no-op.
    await notificationService.notify({
      type: "assignment.graded",
      recipients: [recipient],
      dedupeKey: `assignment.graded:${submission.id}:${submission.marksAwarded ?? ""}`,
      title: "Assignment graded",
      body: `"${submission.assignment.title}" has been graded. Tap to see feedback`,
      data: {
        assignmentId: submission.assignment.id,
        courseId: submission.assignment.courseId,
        route: `/my-courses/${submission.assignment.courseId}/assignments`,
      },
    });
  });
}

function materialPublished(materialId: string) {
  background("materialPublished", async () => {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: { select: { id: true, title: true } } },
    });
    if (!material) return;
    await notificationService.notifyGrouped({
      type: "material.published",
      recipients: await enrolledLearners(material.course.id),
      groupKey: `material.published:${material.course.id}:${todayKey()}`,
      build: (count) => ({
        title: count === 1 ? "New lesson added" : `${count} new lessons added`,
        body:
          count === 1
            ? `"${material.title}" in ${material.course.title}`
            : `New lessons are available in ${material.course.title}`,
        data: {
          courseId: material.course.id,
          materialId: material.id,
          route:
            count === 1
              ? `/my-courses/${material.course.id}/lessons/${material.id}`
              : `/my-courses`,
        },
      }),
    });
  });
}

// ──────────────────────────────────
// Enrolment & certificates
// ──────────────────────────────────

function enrolmentCreated(enrolmentId: string) {
  background("enrolmentCreated", async () => {
    const enrolment = await prisma.enrolment.findUnique({
      where: { id: enrolmentId },
      include: {
        learnerProfile: { select: { id: true, accountId: true } },
        course: { select: { id: true, title: true, type: true, instructorId: true } },
        batch: { select: { id: true, name: true, capacity: true } },
      },
    });
    if (!enrolment) return;
    const { course, batch } = enrolment;
    const learner = {
      userId: enrolment.learnerProfile.accountId,
      learnerProfileId: enrolment.learnerProfile.id,
    };
    const learnerRoute = batch ? `/online-classes/${batch.id}` : "/my-courses";

    if (enrolment.waitlisted) {
      await notificationService.notify({
        type: "enrolment.waitlisted",
        recipients: [learner],
        dedupeKey: `enrolment.waitlisted:${enrolment.id}`,
        title: "On the waitlist",
        body: `You're #${enrolment.waitlistPosition ?? "?"} on the waitlist for "${batch?.name ?? course.title}"`,
        data: { courseId: course.id, batchId: batch?.id, route: `/courses/${course.id}` },
      });
      return;
    }

    await notificationService.notify({
      type: "enrolment.confirmed",
      recipients: [learner],
      dedupeKey: `enrolment.confirmed:${enrolment.id}`,
      title: "Enrolled",
      body: `You're enrolled in "${course.title}"${batch ? ` (${batch.name})` : ""}`,
      data: { courseId: course.id, batchId: batch?.id, route: learnerRoute },
    });

    await notificationService.notifyGrouped({
      type: "course.new_enrolment",
      recipients: [{ userId: course.instructorId }],
      groupKey: `course.new_enrolment:${course.id}:${todayKey()}`,
      build: (count) => ({
        title: "New enrolments",
        body: `${plural(count, "new learner")} joined "${course.title}" today`,
        data: { courseId: course.id, route: `/instructor/courses/${course.id}/students` },
      }),
    });

    if (batch) {
      const active = await prisma.enrolment.count({
        where: { batchId: batch.id, waitlisted: false },
      });
      if (active >= batch.capacity) {
        await notificationService.notify({
          type: "batch.full",
          recipients: [{ userId: course.instructorId }],
          dedupeKey: `batch.full:${batch.id}`,
          title: "Batch full",
          body: `"${batch.name}" has reached ${active}/${batch.capacity}`,
          data: {
            courseId: course.id,
            batchId: batch.id,
            route: `/instructor/courses/${course.id}/batches/${batch.id}`,
          },
        });
      }
    }
  });
}

function waitlistPromoted(enrolmentId: string) {
  background("waitlistPromoted", async () => {
    const enrolment = await prisma.enrolment.findUnique({
      where: { id: enrolmentId },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
      },
    });
    if (!enrolment || enrolment.waitlisted) return;
    const recipient = await learnerRecipient(enrolment.learnerProfileId);
    if (!recipient) return;
    await notificationService.notify({
      type: "enrolment.waitlist_promoted",
      recipients: [recipient],
      dedupeKey: `enrolment.waitlist_promoted:${enrolment.id}`,
      title: "You're in!",
      body: `A seat opened in "${enrolment.batch?.name ?? enrolment.course.title}"`,
      data: {
        courseId: enrolment.course.id,
        batchId: enrolment.batch?.id,
        route: enrolment.batch ? `/online-classes/${enrolment.batch.id}` : "/my-courses",
      },
    });
  });
}

function certificatesIssued(
  courseId: string,
  learnerProfileIds: string[],
  certificateType: string,
) {
  background("certificatesIssued", async () => {
    if (learnerProfileIds.length === 0) return;
    const [course, profiles] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true },
      }),
      prisma.learnerProfile.findMany({
        where: { id: { in: learnerProfileIds }, deletedAt: null },
        select: { id: true, accountId: true },
      }),
    ]);
    if (!course) return;
    await notificationService.notify({
      type: "certificate.issued",
      recipients: profiles.map((p) => ({
        userId: p.accountId,
        learnerProfileId: p.id,
      })),
      dedupeKey: `certificate.issued:${course.id}:${certificateType}`,
      title: "Certificate ready",
      body: `Your certificate for "${course.title}" is ready`,
      data: { courseId: course.id, route: "/certificates" },
    });
  });
}

// ──────────────────────────────────
// Instructor & admin: courses
// ──────────────────────────────────

function courseSubmittedForReview(courseId: string) {
  background("courseSubmittedForReview", async () => {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        status: true,
        instructor: { select: { firstName: true, lastName: true } },
      },
    });
    if (!course || course.status !== "PENDING_REVIEW") return;
    await notificationService.notify({
      type: "admin.course_review_requested",
      recipients: await admins(),
      groupKey: `course-review:${course.id}`,
      title: "Course review needed",
      body: `"${course.title}" by ${course.instructor.firstName} ${course.instructor.lastName}`.trim(),
      data: { courseId: course.id, route: "/admin/courses" },
    });
  });
}

function courseReviewed(courseId: string, approved: boolean, reason?: string) {
  background("courseReviewed", async () => {
    await notificationService.resolveGroup(`course-review:${courseId}`);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });
    if (!course) return;
    await notificationService.notify({
      type: approved ? "course.approved" : "course.rejected",
      recipients: [{ userId: course.instructorId }],
      title: approved ? "Course approved" : "Course needs changes",
      body: approved
        ? `"${course.title}" is now published`
        : `"${course.title}" was not approved.${reason ? ` Reason: ${reason}` : ""}`,
      data: { courseId: course.id, route: `/instructor/courses/${course.id}/edit` },
    });
  });
}

function courseSuspended(courseId: string) {
  background("courseSuspended", async () => {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });
    if (!course) return;
    await notificationService.notify({
      type: "course.suspended",
      recipients: [{ userId: course.instructorId }],
      title: "Course suspended",
      body: `"${course.title}" has been suspended`,
      data: { courseId: course.id, route: `/instructor/courses/${course.id}/edit` },
    });
  });
}

function courseRated(ratingId: string) {
  background("courseRated", async () => {
    const rating = await prisma.courseRating.findUnique({
      where: { id: ratingId },
      include: { course: { select: { id: true, title: true, instructorId: true } } },
    });
    if (!rating) return;
    await notificationService.notify({
      type: "course.rated",
      recipients: [{ userId: rating.course.instructorId }],
      dedupeKey: `course.rated:${rating.id}`,
      title: "New rating",
      body: `"${rating.course.title}" received a ${rating.rating}★ ${rating.review ? "review" : "rating"}`,
      data: { courseId: rating.course.id, route: `/instructor/courses/${rating.course.id}/edit` },
    });
  });
}

// ──────────────────────────────────
// Instructor applications
// ──────────────────────────────────

function instructorApplicationSubmitted(userId: string) {
  background("instructorApplicationSubmitted", async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!user) return;
    await notificationService.notify({
      type: "admin.instructor_application",
      recipients: await admins(),
      groupKey: `instructor-app:${user.id}`,
      dedupeKey: `admin.instructor_application:${user.id}`,
      title: "New instructor application",
      body: `${user.firstName} ${user.lastName} applied to teach`.trim(),
      data: { instructorId: user.id, route: `/admin/instructors/${user.id}` },
    });
  });
}

function instructorApplicationReviewed(
  userId: string,
  approved: boolean,
  reason?: string,
) {
  background("instructorApplicationReviewed", async () => {
    await notificationService.resolveGroup(`instructor-app:${userId}`);
    await notificationService.notify({
      type: approved
        ? "instructor.application_approved"
        : "instructor.application_rejected",
      recipients: [{ userId }],
      title: approved ? "Welcome aboard!" : "Application update",
      body: approved
        ? "Your instructor application has been approved"
        : `Your instructor application was not approved.${reason ? ` Reason: ${reason}` : ""}`,
      data: { route: approved ? "/instructor/dashboard" : "/instructor/login" },
    });
  });
}

// ──────────────────────────────────
// Account holder: waivers & billing
// ──────────────────────────────────

function waiverRequested(waiverId: string) {
  background("waiverRequested", async () => {
    const waiver = await prisma.waiver.findUnique({
      where: { id: waiverId },
      select: {
        id: true,
        account: { select: { firstName: true, lastName: true } },
        learnerProfile: { select: { displayName: true } },
      },
    });
    if (!waiver) return;
    const accountName =
      `${waiver.account.firstName} ${waiver.account.lastName}`.trim();
    await notificationService.notify({
      type: "admin.waiver_requested",
      recipients: await admins(),
      groupKey: `waiver:${waiver.id}`,
      dedupeKey: `admin.waiver_requested:${waiver.id}`,
      title: "Waiver request",
      body: waiver.learnerProfile
        ? `${accountName} asked for a fee waiver for ${waiver.learnerProfile.displayName}`
        : `New waiver request from ${accountName}`,
      data: { waiverId: waiver.id, route: "/admin/waivers" },
    });
  });
}

function waiverDecided(waiverId: string, reason?: string) {
  background("waiverDecided", async () => {
    await notificationService.resolveGroup(`waiver:${waiverId}`);
    const waiver = await prisma.waiver.findUnique({
      where: { id: waiverId },
      select: {
        id: true,
        accountId: true,
        status: true,
        tier: true,
        rejectionReason: true,
        learnerProfile: { select: { displayName: true } },
      },
    });
    if (!waiver) return;
    const name = waiver.learnerProfile?.displayName ?? "your learner";
    const content = {
      APPROVED: {
        type: "waiver.approved" as const,
        title: "Waiver approved",
        body: `${name} has a ${waiver.tier ?? 0}% waiver to use on their next subscription within 30 days`,
      },
      REJECTED: {
        type: "waiver.rejected" as const,
        title: "Waiver not approved",
        body: `The fee waiver request for ${name} was not approved.${
          waiver.rejectionReason ? ` Reason: ${waiver.rejectionReason}` : ""
        }`,
      },
      REVOKED: {
        type: "waiver.revoked" as const,
        title: "Waiver withdrawn",
        body: `The fee waiver for ${name} has been withdrawn.${reason ? ` Reason: ${reason}` : ""}`,
      },
    }[waiver.status as "APPROVED" | "REJECTED" | "REVOKED"];
    if (!content) return;
    await notificationService.notify({
      ...content,
      recipients: [{ userId: waiver.accountId }],
      dedupeKey: `${content.type}:${waiver.id}`,
      data: { waiverId: waiver.id, route: "/subscription" },
    });
  });
}

async function accountForStripeSubscription(stripeSubscriptionId?: string) {
  if (!stripeSubscriptionId) return null;
  return prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    select: {
      id: true,
      accountId: true,
      currentPeriodEnd: true,
      account: { select: { email: true } },
    },
  });
}

function formatAmount(cents: unknown, currency: unknown): string | null {
  if (typeof cents !== "number") return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency ?? "usd").toUpperCase(),
    }).format(cents / 100);
  } catch {
    return null;
  }
}

function paymentSucceeded(invoice: {
  id: string;
  subscription?: string;
  amount_paid?: number;
  currency?: string;
}) {
  background("paymentSucceeded", async () => {
    const subscription = await accountForStripeSubscription(invoice.subscription);
    if (!subscription) return;
    const amount = formatAmount(invoice.amount_paid, invoice.currency);
    await notificationService.notify({
      type: "billing.payment_succeeded",
      recipients: [{ userId: subscription.accountId }],
      dedupeKey: `billing.payment_succeeded:${invoice.id}`,
      title: "Payment received",
      body: amount
        ? `Thanks! Your payment of ${amount} was successful`
        : "Thanks! Your payment was successful",
      data: { invoiceId: invoice.id, route: "/account-settings" },
    });
  });
}

function paymentFailed(invoice: { id: string; subscription?: string }) {
  background("paymentFailed", async () => {
    const subscription = await accountForStripeSubscription(invoice.subscription);
    if (!subscription) return;
    await notificationService.notify({
      type: "billing.payment_failed",
      recipients: [{ userId: subscription.accountId }],
      dedupeKey: `billing.payment_failed:${invoice.id}`,
      title: "Payment failed",
      body: "Please update your payment method to keep access",
      data: { invoiceId: invoice.id, route: "/account-settings" },
    });
    await notificationService.notify({
      type: "admin.payment_failed",
      recipients: await admins(),
      dedupeKey: `admin.payment_failed:${invoice.id}`,
      title: "Payment failed",
      body: `Payment failed for ${subscription.account.email}`,
      data: { subscriptionId: subscription.id, route: "/admin/subscriptions" },
    });
  });
}

function subscriptionCancelled(stripeSubscriptionId: string) {
  background("subscriptionCancelled", async () => {
    const subscription = await accountForStripeSubscription(stripeSubscriptionId);
    if (!subscription) return;
    await notifyLocalized(
      {
        type: "billing.subscription_cancelled",
        recipients: [{ userId: subscription.accountId }],
        dedupeKey: `billing.subscription_cancelled:${subscription.id}`,
      },
      (zone) => ({
        title: "Subscription cancelled",
        body: `Your subscription has been cancelled. Access ends ${formatDate(subscription.currentPeriodEnd, zone)}`,
        data: { route: "/account-settings" },
      }),
    );
  });
}

// ──────────────────────────────────
// Manual subscriptions
// ──────────────────────────────────

function subscriptionRequested(requestId: string) {
  background("subscriptionRequested", async () => {
    const request = await prisma.subscriptionRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        learnerProfile: { select: { displayName: true } },
        account: { select: { firstName: true, lastName: true } },
      },
    });
    if (!request) return;
    const accountName =
      `${request.account.firstName} ${request.account.lastName}`.trim();
    await notificationService.notify({
      type: "admin.subscription_requested",
      recipients: await admins(),
      groupKey: `subscription-request:${request.id}`,
      dedupeKey: `admin.subscription_requested:${request.id}`,
      title: "Subscription payment to review",
      body: `${accountName} applied for a subscription for ${request.learnerProfile.displayName}`,
      data: { requestId: request.id, route: "/admin/subscription-requests" },
    });
  });
}

function subscriptionRequestDecided(requestId: string) {
  background("subscriptionRequestDecided", async () => {
    await notificationService.resolveGroup(`subscription-request:${requestId}`);
    const request = await prisma.subscriptionRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        accountId: true,
        status: true,
        periodEnd: true,
        rejectionReason: true,
        learnerProfile: { select: { displayName: true } },
      },
    });
    if (!request) return;
    const name = request.learnerProfile.displayName;
    if (request.status === "APPROVED" && request.periodEnd) {
      const periodEnd = request.periodEnd;
      await notifyLocalized(
        {
          type: "subscription.approved",
          recipients: [{ userId: request.accountId }],
          dedupeKey: `subscription.approved:${request.id}`,
        },
        (zone) => ({
          title: "Subscription approved",
          body: `${name} is subscribed until ${formatDateTime(periodEnd, zone)}`,
          data: { requestId: request.id, route: "/subscription" },
        }),
      );
    } else if (request.status === "REJECTED") {
      await notificationService.notify({
        type: "subscription.rejected",
        recipients: [{ userId: request.accountId }],
        dedupeKey: `subscription.rejected:${request.id}`,
        title: "Subscription not approved",
        body: `The subscription payment for ${name} was not approved.${
          request.rejectionReason ? ` Reason: ${request.rejectionReason}` : ""
        }`,
        data: { requestId: request.id, route: "/subscription" },
      });
    }
  });
}

/**
 * "Renew soon" reminder for a manual subscription: once when it has a week
 * or less left (`window` 7) and once on its last day (`window` 1).
 */
function subscriptionEndingSoon(
  subscriptionId: string,
  accountId: string,
  profileNames: string[],
  endsAt: Date,
  window: 7 | 1,
) {
  background("subscriptionEndingSoon", async () => {
    if (profileNames.length === 0) return;
    const who = profileNames.join(", ");
    const days = Math.max(1, Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000));
    await notificationService.notify({
      type: "subscription.ending_soon",
      recipients: [{ userId: accountId }],
      dedupeKey: `subscription.ending_soon:${subscriptionId}:${endsAt.toISOString()}:${window}`,
      title:
        days <= 1 ? "Subscription ends tomorrow" : `Subscription ends in ${days} days`,
      body:
        days <= 1
          ? `The subscription for ${who} ends tomorrow. Renew now so lessons and live classes aren't interrupted.`
          : `The subscription for ${who} ends in ${days} days. Payments are reviewed by our team, so renew early to avoid a gap.`,
      data: { subscriptionId, route: "/subscription" },
    });
  });
}

function subscriptionExpired(
  subscriptionId: string,
  accountId: string,
  profileNames: string[],
) {
  background("subscriptionExpired", async () => {
    if (profileNames.length === 0) return;
    await notificationService.notify({
      type: "subscription.expired",
      recipients: [{ userId: accountId }],
      dedupeKey: `subscription.expired:${subscriptionId}`,
      title: "Subscription ended",
      body: `The subscription for ${profileNames.join(", ")} has ended. Renew to keep enrolling in courses.`,
      data: { subscriptionId, route: "/subscription" },
    });
  });
}

// ──────────────────────────────────
// Admin: moderation
// ──────────────────────────────────

function chatMessageReported(messageId: string) {
  background("chatMessageReported", async () => {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, courseId: true, batchId: true },
    });
    if (!message) return;
    const [course, batch] = await Promise.all([
      prisma.course.findUnique({
        where: { id: message.courseId },
        select: { title: true },
      }),
      message.batchId
        ? prisma.batch.findUnique({
            where: { id: message.batchId },
            select: { name: true },
          })
        : null,
    ]);
    await notificationService.notify({
      type: "admin.chat_reported",
      recipients: await admins(),
      groupKey: `chat-report:${message.id}`,
      dedupeKey: `admin.chat_reported:${message.id}`,
      title: "Message reported",
      body: `A message in "${batch?.name ?? course?.title ?? "a class"}" chat was reported`,
      data: { messageId: message.id, route: "/admin/moderation" },
    });
  });
}

export const notificationEvents = {
  sessionScheduled,
  sessionUpdated,
  sessionCancelled,
  batchClosed,
  examPublished,
  examUpdated,
  examSubmitted,
  examGraded,
  assignmentPublished,
  assignmentSubmitted,
  assignmentGraded,
  materialPublished,
  enrolmentCreated,
  waitlistPromoted,
  certificatesIssued,
  courseSubmittedForReview,
  courseReviewed,
  courseSuspended,
  courseRated,
  instructorApplicationSubmitted,
  instructorApplicationReviewed,
  waiverRequested,
  waiverDecided,
  paymentSucceeded,
  paymentFailed,
  subscriptionCancelled,
  chatMessageReported,
  subscriptionRequested,
  subscriptionRequestDecided,
  subscriptionEndingSoon,
  subscriptionExpired,
};
