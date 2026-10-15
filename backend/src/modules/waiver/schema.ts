import { z } from "zod";

export const WAIVER_TIERS = [25, 50, 75, 100] as const;

export const createWaiverSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  explanation: z
    .string()
    .trim()
    .min(20, "Please explain your situation in at least 20 characters")
    .max(3000),
  evidenceFiles: z.array(z.string().url().max(1000)).max(3).optional().default([]),
});

export type CreateWaiverInput = z.infer<typeof createWaiverSchema>;

export const approveWaiverSchema = z.object({
  tier: z.coerce
    .number()
    .int()
    .refine((tier) => (WAIVER_TIERS as readonly number[]).includes(tier), {
      message: "Discount must be 25, 50, 75 or 100%",
    }),
});

export const reasonSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required").max(1000),
});
