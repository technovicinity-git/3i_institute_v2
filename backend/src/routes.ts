import { type Express, Router } from "express";
import { authRoutes } from "#/modules/auth/routes";
import { userRoutes } from "#/modules/user/routes";
import { learnerRoutes } from "#/modules/learner/routes";
// import { deviceRoutes } from "#/modules/device/routes";
import { instructorRoutes } from "#/modules/instructor/routes";
import { courseRoutes } from "#/modules/course/routes";
import { enrolmentRoutes } from "#/modules/enrolment/routes";
import { batchRoutes } from "#/modules/batch/routes";
import { examRoutes } from "#/modules/exam/routes";
import { certificateRoutes } from "#/modules/certificate/routes";
import { billingRoutes } from "#/modules/billing/routes";
import { chatRoutes } from "#/modules/chat/routes";
import { notificationRoutes } from "#/modules/notification/routes";
import {
  adminBroadcastRoutes,
  instructorBroadcastRoutes,
} from "#/modules/notification/broadcast-routes";
import { reportRoutes } from "#/modules/report/routes";
import { materialRoutes } from "#/modules/material/routes";
import { progressRoutes } from "#/modules/progress/routes";
import { ratingRoutes } from "#/modules/rating/routes";
import { seatRoutes } from "#/modules/seat/routes";
import {
  subscriptionRoutes,
  adminSubscriptionRequestRoutes,
} from "#/modules/subscription/routes";
import { waiverRoutes, adminWaiverRoutes } from "#/modules/waiver/routes";
import { adminActivityLogRoutes } from "#/modules/activity-log/routes";
import { dashboardRoutes } from "#/modules/dashboard/routes";
import { uploadRoutes } from "#/modules/upload/routes";
import { wishlistRoutes } from "#/modules/wishlist/routes";
import { instructorAssignmentRoutes } from "#/modules/assignment/routes";
import { adminRoutes } from "#/modules/admin/routes";
import { adminEmailRoutes } from "#/modules/admin-email/routes";
import { learnerAssignmentRoutes } from "#/modules/assignment/learner-routes";
import { noteRoutes } from "#/modules/note/routes";
import { categoryRoutes } from "#/modules/category/routes";
import { siteRoutes } from "#/modules/site/routes";
import {
  adminContentRoutes,
  publicContentRoutes,
} from "#/modules/content/routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/learners", learnerRoutes);
// router.use("/devices", deviceRoutes);
// Mounted before the broader /instructors and /admin routers.
router.use("/instructors/notifications", instructorBroadcastRoutes);
router.use("/admin/notifications", adminBroadcastRoutes);
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
router.use("/subscriptions", subscriptionRoutes);
router.use("/waivers", waiverRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/instructors/assignments", instructorAssignmentRoutes);
// Mounted before the broader /admin router.
router.use("/admin/content", adminContentRoutes);
router.use("/admin/emails", adminEmailRoutes);
router.use("/admin/subscription-requests", adminSubscriptionRequestRoutes);
router.use("/admin/waivers", adminWaiverRoutes);
router.use("/admin/activity-log", adminActivityLogRoutes);
router.use("/admin", adminRoutes);
router.use("/assignments", learnerAssignmentRoutes);
router.use("/notes", noteRoutes);
router.use("/categories", categoryRoutes);
router.use("/site", siteRoutes);
router.use("/site", publicContentRoutes);

function mountRoutes(app: Express): void {
  app.use("/api/v1", router);
}

export { mountRoutes, router };
