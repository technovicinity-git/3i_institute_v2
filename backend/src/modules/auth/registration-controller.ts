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

      // No tokens: the user must verify their email before signing in.
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

  registerInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const input = instructorRegistrationSchema.parse(req.body);
      const result = await registrationService.registerInstructor(input);

      // No tokens: the user must verify their email before signing in.
      sendSuccess(
        res,
        {
          user: result.user,
          instructorApplication: result.instructorApplication,
        },
        201,
        "Application submitted. Please check your email to verify.",
      );
    } catch (error) {
      next(error);
    }
  };
}

export const registrationController = new RegistrationController();
