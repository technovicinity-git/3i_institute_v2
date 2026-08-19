import { z } from "zod";

// ──────────────────────────────────────
// Registration
// ──────────────────────────────────────

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
  dateOfBirth: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid date of birth"),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]).default("en"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ──────────────────────────────────────
// Login
// ──────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ──────────────────────────────────────
// Email verification
// ──────────────────────────────────────

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// ──────────────────────────────────────
// Forgot password
// ──────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ──────────────────────────────────────
// Reset password
// ──────────────────────────────────────

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ──────────────────────────────────────
// Change password
// ──────────────────────────────────────

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ──────────────────────────────────────
// Refresh token
// ──────────────────────────────────────

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
