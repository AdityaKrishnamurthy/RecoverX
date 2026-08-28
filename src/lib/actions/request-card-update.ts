import prisma from "@/lib/prisma";

export async function executeRequestCardUpdate(interventionId: string) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: { case: { include: { customer: true } } },
  });

  if (!intervention) throw new Error(`Intervention ${interventionId} not found`);

  const caseItem = intervention.case;
  const isCustomerUpdated = Math.random() < 0.75; // 75% of customers update their card
  const portalToken = `upd_tok_${Math.random().toString(36).substring(2, 10)}`;

  const outcomeMessage = isCustomerUpdated
    ? `[SIMULATED] Customer ${caseItem.customer.name} updated card details via secure portal (${portalToken}). Subscription / payment method refreshed and charged ${caseItem.currency} ${caseItem.amount}.`
    : `[SIMULATED] Card update link dispatched to ${caseItem.customer.email}. Awaiting customer submission.`;

  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      status: "EXECUTED",
      executedAt: new Date(),
      outcome: outcomeMessage,
    },
  });

  if (isCustomerUpdated) {
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
          interventionType: "REQUEST_CARD_UPDATE",
          recoveredAmount: caseItem.amount,
          currency: caseItem.currency,
          message: outcomeMessage,
        }),
      },
    });
  } else {
    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "AGENT",
        action: "CARD_UPDATE_REQUESTED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "REQUEST_CARD_UPDATE",
          recipient: caseItem.customer.email,
          portalToken,
          message: outcomeMessage,
        }),
      },
    });
  }

  return {
    success: isCustomerUpdated,
    portalToken,
    outcome: outcomeMessage,
    simulated: true,
  };
}
