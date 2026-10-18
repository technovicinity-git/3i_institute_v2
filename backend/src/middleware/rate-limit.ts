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

// One store per limiter: each route counts its own requests, so e.g. a
// login attempt doesn't use up the same IP's verification-email resend.
const stores = new Set<Map<string, StoreEntry>>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const store of stores) {
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) {
          store.delete(key);
        }
      }
    }
  },
  5 * 60 * 1000,
).unref();

// Fixed-window counter per client IP, kept in this process's memory: limits
// reset on restart and are counted separately on each server instance.
function rateLimit(options: RateLimitOptions) {
  const store = new Map<string, StoreEntry>();
  stores.add(store);

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
