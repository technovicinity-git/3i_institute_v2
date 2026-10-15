import type { Request, Response, NextFunction } from "express";
import { subscriptionService } from "#/modules/subscription/service";
import {
  createSubscriptionRequestSchema,
  paymentSettingsSchema,
  rejectSubscriptionRequestSchema,
} from "#/modules/subscription/schema";
import { sendSuccess } from "#/shared/response";

export class SubscriptionController {
  // ─── Account holder ───

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await subscriptionService.getOverview(req.user?.sub!);
      sendSuccess(res, overview, 200);
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createSubscriptionRequestSchema.parse(req.body);
      const request = await subscriptionService.createRequest(
        req.user?.sub!,
        input,
      );
      sendSuccess(res, request, 201, "Subscription request submitted");
    } catch (error) {
      next(error);
    }
  };

  cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await subscriptionService.cancelRequest(
        req.user?.sub!,
        req.params["id"] as string,
      );
      sendSuccess(res, request, 200, "Subscription request cancelled");
    } catch (error) {
      next(error);
    }
  };

  // ─── Admin ───

  listRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query["limit"] ?? 20) || 20));
      const result = await subscriptionService.listRequests(page, limit, {
        status: req.query["status"] as string | undefined,
        search: req.query["search"] as string | undefined,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await subscriptionService.approveRequest(
        req.user?.sub!,
        req.params["id"] as string,
      );
      sendSuccess(res, request, 200, "Subscription approved");
    } catch (error) {
      next(error);
    }
  };

  rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = rejectSubscriptionRequestSchema.parse(req.body);
      const request = await subscriptionService.rejectRequest(
        req.user?.sub!,
        req.params["id"] as string,
        reason,
      );
      sendSuccess(res, request, 200, "Subscription request rejected");
    } catch (error) {
      next(error);
    }
  };

  getPaymentSettings = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      sendSuccess(res, await subscriptionService.getPaymentSettings(), 200);
    } catch (error) {
      next(error);
    }
  };

  savePaymentSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const settings = paymentSettingsSchema.parse(req.body);
      const saved = await subscriptionService.savePaymentSettings(
        settings,
        req.user?.sub!,
      );
      sendSuccess(res, saved, 200, "Payment details saved");
    } catch (error) {
      next(error);
    }
  };
}

export const subscriptionController = new SubscriptionController();
