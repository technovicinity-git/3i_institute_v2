import { Router } from "express";
import { dashboardController } from "#/modules/dashboard/controller";
import { authenticate } from "#/middleware/authenticate";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get learner dashboard data
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get("/", authenticate, dashboardController.getDashboard);

export { router as dashboardRoutes };
