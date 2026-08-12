import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "#/shared/errors";

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && err.details
          ? { details: err.details }
          : {}),
      },
    });
    return;
  }

  console.error("❌ Unhandled error:", err);

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}

export { errorHandler };
