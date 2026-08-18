import { z } from "zod";

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  dateOfBirth: z.string().optional(), // Required on first login if new user
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

export const appleLoginSchema = z.object({
  identityToken: z.string().min(1, "Apple identity token is required"),
  authorizationCode: z.string().optional(),
  firstName: z.string().max(100).optional(), // Apple only sends name on first login
  lastName: z.string().max(100).optional(),
  dateOfBirth: z.string().optional(),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
});

export type AppleLoginInput = z.infer<typeof appleLoginSchema>;
