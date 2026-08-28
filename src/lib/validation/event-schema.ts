import { z } from "zod";

export const IngestionEventSchema = z.object({
  eventType: z.enum([
    "PAYMENT_FAILED",
    "CHECKOUT_ABANDONED",
    "SUBSCRIPTION_CHARGE_FAILED",
    "INVOICE_OVERDUE",
  ]),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().default("USD"),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid customer email is required"),
    phone: z.string().optional(),
    segment: z.enum(["ENTERPRISE", "SMB", "VIP", "STANDARD"]).default("STANDARD"),
  }),
  payload: z.record(z.string(), z.any()),
});

export type IngestionEventInput = z.infer<typeof IngestionEventSchema>;
