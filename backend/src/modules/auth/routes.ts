import { Router } from "express";
import { authController } from "#/modules/auth/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "#/modules/auth/schema";
import { rateLimit } from "#/middleware/rate-limit";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     description: Create a new user account. Users under 13 are blocked. Users aged 13-17 require guardian info.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - dateOfBirth
 *               - locale
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Fatima
 *               lastName:
 *                 type: string
 *                 example: Rahman
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fatima@example.com
 *               password:
 *                 type: string
 *                 minLength: 10
 *                 example: MySecurePass123
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *               locale:
 *                 type: string
 *                 enum: [en, bn, hi, ur, ar]
 *                 example: en
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error or underage registration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validate(registerSchema),
  authController.register,
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to an existing account
 *     description: Authenticate with email and password. Account locks after 5 failed attempts for 15 minutes.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fatima@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid credentials or account locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validate(loginSchema),
  authController.login,
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access token. Accepts token via cookie or request body.
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email address
 *     description: Verify email using the token sent during registration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       422:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     description: Sends a password reset email. Always returns success to prevent email enumeration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent if account exists
 */
router.post(
  "/forgot-password",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }),
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password
 *     description: Set a new password using the reset token. Invalidates all existing sessions.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       422:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Revoke all refresh tokens for the authenticated user.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     description: Change password for the authenticated user. Requires current password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       422:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export { router as authRoutes };
