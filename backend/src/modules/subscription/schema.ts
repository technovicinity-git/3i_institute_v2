import { z } from "zod";

// ─── Admin payment settings (bank / mobile banking accounts) ───

export const paymentAccountSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(["BANK", "MOBILE_BANKING", "OTHER"]).default("BANK"),
  /** e.g. "Dutch-Bangla Bank" or "bKash (Personal)" */
  label: z.string().trim().min(1, "Name is required").max(100),
  accountName: z.string().trim().max(150).default(""),
  accountNumber: z.string().trim().min(1, "Account number is required").max(100),
  /** Branch, routing / SWIFT code, or other instructions */
  details: z.string().trim().max(1000).default(""),
});

export type PaymentAccount = z.infer<typeof paymentAccountSchema>;

export const paymentSettingsSchema = z.object({
  monthlyPrice: z.coerce.number().min(0).max(1_000_000).default(9.99),
  currency: z.string().trim().min(1).max(10).default("USD"),
  instructions: z.string().trim().max(2000).default(""),
  accounts: z.array(paymentAccountSchema).max(20).default([]),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

// ─── Learner: apply for a subscription ───

export const createSubscriptionRequestSchema = z.object({
  learnerProfileId: z.string().uuid("Invalid learner profile ID"),
  /** Label of the admin account paid into, or "Other" */
  paymentMethod: z.string().trim().min(1, "Payment method is required").max(100),
  amount: z.coerce.number().positive("Amount must be more than 0").max(1_000_000),
  transactionId: z
    .string()
    .trim()
    .min(3, "Transaction ID is required")
    .max(100),
  senderAccount: z.string().trim().max(100).optional(),
  paidAt: z.coerce
    .date()
    .refine((date) => date.getTime() <= Date.now() + 24 * 60 * 60 * 1000, {
      message: "Payment date can't be in the future",
    }),
  note: z.string().trim().max(1000).optional(),
  proofImageUrl: z.string().url().max(1000).optional(),
});

export type CreateSubscriptionRequestInput = z.infer<
  typeof createSubscriptionRequestSchema
>;

// ─── Admin: review ───

export const rejectSubscriptionRequestSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required").max(1000),
});
