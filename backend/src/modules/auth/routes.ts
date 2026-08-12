import { Router } from "express";
import { authController } from "#/modules/auth/controller";
import { authenticate } from "#/middleware/authenticate";

const router: Router = Router();

// ──────────────────────────────────────
// Public routes
// ──────────────────────────────────────
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// ──────────────────────────────────────
// Protected routes
// ──────────────────────────────────────
router.post("/logout", authenticate, authController.logout);
router.post("/change-password", authenticate, authController.changePassword);

export { router as authRoutes };
