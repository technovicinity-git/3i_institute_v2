import { z } from "zod";

export const addToWishlistSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  courseId: z.string().uuid("Invalid course ID"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

export const removeFromWishlistSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  courseId: z.string().uuid("Invalid course ID"),
});

export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;
