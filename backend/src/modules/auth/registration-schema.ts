import { z } from "zod";

// ──────────────────────────────────
// Learner Registration
// ──────────────────────────────────

export const learnerRegistrationSchema = z.object({
  // Account details
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

  // Guardian details (required if account holder is under 13)
  guardianName: z.string().max(200).optional(),
  guardianEmail: z.string().email().max(255).optional(),

  // Learner profile details
  learnerDisplayName: z
    .string()
    .min(1, "Learner display name is required")
    .max(100),
  learnerDateOfBirth: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid learner date of birth"),
  learnerAvatarUrl: z.string().url().optional(),
  learnerPin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
    .optional(),
});

export type LearnerRegistrationInput = z.infer<
  typeof learnerRegistrationSchema
>;

// ──────────────────────────────────
// Instructor Registration
// ──────────────────────────────────

export const instructorRegistrationSchema = z.object({
  // Account details
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

  // Instructor profile details
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000),
  areaOfExpertise: z.string().min(2, "Area of expertise is required").max(500),
  cvUrl: z.string().url("CV must be a valid URL"),
  wwccNumber: z.string().min(1, "WWCC number is required").max(50),
  wwccState: z.string().min(1, "Issuing state is required").max(50),
  wwccExpiry: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid WWCC expiry date"),
});

export type InstructorRegistrationInput = z.infer<
  typeof instructorRegistrationSchema
>;
