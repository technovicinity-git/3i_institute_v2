import type { Request, Response, NextFunction } from "express";
import { adminService } from "#/modules/admin/service";
import { sendSuccess } from "#/shared/response";

export class AdminController {
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const search = req.query["search"] as string | undefined;
      const result = await adminService.getUsers(page, limit, search);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  suspendUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params["id"] as string;
      const result = await adminService.suspendUser(userId);
      sendSuccess(res, result, 200, "User suspended");
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params["id"] as string;
      const result = await adminService.activateUser(userId);
      sendSuccess(res, result, 200, "User activated");
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params["id"] as string;
      const result = await adminService.deleteUser(userId);
      sendSuccess(res, result, 200, "User deleted");
    } catch (error) {
      next(error);
    }
  };

  getInstructors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const result = await adminService.getInstructors(page, limit);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getPendingApplications = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await adminService.getPendingInstructorApplications();
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getPendingCourses = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await adminService.getPendingCourses();
      sendSuccess(res, result, 200);
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
      const result = await adminService.getPendingWaivers();
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const status = req.query["status"] as string | undefined;
      const result = await adminService.getAllCourses(page, limit, status);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  suspendCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params["id"] as string;
      const result = await adminService.suspendCourse(courseId);
      sendSuccess(res, result, 200, "Course suspended");
    } catch (error) {
      next(error);
    }
  };

  activateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params["id"] as string;
      const result = await adminService.activateCourse(courseId);
      sendSuccess(res, result, 200, "Course activated");
    } catch (error) {
      next(error);
    }
  };

  getAllWaivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const status = req.query["status"] as string | undefined;
      const result = await adminService.getAllWaivers(page, limit, status);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const status = req.query["status"] as string | undefined;
      const result = await adminService.getSubscriptions(page, limit, status);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getCertificates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"] ?? 1);
      const limit = Number(req.query["limit"] ?? 20);
      const search = req.query["search"] as string | undefined;
      const result = await adminService.getCertificates(page, limit, search);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
