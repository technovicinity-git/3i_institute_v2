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
import {
  AccountInactiveError,
  UnauthorizedError,
  ValidationError,
} from "#/shared/errors";
import { clearRefreshCookie, setRefreshCookie } from "#/lib/refresh-cookie";
import { sendSuccess } from "#/shared/response";
import { resendVerificationSchema } from "#/modules/auth/resend-verification-schema";

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

      setRefreshCookie(res, result.tokens.refreshToken);

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

      setRefreshCookie(res, tokens.refreshToken);

      sendSuccess(
        res,
        { accessToken: tokens.accessToken },
        200,
        "Token refreshed",
      );
    } catch (error) {
      // The token is unusable, so drop the cookie. Otherwise the browser
      // keeps sending it and the frontend middleware still treats the
      // visitor as logged in, bouncing /login → /dashboard → /login.
      if (
        error instanceof UnauthorizedError ||
        error instanceof AccountInactiveError ||
        error instanceof ValidationError
      ) {
        clearRefreshCookie(res);
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (userId) {
        await authService.logout(userId);
      }

      clearRefreshCookie(res);
      sendSuccess(res, null, 200, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(input.token);
      sendSuccess(res, result, 200, "Email verified successfully");
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

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const input = resendVerificationSchema.parse(req.body);
      const result = await authService.resendVerification(input);
      sendSuccess(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
