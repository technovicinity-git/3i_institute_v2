import type { Request, Response, NextFunction } from "express";
import { RateLimitError } from "#/shared/errors";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface StoreEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, StoreEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

function rateLimit(options: RateLimitOptions) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now > existing.resetAt) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (existing.count >= options.max) {
      throw new RateLimitError(
        options.message ?? "Too many requests. Please try again later.",
      );
    }

    existing.count++;
    next();
  };
}

export { rateLimit };
export type { RateLimitOptions };
