import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";
import { Prisma } from "../../generated/prisma/client.js";

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  category: string;
  learnerProfileId?: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  async create(input: CreateNotificationInput) {
    const details = {
      title: input.title,
      body: input.body,
      category: input.category,
      read: false,
      data: input.data ?? null,
    } as const;

    const notification = await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: "NOTIFICATION",
        resource: "notification",
        resourceId: input.learnerProfileId ?? null,
        details: details as unknown as Prisma.InputJsonValue,
      },
    });

    // TODO: Send push notification via Firebase Cloud Messaging
    // TODO: Send email via AWS SES

    return notification;
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const [total, notifications] = await Promise.all([
      prisma.auditLog.count({
        where: {
          userId,
          action: "NOTIFICATION",
        },
      }),
      prisma.auditLog.findMany({
        where: {
          userId,
          action: "NOTIFICATION",
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        title: (n.details as any)?.title ?? "",
        body: (n.details as any)?.body ?? "",
        category: (n.details as any)?.category ?? "general",
        read: (n.details as any)?.read ?? false,
        data: (n.details as any)?.data ?? null,
        createdAt: n.createdAt,
      })),
      total,
      page,
      limit,
      unreadCount: await this.getUnreadCount(userId),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await prisma.auditLog.findMany({
      where: {
        userId,
        action: "NOTIFICATION",
      },
      select: {
        details: true,
      },
    });

    return notifications.filter((n) => !((n.details as any)?.read ?? false))
      .length;
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.auditLog.findFirst({
      where: {
        id: notificationId,
        userId,
        action: "NOTIFICATION",
      },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    const details = (notification.details as any) ?? {};
    details.read = true;

    await prisma.auditLog.update({
      where: { id: notificationId },
      data: {
        details: JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue,
      },
    });
  }

  async markAllAsRead(userId: string) {
    const notifications = await prisma.auditLog.findMany({
      where: {
        userId,
        action: "NOTIFICATION",
      },
    });

    for (const notification of notifications) {
      const details = (notification.details as any) ?? {};
      details.read = true;

      await prisma.auditLog.update({
        where: { id: notification.id },
        data: {
          details: JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue,
        },
      });
    }
  }

  // ──────────────────────────────────
  // Notification triggers
  // ──────────────────────────────────

  async notifyCourseEnrolled(
    userId: string,
    learnerProfileId: string,
    courseTitle: string,
  ) {
    await this.create({
      userId,
      title: "Course Enrolled",
      body: `Successfully enrolled in "${courseTitle}"`,
      category: "enrolment",
      learnerProfileId,
      data: { type: "enrolment", courseTitle },
    });
  }

  async notifyBatchScheduled(
    userId: string,
    batchName: string,
    scheduledAt: string,
  ) {
    await this.create({
      userId,
      title: "Batch Scheduled",
      body: `New batch "${batchName}" scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      category: "batch",
      data: { type: "batch", batchName, scheduledAt },
    });
  }

  async notifyExamAvailable(
    userId: string,
    examTitle: string,
    courseTitle: string,
  ) {
    await this.create({
      userId,
      title: "Exam Available",
      body: `Exam "${examTitle}" is now available for "${courseTitle}"`,
      category: "exam",
      data: { type: "exam", examTitle, courseTitle },
    });
  }

  async notifyCertificateIssued(
    userId: string,
    learnerProfileId: string,
    courseTitle: string,
    certificateType: string,
  ) {
    await this.create({
      userId,
      title: "Certificate Issued",
      body: `Certificate (${certificateType}) issued for "${courseTitle}"`,
      category: "certificate",
      learnerProfileId,
      data: { type: "certificate", courseTitle, certificateType },
    });
  }

  async notifyPaymentSuccess(userId: string, amount: string) {
    await this.create({
      userId,
      title: "Payment Successful",
      body: `Payment of ${amount} was processed successfully`,
      category: "billing",
      data: { type: "payment", status: "success", amount },
    });
  }

  async notifyPaymentFailed(userId: string) {
    await this.create({
      userId,
      title: "Payment Failed",
      body: "Your subscription payment failed. Please update your payment method.",
      category: "billing",
      data: { type: "payment", status: "failed" },
    });
  }

  async notifyWaiverDecision(userId: string, approved: boolean, tier?: number) {
    await this.create({
      userId,
      title: approved ? "Waiver Approved" : "Waiver Rejected",
      body: approved
        ? `Your waiver request was approved at ${tier}% discount`
        : "Your waiver request was rejected",
      category: "waiver",
      data: { type: "waiver", approved, tier },
    });
  }

  async notifyInstructorApproved(userId: string) {
    await this.create({
      userId,
      title: "Instructor Approved",
      body: "Your instructor application has been approved. Welcome aboard!",
      category: "instructor",
      data: { type: "instructor", status: "approved" },
    });
  }

  async notifyInstructorRejected(userId: string, reason?: string) {
    await this.create({
      userId,
      title: "Instructor Application Rejected",
      body: reason ? `Reason: ${reason}` : "Your application was not approved",
      category: "instructor",
      data: { type: "instructor", status: "rejected", reason },
    });
  }
}

export const notificationService = new NotificationService();
