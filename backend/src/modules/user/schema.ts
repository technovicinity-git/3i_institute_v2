import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
  bio: z.string().max(1000).nullable().optional(),
  // IANA timezone (e.g. "Asia/Dhaka"), used to show dates in notifications.
  timezone: z
    .string()
    .max(64)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Invalid timezone")
    .optional(),
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
