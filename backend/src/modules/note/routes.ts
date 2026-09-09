import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "#/middleware/authenticate";
import { noteService } from "#/modules/note/service";
import { sendSuccess } from "#/shared/response";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const learnerProfileId = req.query["learnerProfileId"] as string;
      const materialId = req.query["materialId"] as string;

      if (!learnerProfileId || !materialId) {
        res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "learnerProfileId and materialId required",
          },
        });
        return;
      }

      const note = await noteService.getNotes(
        accountId,
        learnerProfileId,
        materialId,
      );
      sendSuccess(res, note, 200);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const { learnerProfileId, materialId, content } = req.body;

      if (!learnerProfileId || !materialId || !content) {
        res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "learnerProfileId, materialId, content required",
          },
        });
        return;
      }

      const note = await noteService.saveNote(
        accountId,
        learnerProfileId,
        materialId,
        content,
      );
      sendSuccess(res, note, 201, "Note saved");
    } catch (error) {
      next(error);
    }
  },
);

export { router as noteRoutes };
