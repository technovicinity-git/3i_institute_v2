import { prisma } from "#/lib/prisma";

interface StripeSubscriptionData {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  metadata?: {
    accountId?: string;
    seats?: string;
  };
  quantity?: number;
  cancel_at_period_end?: boolean;
}

async function handleSubscriptionCreated(subscription: StripeSubscriptionData) {
  const accountId = subscription.metadata?.accountId;

  if (!accountId) {
    console.warn("⚠️ Webhook: No accountId in subscription metadata");
    return;
  }

  const seats = parseInt(subscription.metadata?.seats ?? "1", 10);

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: "ACTIVE",
      seats,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    create: {
      accountId,
      stripeSubscriptionId: subscription.id,
      status: "ACTIVE",
      seats,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`✅ Subscription activated for account ${accountId}`);
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionData) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existing) {
    // Try to create if missing (e.g., checkout session completed before webhook)
    const accountId = subscription.metadata?.accountId;
    if (accountId) {
      const seats = parseInt(subscription.metadata?.seats ?? "1", 10);
      await prisma.subscription.create({
        data: {
          accountId,
          stripeSubscriptionId: subscription.id,
          status: subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
          seats,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      console.log(`✅ Subscription created (from update) for ${accountId}`);
    }
    return;
  }

  // Map Stripe status to our status
  let status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" = "ACTIVE";

  switch (subscription.status) {
    case "active":
      status = "ACTIVE";
      break;
    case "past_due":
      status = "PAST_DUE";
      break;
    case "canceled":
      status = "CANCELLED";
      break;
    case "unpaid":
      status = "EXPIRED";
      break;
    case "incomplete":
    case "incomplete_expired":
      status = "EXPIRED";
      break;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      seats: parseInt(
        subscription.metadata?.seats ?? String(existing.seats),
        10,
      ),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelledAt: subscription.cancel_at_period_end ? new Date() : null,
    },
  });

  console.log(`📝 Subscription updated for ${subscription.id}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionData) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existing) {
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  console.log(`❌ Subscription cancelled: ${subscription.id}`);
}

async function handleCheckoutSessionCompleted(session: any) {
  // FR-BILL-03: Access granted only from webhook
  const accountId = session.metadata?.accountId;

  if (!accountId) {
    console.warn("⚠️ Webhook: No accountId in checkout session metadata");
    return;
  }

  // The subscription will be created by the subscription.created event
  // This is just a fallback log
  console.log(`💳 Checkout completed for account ${accountId}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log(`💵 Invoice paid: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  // FR-BILL-06: Failed payments use retries + email sequence
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: { status: "PAST_DUE" },
      });
    }
  }

  console.log(`⚠️ Invoice payment failed: ${invoice.id}`);
}

export async function handleStripeWebhook(
  eventType: string,
  eventData: any,
): Promise<void> {
  switch (eventType) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(eventData);
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(eventData);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(eventData);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(eventData);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(eventData);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(eventData);
      break;

    default:
      console.log(`ℹ️ Unhandled Stripe event: ${eventType}`);
  }
}
