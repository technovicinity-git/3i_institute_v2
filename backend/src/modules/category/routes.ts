import { Router } from "express";
import { categoryController } from "#/modules/category/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     security: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", categoryController.list);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category details
 */
router.get("/:id", categoryController.getById);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               icon: { type: string }
 *               order: { type: integer }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  "/",
  authenticate,
  authorize("admin.access"),
  categoryController.create,
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update category (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin.access"),
  categoryController.update,
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin.access"),
  categoryController.delete,
);

export { router as categoryRoutes };
