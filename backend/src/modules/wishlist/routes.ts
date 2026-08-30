import { Router } from "express";
import { wishlistController } from "#/modules/wishlist/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
} from "#/modules/wishlist/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get learner's wishlist
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Wishlist items
 *   post:
 *     tags: [Wishlist]
 *     summary: Add course to wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Added to wishlist
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove course from wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Removed from wishlist
 */
router.get("/", authenticate, wishlistController.getWishlist);
router.post(
  "/",
  authenticate,
  validate(addToWishlistSchema),
  wishlistController.addToWishlist,
);
router.delete(
  "/",
  authenticate,
  validate(removeFromWishlistSchema),
  wishlistController.removeFromWishlist,
);

export { router as wishlistRoutes };
