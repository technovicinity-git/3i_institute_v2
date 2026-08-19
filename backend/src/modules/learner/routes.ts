import { Router } from "express";
import { learnerController } from "#/modules/learner/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createLearnerSchema,
  updateLearnerSchema,
  verifyPinSchema,
} from "#/modules/learner/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/learners:
 *   get:
 *     tags: [Learners]
 *     summary: Get all learner profiles
 *     description: Returns all active learner profiles for the authenticated account holder.
 *     responses:
 *       200:
 *         description: List of learner profiles
 *   post:
 *     tags: [Learners]
 *     summary: Create a learner profile
 *     description: Create a new learner profile under the authenticated account. Only adult account holders can create profiles. Max 6 profiles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - dateOfBirth
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: Aisha
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2015-06-20"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               pin:
 *                 type: string
 *                 pattern: '^\d{4}$'
 *                 example: "1234"
 *               chatEnabled:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Learner profile created
 *       403:
 *         description: Not an adult account holder
 *       409:
 *         description: Max profiles reached
 */
router.get(
  "/",
  authenticate,
  authorize("profiles.create"),
  learnerController.getAll,
);
router.post(
  "/",
  authenticate,
  authorize("profiles.create"),
  validate(createLearnerSchema),
  learnerController.create,
);

/**
 * @swagger
 * /api/v1/learners/{id}:
 *   get:
 *     tags: [Learners]
 *     summary: Get learner profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Learner profile
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Learners]
 *     summary: Update learner profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               pin:
 *                 type: string
 *                 pattern: '^\d{4}$'
 *               chatEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 *       409:
 *         description: Name locked due to certificate
 *   delete:
 *     tags: [Learners]
 *     summary: Delete learner profile
 *     description: Soft delete a learner profile. Certificates remain valid.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.get(
  "/:id",
  authenticate,
  authorize("profiles.create"),
  learnerController.getById,
);
router.patch(
  "/:id",
  authenticate,
  authorize("profiles.update"),
  validate(updateLearnerSchema),
  learnerController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("profiles.delete"),
  learnerController.delete,
);

/**
 * @swagger
 * /api/v1/learners/{id}/verify-pin:
 *   post:
 *     tags: [Learners]
 *     summary: Verify profile PIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pin]
 *             properties:
 *               pin: { type: string, pattern: '^\d{4}$' }
 *     responses:
 *       200:
 *         description: PIN verified
 */
router.post(
  "/:id/verify-pin",
  authenticate,
  validate(verifyPinSchema),
  learnerController.verifyPin,
);

/**
 * @swagger
 * /api/v1/learners/{id}/reset-pin:
 *   post:
 *     tags: [Learners]
 *     summary: Reset profile PIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pin]
 *             properties:
 *               pin: { type: string, pattern: '^\d{4}$' }
 *     responses:
 *       200:
 *         description: PIN reset
 */
router.post(
  "/:id/reset-pin",
  authenticate,
  validate(verifyPinSchema),
  learnerController.resetPin,
);

export { router as learnerRoutes };
