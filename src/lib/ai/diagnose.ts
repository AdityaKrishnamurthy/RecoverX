import { generateObject } from "ai";
import { z } from "zod";
import { executeWithFallback, LLMProviderName, ExecutionResult } from "./provider";

export const DiagnosisOutputSchema = z.object({
  rootCause: z.string().describe("Clear, concise root cause explanation for the failure or drop-off"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0"),
  recommendedAction: z.enum([
    "RETRY_PAYMENT",
    "SEND_REMINDER",
    "OFFER_INCENTIVE",
    "REQUEST_CARD_UPDATE",
    "ESCALATE_HUMAN",
  ]).describe("Best recovery intervention from the allowed action menu"),
  suggestedDelaySeconds: z.number().describe("Recommended delay in seconds before executing the intervention"),
  reasoning: z.string().describe("Forensic justification for the chosen action"),
  // Nullable rather than optional: some providers (e.g. Groq) enforce strict
  // JSON schemas where every property in `properties` must also appear in
  // `required`, which rejects `.optional()` fields outright.
  customerOutreachMessage: z.string().nullable().describe("Polished, context-aware notification copy if contacting the customer, or null if not applicable"),
});

export type DiagnosisOutput = z.infer<typeof DiagnosisOutputSchema>;

export interface CaseDiagnosisContext {
  caseId: string;
  type: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerSegment: string;
  rawEventPayload: Record<string, unknown>;
}

export function generateDeterministicDiagnosis(context: CaseDiagnosisContext): DiagnosisOutput {
  const payload = context.rawEventPayload;
  const type = context.type;

  if (type === "PAYMENT_RETRY") {
    const err = String(payload.errorCode || "").toLowerCase();
    if (err.includes("network") || err.includes("timeout")) {
      return {
        rootCause: "Acquirer network timeout during 3D-Secure authentication handshake.",
        confidence: 0.94,
        recommendedAction: "RETRY_PAYMENT",
        suggestedDelaySeconds: 300,
        reasoning: "Transient gateway degradation has cleared; smart immediate retry has a >88% probability of capture.",
        customerOutreachMessage: null,
      };
    }
    if (err.includes("expired")) {
      return {
        rootCause: "Payment method card expiration date elapsed.",
        confidence: 0.98,
        recommendedAction: "REQUEST_CARD_UPDATE",
        suggestedDelaySeconds: 0,
        reasoning: "Card expired at issuer; retrying will trigger repeated hard decline. Card update required.",
        customerOutreachMessage: `Hi ${context.customerName}, your card ending in ${payload.cardLast4 || "XXXX"} expired. Update your card to keep your services active.`,
      };
    }
    if (err.includes("insufficient")) {
      return {
        rootCause: "Temporary cardholder account balance shortfall.",
        confidence: 0.89,
        recommendedAction: "RETRY_PAYMENT",
        suggestedDelaySeconds: 43200, // 12 hours
        reasoning: "Soft decline; scheduled retry timed after business banking settlement window maximizes recovery.",
        customerOutreachMessage: null,
      };
    }
    return {
      rootCause: "Issuer risk velocity rule triggered on payment attempt.",
      confidence: 0.82,
      recommendedAction: "RETRY_PAYMENT",
      suggestedDelaySeconds: 14400, // 4 hours
      reasoning: "Issuer security velocity cool-down required before secondary retry attempt.",
      customerOutreachMessage: null,
    };
  }

  if (type === "CHECKOUT_ABANDONMENT") {
    const step = String(payload.dropoffStep || "").toLowerCase();
    if (step.includes("shipping") || step.includes("discount") || (payload.appliedDiscount === null && context.amount > 100)) {
      return {
        rootCause: "Price sensitivity and checkout friction at final order summary.",
        confidence: 0.88,
        recommendedAction: "OFFER_INCENTIVE",
        suggestedDelaySeconds: 1800, // 30 mins
        reasoning: "Customer abandoned high-intent cart due to cost barrier. Targeted 10% incentive clears drop-off friction.",
        customerOutreachMessage: `Hi ${context.customerName}, we saved your cart! Use code RECOVER10 to enjoy 10% off your order before it expires.`,
      };
    }
    return {
      rootCause: "Payment method selection abandonment or temporary browser interruption.",
      confidence: 0.85,
      recommendedAction: "SEND_REMINDER",
      suggestedDelaySeconds: 900, // 15 mins
      reasoning: "High-intent session drop; a timely 1-click cart resumption reminder recovers >40% of orders.",
      customerOutreachMessage: `Hi ${context.customerName}, complete your checkout in one click here: https://store.example.com/checkout?resume=${payload.cartId || "123"}`,
    };
  }

  if (type === "SUBSCRIPTION_FAILURE") {
    const reason = String(payload.failureReason || "").toLowerCase();
    if (reason.includes("expired")) {
      return {
        rootCause: "Recurring billing payment instrument expired.",
        confidence: 0.96,
        recommendedAction: "REQUEST_CARD_UPDATE",
        suggestedDelaySeconds: 0,
        reasoning: "Subscription billing cannot process on expired credentials. Customer update link dispatched.",
        customerOutreachMessage: `Hi ${context.customerName}, your subscription payment for ${payload.planName || "Pro"} failed due to an expired card. Update your details here to prevent service interruption.`,
      };
    }
    if (reason.includes("mandate")) {
      return {
        rootCause: "Recurring e-mandate auto-debit authorization revoked or unlinked.",
        confidence: 0.91,
        recommendedAction: "SEND_REMINDER",
        suggestedDelaySeconds: 3600,
        reasoning: "Auto-debit mandate expired; customer action required to re-authorize mandate.",
        customerOutreachMessage: `Hi ${context.customerName}, please re-authenticate your auto-debit mandate for ${payload.planName || "Subscription"} to continue uninterrupted access.`,
      };
    }
    return {
      rootCause: "Subscription billing cycle debit soft decline (insufficient funds / daily limit).",
      confidence: 0.87,
      recommendedAction: "RETRY_PAYMENT",
      suggestedDelaySeconds: 86400, // 24 hours
      reasoning: "Standard subscription dunning retry schedule applied (attempt 2 of 3).",
      customerOutreachMessage: null,
    };
  }

  // RECEIVABLE_OVERDUE
  const days = Number(payload.daysOverdue || 0);
  if (days >= 60 || context.amount >= 10000) {
    return {
      rootCause: `Severe B2B receivables delinquency (${days} days overdue, high exposure).`,
      confidence: 0.93,
      recommendedAction: "ESCALATE_HUMAN",
      suggestedDelaySeconds: 0,
      reasoning: `Receivable exceeds compliance aging threshold (${days} days). Account manager direct escalation triggered.`,
      customerOutreachMessage: `URGENT: Invoice ${payload.invoiceNumber} for ${context.currency} ${context.amount} is ${days} days overdue. An account manager has been assigned to assist with reconciliation.`,
    };
  }

  return {
    rootCause: `Standard accounts payable cycle delay (${days} days overdue).`,
    confidence: 0.90,
    recommendedAction: "SEND_REMINDER",
    suggestedDelaySeconds: 86400,
    reasoning: "Compliant polite statement reminder with Promise-to-Pay tracking link dispatched to accounts payable contact.",
    customerOutreachMessage: `Statement Reminder: Invoice ${payload.invoiceNumber} (${context.currency} ${context.amount}) was due on ${payload.dueDate ? String(payload.dueDate).slice(0, 10) : "last month"}. Please confirm payment schedule.`,
  };
}

export async function runCaseDiagnosis(
  context: CaseDiagnosisContext,
  preferredProviderOrder?: LLMProviderName[]
): Promise<ExecutionResult<DiagnosisOutput>> {
  const systemPrompt = `You are an elite Autonomous Revenue Recovery Agent for FinOps.
Your role: Diagnose payment failures, checkout abandonments, failed subscriptions, and overdue receivables, then decide the optimal bounded intervention.

Strict Rules:
1. Always choose interventions ONLY from: RETRY_PAYMENT, SEND_REMINDER, OFFER_INCENTIVE, REQUEST_CARD_UPDATE, ESCALATE_HUMAN.
2. For transient network errors, recommend RETRY_PAYMENT with 300s to 3600s delay.
3. For expired cards or revoked mandates, recommend REQUEST_CARD_UPDATE or SEND_REMINDER.
4. For checkout drop-offs on price friction, recommend OFFER_INCENTIVE (e.g. 5-10% discount code).
5. For high-value enterprise invoices 60+ days overdue, recommend SEND_REMINDER or ESCALATE_HUMAN if high risk.
6. Provide honest, forensic reasoning that will be saved in an immutable audit trail.`;

  const userPrompt = `Analyze this revenue recovery case:
- Case ID: ${context.caseId}
- Workflow Type: ${context.type}
- Amount: ${context.currency} ${context.amount}
- Customer: ${context.customerName} (${context.customerSegment}) <${context.customerEmail}>
- Signal Payload:
${JSON.stringify(context.rawEventPayload, null, 2)}

Provide a structured diagnostic decision.`;

  return await executeWithFallback<DiagnosisOutput>(
    async (model) => {
      const response = await generateObject({
        model,
        schema: DiagnosisOutputSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return response.object;
    },
    () => generateDeterministicDiagnosis(context),
    preferredProviderOrder
  );
}
