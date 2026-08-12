import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "#/shared/errors";

function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userPermissions: string[] = user.permissions ?? [];

    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAll) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
}

export { authorize };
