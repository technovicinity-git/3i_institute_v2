import { prisma } from "#/lib/prisma";
import { recordAudit } from "#/shared/audit";
import { isManualSubscription } from "#/modules/seat/service";
import { ForbiddenError, NotFoundError } from "#/shared/errors";
import {
  setCachedStatus,
  terminateUserSessions,
} from "#/modules/user/account-status";
import { notificationEvents } from "#/modules/notification/events";
import { emailLinks } from "#/modules/email/links";
import { emailService } from "#/modules/email/service";

export class AdminService {
  async getLearnerProfiles(
    page: number,
    limit: number,
    filters: { search?: string; status?: string; seatStatus?: string } = {},
  ) {
    const where: any = {
      ...(filters.status === "ACTIVE" ? { deletedAt: null } : {}),
      ...(filters.status === "ARCHIVED" ? { deletedAt: { not: null } } : {}),
      ...(filters.seatStatus === "ACTIVE" ? { isActive: true } : {}),
      ...(filters.seatStatus === "INACTIVE" ? { isActive: false } : {}),
      ...(filters.search ? {
        OR: [
          { displayName: { contains: filters.search, mode: "insensitive" } },
          { account: { is: { firstName: { contains: filters.search, mode: "insensitive" } } } },
          { account: { is: { lastName: { contains: filters.search, mode: "insensitive" } } } },
          { account: { is: { email: { contains: filters.search, mode: "insensitive" } } } },
        ],
      } : {}),
    };
    const [total, profiles] = await Promise.all([
      prisma.learnerProfile.count({ where }),
      prisma.learnerProfile.findMany({
        where,
        select: {
          id: true, displayName: true, dateOfBirth: true, avatarUrl: true,
          isActive: true, chatEnabled: true, createdAt: true, deletedAt: true,
          account: { select: { id: true, firstName: true, lastName: true, email: true, accountType: true } },
          _count: { select: { enrolments: true, examAttempts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { profiles, total };
  }

  async getLearnerProfileDetails(profileId: string) {
    const profile = await prisma.learnerProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true, displayName: true, dateOfBirth: true, avatarUrl: true,
        isActive: true, chatEnabled: true, nameLocked: true, createdAt: true, deletedAt: true,
        account: { select: { id: true, firstName: true, lastName: true, email: true, accountType: true } },
        enrolments: {
          orderBy: { enrolledAt: "desc" },
          select: {
            id: true, enrolledAt: true, waitlisted: true, waitlistPosition: true,
            course: {
              select: {
                id: true, title: true, status: true, thumbnailUrl: true,
                exams: {
                  select: {
                    id: true, title: true, type: true, totalMarks: true, passMark: true,
                    attempts: {
                      where: { learnerProfileId: profileId },
                      orderBy: { attemptNumber: "desc" },
                      select: { id: true, attemptNumber: true, score: true, totalMarks: true, passed: true, graded: true, startedAt: true, submittedAt: true },
                    },
                  },
                },
              },
            },
          },
        },
        _count: { select: { examAttempts: true, certificates: true } },
      },
    });
    if (!profile) throw new NotFoundError("Learner profile not found");
    return profile;
  }

  async archiveLearnerProfile(profileId: string, actorId: string) {
    const profile = await prisma.learnerProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundError("Learner profile not found");
    await prisma.learnerProfile.update({ where: { id: profileId }, data: { deletedAt: new Date() } });
    await recordAudit({
      actorId,
      action: "LEARNER_PROFILE_ARCHIVED",
      resource: "learner_profile",
      resourceId: profileId,
      details: { displayName: profile.displayName },
    });
    return { message: "Learner profile archived" };
  }

  async restoreLearnerProfile(profileId: string, actorId: string) {
    const profile = await prisma.learnerProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundError("Learner profile not found");
    await prisma.learnerProfile.update({ where: { id: profileId }, data: { deletedAt: null } });
    await recordAudit({
      actorId,
      action: "LEARNER_PROFILE_RESTORED",
      resource: "learner_profile",
      resourceId: profileId,
      details: { displayName: profile.displayName },
    });
    return { message: "Learner profile restored" };
  }

  async getUsers(
    page: number,
    limit: number,
    filters: { search?: string; role?: string; accountType?: string; emailVerified?: boolean; subscriptionStatus?: string; status?: string } = {},
  ) {
    const where: any = {
      ...(filters.search ? { OR: [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ] } : {}),
      ...(filters.role ? { role: { name: filters.role } } : {}),
      ...(filters.accountType ? { accountType: filters.accountType } : {}),
      ...(filters.emailVerified !== undefined ? { emailVerified: filters.emailVerified } : {}),
      ...(filters.subscriptionStatus === "ACTIVE" ? { subscriptions: { some: { status: "ACTIVE" } } } : {}),
      ...(filters.subscriptionStatus === "INACTIVE" ? { subscriptions: { none: { status: "ACTIVE" } } } : {}),
      ...(filters.status === "ACTIVE" ? { isActive: true } : {}),
      ...(filters.status === "INACTIVE" ? { isActive: false } : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          accountType: true,
          emailVerified: true,
          isActive: true,
          deactivatedAt: true,
          createdAt: true,
          role: {
            select: { name: true },
          },
          _count: {
            select: {
              learnerProfiles: true,
            },
          },
          subscriptions: {
            where: { status: "ACTIVE" },
            select: { status: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      accountType: user.accountType,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      deactivatedAt: user.deactivatedAt,
      createdAt: user.createdAt,
      learnerProfilesCount: user._count.learnerProfiles,
      subscriptionStatus: user.subscriptions[0]?.status ?? null,
    }));

    return { users: formattedUsers, total };
  }

  // Deactivates the account: the user can no longer log in and every
  // existing session (web and mobile) is ended immediately.
  async suspendUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new ForbiddenError("You cannot deactivate your own account");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isActive) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false, deactivatedAt: new Date() },
      });
      emailService.sendInBackground({
        to: user.email,
        template: "account.deactivated",
        data: { firstName: user.firstName, contactUrl: emailLinks.contact() },
      });
    }

    await terminateUserSessions(userId, "deactivated");

    if (user.isActive) {
      await recordAudit({
        actorId,
        action: "USER_DEACTIVATED",
        resource: "user",
        resourceId: userId,
        details: { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email },
      });
    }

    return { id: userId, isActive: false };
  }

  async activateUser(userId: string, actorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        deactivatedAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    setCachedStatus(userId, true);

    if (!user.isActive) {
      await recordAudit({
        actorId,
        action: "USER_REACTIVATED",
        resource: "user",
        resourceId: userId,
        details: { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email },
      });
      emailService.sendInBackground({
        to: user.email,
        template: "account.reactivated",
        data: {
          firstName: user.firstName,
          loginUrl:
            user.role.name === "Instructor"
              ? emailLinks.instructorLogin()
              : emailLinks.login(),
        },
      });
    }

    return { id: userId, isActive: true };
  }

  async deleteUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new ForbiddenError("You cannot delete your own account");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.delete({ where: { id: userId } });
    // The user is gone, so keep who it was in the entry
    await recordAudit({
      actorId,
      action: "USER_DELETED",
      resource: "user",
      resourceId: userId,
      details: { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email },
    });
    await terminateUserSessions(userId, "deleted");

    return { message: "User deleted" };
  }

  async getInstructors(page: number, limit: number) {
    const statusEvents = await prisma.auditLog.findMany({
      where: { action: { in: ["INSTRUCTOR_SUSPENDED", "INSTRUCTOR_REINSTATED"] }, resource: "instructor" },
      select: { resourceId: true, action: true },
      orderBy: { createdAt: "desc" },
    });
    const latestStatus = new Map<string, string>();
    for (const event of statusEvents) if (event.resourceId && !latestStatus.has(event.resourceId)) latestStatus.set(event.resourceId, event.action);
    const currentlySuspendedIds = [...latestStatus].filter(([, action]) => action === "INSTRUCTOR_SUSPENDED").map(([id]) => id);
    const where = { OR: [{ role: { name: "Instructor" } }, { id: { in: currentlySuspendedIds } }] };
    const [total, instructors] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: { courses: true },
          },
          role: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { instructors: instructors.map((instructor) => ({ ...instructor, status: instructor.role.name === "Instructor" ? "ACTIVE" : "SUSPENDED" })), total };
  }

  async getInstructorDetails(instructorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: instructorId },
      select: {
        id: true, firstName: true, lastName: true, email: true, bio: true,
        avatarUrl: true, createdAt: true, role: { select: { name: true } },
        courses: { select: { id: true, title: true, summary: true, thumbnailUrl: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) throw new NotFoundError("Instructor not found");
    const application = await prisma.auditLog.findFirst({
      where: { resource: "instructor_application", resourceId: instructorId, action: "INSTRUCTOR_APPLICATION_SUBMITTED" },
      orderBy: { createdAt: "desc" },
      select: { details: true, createdAt: true },
    });
    const latestStatus = await prisma.auditLog.findFirst({
      where: { resource: "instructor", resourceId: instructorId, action: { in: ["INSTRUCTOR_SUSPENDED", "INSTRUCTOR_REINSTATED"] } },
      orderBy: { createdAt: "desc" }, select: { action: true },
    });
    const rejection = await prisma.auditLog.findFirst({ where: { resource: "instructor_application", resourceId: instructorId, action: "INSTRUCTOR_REJECTED" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    const status = user.role.name === "Instructor" ? "ACTIVE" : latestStatus?.action === "INSTRUCTOR_SUSPENDED" ? "SUSPENDED" : rejection && (!application || rejection.createdAt > application.createdAt) ? "REJECTED" : "PENDING";
    return { ...user, status, application: application?.details ?? null };
  }

  async getPendingInstructorApplications() {
    const applications = await prisma.auditLog.findMany({
      where: { action: "INSTRUCTOR_APPLICATION_SUBMITTED" },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user details separately
    const userIds = applications
      .map((app) => app.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    return applications.map((application) => ({
      id: application.id,
      userId: application.userId,
      user: application.userId ? (userMap[application.userId] ?? null) : null,
      details: application.details,
      createdAt: application.createdAt,
    }));
  }

  async getPendingCourses() {
    const courses = await prisma.course.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses;
  }

  async getAllCourses(page: number, limit: number, status?: string) {
    const where: any = {
      ...(status ? { status } : {}),
    };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { enrolments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Fetch rejection reasons for DRAFT courses
    const draftCourseIds = courses
      .filter((c) => c.status === "DRAFT")
      .map((c) => c.id);

    let rejectionMap = new Map<string, string>();

    if (draftCourseIds.length > 0) {
      const rejectionLogs = await prisma.auditLog.findMany({
        where: {
          action: "COURSE_REJECTED",
          resourceId: { in: draftCourseIds },
        },
        orderBy: { createdAt: "desc" },
      });

      for (const log of rejectionLogs) {
        if (log.resourceId && !rejectionMap.has(log.resourceId)) {
          const details = log.details as any;
          rejectionMap.set(
            log.resourceId,
            details?.reason ?? "No reason provided",
          );
        }
      }
    }

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      summary: course.summary,
      thumbnailUrl: course.thumbnailUrl,
      categoryId: course.categoryId,
      category: course.category
        ? {
            id: course.category.id,
            name: course.category.name,
            slug: course.category.slug,
          }
        : null,
      level: course.level,
      type: course.type,
      language: course.language,
      minimumAge: course.minimumAge,
      status: course.status,
      instructor: {
        id: course.instructor.id,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`,
      },
      enrolmentCount: course._count.enrolments,
      rejectionReason:
        course.status === "DRAFT"
          ? (rejectionMap.get(course.id) ?? null)
          : null,
      createdAt: course.createdAt,
    }));

    return { courses: formattedCourses, total };
  }

  async suspendCourse(courseId: string, actorId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { email: true, firstName: true } } },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: "SUSPENDED" },
    });

    notificationEvents.courseSuspended(courseId);
    if (course.status !== "SUSPENDED") {
      await recordAudit({
        actorId,
        action: "COURSE_SUSPENDED",
        resource: "course",
        resourceId: courseId,
        details: { title: course.title },
      });
      emailService.sendInBackground({
        to: course.instructor.email,
        template: "instructor.course-suspended",
        data: {
          firstName: course.instructor.firstName,
          courseTitle: course.title,
          contactUrl: emailLinks.contact(),
        },
      });
    }

    return updated;
  }

  async activateCourse(courseId: string, actorId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED" },
    });

    if (course.status !== "PUBLISHED") {
      await recordAudit({
        actorId,
        action: "COURSE_REACTIVATED",
        resource: "course",
        resourceId: courseId,
        details: { title: course.title, previousStatus: course.status },
      });
    }

    return updated;
  }

  async getSubscriptions(page: number, limit: number, status?: string) {
    const where: any = {
      ...(status ? { status } : {}),
    };

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        include: {
          account: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedSeats: {
            select: { learnerProfile: { select: { displayName: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      accountId: sub.accountId,
      accountName: `${sub.account.firstName} ${sub.account.lastName}`,
      accountEmail: sub.account.email,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      isManual: isManualSubscription(sub),
      profiles: sub.assignedSeats.map((seat) => seat.learnerProfile.displayName),
      status: sub.status,
      seats: sub.seats,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt,
    }));

    return { subscriptions: formattedSubscriptions, total };
  }

  async getCertificates(
    page: number,
    limit: number,
    filters: { search?: string; type?: string; status?: string } = {},
  ) {
    const { search, type, status } = filters;
    const where: any = {
      ...(search
        ? {
            OR: [
              {
                learnerNameSnapshot: { contains: search, mode: "insensitive" },
              },
              {
                courseTitleSnapshot: { contains: search, mode: "insensitive" },
              },
              { verificationCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(type && ["ATTENDANCE", "COMPLETION", "EXAM"].includes(type)
        ? { type }
        : {}),
      ...(status === "ACTIVE"
        ? { revokedAt: null }
        : status === "REVOKED"
          ? { revokedAt: { not: null } }
          : {}),
    };

    const [total, certificates] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      certificates: certificates.map((cert) => {
        const details = (cert.details ?? {}) as {
          examTitle?: string;
          score?: number;
          totalMarks?: number;
        };
        return {
          id: cert.id,
          type: cert.type,
          verificationCode: cert.verificationCode,
          learnerName: cert.learnerNameSnapshot,
          courseId: cert.courseId,
          courseTitle: cert.courseTitleSnapshot,
          examTitle: details.examTitle ?? null,
          score: typeof details.score === "number" ? details.score : null,
          totalMarks:
            typeof details.totalMarks === "number" ? details.totalMarks : null,
          issuerName: cert.issuerName,
          issuedAt: cert.issuedAt,
          revokedAt: cert.revokedAt,
          revokeReason: cert.revokeReason,
        };
      }),
      total,
    };
  }

  async getExams(page: number, limit: number, type?: string) {
    const where: any = {
      ...(type ? { type } : {}),
    };

    const [total, exams] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        include: {
          course: {
            select: { title: true },
          },
          _count: {
            select: { attempts: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedExams = exams.map((exam) => ({
      id: exam.id,
      courseId: exam.courseId,
      courseTitle: exam.course.title,
      title: exam.title,
      type: exam.type,
      duration: exam.duration,
      passMark: exam.passMark,
      totalMarks: exam.totalMarks,
      maxAttempts: exam.maxAttempts,
      questionCount: (exam.questions as any[])?.length ?? 0,
      attemptCount: exam._count.attempts,
      createdAt: exam.createdAt,
    }));

    return { exams: formattedExams, total };
  }

  async getExamAttempts(examId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      learnerProfileId: attempt.learnerProfileId,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      passed: attempt.passed,
      graded: attempt.graded,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    }));
  }
}

export const adminService = new AdminService();
