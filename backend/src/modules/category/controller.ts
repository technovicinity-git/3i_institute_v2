import type { Request, Response, NextFunction } from "express";
import { categoryService } from "#/modules/category/service";
import {
  createCategorySchema,
  updateCategorySchema,
} from "#/modules/category/schema";
import { sendSuccess } from "#/shared/response";

export class CategoryController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createCategorySchema.parse(req.body);
      const category = await categoryService.create(input);
      sendSuccess(res, category, 201, "Category created");
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, category, 200, "Category updated");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await categoryService.delete(req.params["id"] as string);
      sendSuccess(res, null, 200, "Category deleted");
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query["includeInactive"] === "true";
      const categories = await categoryService.list(includeInactive);
      sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.getById(
        req.params["id"] as string,
      );
      sendSuccess(res, category, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const categoryController = new CategoryController();
