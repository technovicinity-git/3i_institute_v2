import { z } from "zod";

export const createMaterialSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["video", "document", "audio", "link"]),
  url: z.string().url().optional(),
  order: z.coerce.number().int().min(0).default(0),
  duration: z.number().int().min(0).optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

export const updateMaterialSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  order: z.number().int().min(0).optional(),
});

export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;

export const uploadVideoSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(255),
  order: z.coerce.number().int().min(0).default(0),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;
