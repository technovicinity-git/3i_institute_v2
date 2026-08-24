import type { Request, Response, NextFunction } from "express";
import { uploadService } from "#/modules/upload/service";
import { sendSuccess } from "#/shared/response";
import { ValidationError } from "#/shared/errors";

function getImageFile(req: Request): {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
} {
  const files = (req as any).files;
  const imageFile = files?.image?.[0];

  if (!imageFile) {
    throw new ValidationError("Image file is required (field name: 'image')");
  }

  return imageFile;
}

export class UploadController {
  // ──────────────────────────────────
  // Instructor Photo Upload
  // ──────────────────────────────────
  uploadInstructorPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const imageFile = getImageFile(req);

      const result = await uploadService.uploadInstructorPhoto(
        accountId,
        imageFile.buffer,
        imageFile.mimetype,
        imageFile.originalname,
      );

      sendSuccess(res, result, 201, "Instructor photo uploaded");
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // Learner Profile Avatar Upload
  // ──────────────────────────────────
  uploadLearnerAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const learnerProfileId = req.body?.learnerProfileId as string;

      if (!learnerProfileId) {
        throw new ValidationError("learnerProfileId is required");
      }

      const imageFile = getImageFile(req);

      const result = await uploadService.uploadLearnerProfileAvatar(
        accountId,
        learnerProfileId,
        imageFile.buffer,
        imageFile.mimetype,
        imageFile.originalname,
      );

      sendSuccess(res, result, 201, "Learner avatar uploaded");
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // Account Image Upload
  // ──────────────────────────────────
  uploadAccountImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const imageFile = getImageFile(req);

      const result = await uploadService.uploadAccountImage(
        accountId,
        imageFile.buffer,
        imageFile.mimetype,
        imageFile.originalname,
      );

      sendSuccess(res, result, 201, "Account image uploaded");
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // Course Thumbnail Upload
  // ──────────────────────────────────
  uploadCourseThumbnail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const courseId = req.body?.courseId as string;

      if (!courseId) {
        throw new ValidationError("courseId is required");
      }

      const imageFile = getImageFile(req);

      const result = await uploadService.uploadCourseThumbnail(
        accountId,
        courseId,
        imageFile.buffer,
        imageFile.mimetype,
        imageFile.originalname,
      );

      sendSuccess(res, result, 201, "Course thumbnail uploaded");
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // Course Cover Upload
  // ──────────────────────────────────
  uploadCourseCover = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const accountId = req.user?.sub!;
      const courseId = req.body?.courseId as string;

      if (!courseId) {
        throw new ValidationError("courseId is required");
      }

      const imageFile = getImageFile(req);

      const result = await uploadService.uploadCourseCoverImage(
        accountId,
        courseId,
        imageFile.buffer,
        imageFile.mimetype,
        imageFile.originalname,
      );

      sendSuccess(res, result, 201, "Course cover uploaded");
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────
  // Delete Image
  // ──────────────────────────────────
  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const publicId = req.body?.publicId as string;

      if (!publicId) {
        throw new ValidationError("publicId is required");
      }

      await uploadService.deleteImage(accountId, publicId);
      sendSuccess(res, null, 200, "Image deleted");
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
