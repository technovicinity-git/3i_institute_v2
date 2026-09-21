import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateBatchInput,
  UpdateBatchInput,
  AddSessionInput,
  MarkAttendanceInput,
} from "#/modules/batch/schema";

export class BatchService {
  async create(instructorId: string, input: CreateBatchInput) {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only create batches for your own courses",
      );
    }

    if (course.type === "REGULAR") {
      throw new ValidationError("Regular courses do not have batches");
    }

    // FR: Check for schedule conflicts with existing sessions
    const existingSessions = await prisma.session.findMany({
      where: {
        batch: {
          course: { instructorId },
        },
      },
      include: {
        batch: {
          include: {
            course: { select: { title: true } },
          },
        },
      },
    });

    const conflicts: string[] = [];

    for (const newSession of input.sessions) {
      const newStart = new Date(newSession.scheduledAt).getTime();
      const newEnd = newStart + newSession.durationMinutes * 60 * 1000;

      for (const existing of existingSessions) {
        const existingStart = new Date(existing.scheduledAt).getTime();
        const existingEnd =
          existingStart + existing.durationMinutes * 60 * 1000;

        // Overlap: newStart < existingEnd AND existingStart < newEnd
        if (newStart < existingEnd && existingStart < newEnd) {
          conflicts.push(
            `"${newSession.title}" conflicts with "${existing.title}" on ${existing.batch.course.title} — ${existing.batch.name}`,
          );
        }
      }
    }

    if (conflicts.length > 0) {
      throw new ValidationError(
        `Schedule conflict detected: ${conflicts.join("; ")}`,
      );
    }

    const batch = await prisma.batch.create({
      data: {
        courseId: input.courseId,
        name: input.name,
        capacity: input.capacity,
        sessions: {
          create: input.sessions.map((session) => ({
            title: session.title,
            scheduledAt: new Date(session.scheduledAt),
            durationMinutes: session.durationMinutes,
            meetingLink: session.meetingLink ?? null,
            notes: session.notes ?? null,
          })),
        },
      },
      include: {
        sessions: true,
      },
    });

    return batch;
  }

  async getCourseBatches(courseId: string) {
    const batches = await prisma.batch.findMany({
      where: { courseId },
      include: {
        sessions: {
          orderBy: { scheduledAt: "asc" },
        },
        _count: {
          select: {
            enrolments: { where: { waitlisted: false } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      capacity: batch.capacity,
      status: batch.status,
      sessions: batch.sessions,
      enrolmentCount: batch._count.enrolments,
      seatsRemaining: batch.capacity - batch._count.enrolments,
    }));
  }

  async getById(batchId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            type: true,
            minimumAge: true,
          },
        },
        sessions: {
          orderBy: { scheduledAt: "asc" },
        },
        enrolments: {
          where: { waitlisted: false },
          include: {
            learnerProfile: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundError("Batch not found");
    }

    return batch;
  }

  async update(instructorId: string, batchId: string, input: UpdateBatchInput) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { course: true },
    });

    if (!batch) {
      throw new NotFoundError("Batch not found");
    }

    if (batch.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only update your own batches");
    }

    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: input,
    });

    return updated;
  }

  async addSession(
    instructorId: string,
    batchId: string,
    input: AddSessionInput,
  ) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { course: true },
    });

    if (!batch) {
      throw new NotFoundError("Batch not found");
    }

    if (batch.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only modify your own batches");
    }

    // Check for conflicts with existing sessions (excluding this batch's own sessions)
    const existingSessions = await prisma.session.findMany({
      where: {
        batch: {
          course: { instructorId },
        },
        NOT: { batchId },
      },
      include: {
        batch: {
          include: {
            course: { select: { title: true } },
          },
        },
      },
    });

    const newStart = new Date(input.scheduledAt).getTime();
    const newEnd = newStart + input.durationMinutes * 60 * 1000;

    const conflicts: string[] = [];

    for (const existing of existingSessions) {
      const existingStart = new Date(existing.scheduledAt).getTime();
      const existingEnd = existingStart + existing.durationMinutes * 60 * 1000;

      if (newStart < existingEnd && existingStart < newEnd) {
        conflicts.push(
          `Conflicts with "${existing.title}" on ${existing.batch.course.title} — ${existing.batch.name}`,
        );
      }
    }

    if (conflicts.length > 0) {
      throw new ValidationError(
        `Schedule conflict detected: ${conflicts.join("; ")}`,
      );
    }

    const session = await prisma.session.create({
      data: {
        batchId,
        title: input.title,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes,
        meetingLink: input.meetingLink ?? null,
        notes: input.notes ?? null,
      },
    });

    return session;
  }

  async closeBatch(instructorId: string, batchId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { course: true },
    });

    if (!batch) {
      throw new NotFoundError("Batch not found");
    }

    if (batch.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only close your own batches");
    }

    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: { status: "COMPLETED" },
    });

    return updated;
  }

  async markAttendance(instructorId: string, input: MarkAttendanceInput) {
    const session = await prisma.session.findUnique({
      where: { id: input.sessionId },
      include: { batch: { include: { course: true } } },
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.batch.course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only mark attendance for your own sessions",
      );
    }

    // Check if learner is enrolled in this batch
    const enrolment = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        batchId: session.batchId,
        waitlisted: false,
      },
    });

    if (!enrolment) {
      throw new ValidationError("Learner is not enrolled in this batch");
    }

    // Upsert attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_learnerProfileId: {
          sessionId: input.sessionId,
          learnerProfileId: input.learnerProfileId,
        },
      },
      update: {
        status: input.status,
        markedBy: instructorId,
      },
      create: {
        sessionId: input.sessionId,
        learnerProfileId: input.learnerProfileId,
        status: input.status,
        markedBy: instructorId,
      },
    });

    return attendance;
  }

  async getSessionAttendance(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        batch: {
          include: {
            enrolments: {
              where: { waitlisted: false },
              include: {
                learnerProfile: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
        attendance: true,
      },
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    const learners = session.batch.enrolments.map((enrolment) => {
      const existingAttendance = session.attendance.find(
        (a) => a.learnerProfileId === enrolment.learnerProfileId,
      );

      return {
        learnerProfileId: enrolment.learnerProfileId,
        learnerName: enrolment.learnerProfile?.displayName ?? "Unknown",
        status: existingAttendance?.status ?? null,
      };
    });

    return {
      sessionId: session.id,
      sessionTitle: session.title,
      scheduledAt: session.scheduledAt,
      batchId: session.batchId,
      batchName: session.batch.name,
      learners,
    };
  }

  async getInstructorSessions(instructorId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        batch: {
          course: { instructorId },
        },
        scheduledAt: { gte: new Date() },
      },
      include: {
        batch: {
          include: {
            course: {
              select: { id: true, title: true },
            },
            _count: {
              select: {
                enrolments: { where: { waitlisted: false } },
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      meetingLink: session.meetingLink,
      notes: session.notes,
      batchId: session.batchId,
      batchName: session.batch.name,
      courseId: session.batch.course.id,
      courseTitle: session.batch.course.title,
      enrolmentCount: session.batch._count.enrolments,
    }));
  }

  async getInstructorBatches(instructorId: string) {
    const batches = await prisma.batch.findMany({
      where: {
        course: { instructorId },
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        _count: {
          select: {
            enrolments: { where: { waitlisted: false } },
            sessions: true,
          },
        },
        sessions: {
          where: { scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      courseId: batch.course.id,
      courseTitle: batch.course.title,
      capacity: batch.capacity,
      status: batch.status,
      enrolmentCount: batch._count.enrolments,
      sessionCount: batch._count.sessions,
      nextSessionAt: batch.sessions[0]?.scheduledAt ?? null,
    }));
  }

  async getLearnerSessions(accountId: string, learnerProfileId: string) {
    // Verify learner profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Get upcoming sessions from all batches this learner is enrolled in
    const sessions = await prisma.session.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        batch: {
          enrolments: {
            some: {
              learnerProfileId,
              waitlisted: false,
            },
          },
          status: { in: ["UPCOMING", "ACTIVE"] },
        },
      },
      include: {
        batch: {
          include: {
            course: {
              include: {
                instructor: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        attendance: {
          where: { learnerProfileId },
          take: 1,
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      meetingLink: session.meetingLink,
      notes: session.notes,
      batchId: session.batchId,
      batchName: session.batch.name,
      courseId: session.batch.course.id,
      courseTitle: session.batch.course.title,
      instructorName: `${session.batch.course.instructor.firstName} ${session.batch.course.instructor.lastName}`,
      attendanceStatus: session.attendance[0]?.status ?? null,
    }));
  }

  async getNextSession(batchId: string) {
    const session = await prisma.session.findFirst({
      where: {
        batchId,
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
    });

    if (!session) return null;

    return {
      id: session.id,
      title: session.title,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      meetingLink: session.meetingLink,
    };
  }
}

export const batchService = new BatchService();
