import type { Request, Response, NextFunction } from "express";
import { socialAuthService } from "#/modules/auth/social-service";
import { sendSuccess } from "#/shared/response";
import { setRefreshCookie } from "#/lib/refresh-cookie";

export class SocialAuthController {
  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await socialAuthService.googleLogin(req.body);

      setRefreshCookie(res, result.tokens.refreshToken);

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

      setRefreshCookie(res, result.tokens.refreshToken);

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
