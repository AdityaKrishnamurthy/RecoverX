export interface PaymentFailureClassification {
  category: "ISSUER_DECLINE" | "INSUFFICIENT_FUNDS" | "NETWORK_TIMEOUT" | "EXPIRED_CARD" | "VELOCITY_LIMIT" | "UNKNOWN";
  retryable: boolean;
  transient: boolean;
  recommendedBackoffSeconds: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskScore: number;
}

export function classifyPaymentFailure(payload: Record<string, unknown>): PaymentFailureClassification {
  const code = String(payload.errorCode || "").toLowerCase();
  const message = String(payload.errorMessage || "").toLowerCase();

  if (code.includes("network") || code.includes("timeout") || message.includes("timeout") || message.includes("gateway")) {
    return {
      category: "NETWORK_TIMEOUT",
      retryable: true,
      transient: true,
      recommendedBackoffSeconds: 300,
      severity: "LOW",
      riskScore: 0.25,
    };
  }

  if (code.includes("expired") || message.includes("expired")) {
    return {
      category: "EXPIRED_CARD",
      retryable: false,
      transient: false,
      recommendedBackoffSeconds: 0,
      severity: "HIGH",
      riskScore: 0.70,
    };
  }

  if (code.includes("insufficient") || message.includes("insufficient") || message.includes("funds")) {
    return {
      category: "INSUFFICIENT_FUNDS",
      retryable: true,
      transient: true,
      recommendedBackoffSeconds: 43200, // 12h
      severity: "MEDIUM",
      riskScore: 0.65,
    };
  }

  if (code.includes("velocity") || message.includes("frequency") || message.includes("limit")) {
    return {
      category: "VELOCITY_LIMIT",
      retryable: true,
      transient: true,
      recommendedBackoffSeconds: 14400, // 4h
      severity: "MEDIUM",
      riskScore: 0.55,
    };
  }

  return {
    category: "ISSUER_DECLINE",
    retryable: true,
    transient: false,
    recommendedBackoffSeconds: 21600, // 6h
    severity: "MEDIUM",
    riskScore: 0.50,
  };
}
