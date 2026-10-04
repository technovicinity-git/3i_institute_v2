import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
  bio: z.string().max(1000).nullable().optional(),
  billingContactName: z.string().max(200).optional(),
  billingContactEmail: z.string().email().max(255).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Invalid email address")
    .max(255)
    .toLowerCase()
    .trim(),
  currentPassword: z.string().min(1, "Current password is required"),
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
