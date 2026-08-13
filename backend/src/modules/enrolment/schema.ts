import { z } from "zod";

export const enrolSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  courseId: z.string().uuid("Invalid course ID"),
  batchId: z.string().uuid("Invalid batch ID").optional(),
  ageOverride: z.boolean().optional().default(false),
});

export type EnrolInput = z.infer<typeof enrolSchema>;

export const listEnrolmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  learnerProfileId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
});

export type ListEnrolmentsQuery = z.infer<typeof listEnrolmentsQuerySchema>;
