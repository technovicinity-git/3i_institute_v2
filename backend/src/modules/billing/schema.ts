import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  seats: z.number().int().min(1).max(6).default(1),
  plan: z.enum(["monthly", "annual"]),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

export const waiverRequestSchema = z.object({
  explanation: z
    .string()
    .min(20, "Explanation must be at least 20 characters")
    .max(3000),
  evidenceFiles: z.array(z.string().url()).optional().default([]),
});

export type WaiverRequestInput = z.infer<typeof waiverRequestSchema>;

export const waiverDecisionSchema = z.object({
  approved: z.boolean(),
  tier: z.number().int().min(25).max(100).optional(),
  reason: z.string().max(1000).optional(),
});

export type WaiverDecisionInput = z.infer<typeof waiverDecisionSchema>;
