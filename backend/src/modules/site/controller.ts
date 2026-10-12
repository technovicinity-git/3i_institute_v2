import type { Request, Response, NextFunction } from "express";
import { siteService } from "#/modules/site/service";
import { sendSuccess } from "#/shared/response";

export class SiteController {
  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await siteService.getStats(), 200);
    } catch (error) {
      next(error);
    }
  };

  getFaculty = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await siteService.getFaculty(), 200);
    } catch (error) {
      next(error);
    }
  };

  getTestimonials = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await siteService.getTestimonials(), 200);
    } catch (error) {
      next(error);
    }
  };
}

export const siteController = new SiteController();
