import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { env } from "#/config/env";

let messaging: Messaging | null | undefined;

function loadServiceAccount(): ServiceAccount | null {
  if (env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
        "utf8",
      ),
    ) as ServiceAccount;
  }
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const path = resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return JSON.parse(readFileSync(path, "utf8")) as ServiceAccount;
  }
  return null;
}

// Firebase Cloud Messaging, or null when no credentials are configured.
// Initialised lazily so the server still starts without Firebase.
export function getFirebaseMessaging(): Messaging | null {
  if (messaging !== undefined) return messaging;

  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      messaging = null;
      return messaging;
    }
    const app: App =
      getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
    messaging = getMessaging(app);
  } catch (error) {
    console.error("❌ Failed to initialise Firebase Admin:", error);
    messaging = null;
  }
  return messaging;
}

export function isPushConfigured(): boolean {
  return getFirebaseMessaging() !== null;
}
