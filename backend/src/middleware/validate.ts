import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "#/shared/errors";

function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >;

      // Create readable error messages
      const messages: string[] = [];

      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (errors && Array.isArray(errors) && errors.length > 0) {
          messages.push(`${field}: ${errors.join(", ")}`);
        }
      }

      throw new ValidationError(
        messages.length > 0 ? messages[0]! : "Validation failed",
        {
          fieldErrors,
          messages,
        },
      );
    }

    req.body = result.data;
    next();
  };
}

export { validate };
