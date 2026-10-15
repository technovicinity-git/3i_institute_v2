import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { activityLogService } from "#/modules/activity-log/service";
import { sendSuccess } from "#/shared/response";

// Mounted at /admin/activity-log
const router: Router = Router();
router.use(authenticate, authorize("admin.access"));

function parseDate(value: unknown, endOfDay = false): Date | undefined {
  if (typeof value !== "string" || !value) return undefined;
  // Plain dates ("2026-10-15") cover the whole day
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : value,
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * @swagger
 * /api/v1/admin/activity-log:
 *   get:
 *     tags: [Admin]
 *     summary: Admin and security actions, newest first (admin)
 *     description: Only allow-listed admin actions are returned; app data kept in the audit table (lesson notes, chat reports, device swaps) never is.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [accounts, instructors, courses, billing, moderation, content] }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *       - in: query
 *         name: actorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         description: Name or email of the admin, or of a user the action was done to
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activity entries
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query["limit"] ?? 25) || 25),
    );
    const result = await activityLogService.list(page, limit, {
      category: (req.query["category"] as string) || undefined,
      action: (req.query["action"] as string) || undefined,
      actorId: (req.query["actorId"] as string) || undefined,
      from: parseDate(req.query["from"]),
      to: parseDate(req.query["to"], true),
      search: (req.query["search"] as string) || undefined,
    });
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/admin/activity-log/filters:
 *   get:
 *     tags: [Admin]
 *     summary: Categories, actions and admins for the activity log filters (admin)
 *     responses:
 *       200:
 *         description: Filter options
 */
router.get(
  "/filters",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await activityLogService.filterOptions(), 200);
    } catch (error) {
      next(error);
    }
  },
);

export { router as adminActivityLogRoutes };
