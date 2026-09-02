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
}

export const batchService = new BatchService();
