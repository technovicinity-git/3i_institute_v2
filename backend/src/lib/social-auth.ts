import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { env } from "#/config/env";

// ──────────────────────────────────
// Google OAuth
// ──────────────────────────────────

const googleClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
});

interface GoogleUserInfo {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  emailVerified: boolean;
}

async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token payload");
  }

  return {
    email: payload["email"] ?? "",
    firstName: payload["given_name"] ?? "",
    lastName: payload["family_name"] ?? "",
    picture: payload["picture"] ?? undefined,
    emailVerified: payload["email_verified"] === true,
  };
}

// ──────────────────────────────────
// Apple Sign In
// ──────────────────────────────────

interface AppleUserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  subject: string;
  emailVerified: boolean;
}

async function verifyAppleToken(
  identityToken: string,
  _authorizationCode?: string,
): Promise<AppleUserInfo> {
  // Get Apple public keys
  const keysResponse = await fetch("https://appleid.apple.com/auth/keys");
  const { keys } = (await keysResponse.json()) as { keys: any[] };

  // Decode token header to get kid
  const header = JSON.parse(
    Buffer.from(identityToken.split(".")[0]!, "base64").toString(),
  );

  // Find matching key
  const key = keys.find((k) => k.kid === header.kid);

  if (!key) {
    throw new Error("Apple public key not found");
  }

  // Convert JWK to PEM
  const crypto = await import("node:crypto");
  const publicKey = crypto.createPublicKey({
    key: {
      kty: key.kty,
      n: key.n,
      e: key.e,
    },
    format: "jwk",
  });

  // Verify token
  const payload = jwt.verify(identityToken, publicKey, {
    algorithms: ["RS256"],
    issuer: "https://appleid.apple.com",
    audience: env.APPLE_CLIENT_ID,
  }) as any;

  return {
    email: payload.email ?? "",
    subject: payload.sub ?? "",
    emailVerified:
      payload.email_verified === true || payload.email_verified === "true",
  };
}

export { verifyGoogleToken, verifyAppleToken };
export type { GoogleUserInfo, AppleUserInfo };
