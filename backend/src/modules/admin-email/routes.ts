import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import multer from "multer";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { ValidationError } from "#/shared/errors";
import { adminEmailController } from "#/modules/admin-email/controller";
import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENTS_BYTES,
} from "#/modules/admin-email/service";

// ──────────────────────────────────
// Admin: /api/v1/admin/emails
// ──────────────────────────────────
const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_ATTACHMENTS_BYTES,
    files: MAX_ATTACHMENTS,
    fieldSize: 1024 * 1024, // the Markdown body
  },
}).array("attachments", MAX_ATTACHMENTS);

// Turns multer's limit errors into a 422 with a readable message.
function uploadAttachments(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? `Attachments can be at most ${MAX_ATTACHMENTS_BYTES / 1024 / 1024}MB in total`
          : error.code === "LIMIT_FILE_COUNT" ||
              error.code === "LIMIT_UNEXPECTED_FILE"
            ? `Attach at most ${MAX_ATTACHMENTS} files`
            : error.message;
      next(new ValidationError(message));
      return;
    }
    next(error as Error | undefined);
  });
}

router.use(authenticate, authorize("admin.access"));

/**
 * @swagger
 * /api/v1/admin/emails/preview:
 *   get:
 *     tags: [Admin Emails]
 *     summary: Count who would receive an admin email
 *     parameters:
 *       - in: query
 *         name: audience
 *         required: true
 *         schema: { type: string, enum: [INSTRUCTORS, LEARNERS, ALL, USERS] }
 *       - in: query
 *         name: userIds
 *         schema: { type: string }
 *         description: Comma-separated user IDs (audience USERS)
 *     responses:
 *       200:
 *         description: "{ recipientCount } (active, verified accounts only)"
 */
router.get("/preview", adminEmailController.preview);

/**
 * @swagger
 * /api/v1/admin/emails:
 *   get:
 *     tags: [Admin Emails]
 *     summary: Sent email history
 *     responses:
 *       200:
 *         description: "{ emails, total, page, limit, hasMore }"
 *   post:
 *     tags: [Admin Emails]
 *     summary: Send a custom email (sent in the background)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [audience, subject, body]
 *             properties:
 *               audience: { type: string, enum: [INSTRUCTORS, LEARNERS, ALL, USERS] }
 *               userIds: { type: string, description: "JSON array of user IDs (audience USERS)" }
 *               subject: { type: string, maxLength: 200 }
 *               body: { type: string, description: Markdown }
 *               greeting: { type: string, enum: ["true", "false"] }
 *               attachments: { type: array, items: { type: string, format: binary }, maxItems: 5 }
 *     responses:
 *       201:
 *         description: "{ id, recipientCount }"
 */
router.get("/", adminEmailController.list);
router.post("/", uploadAttachments, adminEmailController.send);

/**
 * @swagger
 * /api/v1/admin/emails/{id}:
 *   get:
 *     tags: [Admin Emails]
 *     summary: One sent email with its status and counts
 *     responses:
 *       200:
 *         description: Email details
 */
router.get("/:id", adminEmailController.get);

export { router as adminEmailRoutes };
