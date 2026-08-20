import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
