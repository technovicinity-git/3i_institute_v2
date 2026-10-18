import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import express from "express";
import { env } from "#/config/env";
import { handleStripeWebhook } from "#/modules/billing/webhook";

const router: Router = Router();

router.post(
  "/stripe",
  // Raw body, not JSON: the signature is computed over the exact bytes
  // Stripe sent. This is why app.ts mounts webhooks before express.json().
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const stripe = await import("stripe");
      const stripeClient = new stripe.default(env.STRIPE_SECRET_KEY);

      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        res.status(400).json({ error: "Missing stripe-signature header" });
        return;
      }

      let event: any;

      try {
        event = stripeClient.webhooks.constructEvent(
          req.body,
          signature,
          env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (error) {
        console.error("❌ Webhook signature verification failed:", error);
        res.status(400).json({ error: "Invalid signature" });
        return;
      }

      // Acknowledged before processing so Stripe doesn't time out and resend.
      // Trade-off: if a handler below throws, Stripe won't retry the event —
      // the error is only logged.
      res.status(200).json({ received: true });

      await handleStripeWebhook(event.type, event.data.object);
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
    }
  },
);

export { router as stripeWebhookRoutes };
