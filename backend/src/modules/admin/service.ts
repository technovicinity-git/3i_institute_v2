import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";

export class AdminService {
  async getUsers(page: number, limit: number, search?: string) {
    const where: any = {
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
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
      createdAt: user.createdAt,
      learnerProfilesCount: user._count.learnerProfiles,
      subscriptionStatus: user.subscriptions[0]?.status ?? null,
    }));

    return { users: formattedUsers, total };
  }

  async suspendUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Suspend all active subscriptions
    await prisma.subscription.updateMany({
      where: { accountId: userId, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return { message: "User suspended" };
  }

  async activateUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { message: "User activated" };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.delete({ where: { id: userId } });

    return { message: "User deleted" };
  }

  async getInstructors(page: number, limit: number) {
    const [total, instructors] = await Promise.all([
      prisma.user.count({ where: { role: { name: "Instructor" } } }),
      prisma.user.findMany({
        where: { role: { name: "Instructor" } },
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
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { instructors, total };
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

  async getPendingWaivers() {
    const waivers = await prisma.waiver.findMany({
      where: { status: "PENDING" },
      include: {
        account: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return waivers;
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

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      summary: course.summary,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
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
      createdAt: course.createdAt,
    }));

    return { courses: formattedCourses, total };
  }

  async suspendCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: "SUSPENDED" },
    });

    return updated;
  }

  async activateCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED" },
    });

    return updated;
  }

  async getAllWaivers(page: number, limit: number, status?: string) {
    const where: any = {
      ...(status ? { status } : {}),
    };

    const [total, waivers] = await Promise.all([
      prisma.waiver.count({ where }),
      prisma.waiver.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { waivers, total };
  }
}

export const adminService = new AdminService();
