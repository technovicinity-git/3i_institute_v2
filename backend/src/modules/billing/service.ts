import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type { CreateCheckoutSessionInput } from "#/modules/billing/schema";
import { env } from "#/config/env";
import { isManualSubscription } from "#/modules/seat/service";

// Stripe is lazy-loaded to avoid initialization in non-billing contexts
let stripeClient: any = null;

async function getStripe() {
  if (!stripeClient) {
    const { default: Stripe } = await import("stripe");
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Stripe (card) subscriptions. Runs alongside the manual subscriptions in
// the subscription module; both write to the same Subscription table and
// manual ones are told apart by their "manual_" id (isManualSubscription).
export class BillingService {
  // ──────────────────────────────────
  // Subscription
  // ──────────────────────────────────

  async createCheckoutSession(
    accountId: string,
    input: CreateCheckoutSessionInput,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: accountId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // One active subscription per account (manual or Stripe); more seats
    // means changing the quantity, not buying a second subscription.
    const existing = await prisma.subscription.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      throw new ConflictError("You already have an active subscription");
    }

    const stripe = await getStripe();

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.billingContactEmail ?? user.email,
        name: user.billingContactName ?? `${user.firstName} ${user.lastName}`,
        metadata: { accountId },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: accountId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session. Nothing is granted here: the subscription row
    // is only written when Stripe's webhook confirms payment (webhook.ts).
    const priceId =
      input.plan === "monthly"
        ? (env.STRIPE_MONTHLY_PRICE_ID ?? "price_monthly")
        : (env.STRIPE_ANNUAL_PRICE_ID ?? "price_annual");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: input.seats,
        },
      ],
      success_url: `${env.FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${env.FRONTEND_URL}/pricing?checkout=cancelled`,
      metadata: {
        accountId,
        seats: String(input.seats),
      },
      subscription_data: {
        metadata: {
          accountId,
          seats: String(input.seats),
        },
      },
    });

    return { checkoutUrl: session.url };
  }

  async getSubscription(accountId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });

    return subscription;
  }

  async cancelSubscription(accountId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      throw new NotFoundError("No active subscription found");
    }

    if (isManualSubscription(subscription)) {
      throw new ValidationError(
        "This subscription was paid manually and ends automatically at the end of its period.",
      );
    }

    // Cancel at period end, not immediately: the family keeps what they paid
    // for. Our row is updated later by the subscription.updated webhook.
    const stripe = await getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      message: "Subscription will be cancelled at end of billing period",
    };
  }
}

export const billingService = new BillingService();
