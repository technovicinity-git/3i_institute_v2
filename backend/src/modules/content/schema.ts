import { z } from "zod";

export const pageSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(
    /^[a-z0-9-]+$/,
    "Slug must contain only lowercase letters, numbers, and hyphens",
  );

export const upsertPageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  body: z.string().max(100_000).default(""),
  published: z.boolean().default(false),
});
export type UpsertPageInput = z.infer<typeof upsertPageSchema>;

export const faqItemSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(5_000),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
});
export type FaqItemInput = z.infer<typeof faqItemSchema>;

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Must be a full URL starting with http(s)://")
  .default("");

export const siteSettingsSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Invalid email")
    .default(""),
  contactPhone: z.string().trim().max(50).default(""),
  address: z.string().trim().max(300).default(""),
  supportHours: z.string().trim().max(150).default(""),
  social: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      youtube: optionalUrl,
      x: optionalUrl,
      linkedin: optionalUrl,
      whatsapp: optionalUrl,
    })
    .default({
      facebook: "",
      instagram: "",
      youtube: "",
      x: "",
      linkedin: "",
      whatsapp: "",
    }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
