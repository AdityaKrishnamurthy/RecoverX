import prisma from "@/lib/prisma";

export interface RetryPaymentResult {
  success: boolean;
  capturedAmount: number;
  transactionId: string;
  gatewayMessage: string;
  simulated: true;
}

export async function executeRetryPayment(interventionId: string): Promise<RetryPaymentResult> {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: { case: true },
  });

  if (!intervention) {
    throw new Error(`Intervention ${interventionId} not found`);
  }

  const caseItem = intervention.case;
  const diag = (caseItem.diagnosis || "").toLowerCase();

  // Weighted probability based on root cause
  let successProbability = 0.65;
  if (diag.includes("network") || diag.includes("timeout")) {
    successProbability = 0.92;
  } else if (diag.includes("velocity")) {
    successProbability = 0.80;
  } else if (diag.includes("insufficient")) {
    successProbability = 0.60;
  } else if (diag.includes("expired")) {
    successProbability = 0.05;
  }

  const isSuccess = Math.random() < successProbability;
  const authCode = `auth_sim_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const outcomeMessage = isSuccess
    ? `[SIMULATED] Gateway auto-retry succeeded via ${intervention.channel || "Payment Gateway"}. Auth Code: ${authCode}. Amount captured: ${caseItem.currency} ${caseItem.amount}.`
    : `[SIMULATED] Gateway auto-retry failed: 51_insufficient_funds (soft decline). Backoff schedule updated.`;

  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      status: isSuccess ? "EXECUTED" : "FAILED",
      executedAt: new Date(),
      outcome: outcomeMessage,
    },
  });

  if (isSuccess) {
    await prisma.case.update({
      where: { id: caseItem.id },
      data: {
        status: "RECOVERED",
        recoveredAmount: caseItem.amount,
        recoveredAt: new Date(),
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "REVENUE_RECOVERED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "RETRY_PAYMENT",
          recoveredAmount: caseItem.amount,
          currency: caseItem.currency,
          authCode,
          message: outcomeMessage,
        }),
      },
    });
  } else {
    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "INTERVENTION_ATTEMPT_FAILED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "RETRY_PAYMENT",
          message: outcomeMessage,
        }),
      },
    });
  }

  return {
    success: isSuccess,
    capturedAmount: isSuccess ? caseItem.amount : 0,
    transactionId: authCode,
    gatewayMessage: outcomeMessage,
    simulated: true,
  };
}
