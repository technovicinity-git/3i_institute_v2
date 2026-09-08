import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";

interface CreateAssignmentInput {
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  totalMarks: number;
}

export class AssignmentService {
  async create(instructorId: string, input: CreateAssignmentInput) {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only create assignments for your own courses",
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        totalMarks: input.totalMarks,
      },
    });

    return assignment;
  }

  async getAssignments(instructorId: string, courseId?: string) {
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        ...(courseId ? { id: courseId } : {}),
      },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c) => c.id);
    const courseTitles = Object.fromEntries(
      courses.map((c) => [c.id, c.title]),
    );

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      courseId: assignment.courseId,
      courseTitle: courseTitles[assignment.courseId] ?? "Unknown",
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      status: assignment.status,
      submissionCount: assignment._count.submissions,
      createdAt: assignment.createdAt,
    }));
  }

  async getSubmissions(instructorId: string, assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    if (assignment.course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only view submissions for your own assignments",
      );
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    return submissions.map((submission) => ({
      id: submission.id,
      assignmentId: submission.assignmentId,
      learnerProfileId: submission.learnerProfileId,
      learnerName: submission.learnerProfile?.displayName ?? "Unknown",
      submittedAt: submission.submittedAt,
      content: submission.content,
      fileUrl: submission.fileUrl,
      marksAwarded: submission.marksAwarded,
      feedback: submission.feedback,
      graded: submission.graded,
    }));
  }

  async gradeSubmission(
    instructorId: string,
    submissionId: string,
    marksAwarded: number,
    feedback: string,
  ) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.assignment.course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only grade submissions for your own assignments",
      );
    }

    if (marksAwarded < 0 || marksAwarded > submission.assignment.totalMarks) {
      throw new ValidationError(
        `Marks must be between 0 and ${submission.assignment.totalMarks}`,
      );
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksAwarded,
        feedback,
        graded: true,
      },
    });

    return updated;
  }

  async getCourseAssignmentsForLearner(
    accountId: string,
    courseId: string,
    learnerProfileId: string,
  ) {
    // Verify profile belongs to account
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

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
        status: "PUBLISHED",
      },
      include: {
        submissions: {
          where: { learnerProfileId },
          take: 1,
        },
        course: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((assignment) => {
      const submission = assignment.submissions[0] ?? null;
      return {
        id: assignment.id,
        courseId: assignment.courseId,
        courseTitle: assignment.course.title,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        status: assignment.status,
        submitted: !!submission,
        submission: submission
          ? {
              id: submission.id,
              content: submission.content,
              fileUrl: submission.fileUrl,
              marksAwarded: submission.marksAwarded,
              feedback: submission.feedback,
              graded: submission.graded,
              submittedAt: submission.submittedAt,
            }
          : null,
        createdAt: assignment.createdAt,
      };
    });
  }

  async submitAssignment(
    accountId: string,
    input: {
      assignmentId: string;
      learnerProfileId: string;
      content: string;
      fileUrl?: string;
    },
  ) {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: input.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Check if already submitted
    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_learnerProfileId: {
          assignmentId: input.assignmentId,
          learnerProfileId: input.learnerProfileId,
        },
      },
    });

    if (existing) {
      throw new ValidationError("Assignment already submitted");
    }

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId: input.assignmentId,
        learnerProfileId: input.learnerProfileId,
        content: input.content,
        fileUrl: input.fileUrl ?? null,
      },
    });

    return submission;
  }
}

export const assignmentService = new AssignmentService();
