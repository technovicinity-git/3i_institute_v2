import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_NAMES,
  ACTIVITY_CATEGORY_LABEL,
  actionsInCategory,
  isActivityAction,
  type ActivityActionName,
} from "#/modules/activity-log/catalog";

export interface ActivityLogFilters {
  category?: string;
  action?: string;
  actorId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}

interface ActivityTarget {
  type: string;
  id: string | null;
  label: string;
  /** Admin page for the target, when there is one. */
  href: string | null;
}

type Details = Record<string, unknown>;

const asDetails = (value: Prisma.JsonValue | null): Details =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Details)
    : {};

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** One-line extra context, e.g. the rejection reason or the discount. */
function summarize(action: ActivityActionName, details: Details): string | null {
  switch (action) {
    case "WAIVER_APPROVED":
      return typeof details["tier"] === "number"
        ? `${details["tier"]}% discount`
        : null;
    case "CHAT_MODERATION":
      return details["action"] === "DELETE"
        ? "Deleted the message"
        : "Dismissed the reports";
    case "CATEGORY_UPDATED": {
      const changes = details["changes"];
      return Array.isArray(changes) && changes.length > 0
        ? `Changed ${changes.join(", ")}`
        : null;
    }
    case "INSTRUCTOR_SUSPENDED": {
      const courses = details["suspendedCourseIds"];
      return Array.isArray(courses) && courses.length > 0
        ? `${courses.length} course(s) suspended with them`
        : null;
    }
    case "PAYMENT_SETTINGS_UPDATED":
      return typeof details["monthlyPrice"] === "number"
        ? `${details["currency"] ?? ""} ${details["monthlyPrice"]} per profile`.trim()
        : null;
    default: {
      const reason = text(details["reason"]);
      return reason ? `Reason: ${reason}` : null;
    }
  }
}

const fullName = (user: { firstName: string; lastName: string; email: string }) =>
  `${user.firstName} ${user.lastName}`.trim() || user.email;

/**
 * Resolves each entry's target to a readable label in a few batched queries.
 * Falls back to names saved in the entry's details when the target was
 * deleted.
 */
async function resolveTargets(
  entries: { resource: string; resourceId: string | null; details: Details }[],
): Promise<Map<string, ActivityTarget>> {
  const ids = (resources: string[]) => [
    ...new Set(
      entries
        .filter((e) => resources.includes(e.resource) && e.resourceId)
        .map((e) => e.resourceId!),
    ),
  ];

  const userIds = ids(["user", "instructor", "instructor_application"]);
  const [
    users,
    profiles,
    courses,
    certificates,
    ratings,
    requests,
    waivers,
    categories,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.learnerProfile.findMany({
      where: { id: { in: ids(["learner_profile"]) } },
      select: { id: true, displayName: true },
    }),
    prisma.course.findMany({
      where: { id: { in: ids(["course"]) } },
      select: { id: true, title: true },
    }),
    prisma.certificate.findMany({
      where: { id: { in: ids(["certificate"]) } },
      select: { id: true, learnerNameSnapshot: true, courseTitleSnapshot: true },
    }),
    prisma.courseRating.findMany({
      where: { id: { in: ids(["course_rating"]) } },
      select: { id: true, courseId: true, course: { select: { title: true } } },
    }),
    prisma.subscriptionRequest.findMany({
      where: { id: { in: ids(["subscription_request"]) } },
      select: { id: true, learnerProfile: { select: { displayName: true } } },
    }),
    prisma.waiver.findMany({
      where: { id: { in: ids(["waiver"]) } },
      select: { id: true, learnerProfile: { select: { displayName: true } } },
    }),
    prisma.category.findMany({
      where: { id: { in: ids(["category"]) } },
      select: { id: true, name: true },
    }),
  ]);

  const byId = <T extends { id: string }>(rows: T[]) =>
    new Map(rows.map((row) => [row.id, row]));
  const userMap = byId(users);
  const profileMap = byId(profiles);
  const courseMap = byId(courses);
  const certificateMap = byId(certificates);
  const ratingMap = byId(ratings);
  const requestMap = byId(requests);
  const waiverMap = byId(waivers);
  const categoryMap = byId(categories);

  const targets = new Map<string, ActivityTarget>();
  for (const entry of entries) {
    const id = entry.resourceId;
    const key = `${entry.resource}:${id ?? ""}`;
    if (targets.has(key)) continue;
    const saved = entry.details;
    let target: ActivityTarget;

    switch (entry.resource) {
      case "user":
      case "instructor":
      case "instructor_application": {
        const user = id ? userMap.get(id) : undefined;
        const isInstructor = entry.resource !== "user";
        target = {
          type: isInstructor ? "Instructor" : "User",
          id,
          label: user
            ? `${fullName(user)} · ${user.email}`
            : (text(saved["name"]) ?? "Deleted user"),
          href: user && isInstructor ? `/admin/instructors/${user.id}` : null,
        };
        break;
      }
      case "learner_profile": {
        const profile = id ? profileMap.get(id) : undefined;
        target = {
          type: "Learner profile",
          id,
          label:
            profile?.displayName ??
            text(saved["displayName"]) ??
            "Deleted profile",
          href: profile ? `/admin/learner-profiles/${profile.id}` : null,
        };
        break;
      }
      case "course": {
        const course = id ? courseMap.get(id) : undefined;
        target = {
          type: "Course",
          id,
          label: course?.title ?? text(saved["title"]) ?? "Deleted course",
          href: course ? `/admin/courses/${course.id}/edit` : null,
        };
        break;
      }
      case "certificate": {
        const certificate = id ? certificateMap.get(id) : undefined;
        target = {
          type: "Certificate",
          id,
          label: certificate
            ? `${certificate.learnerNameSnapshot} · ${certificate.courseTitleSnapshot}`
            : "Certificate",
          href: "/admin/certificates",
        };
        break;
      }
      case "course_rating": {
        const rating = id ? ratingMap.get(id) : undefined;
        target = {
          type: "Review",
          id,
          label: rating ? `Review on ${rating.course.title}` : "Course review",
          href: rating ? `/courses/${rating.courseId}` : null,
        };
        break;
      }
      case "chat_moderation": {
        const message = text(saved["message"]);
        target = {
          type: "Chat message",
          id,
          label: message
            ? `“${message.length > 80 ? `${message.slice(0, 80)}…` : message}”`
            : "Chat message",
          href: "/admin/moderation",
        };
        break;
      }
      case "subscription_request": {
        const request = id ? requestMap.get(id) : undefined;
        target = {
          type: "Subscription payment",
          id,
          label: request?.learnerProfile.displayName ?? "Subscription payment",
          href: "/admin/subscription-requests",
        };
        break;
      }
      case "waiver": {
        const waiver = id ? waiverMap.get(id) : undefined;
        target = {
          type: "Fee waiver",
          id,
          label: waiver?.learnerProfile?.displayName ?? "Fee waiver",
          href: "/admin/waivers",
        };
        break;
      }
      case "category": {
        const category = id ? categoryMap.get(id) : undefined;
        target = {
          type: "Category",
          id,
          label: category?.name ?? text(saved["name"]) ?? "Deleted category",
          href: category ? "/admin/categories" : null,
        };
        break;
      }
      case "site_page":
        target = {
          type: "Site page",
          id,
          label: text(saved["title"]) ?? id ?? "Site page",
          href: id ? `/admin/content/pages/${id}` : null,
        };
        break;
      case "site_settings":
        target = { type: "Settings", id, label: "Site settings", href: "/admin/content" };
        break;
      case "payment_settings":
        target = {
          type: "Settings",
          id,
          label: "Subscription payment details",
          href: "/admin/settings",
        };
        break;
      default:
        target = { type: entry.resource, id, label: id ?? entry.resource, href: null };
    }
    targets.set(key, target);
  }
  return targets;
}

export class ActivityLogService {
  async list(page: number, limit: number, filters: ActivityLogFilters) {
    let actions: ActivityActionName[] = ACTIVITY_ACTION_NAMES;
    if (filters.category) actions = actionsInCategory(filters.category);
    if (filters.action) {
      actions = isActivityAction(filters.action)
        ? actions.filter((a) => a === filters.action)
        : [];
    }

    // Search matches the admin who did it, or a user it was done to
    let searchUserIds: string[] | null = null;
    const search = filters.search?.trim();
    if (search) {
      const matches = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true },
        take: 200,
      });
      searchUserIds = matches.map((u) => u.id);
    }

    const where: Prisma.AuditLogWhereInput = {
      action: { in: actions },
      ...(filters.actorId ? { userId: filters.actorId } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
      ...(searchUserIds
        ? {
            OR: [
              { userId: { in: searchUserIds } },
              { resourceId: { in: searchUserIds } },
              { resourceId: search },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const actorIds = [
      ...new Set(rows.map((r) => r.userId).filter((id): id is string => !!id)),
    ];
    const [actors, targets] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: { select: { name: true } },
        },
      }),
      resolveTargets(
        rows.map((r) => ({
          resource: r.resource,
          resourceId: r.resourceId,
          details: asDetails(r.details),
        })),
      ),
    ]);
    const actorMap = new Map(actors.map((a) => [a.id, a]));

    return {
      total,
      entries: rows.map((row) => {
        const name = row.action as ActivityActionName;
        const definition = ACTIVITY_ACTIONS[name];
        const details = asDetails(row.details);
        const actor = row.userId ? actorMap.get(row.userId) : undefined;
        return {
          id: row.id,
          action: name,
          label: definition.label,
          category: definition.category,
          tone: "tone" in definition ? definition.tone : null,
          summary: summarize(name, details),
          createdAt: row.createdAt,
          ipAddress: row.ipAddress,
          actor: actor
            ? {
                id: actor.id,
                name: fullName(actor),
                email: actor.email,
                role: actor.role.name,
              }
            : null,
          target:
            targets.get(`${row.resource}:${row.resourceId ?? ""}`) ?? null,
          details,
        };
      }),
    };
  }

  /** Options for the filter dropdowns. */
  async filterOptions() {
    const actorRows = await prisma.auditLog.groupBy({
      by: ["userId"],
      where: { action: { in: ACTIVITY_ACTION_NAMES }, userId: { not: null } },
      _count: { _all: true },
    });
    const actors = await prisma.user.findMany({
      where: { id: { in: actorRows.map((r) => r.userId!) } },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    });

    return {
      categories: Object.entries(ACTIVITY_CATEGORY_LABEL).map(
        ([value, label]) => ({ value, label }),
      ),
      actions: ACTIVITY_ACTION_NAMES.map((value) => ({
        value,
        label: ACTIVITY_ACTIONS[value].label,
        category: ACTIVITY_ACTIONS[value].category,
      })),
      actors: actors.map((actor) => ({ id: actor.id, name: fullName(actor) })),
    };
  }
}

export const activityLogService = new ActivityLogService();
