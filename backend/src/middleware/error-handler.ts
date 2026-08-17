import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "#/shared/errors";

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      code: err.code,
      message: err.message,
    };

    // Include details for validation errors
    if (err instanceof ValidationError && err.details) {
      response["details"] = err.details;
    }

    res.status(err.statusCode).json({
      error: response,
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
