import { Router } from "express";
import { siteController } from "#/modules/site/controller";

// Public, unauthenticated content for the marketing site.
const router: Router = Router();

router.get("/stats", siteController.getStats);
router.get("/faculty", siteController.getFaculty);
router.get("/testimonials", siteController.getTestimonials);

export { router as siteRoutes };
