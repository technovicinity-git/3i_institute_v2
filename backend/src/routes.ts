import { type Express, Router } from "express";
import { authRoutes } from "#/modules/auth/routes";
import { userRoutes } from "#/modules/user/routes";
import { learnerRoutes } from "#/modules/learner/routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/learners", learnerRoutes);

function mountRoutes(app: Express): void {
  app.use("/api/v1", router);
}

export { mountRoutes, router };
