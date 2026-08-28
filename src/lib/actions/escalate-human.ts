import prisma from "@/lib/prisma";

export async function executeEscalateHuman(interventionId: string) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: { case: { include: { customer: true, promiseToPay: true } } },
  });

  if (!intervention) throw new Error(`Intervention ${interventionId} not found`);

  const caseItem = intervention.case;
  const ticketId = `TICK-OPS-${Math.floor(1000 + Math.random() * 9000)}`;

  const outcomeMessage = `[SIMULATED] Case escalated to FinOps Senior Account Management. Ticket ${ticketId} assigned. High-exposure receivable (${caseItem.currency} ${caseItem.amount}) requiring manual debt-resolution protocol.`;

  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      status: "EXECUTED",
      executedAt: new Date(),
      outcome: outcomeMessage,
    },
  });

  await prisma.case.update({
    where: { id: caseItem.id },
    data: {
      status: "ESCALATED",
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      caseId: caseItem.id,
      actor: "AGENT",
      action: "HUMAN_ESCALATION_DISPATCHED",
      detail: JSON.stringify({
        simulated: true,
        interventionType: "ESCALATE_HUMAN",
        ticketId,
        assignedQueue: "FinOps High Exposure Tier 1",
        accountManagerContact: "ops-lead@merchant.io",
        reason: caseItem.diagnosis,
        riskScore: caseItem.riskScore,
        amount: caseItem.amount,
        currency: caseItem.currency,
      }),
    },
  });

  return {
    success: true,
    ticketId,
    status: "ESCALATED",
    outcome: outcomeMessage,
    simulated: true,
  };
}
