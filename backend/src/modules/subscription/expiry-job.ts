import { subscriptionService } from "#/modules/subscription/service";

// How often ended subscriptions are tidied up. Access already stops exactly
// at 12am because enrolment checks `currentPeriodEnd`; this only updates
// statuses and sends the "subscription ended" notification.
const SWEEP_INTERVAL_MS = 60 * 1000;

let timer: NodeJS.Timeout | null = null;
let running = false;

async function sweep() {
  if (running) return;
  running = true;
  try {
    const expired = await subscriptionService.expireDueSubscriptions();
    if (expired > 0) {
      console.log(`⏰ Expired ${expired} subscription(s)`);
    }
  } catch (error) {
    console.error("[subscriptions] expiry sweep failed:", error);
  } finally {
    running = false;
  }
}

/** Runs once now (catches anything missed while the server was down), then every minute. */
export function startSubscriptionExpiryJob() {
  if (timer) return;
  void sweep();
  timer = setInterval(() => void sweep(), SWEEP_INTERVAL_MS);
  timer.unref();
}
