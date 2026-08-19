import type { Request, Response, NextFunction } from "express";
import { authService } from "#/modules/auth/service";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "#/modules/auth/schema";
import { ValidationError } from "#/shared/errors";
import { sendSuccess } from "#/shared/response";

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);

      // No tokens — user must verify email first
      sendSuccess(
        res,
        {
          user: result.user,
        },
        201,
        "Account created. Please check your email to verify.",
      );
    } catch (error) {
      next(error);
    }
  };

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

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
        200,
        "Login successful",
      );
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      sendSuccess(
        res,
        { accessToken: tokens.accessToken },
        200,
        "Token refreshed",
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (userId) {
        await authService.logout(userId);
      }

      res.clearCookie("refreshToken", { path: "/api/v1/auth" });
      sendSuccess(res, null, 200, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = verifyEmailSchema.parse(req.body);
      await authService.verifyEmail(input.token);
      sendSuccess(res, null, 200, "Email verified successfully");
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(input.email);
      sendSuccess(
        res,
        null,
        200,
        "If an account with that email exists, a password reset link has been sent.",
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(input);
      sendSuccess(res, null, 200, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        throw new ValidationError("Authentication required");
      }

      const input = changePasswordSchema.parse(req.body);
      await authService.changePassword(userId, input);
      sendSuccess(res, null, 200, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
