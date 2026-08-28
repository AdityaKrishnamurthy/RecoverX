export interface SubscriptionFailureClassification {
  reasonCategory: "CARD_EXPIRED" | "INSUFFICIENT_FUNDS" | "MANDATE_REVOKED" | "ISSUER_DECLINED" | "UNKNOWN";
  dunningStage: "INITIAL_GRACE" | "DUNNING_ATTEMPT_2" | "PRE_CANCELLATION";
  actionRequired: "REQUEST_CARD_UPDATE" | "RETRY_PAYMENT" | "REAUTHORIZE_MANDATE";
  riskScore: number;
}

export function classifySubscriptionFailure(payload: Record<string, unknown>): SubscriptionFailureClassification {
  const reason = String(payload.failureReason || "").toLowerCase();
  const failedCycles = Number(payload.consecutiveFailedCycles || 1);

  let reasonCategory: SubscriptionFailureClassification["reasonCategory"] = "ISSUER_DECLINED";
  let actionRequired: SubscriptionFailureClassification["actionRequired"] = "RETRY_PAYMENT";
  let risk = 0.40;

  if (reason.includes("expired")) {
    reasonCategory = "CARD_EXPIRED";
    actionRequired = "REQUEST_CARD_UPDATE";
    risk = 0.65;
  } else if (reason.includes("mandate")) {
    reasonCategory = "MANDATE_REVOKED";
    actionRequired = "REAUTHORIZE_MANDATE";
    risk = 0.75;
  } else if (reason.includes("insufficient") || reason.includes("funds")) {
    reasonCategory = "INSUFFICIENT_FUNDS";
    actionRequired = "RETRY_PAYMENT";
    risk = 0.50;
  }

  const dunningStage =
    failedCycles >= 3 ? "PRE_CANCELLATION" : failedCycles === 2 ? "DUNNING_ATTEMPT_2" : "INITIAL_GRACE";

  return {
    reasonCategory,
    dunningStage,
    actionRequired,
    riskScore: risk + (failedCycles > 1 ? 0.15 : 0),
  };
}
