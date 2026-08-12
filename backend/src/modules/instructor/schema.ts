import { z } from "zod";

export const instructorApplicationSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000),
  areaOfExpertise: z.string().min(2, "Area of expertise is required").max(500),
  cvUrl: z.string().url("CV must be a valid URL"),
  wwccNumber: z.string().min(1, "WWCC number is required").max(50),
  wwccState: z.string().min(1, "Issuing state is required").max(50),
  wwccExpiry: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Invalid expiry date"),
});

export type InstructorApplicationInput = z.infer<
  typeof instructorApplicationSchema
>;

export const adminReviewSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(1000).optional(),
});

export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
