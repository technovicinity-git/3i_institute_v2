import { z } from "zod";

export const updateProgressSchema = z.object({
  materialId: z.string().uuid("Invalid material ID"),
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  watchedSeconds: z.number().int().min(0).optional(),
  lastPosition: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

export const getProgressQuerySchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  courseId: z.string().uuid("Invalid course ID").optional(),
});

export type GetProgressQuery = z.infer<typeof getProgressQuerySchema>;
