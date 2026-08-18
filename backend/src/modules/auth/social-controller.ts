import type { Request, Response, NextFunction } from "express";
import { socialAuthService } from "#/modules/auth/social-service";
import { sendSuccess } from "#/shared/response";

export class SocialAuthController {
  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await socialAuthService.googleLogin(req.body);

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
        "Google login successful",
      );
    } catch (error) {
      next(error);
    }
  };

  appleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await socialAuthService.appleLogin(req.body);

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
        "Apple login successful",
      );
    } catch (error) {
      next(error);
    }
  };
}

export const socialAuthController = new SocialAuthController();
