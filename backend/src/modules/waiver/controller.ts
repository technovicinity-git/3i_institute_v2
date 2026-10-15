import type { Request, Response, NextFunction } from "express";
import { waiverService } from "#/modules/waiver/service";
import {
  approveWaiverSchema,
  createWaiverSchema,
  reasonSchema,
} from "#/modules/waiver/schema";
import { sendSuccess } from "#/shared/response";

export class WaiverController {
  // ─── Account holder ───

  listMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await waiverService.listMine(req.user?.sub!), 200);
    } catch (error) {
      next(error);
    }
  };

  apply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createWaiverSchema.parse(req.body);
      const waiver = await waiverService.apply(req.user?.sub!, input);
      sendSuccess(res, waiver, 201, "Waiver request submitted");
    } catch (error) {
      next(error);
    }
  };

  // ─── Admin ───

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
      const limit = Math.min(
        100,
        Math.max(1, Number(req.query["limit"] ?? 20) || 20),
      );
      const result = await waiverService.list(page, limit, {
        status: req.query["status"] as string | undefined,
        search: req.query["search"] as string | undefined,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tier } = approveWaiverSchema.parse(req.body);
      const waiver = await waiverService.approve(
        req.user?.sub!,
        req.params["id"] as string,
        tier,
      );
      sendSuccess(res, waiver, 200, "Waiver approved");
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = reasonSchema.parse(req.body);
      const waiver = await waiverService.reject(
        req.user?.sub!,
        req.params["id"] as string,
        reason,
      );
      sendSuccess(res, waiver, 200, "Waiver rejected");
    } catch (error) {
      next(error);
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = reasonSchema.parse(req.body);
      const waiver = await waiverService.revoke(
        req.user?.sub!,
        req.params["id"] as string,
        reason,
      );
      sendSuccess(res, waiver, 200, "Waiver revoked");
    } catch (error) {
      next(error);
    }
  };
}

export const waiverController = new WaiverController();
