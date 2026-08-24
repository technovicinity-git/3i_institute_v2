import { z } from "zod";

export const uploadImageSchema = z.object({
  folder: z
    .enum([
      "instructors",
      "profiles",
      "courses",
      "thumbnails",
      "materials",
      "general",
    ])
    .optional()
    .default("general"),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
