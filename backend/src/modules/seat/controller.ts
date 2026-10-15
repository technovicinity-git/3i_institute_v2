import type { Request, Response, NextFunction } from "express";
import { seatService } from "#/modules/seat/service";
import {
  assignSeatSchema,
  cancelSeatSchema,
  profileSubscriptionSchema,
} from "#/modules/seat/schema";
import { sendSuccess } from "#/shared/response";

export class SeatController {
  assignSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = assignSeatSchema.parse(req.body);
      const seat = await seatService.assignSeat(accountId, input);
      sendSuccess(res, seat, 201, "Seat assigned to profile");
    } catch (error) {
      next(error);
    }
  };

  cancelSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = cancelSeatSchema.parse(req.body);
      const seat = await seatService.cancelSeat(accountId, input);
      sendSuccess(res, seat, 200, "Seat cancelled");
    } catch (error) {
      next(error);
    }
  };

  getAccountSeats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const seats = await seatService.getAccountSeats(accountId);
      sendSuccess(res, seats, 200);
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionOverview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const overview = await seatService.getSubscriptionOverview(accountId);
      sendSuccess(res, overview, 200);
    } catch (error) {
      next(error);
    }
  };

  subscribeProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const { learnerProfileId } = profileSubscriptionSchema.parse(req.body);
      const seat = await seatService.subscribeProfile(
        accountId,
        learnerProfileId,
      );
      sendSuccess(res, seat, 201, "Profile subscribed");
    } catch (error) {
      next(error);
    }
  };

  unsubscribeProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const { learnerProfileId } = profileSubscriptionSchema.parse(req.body);
      const seat = await seatService.unsubscribeProfile(
        accountId,
        learnerProfileId,
      );
      sendSuccess(res, seat, 200, "Profile unsubscribed");
    } catch (error) {
      next(error);
    }
  };

  getProfileSeatStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const status = await seatService.getProfileSeatStatus(
        accountId,
        req.params["learnerProfileId"] as string,
      );
      sendSuccess(res, status, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const seatController = new SeatController();
