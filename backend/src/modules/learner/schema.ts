import { z } from "zod";

export const createLearnerSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  dateOfBirth: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid date of birth"),
  avatarUrl: z.string().url().optional(),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
    .optional(),
  chatEnabled: z.boolean().optional().default(false),
});

export type CreateLearnerInput = z.infer<typeof createLearnerSchema>;

export const updateLearnerSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
    .optional(),
  chatEnabled: z.boolean().optional(),
});

export type UpdateLearnerInput = z.infer<typeof updateLearnerSchema>;
