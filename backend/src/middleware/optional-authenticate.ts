import type { Request, Response, NextFunction } from "express";
import { authenticate } from "#/middleware/authenticate";

// For public routes that show more to signed-in users (e.g. the course list
// filtered to the learner's age). No Authorization header: continue as a
// visitor. A header that is present but invalid or expired still fails with
// 401, so the client refreshes its token and retries instead of silently
// getting the visitor view.
async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.headers.authorization) {
    next();
    return;
  }
  await authenticate(req, res, next);
}

export { optionalAuthenticate };
