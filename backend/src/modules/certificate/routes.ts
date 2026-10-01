import { Router } from "express";
import { certificateController } from "#/modules/certificate/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/certificates/issue/attendance:
 *   post:
 *     tags: [Certificates]
 *     summary: Issue attendance certificate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Certificate issued
 */
router.post(
  "/issue/attendance",
  authenticate,
  certificateController.issueAttendance,
);

/**
 * @swagger
 * /api/v1/certificates/issue/completion:
 *   post:
 *     tags: [Certificates]
 *     summary: Issue completion certificate
 *     description: Requires passing the final exam first.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Certificate issued
 */
router.post(
  "/issue/completion",
  authenticate,
  certificateController.issueCompletion,
);

/**
 * @swagger
 * /api/v1/certificates/issue/final-exam/{examId}:
 *   post:
 *     tags: [Certificates]
 *     summary: Issue completion certificates for eligible online-class learners
 *     description: Only for ONLINE_CLASS final exams. Fails while any attempt remains ungraded.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Certificate issuance counts
 */
router.post(
  "/issue/final-exam/:examId",
  authenticate,
  authorize("exams.grade"),
  certificateController.issueOnlineFinalExamBatch,
);

/**
 * @swagger
 * /api/v1/certificates/issue/exam:
 *   post:
 *     tags: [Certificates]
 *     summary: Issue exam certificate (REGULAR course exam)
 *     description: Requires at least one exam attempt. Can only be issued once.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Certificate issued
 */
router.post(
  "/issue/exam",
  authenticate,
  certificateController.issueExam,
);

/**
 * @swagger
 * /api/v1/certificates/exam:
 *   get:
 *     tags: [Certificates]
 *     summary: Get the exam certificate for a learner + course (nullable)
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Certificate or null
 */
router.get("/exam", authenticate, certificateController.getExam);

/**
 * @swagger
 * /api/v1/certificates/learner/{learnerProfileId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get all certificates for a learner
 *     parameters:
 *       - in: path
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get(
  "/learner/:learnerProfileId",
  authenticate,
  certificateController.getLearnerCertificates,
);

/**
 * @swagger
 * /api/v1/certificates/verify/{code}:
 *   get:
 *     tags: [Certificates]
 *     summary: Verify a certificate (public)
 *     description: No authentication required. Returns VALID or REVOKED status.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate verification result
 *       404:
 *         description: Certificate not found
 */
router.get("/verify/:code", certificateController.verify);

/**
 * @swagger
 * /api/v1/certificates/{id}/revoke:
 *   post:
 *     tags: [Certificates]
 *     summary: Revoke a certificate (admin)
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Certificate revoked
 */
router.post(
  "/:id/revoke",
  authenticate,
  authorize("certificates.revoke"),
  certificateController.revoke,
);

export { router as certificateRoutes };
