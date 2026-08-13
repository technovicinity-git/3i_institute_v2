import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(1000),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z.string().url("Thumbnail must be a valid URL").optional(),
  category: z.string().min(1, "Category is required").max(100),
  type: z.enum(["REGULAR", "ONLINE_CLASS", "MIXED"]),
  level: z.string().min(1, "Level is required").max(50),
  language: z.enum(["en", "bn", "hi", "ur", "ar"]).default("en"),
  minimumAge: z.number().int().min(5).max(18),
  maximumAge: z.number().int().min(5).max(100).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  summary: z.string().min(10).max(1000).optional(),
  description: z.string().min(10).optional(),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().min(1).max(100).optional(),
  type: z.enum(["REGULAR", "ONLINE_CLASS", "MIXED"]).optional(),
  level: z.string().min(1).max(50).optional(),
  language: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
  minimumAge: z.number().int().min(5).max(18).optional(),
  maximumAge: z.number().int().min(5).max(100).optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  type: z.enum(["REGULAR", "ONLINE_CLASS", "MIXED"]).optional(),
  level: z.string().optional(),
  language: z.enum(["en", "bn", "hi", "ur", "ar"]).optional(),
  minimumAge: z.coerce.number().int().optional(),
  search: z.string().max(255).optional(),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
