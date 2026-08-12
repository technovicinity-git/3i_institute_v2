import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "#/shared/errors";

function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.flatten().fieldErrors,
      );
    }

    req.body = result.data;
    next();
  };
}

export { validate };
