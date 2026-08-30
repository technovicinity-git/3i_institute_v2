/**
 * Decodes the payload of a JWT access token (`header.payload.signature`)
 * without verifying the signature.
 *
 * ⚠️ For UI display/routing only — never rely on unverified token claims
 * for authorization. The backend always re-verifies tokens.
 */
export interface JwtAccessTokenPayload {
  sub?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  type?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwtPayload(token: string): JwtAccessTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  // Convert base64url → base64 and restore padding
  let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  try {
    // Decode as UTF-8 so non-ASCII strings in claims survive round-tripping
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(decoded) as JwtAccessTokenPayload;
  } catch {
    return null;
  }
}