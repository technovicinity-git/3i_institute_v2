import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  seats: z.number().int().min(1).max(6).default(1),
  plan: z.enum(["monthly", "annual"]),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;
