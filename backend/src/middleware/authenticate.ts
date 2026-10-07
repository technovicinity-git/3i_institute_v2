import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "#/lib/jwt";
import { UnauthorizedError } from "#/shared/errors";
import { assertAccountActive } from "#/modules/user/account-status";

async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token is required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }

  // Tokens stay valid until they expire, so deactivation is enforced here.
  await assertAccountActive(payload.sub);

  req.user = payload;
  next();
}

export { authenticate };
