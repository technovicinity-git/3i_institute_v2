import { type Express, Router } from "express";

// ──────────────────────────────────────
// Module routes (imported as we build them)
// ──────────────────────────────────────
// import { authRoutes } from "#/modules/auth/routes";

const router: Router = Router();

// ──────────────────────────────────────
// Mount module routes
// ──────────────────────────────────────
// router.use("/auth", authRoutes);

// ──────────────────────────────────────
// Central mount point
// ──────────────────────────────────────
function mountRoutes(app: Express): void {
  app.use("/api/v1", router);
}

export { mountRoutes, router };
