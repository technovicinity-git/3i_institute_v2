import { prisma } from "#/lib/prisma";
import { ForbiddenError, NotFoundError } from "#/shared/errors";
import { Prisma } from "../../generated/prisma/client.js";
import {
  getNotificationEvent,
  type NotificationPriority,
  type NotificationType,
} from "#/modules/notification/catalog";
import { emitToUser } from "#/modules/notification/realtime";

export interface NotificationRecipient {
  // Account that owns the notification (a learner's account holder,
  // an instructor or an admin).
  userId: string;
  // Set for learner-profile notifications; omitted for account-level ones.
  learnerProfileId?: string | null;
}

export interface NotificationContent {
  title: string;
  body: string;
  // Ids for the client plus `route`, the web path to open on tap.
  data?: Record<string, unknown> & { route?: string };
  imageUrl?: string | null;
}

export interface NotifyInput extends NotificationContent {
  type: NotificationType;
  recipients: NotificationRecipient[];
  // Makes the notification idempotent: a recipient never receives two
  // notifications with the same key (webhook retries, double submits).
  dedupeKey?: string;
  // Links related notifications so they can be resolved together.
  groupKey?: string;
  priority?: NotificationPriority;
  expiresAt?: Date | null;
}

export interface NotifyGroupedInput
  extends Omit<NotifyInput, keyof NotificationContent | "dedupeKey"> {
  groupKey: string;
  // Builds the text for a group that now contains `count` events.
  build: (count: number) => NotificationContent;
}

export interface ListNotificationsQuery {
  learnerProfileId?: string;
  category?: string;
  unreadOnly?: boolean;
  page: number;
  limit: number;
}

const INSERT_CHUNK = 500;

type NotificationRow = Prisma.NotificationGetPayload<object>;

function serialize(n: NotificationRow) {
  return {
    id: n.id,
    type: n.type,
    category: n.category,
    priority: n.priority,
    title: n.title,
    body: n.body,
    data: n.data,
    imageUrl: n.imageUrl,
    learnerProfileId: n.learnerProfileId,
    read: n.readAt !== null,
    readAt: n.readAt,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export type SerializedNotification = ReturnType<typeof serialize>;

// Unique recipients, keeping the first occurrence.
function uniqueRecipients(recipients: NotificationRecipient[]) {
  const seen = new Set<string>();
  return recipients.filter((r) => {
    const key = `${r.userId}|${r.learnerProfileId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Scope for one feed: a learner profile's notifications, or the
// account-level ones (instructors, admins, account holders).
function scopeWhere(
  userId: string,
  learnerProfileId?: string,
): Prisma.NotificationWhereInput {
  return {
    userId,
    learnerProfileId: learnerProfileId ?? null,
    archivedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

export class NotificationService {
  // ──────────────────────────────────
  // Creating notifications
  // ──────────────────────────────────

  async notify(input: NotifyInput): Promise<number> {
    const recipients = uniqueRecipients(input.recipients);
    if (recipients.length === 0) return 0;

    const definition = getNotificationEvent(input.type);
    const rows = recipients.map((recipient) => ({
      userId: recipient.userId,
      learnerProfileId: recipient.learnerProfileId ?? null,
      type: input.type,
      category: definition.category,
      priority: input.priority ?? definition.priority,
      title: input.title,
      body: input.body,
      data: (input.data ?? undefined) as Prisma.InputJsonValue | undefined,
      imageUrl: input.imageUrl ?? null,
      // The unique key is per user, so include the profile to keep sibling
      // learner profiles under one account independent.
      dedupeKey: input.dedupeKey
        ? `${input.dedupeKey}:${recipient.learnerProfileId ?? "account"}`
        : null,
      groupKey: input.groupKey ?? null,
      expiresAt: input.expiresAt ?? null,
    }));

    const created: NotificationRow[] = [];
    for (const batch of chunk(rows, INSERT_CHUNK)) {
      created.push(
        ...(await prisma.notification.createManyAndReturn({
          data: batch,
          skipDuplicates: true,
        })),
      );
    }

    // Email and push deliveries are queued here once the delivery worker
    // exists (plan phases 2–3).

    await this.publish(created);
    return created.length;
  }

  // Collapses repeated events into one unread notification per recipient,
  // e.g. "3 new lessons added". A new notification starts once the previous
  // one has been read.
  async notifyGrouped(input: NotifyGroupedInput): Promise<number> {
    const recipients = uniqueRecipients(input.recipients);
    if (recipients.length === 0) return 0;

    const existing = await prisma.notification.findMany({
      where: {
        groupKey: input.groupKey,
        readAt: null,
        archivedAt: null,
        userId: { in: [...new Set(recipients.map((r) => r.userId))] },
      },
    });
    const existingByRecipient = new Map(
      existing.map((n) => [`${n.userId}|${n.learnerProfileId ?? ""}`, n]),
    );

    const fresh: NotificationRecipient[] = [];
    const updated: NotificationRow[] = [];
    for (const recipient of recipients) {
      const current = existingByRecipient.get(
        `${recipient.userId}|${recipient.learnerProfileId ?? ""}`,
      );
      if (!current) {
        fresh.push(recipient);
        continue;
      }
      const previousData = (current.data ?? {}) as Record<string, unknown>;
      const count = Number(previousData["count"] ?? 1) + 1;
      const content = input.build(count);
      updated.push(
        await prisma.notification.update({
          where: { id: current.id },
          data: {
            title: content.title,
            body: content.body,
            data: { ...content.data, count } as Prisma.InputJsonValue,
            // Bump to the top of the feed.
            createdAt: new Date(),
          },
        }),
      );
    }

    await this.publish(updated);

    if (fresh.length > 0) {
      const content = input.build(1);
      await this.notify({
        ...input,
        ...content,
        data: { ...content.data, count: 1 },
        recipients: fresh,
      });
    }
    return fresh.length + updated.length;
  }

  // Marks every unread notification in a group as read, e.g. once one admin
  // has approved a course, the review request is cleared for all admins.
  async resolveGroup(groupKey: string): Promise<void> {
    const affected = await prisma.notification.findMany({
      where: { groupKey, readAt: null },
      select: { userId: true },
      distinct: ["userId"],
    });
    if (affected.length === 0) return;

    await prisma.notification.updateMany({
      where: { groupKey, readAt: null },
      data: { readAt: new Date() },
    });
    await Promise.all(affected.map((a) => this.emitUnread(a.userId)));
  }

  // ──────────────────────────────────
  // Reading notifications
  // ──────────────────────────────────

  async assertProfileOwnership(userId: string, learnerProfileId?: string) {
    if (!learnerProfileId) return;
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId: userId, deletedAt: null },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenError("Learner profile not found");
  }

  async list(userId: string, query: ListNotificationsQuery) {
    await this.assertProfileOwnership(userId, query.learnerProfileId);

    const where: Prisma.NotificationWhereInput = {
      ...scopeWhere(userId, query.learnerProfileId),
      ...(query.category ? { category: query.category } : {}),
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [total, notifications, unreadCount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({
        where: { ...scopeWhere(userId, query.learnerProfileId), readAt: null },
      }),
    ]);

    return {
      notifications: notifications.map(serialize),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: query.page * query.limit < total,
      unreadCount,
    };
  }

  // Unread counts for every feed the user can see: account-level plus one per
  // learner profile (used for badges on the profile picker).
  async getUnreadCounts(userId: string, learnerProfileId?: string) {
    await this.assertProfileOwnership(userId, learnerProfileId);

    const groups = await prisma.notification.groupBy({
      by: ["learnerProfileId"],
      where: {
        userId,
        readAt: null,
        archivedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      _count: { _all: true },
    });

    const byProfile: Record<string, number> = {};
    let account = 0;
    for (const group of groups) {
      if (group.learnerProfileId) {
        byProfile[group.learnerProfileId] = group._count._all;
      } else {
        account = group._count._all;
      }
    }

    return {
      unreadCount: learnerProfileId
        ? (byProfile[learnerProfileId] ?? 0)
        : account,
      account,
      byProfile,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true, readAt: true },
    });
    if (!notification) throw new NotFoundError("Notification not found");

    if (!notification.readAt) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
      await this.emitUnread(userId);
    }
  }

  async markAllAsRead(userId: string, learnerProfileId?: string) {
    await this.assertProfileOwnership(userId, learnerProfileId);
    const result = await prisma.notification.updateMany({
      where: { ...scopeWhere(userId, learnerProfileId), readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count > 0) await this.emitUnread(userId);
    return { updated: result.count };
  }

  async archive(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId, archivedAt: null },
      data: { archivedAt: new Date(), readAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundError("Notification not found");
    await this.emitUnread(userId);
  }

  // ──────────────────────────────────
  // Realtime
  // ──────────────────────────────────

  private async publish(rows: NotificationRow[]) {
    if (rows.length === 0) return;
    for (const row of rows) {
      emitToUser(row.userId, "notification:new", serialize(row));
    }
    const userIds = [...new Set(rows.map((r) => r.userId))];
    await Promise.all(userIds.map((id) => this.emitUnread(id)));
  }

  private async emitUnread(userId: string) {
    try {
      emitToUser(
        userId,
        "notification:unread",
        await this.getUnreadCounts(userId),
      );
    } catch (error) {
      console.error("Failed to emit unread notification count:", error);
    }
  }
}

export const notificationService = new NotificationService();
