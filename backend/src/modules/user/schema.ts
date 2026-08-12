import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
  billingContactName: z.string().max(200).optional(),
  billingContactEmail: z.string().email().max(255).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
