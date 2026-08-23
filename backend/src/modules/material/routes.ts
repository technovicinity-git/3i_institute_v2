import { Router } from "express";
import multer from "multer";
import { materialController } from "#/modules/material/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createMaterialSchema,
  updateMaterialSchema,
} from "#/modules/material/schema";

const router: Router = Router();

// Configure multer for memory storage (files processed in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024 * 1024, // 4GB max
  },
});

/**
 * @swagger
 * /api/v1/materials:
 *   post:
 *     tags: [Materials]
 *     summary: Create a material link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title, type]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               title: { type: string }
 *               type: { type: string, enum: [video, document, audio, link] }
 *               url: { type: string }
 *               order: { type: integer }
 *               duration: { type: integer }
 *     responses:
 *       201:
 *         description: Material created
 */
router.post(
  "/",
  authenticate,
  authorize("materials.upload"),
  validate(createMaterialSchema),
  materialController.create,
);

/**
 * @swagger
 * /api/v1/materials/upload-video:
 *   post:
 *     tags: [Materials]
 *     summary: Upload a video with optional captions
 *     description: Upload video file. Captions are optional.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: courseId
 *         type: string
 *         format: uuid
 *         required: true
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *       - in: formData
 *         name: order
 *         type: integer
 *         required: false
 *       - in: formData
 *         name: video
 *         type: file
 *         required: true
 *       - in: formData
 *         name: captions
 *         type: file
 *         required: false
 *         description: Optional English caption file (VTT or SRT)
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 */
router.post(
  "/upload-video",
  authenticate,
  authorize("materials.upload"),
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "captions", maxCount: 1 },
  ]),
  materialController.uploadVideo,
);

/**
 * @swagger
 * /api/v1/materials/course/{courseId}:
 *   get:
 *     tags: [Materials]
 *     summary: Get course materials
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of materials
 */
router.get("/course/:courseId", materialController.getCourseMaterials);

/**
 * @swagger
 * /api/v1/materials/{id}/signed-url:
 *   get:
 *     tags: [Materials]
 *     summary: Get signed URL for material
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Signed URL
 */
router.get("/:id/signed-url", authenticate, materialController.getSignedUrl);

/**
 * @swagger
 * /api/v1/materials/{id}:
 *   patch:
 *     tags: [Materials]
 *     summary: Update material
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Material updated
 *   delete:
 *     tags: [Materials]
 *     summary: Delete material
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Material deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorize("materials.upload"),
  validate(updateMaterialSchema),
  materialController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("materials.delete"),
  materialController.delete,
);

export { router as materialRoutes };
