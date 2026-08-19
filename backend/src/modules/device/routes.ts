import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "#/middleware/authenticate";
import { deviceService } from "#/modules/device/service";
import { sendSuccess } from "#/shared/response";
import { z } from "zod";
import { validate } from "#/middleware/validate";

const router: Router = Router();

const registerDeviceSchema = z.object({
  deviceName: z.string().min(1).max(200),
  deviceToken: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

/**
 * @swagger
 * /api/v1/devices:
 *   get:
 *     tags: [Devices]
 *     summary: Get all registered devices
 *     description: Returns devices plus device limit info (scales with seats: 1 + seats)
 *     responses:
 *       200:
 *         description: List of devices with limit info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     devices:
 *                       type: array
 *                       items:
 *                         type: object
 *                     deviceLimit:
 *                       type: integer
 *                       description: Maximum devices allowed (1 + seats)
 *                     currentCount:
 *                       type: integer
 *                     remainingSlots:
 *                       type: integer
 *   post:
 *     tags: [Devices]
 *     summary: Register a device
 *     description: Register a new device. Device limit scales with subscription seats.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceName, deviceToken, platform]
 *             properties:
 *               deviceName:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *     responses:
 *       201:
 *         description: Device registered
 *       409:
 *         description: Device limit reached
 */
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deviceService.getDevices(req.user?.sub!);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  validate(registerDeviceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await deviceService.registerDevice(
        req.user?.sub!,
        req.body,
      );
      sendSuccess(res, device, 201, "Device registered");
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/v1/devices/{id}:
 *   delete:
 *     tags: [Devices]
 *     summary: Remove a device
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Device removed
 */
router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deviceService.removeDevice(
        req.user?.sub!,
        req.params["id"] as string,
      );
      sendSuccess(res, null, 200, "Device removed");
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/v1/devices:
 *   delete:
 *     tags: [Devices]
 *     summary: Remove all devices
 *     responses:
 *       200:
 *         description: All devices removed
 */
router.delete(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deviceService.removeAllDevices(req.user?.sub!);
      sendSuccess(res, null, 200, "All devices removed");
    } catch (error) {
      next(error);
    }
  },
);

export { router as deviceRoutes };
