import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE = "refreshToken";

// Clearing a cookie only works when the attributes match the ones it was
// set with, so every set and clear goes through these options.
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
}
