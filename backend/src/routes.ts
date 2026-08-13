import { type Express, Router } from "express";
import { authRoutes } from "#/modules/auth/routes";
import { userRoutes } from "#/modules/user/routes";
import { learnerRoutes } from "#/modules/learner/routes";
import { deviceRoutes } from "#/modules/device/routes";
import { instructorRoutes } from "#/modules/instructor/routes";
import { courseRoutes } from "#/modules/course/routes";
import { enrolmentRoutes } from "#/modules/enrolment/routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/learners", learnerRoutes);
router.use("/devices", deviceRoutes);
router.use("/instructors", instructorRoutes);
router.use("/courses", courseRoutes);
router.use("/enrolments", enrolmentRoutes);

function mountRoutes(app: Express): void {
  app.use("/api/v1", router);
}

export { mountRoutes, router };
