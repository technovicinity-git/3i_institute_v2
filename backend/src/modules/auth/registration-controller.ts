import type { Request, Response, NextFunction } from "express";
import { registrationService } from "#/modules/auth/registration-service";
import {
  learnerRegistrationSchema,
  instructorRegistrationSchema,
} from "#/modules/auth/registration-schema";
import { sendSuccess } from "#/shared/response";

export class RegistrationController {
  registerLearner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = learnerRegistrationSchema.parse(req.body);
      const result = await registrationService.registerLearner(input);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
        201,
        "Account and learner profile created",
      );
    } catch (error) {
      next(error);
    }
  };

  registerInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const input = instructorRegistrationSchema.parse(req.body);
      const result = await registrationService.registerInstructor(input);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      sendSuccess(
        res,
        {
          user: result.user,
          instructorApplication: result.instructorApplication,
          accessToken: result.tokens.accessToken,
        },
        201,
        "Account created and instructor application submitted",
      );
    } catch (error) {
      next(error);
    }
  };
}

export const registrationController = new RegistrationController();
