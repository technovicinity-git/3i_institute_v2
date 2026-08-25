import { Router } from "express";
import { userController } from "#/modules/user/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import { changeEmailSchema, updateProfileSchema } from "#/modules/user/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile including learner profiles and devices.
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authenticate, userController.getProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               locale:
 *                 type: string
 *                 enum: [en, bn, hi, ur, ar]
 *               billingContactName:
 *                 type: string
 *               billingContactEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Not authenticated
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);
/**
 * @swagger
 * /api/v1/users/change-email:
 *   post:
 *     tags: [Users]
 *     summary: Change email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newEmail, currentPassword]
 *             properties:
 *               newEmail: { type: string, format: email }
 *               currentPassword: { type: string }
 *     responses:
 *       200:
 *         description: Email updated
 */
router.post(
  "/change-email",
  authenticate,
  validate(changeEmailSchema),
  userController.changeEmail,
);

export { router as userRoutes };
