import { Router } from "express";
import { authController } from "#/modules/auth/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import { resendVerificationSchema } from "#/modules/auth/resend-verification-schema";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "#/modules/auth/schema";
import { rateLimit } from "#/middleware/rate-limit";
import {
  googleLoginSchema,
  appleLoginSchema,
} from "#/modules/auth/social-schema";
import { socialAuthController } from "#/modules/auth/social-controller";
import { registrationController } from "#/modules/auth/registration-controller";
import {
  learnerRegistrationSchema,
  instructorRegistrationSchema,
} from "#/modules/auth/registration-schema";

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

// ──────────────────────────────────────
// Social login routes
// ──────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google
 *     description: Authenticate using a Google ID token. New users must provide dateOfBirth.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               locale:
 *                 type: string
 *                 enum: [en, bn, hi, ur, ar]
 *     responses:
 *       200:
 *         description: Login successful
 *       422:
 *         description: DOB required or underage
 */
router.post(
  "/google",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validate(googleLoginSchema),
  socialAuthController.googleLogin,
);

/**
 * @swagger
 * /api/v1/auth/apple:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Apple
 *     description: Authenticate using Apple identity token. New users must provide dateOfBirth.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identityToken]
 *             properties:
 *               identityToken:
 *                 type: string
 *               authorizationCode:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               locale:
 *                 type: string
 *                 enum: [en, bn, hi, ur, ar]
 *     responses:
 *       200:
 *         description: Login successful
 *       422:
 *         description: DOB required or underage
 */
router.post(
  "/apple",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validate(appleLoginSchema),
  socialAuthController.appleLogin,
);

/**
 * @swagger
 * /api/v1/auth/register/learner:
 *   post:
 *     tags: [Auth]
 *     summary: Register as learner (account + profile)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, dateOfBirth, learnerDisplayName, learnerDateOfBirth]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 10 }
 *               dateOfBirth: { type: string, format: date }
 *               locale: { type: string, enum: [en, bn, hi, ur, ar] }
 *               guardianName: { type: string }
 *               guardianEmail: { type: string, format: email }
 *               learnerDisplayName: { type: string }
 *               learnerDateOfBirth: { type: string, format: date }
 *               learnerAvatarUrl: { type: string }
 *               learnerPin: { type: string, pattern: '^\d{4}$' }
 *     responses:
 *       201:
 *         description: Account and learner profile created
 */
router.post(
  "/register/learner",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validate(learnerRegistrationSchema),
  registrationController.registerLearner,
);

/**
 * @swagger
 * /api/v1/auth/register/instructor:
 *   post:
 *     tags: [Auth]
 *     summary: Register as instructor (account + application)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, dateOfBirth, bio, areaOfExpertise, cvUrl, wwccNumber, wwccState, wwccExpiry]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 10 }
 *               dateOfBirth: { type: string, format: date }
 *               locale: { type: string, enum: [en, bn, hi, ur, ar] }
 *               bio: { type: string }
 *               areaOfExpertise: { type: string }
 *               cvUrl: { type: string }
 *               wwccNumber: { type: string }
 *               wwccState: { type: string }
 *               wwccExpiry: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Account created and application submitted
 */
router.post(
  "/register/instructor",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validate(instructorRegistrationSchema),
  registrationController.registerInstructor,
);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Verification email sent
 */
router.post(
  "/resend-verification",
  rateLimit({ windowMs: 60 * 1000, max: 1 }),
  validate(resendVerificationSchema),
  authController.resendVerification,
);

export { router as authRoutes };
