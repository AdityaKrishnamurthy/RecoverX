export interface ReceivableAgingClassification {
  agingBucket: "CURRENT_0_30" | "AGING_31_60" | "DELINQUENT_61_90" | "CRITICAL_90_PLUS";
  daysOverdue: number;
  collectionStrategy: "POLITE_STATEMENT" | "PROMISE_TO_PAY_CAPTURE" | "EXECUTIVE_ESCALATION" | "LEGAL_HOLD";
  riskScore: number;
}

export function classifyReceivableAging(
  payload: Record<string, unknown>,
  amount: number
): ReceivableAgingClassification {
  const days = Number(payload.daysOverdue || 0);

  if (days >= 90) {
    return {
      agingBucket: "CRITICAL_90_PLUS",
      daysOverdue: days,
      collectionStrategy: "LEGAL_HOLD",
      riskScore: 0.95,
    };
  }

  if (days >= 60 || amount > 15000) {
    return {
      agingBucket: "DELINQUENT_61_90",
      daysOverdue: days,
      collectionStrategy: "EXECUTIVE_ESCALATION",
      riskScore: 0.80,
    };
  }

  if (days >= 30) {
    return {
      agingBucket: "AGING_31_60",
      daysOverdue: days,
      collectionStrategy: "PROMISE_TO_PAY_CAPTURE",
      riskScore: 0.55,
    };
  }

  return {
    agingBucket: "CURRENT_0_30",
    daysOverdue: days,
    collectionStrategy: "POLITE_STATEMENT",
    riskScore: 0.30,
  };
}
