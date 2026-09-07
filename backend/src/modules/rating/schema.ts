import { z } from "zod";

export const createRatingSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
  learnerProfileId: z.string().uuid("Invalid learner profile ID").optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
