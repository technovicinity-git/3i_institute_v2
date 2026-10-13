import { z } from "zod";

// Either the account's email, or the token from an expired verification
// link (so the user can get a new link without typing their email).
export const resendVerificationSchema = z.union([
  z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
  }),
  z.object({
    token: z.string().min(1, "Token is required"),
  }),
]);

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
