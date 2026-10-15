import type { Request, Response, NextFunction } from "express";
import { billingService } from "#/modules/billing/service";
import { createCheckoutSessionSchema } from "#/modules/billing/schema";
import { sendSuccess } from "#/shared/response";

export class BillingController {
  createCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const input = createCheckoutSessionSchema.parse(req.body);
      const result = await billingService.createCheckoutSession(
        accountId,
        input,
      );
      sendSuccess(res, result, 200, "Checkout session created");
    } catch (error) {
      next(error);
    }
  };

  getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const subscription = await billingService.getSubscription(accountId);
      sendSuccess(res, subscription, 200);
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const result = await billingService.cancelSubscription(accountId);
      sendSuccess(res, result, 200, "Subscription cancellation scheduled");
    } catch (error) {
      next(error);
    }
  };

}

export const billingController = new BillingController();
