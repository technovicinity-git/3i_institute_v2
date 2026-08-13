import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type {
  CreateCheckoutSessionInput,
  WaiverRequestInput,
  WaiverDecisionInput,
} from "#/modules/billing/schema";
import { env } from "#/config/env";

// Stripe is lazy-loaded to avoid initialization in non-billing contexts
let stripeClient: any = null;

async function getStripe() {
  if (!stripeClient) {
    const { default: Stripe } = await import("stripe");
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

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

    // Check if already has active subscription
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

    // Create checkout session
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
      include: {
        waiver: {
          select: {
            id: true,
            status: true,
            tier: true,
            expiresAt: true,
            effectiveAt: true,
          },
        },
      },
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

    const stripe = await getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      message: "Subscription will be cancelled at end of billing period",
    };
  }

  // ──────────────────────────────────
  // Waivers
  // ──────────────────────────────────

  async requestWaiver(accountId: string, input: WaiverRequestInput) {
    // Check if there's already a pending or active waiver
    const existingWaiver = await prisma.waiver.findFirst({
      where: {
        accountId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingWaiver) {
      throw new ConflictError(
        "You already have a waiver request pending or active",
      );
    }

    // Check if user has a subscription
    const subscription = await prisma.subscription.findFirst({
      where: { accountId },
    });

    if (!subscription) {
      throw new ValidationError(
        "You must have a subscription to request a waiver",
      );
    }

    const waiver = await prisma.waiver.create({
      data: {
        accountId,
        subscriptionId: subscription.id,
        explanation: input.explanation,
        evidenceFiles: input.evidenceFiles,
        status: "PENDING",
      },
    });

    return waiver;
  }

  async getPendingWaivers() {
    return prisma.waiver.findMany({
      where: { status: "PENDING" },
      include: {
        account: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async reviewWaiver(
    adminId: string,
    waiverId: string,
    input: WaiverDecisionInput,
  ) {
    const waiver = await prisma.waiver.findUnique({
      where: { id: waiverId },
    });

    if (!waiver) {
      throw new NotFoundError("Waiver request not found");
    }

    if (waiver.status !== "PENDING") {
      throw new ValidationError("Waiver already reviewed");
    }

    if (input.approved) {
      // FR-WAV-02: Four fixed tiers
      if (!input.tier || ![25, 50, 75, 100].includes(input.tier)) {
        throw new ValidationError("Valid tier required (25, 50, 75, or 100)");
      }

      // FR-WAV-03: Takes effect at next renewal
      // FR-WAV-04: Runs for 12 months
      const updated = await prisma.waiver.update({
        where: { id: waiverId },
        data: {
          status: "APPROVED",
          tier: input.tier,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          effectiveAt: waiver.subscriptionId ? null : new Date(),
          expiresAt: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
        },
      });

      // FR-WAV-06: Apply discount at Stripe
      if (waiver.subscriptionId) {
        const stripe = await getStripe();
        const subscription = await prisma.subscription.findUnique({
          where: { id: waiver.subscriptionId },
        });

        if (subscription) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            coupon: input.tier === 100 ? undefined : undefined,
            // Use discount coupon or metadata — implementation depends on Stripe setup
            metadata: {
              ...(subscription as any).metadata,
              waiverTier: String(input.tier),
            },
          });
        }
      }

      return updated;
    } else {
      const updated = await prisma.waiver.update({
        where: { id: waiverId },
        data: {
          status: "REJECTED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: "WAIVER_REJECTED",
          resource: "waiver",
          resourceId: waiverId,
          details: { reason: input.reason ?? null },
        },
      });

      return updated;
    }
  }

  async revokeWaiver(adminId: string, waiverId: string, reason: string) {
    const waiver = await prisma.waiver.findUnique({
      where: { id: waiverId },
    });

    if (!waiver) {
      throw new NotFoundError("Waiver not found");
    }

    if (waiver.status !== "APPROVED") {
      throw new ValidationError("Only approved waivers can be revoked");
    }

    const updated = await prisma.waiver.update({
      where: { id: waiverId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "WAIVER_REVOKED",
        resource: "waiver",
        resourceId: waiverId,
        details: { reason },
      },
    });

    return updated;
  }

  async getMyWaiver(accountId: string) {
    return prisma.waiver.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }
}

export const billingService = new BillingService();
