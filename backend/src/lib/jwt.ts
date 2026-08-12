import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "#/config/env";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  type: "access";
}

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function generateAccessToken(
  payload: Omit<AccessTokenPayload, "type">,
): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as unknown as number,
  };

  return jwt.sign(
    { ...payload, type: "access" },
    env.JWT_ACCESS_SECRET,
    options,
  );
}

function generateRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as unknown as number,
  };

  return jwt.sign(
    { sub: userId, type: "refresh" } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    options,
  );
}

function generateTokenPair(
  user: Pick<AccessTokenPayload, "sub" | "email" | "role" | "permissions">,
): TokenPair {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.sub);

  return { accessToken, refreshToken };
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  ) as AccessTokenPayload;

  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }

  return decoded;
}

function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
  ) as RefreshTokenPayload;

  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  return decoded;
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};

export type { AccessTokenPayload, RefreshTokenPayload, TokenPair };
