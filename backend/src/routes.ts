import { type Express, Router } from "express";
import { authRoutes } from "#/modules/auth/routes";
import { userRoutes } from "#/modules/user/routes";
import { learnerRoutes } from "#/modules/learner/routes";
import { deviceRoutes } from "#/modules/device/routes";
import { instructorRoutes } from "#/modules/instructor/routes";
import { courseRoutes } from "#/modules/course/routes";
import { enrolmentRoutes } from "#/modules/enrolment/routes";
import { batchRoutes } from "#/modules/batch/routes";
import { examRoutes } from "#/modules/exam/routes";
import { certificateRoutes } from "#/modules/certificate/routes";
import { billingRoutes } from "#/modules/billing/routes";
import { chatRoutes } from "#/modules/chat/routes";
import { notificationRoutes } from "#/modules/notification/routes";
import { reportRoutes } from "#/modules/report/routes";
import { materialRoutes } from "#/modules/material/routes";
import { progressRoutes } from "#/modules/progress/routes";
import { ratingRoutes } from "#/modules/rating/routes";
import { seatRoutes } from "#/modules/seat/routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/learners", learnerRoutes);
router.use("/devices", deviceRoutes);
router.use("/instructors", instructorRoutes);
router.use("/courses", courseRoutes);
router.use("/enrolments", enrolmentRoutes);
router.use("/batches", batchRoutes);
router.use("/exams", examRoutes);
router.use("/certificates", certificateRoutes);
router.use("/billing", billingRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);
router.use("/materials", materialRoutes);
router.use("/progress", progressRoutes);
router.use("/ratings", ratingRoutes);
router.use("/seats", seatRoutes);

function mountRoutes(app: Express): void {
  app.use("/api/v1", router);
}

export { mountRoutes, router };
