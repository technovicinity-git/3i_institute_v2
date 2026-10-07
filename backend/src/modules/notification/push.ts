import { prisma } from "#/lib/prisma";
import { getFirebaseMessaging } from "#/lib/firebase";

// FCM accepts at most 500 tokens per multicast request.
const MULTICAST_LIMIT = 500;

// Errors meaning the token will never work again.
const DEAD_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export interface PushMessage {
  title: string;
  body: string;
  // FCM data values must be strings.
  data?: Record<string, string>;
}

export interface PushResult {
  devices: number;
  sent: number;
  failed: number;
}

export async function countPushDevices(userIds: string[]): Promise<number> {
  if (userIds.length === 0) return 0;
  return prisma.pushToken.count({
    where: { userId: { in: userIds }, invalidatedAt: null },
  });
}

// Sends one push to every active device of the given users. Tokens that FCM
// reports as dead are invalidated so they are skipped next time.
export async function sendPushToUsers(
  userIds: string[],
  message: PushMessage,
): Promise<PushResult> {
  const result: PushResult = { devices: 0, sent: 0, failed: 0 };
  const messaging = getFirebaseMessaging();
  if (!messaging || userIds.length === 0) return result;

  const tokens = await prisma.pushToken.findMany({
    where: { userId: { in: [...new Set(userIds)] }, invalidatedAt: null },
    select: { token: true },
  });
  result.devices = tokens.length;

  const deadTokens: string[] = [];
  for (let i = 0; i < tokens.length; i += MULTICAST_LIMIT) {
    const batch = tokens.slice(i, i + MULTICAST_LIMIT).map((t) => t.token);
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title: message.title, body: message.body },
        data: message.data,
        // "announcements" is the high-importance channel the app creates,
        // so the notification pops up instead of arriving silently.
        android: {
          priority: "high",
          notification: { channelId: "announcements" },
        },
        apns: { payload: { aps: { sound: "default" } } },
      });
      result.sent += response.successCount;
      result.failed += response.failureCount;
      response.responses.forEach((r, index) => {
        if (!r.success && r.error && DEAD_TOKEN_ERRORS.has(r.error.code)) {
          deadTokens.push(batch[index]!);
        }
      });
    } catch (error) {
      console.error("❌ FCM multicast failed:", error);
      result.failed += batch.length;
    }
  }

  if (deadTokens.length > 0) {
    await prisma.pushToken.updateMany({
      where: { token: { in: deadTokens } },
      data: { invalidatedAt: new Date() },
    });
  }
  return result;
}

// Registers a device for push. A token belongs to one user at a time: if the
// device was signed in to another account, it moves to the current one.
export async function registerPushToken(
  userId: string,
  input: {
    token: string;
    platform: string;
    deviceId?: string;
    appVersion?: string;
    locale?: string;
  },
) {
  await prisma.pushToken.upsert({
    where: { token: input.token },
    create: { userId, ...input },
    update: {
      userId,
      platform: input.platform,
      deviceId: input.deviceId ?? null,
      appVersion: input.appVersion ?? null,
      locale: input.locale ?? null,
      lastSeenAt: new Date(),
      invalidatedAt: null,
    },
  });
}

export async function unregisterPushToken(userId: string, token: string) {
  await prisma.pushToken.deleteMany({ where: { userId, token } });
}
