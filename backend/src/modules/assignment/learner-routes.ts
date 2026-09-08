import { Router } from "express";
import { assignmentController } from "#/modules/assignment/controller";
import { authenticate } from "#/middleware/authenticate";

const router: Router = Router();

router.get(
  "/course/:courseId",
  authenticate,
  assignmentController.getCourseAssignmentsForLearner,
);

router.post("/submit", authenticate, assignmentController.submitAssignment);

export { router as learnerAssignmentRoutes };
