import { z } from "zod";

export const assignSeatSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
});

export type AssignSeatInput = z.infer<typeof assignSeatSchema>;

export const cancelSeatSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
});

export type CancelSeatInput = z.infer<typeof cancelSeatSchema>;
