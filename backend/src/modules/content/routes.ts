import { Router } from "express";
import { contentController } from "#/modules/content/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

// Admin CMS endpoints, mounted at /admin/content.
const adminRouter: Router = Router();
adminRouter.use(authenticate, authorize("admin.access"));

adminRouter.get("/pages", contentController.listPages);
adminRouter.get("/pages/:slug", contentController.getPage);
adminRouter.put("/pages/:slug", contentController.savePage);
adminRouter.delete("/pages/:slug", contentController.deletePage);

adminRouter.get("/faq", contentController.listFaqAdmin);
adminRouter.post("/faq", contentController.createFaq);
adminRouter.patch("/faq/:id", contentController.updateFaq);
adminRouter.delete("/faq/:id", contentController.deleteFaq);

adminRouter.get("/settings", contentController.getSettingsAdmin);
adminRouter.put("/settings", contentController.saveSettings);

// Public, read-only content, mounted at /site.
const publicRouter: Router = Router();
publicRouter.get("/pages", contentController.publicPages);
publicRouter.get("/pages/:slug", contentController.publicPage);
publicRouter.get("/faq", contentController.publicFaq);
publicRouter.get("/settings", contentController.publicSettings);

export {
  adminRouter as adminContentRoutes,
  publicRouter as publicContentRoutes,
};
