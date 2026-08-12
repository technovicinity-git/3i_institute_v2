import type { Request, Response, NextFunction } from "express";
import { authService } from "#/modules/auth/service";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from "#/modules/auth/schema";
import { ValidationError } from "#/shared/errors";

export class AuthController {
  // ──────────────────────────────────
  // POST /auth/register
  // ──────────────────────────────────
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/v1/auth",
      });

      res.status(201).json({
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/login
  // ──────────────────────────────────
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
      });

      res.json({
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/refresh
  // ──────────────────────────────────
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Try cookie first, then body
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

      if (!refreshToken) {
        throw new ValidationError("Refresh token is required");
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
      });

      res.json({
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/logout
  // ──────────────────────────────────
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (userId) {
        await authService.logout(userId);
      }

      res.clearCookie("refreshToken", {
        path: "/api/v1/auth",
      });

      res.json({ data: { message: "Logged out successfully" } });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/verify-email
  // ──────────────────────────────────
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = verifyEmailSchema.parse(req.body);
      await authService.verifyEmail(input.token);

      res.json({ data: { message: "Email verified successfully" } });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/forgot-password
  // ──────────────────────────────────
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(input.email);

      // Always return success to prevent email enumeration
      res.json({
        data: {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/reset-password
  // ──────────────────────────────────
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(input);

      res.json({ data: { message: "Password reset successfully" } });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // POST /auth/change-password
  // ──────────────────────────────────
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        throw new ValidationError("Authentication required");
      }

      const input = changePasswordSchema.parse(req.body);
      await authService.changePassword(userId, input);

      res.json({ data: { message: "Password changed successfully" } });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
