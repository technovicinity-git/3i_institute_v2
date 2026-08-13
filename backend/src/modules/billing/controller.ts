import type { Request, Response, NextFunction } from "express";
import { billingService } from "#/modules/billing/service";
import {
  createCheckoutSessionSchema,
  waiverRequestSchema,
  waiverDecisionSchema,
} from "#/modules/billing/schema";
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

  requestWaiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = waiverRequestSchema.parse(req.body);
      const waiver = await billingService.requestWaiver(accountId, input);
      sendSuccess(res, waiver, 201, "Waiver request submitted");
    } catch (error) {
      next(error);
    }
  };

  getMyWaiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const waivers = await billingService.getMyWaiver(accountId);
      sendSuccess(res, waivers, 200);
    } catch (error) {
      next(error);
    }
  };

  getPendingWaivers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const waivers = await billingService.getPendingWaivers();
      sendSuccess(res, waivers, 200);
    } catch (error) {
      next(error);
    }
  };

  reviewWaiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const input = waiverDecisionSchema.parse(req.body);
      const result = await billingService.reviewWaiver(
        adminId,
        req.params["waiverId"] as string,
        input,
      );
      sendSuccess(res, result, 200, "Waiver reviewed");
    } catch (error) {
      next(error);
    }
  };

  revokeWaiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const { reason } = req.body;
      const result = await billingService.revokeWaiver(
        adminId,
        req.params["waiverId"] as string,
        reason,
      );
      sendSuccess(res, result, 200, "Waiver revoked");
    } catch (error) {
      next(error);
    }
  };
}

export const billingController = new BillingController();
