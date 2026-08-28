import prisma from "@/lib/prisma";
import { runCaseDiagnosis, CaseDiagnosisContext } from "./diagnose";
import { preclassifyCase } from "@/lib/detection";

export async function diagnoseCaseById(caseId: string) {
  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      customer: true,
      events: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  if (!caseItem) {
    throw new Error(`Case with id ${caseId} not found`);
  }

  const rawEvent = caseItem.events[0];
  let rawPayload: Record<string, unknown> = {};
  try {
    rawPayload = rawEvent ? JSON.parse(rawEvent.payload) : {};
  } catch {
    rawPayload = {};
  }

  const preClass = preclassifyCase(caseItem.type, rawPayload, caseItem.amount);

  const context: CaseDiagnosisContext = {
    caseId: caseItem.id,
    type: caseItem.type,
    amount: caseItem.amount,
    currency: caseItem.currency,
    customerName: caseItem.customer.name,
    customerEmail: caseItem.customer.email,
    customerSegment: caseItem.customer.segment,
    rawEventPayload: {
      ...rawPayload,
      preclassification: preClass,
    },
  };

  const diagResult = await runCaseDiagnosis(context);
  const diag = diagResult.result;

  const updatedCase = await prisma.case.update({
    where: { id: caseItem.id },
    data: {
      diagnosis: diag.rootCause,
      diagnosisConfidence: diag.confidence,
      status: "DIAGNOSING",
      riskScore: (preClass as { riskScore?: number }).riskScore ?? caseItem.riskScore,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      caseId: caseItem.id,
      actor: "AGENT",
      action: "DIAGNOSIS_COMPLETED",
      detail: JSON.stringify({
        provider: diagResult.provider,
        modelName: diagResult.modelName,
        latencyMs: diagResult.latencyMs,
        rootCause: diag.rootCause,
        confidence: diag.confidence,
        recommendedAction: diag.recommendedAction,
        suggestedDelaySeconds: diag.suggestedDelaySeconds,
        reasoning: diag.reasoning,
        customerOutreachMessage: diag.customerOutreachMessage,
        preclassification: preClass,
        attempts: diagResult.attempts,
      }),
    },
  });

  return {
    case: updatedCase,
    diagnosis: diag,
    provider: diagResult.provider,
    modelName: diagResult.modelName,
  };
}

export async function diagnoseAllPendingCases() {
  const pendingCases = await prisma.case.findMany({
    where: {
      OR: [
        { status: "DETECTED" },
        { diagnosis: null },
      ],
    },
    select: { id: true },
  });

  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < pendingCases.length; i += batchSize) {
    const batch = pendingCases.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((c) => diagnoseCaseById(c.id))
    );
    results.push(...batchResults);
  }

  return {
    count: results.length,
    results,
  };
}
