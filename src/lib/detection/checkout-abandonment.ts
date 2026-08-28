export interface CheckoutAbandonmentClassification {
  dropoffStage: "PAYMENT_METHOD" | "SHIPPING" | "OTP_VERIFICATION" | "DISCOUNT_ERROR" | "CART_REVIEW";
  intentLevel: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";
  incentiveEligible: boolean;
  recommendedIncentivePct: number;
  riskScore: number;
}

export function classifyCheckoutAbandonment(
  payload: Record<string, unknown>,
  amount: number
): CheckoutAbandonmentClassification {
  const step = String(payload.dropoffStep || "").toLowerCase();
  const sessionSec = Number(payload.sessionDurationSeconds || 0);

  let dropoffStage: CheckoutAbandonmentClassification["dropoffStage"] = "CART_REVIEW";
  if (step.includes("payment")) dropoffStage = "PAYMENT_METHOD";
  else if (step.includes("shipping")) dropoffStage = "SHIPPING";
  else if (step.includes("otp")) dropoffStage = "OTP_VERIFICATION";
  else if (step.includes("discount")) dropoffStage = "DISCOUNT_ERROR";

  const intentLevel =
    sessionSec > 150 || dropoffStage === "OTP_VERIFICATION" || dropoffStage === "PAYMENT_METHOD"
      ? "VERY_HIGH"
      : sessionSec > 60
      ? "HIGH"
      : "MEDIUM";

  const incentiveEligible =
    dropoffStage === "SHIPPING" || dropoffStage === "DISCOUNT_ERROR" || (amount > 100 && payload.appliedDiscount === null);

  const recommendedIncentivePct = incentiveEligible ? (amount > 500 ? 15 : 10) : 0;
  const riskScore = dropoffStage === "DISCOUNT_ERROR" ? 0.60 : dropoffStage === "SHIPPING" ? 0.50 : 0.35;

  return {
    dropoffStage,
    intentLevel,
    incentiveEligible,
    recommendedIncentivePct,
    riskScore,
  };
}
