import type { Request, Response, NextFunction } from "express";
import { materialService } from "#/modules/material/service";
import {
  createMaterialSchema,
  updateMaterialSchema,
  uploadVideoSchema,
} from "#/modules/material/schema";
import { sendSuccess } from "#/shared/response";
import { ValidationError } from "#/shared/errors";

export class MaterialController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = createMaterialSchema.parse(req.body);
      const material = await materialService.create(instructorId, input);
      sendSuccess(res, material, 201, "Material created");
    } catch (error) {
      next(error);
    }
  };

  uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = uploadVideoSchema.parse(req.body);

      const files = (req as any).files;
      const videoFile = files?.video?.[0]?.buffer;
      const captionsFile = files?.captions?.[0]?.buffer; // Optional

      if (!videoFile) {
        throw new ValidationError("Video file is required");
      }

      // captionsFile is now optional
      const result = await materialService.uploadVideo(
        instructorId,
        input,
        videoFile,
        captionsFile,
      );

      sendSuccess(res, result, 201, "Video uploaded");
    } catch (error) {
      next(error);
    }
  };

  // For instructor — flat list
  getCourseMaterials = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const courseId = req.params["courseId"] as string;
      const result = await materialService.getCourseMaterials(courseId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  // For learner — module-grouped
  getCourseContent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const courseId = req.params["courseId"] as string;
      const learnerProfileId = req.query["learnerProfileId"] as
        string | undefined;
      const result = await materialService.getCourseContentForLearner(
        courseId,
        learnerProfileId,
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const result = await materialService.getSignedMaterialUrl(
        userId,
        req.params["id"] as string,
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = updateMaterialSchema.parse(req.body);
      const material = await materialService.update(
        instructorId,
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, material, 200, "Material updated");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      await materialService.delete(instructorId, req.params["id"] as string);
      sendSuccess(res, null, 200, "Material deleted");
    } catch (error) {
      next(error);
    }
  };
  uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const files = (req as any).files;
      const file = files?.document?.[0];

      if (!file) {
        throw new ValidationError("Document file is required");
      }

      const { courseId, title, order, description } = req.body;

      if (!courseId || !title) {
        throw new ValidationError("courseId and title are required");
      }

      const material = await materialService.uploadDocument(
        instructorId,
        courseId,
        title,
        Number(order) || 0,
        description || undefined,
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      sendSuccess(res, material, 201, "Document uploaded");
    } catch (error) {
      next(error);
    }
  };
}

export const materialController = new MaterialController();
