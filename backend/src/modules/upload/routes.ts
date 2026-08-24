import { Router } from "express";
import multer from "multer";
import { uploadController } from "#/modules/upload/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF"));
    }
  },
});

const uploadImage = upload.fields([{ name: "image", maxCount: 1 }]);

/**
 * @swagger
 * /api/v1/uploads/instructor-photo:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload instructor profile photo
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *     responses:
 *       201:
 *         description: Photo uploaded
 */
router.post(
  "/instructor-photo",
  authenticate,
  authorize("instructors.manage"),
  uploadImage,
  uploadController.uploadInstructorPhoto,
);

/**
 * @swagger
 * /api/v1/uploads/learner-avatar:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload learner profile avatar
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *       - in: formData
 *         name: learnerProfileId
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Avatar uploaded
 */
router.post(
  "/learner-avatar",
  authenticate,
  authorize("profiles.update"),
  uploadImage,
  uploadController.uploadLearnerAvatar,
);

/**
 * @swagger
 * /api/v1/uploads/account-image:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload account profile image
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *     responses:
 *       201:
 *         description: Image uploaded
 */
router.post(
  "/account-image",
  authenticate,
  uploadImage,
  uploadController.uploadAccountImage,
);

/**
 * @swagger
 * /api/v1/uploads/course-thumbnail:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload course thumbnail
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *       - in: formData
 *         name: courseId
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Thumbnail uploaded
 */
router.post(
  "/course-thumbnail",
  authenticate,
  authorize("courses.update"),
  uploadImage,
  uploadController.uploadCourseThumbnail,
);

/**
 * @swagger
 * /api/v1/uploads/course-cover:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload course cover image
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *       - in: formData
 *         name: courseId
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Cover uploaded
 */
router.post(
  "/course-cover",
  authenticate,
  authorize("courses.update"),
  uploadImage,
  uploadController.uploadCourseCover,
);

/**
 * @swagger
 * /api/v1/uploads/delete:
 *   post:
 *     tags: [Uploads]
 *     summary: Delete an uploaded image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [publicId]
 *             properties:
 *               publicId: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 */
router.post("/delete", authenticate, uploadController.deleteImage);

export { router as uploadRoutes };
