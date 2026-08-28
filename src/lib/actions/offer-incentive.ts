import prisma from "@/lib/prisma";

export async function executeOfferIncentive(interventionId: string) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: { case: { include: { customer: true } } },
  });

  if (!intervention) throw new Error(`Intervention ${interventionId} not found`);

  const caseItem = intervention.case;
  const promoCode = "RECOVER10";
  const discountPct = 10;
  const discountedAmount = Math.round(caseItem.amount * 0.9 * 100) / 100;

  // 70% probability of conversion with discount incentive
  const isConverted = Math.random() < 0.70;

  const outcomeMessage = isConverted
    ? `[SIMULATED] Targeted ${discountPct}% incentive (${promoCode}) redeemed by ${caseItem.customer.name}. Recovered net checkout value: ${caseItem.currency} ${discountedAmount}.`
    : `[SIMULATED] Incentive offer ${promoCode} sent to ${caseItem.customer.email}. Customer viewed offer; cart expires in 24h.`;

  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      status: "EXECUTED",
      executedAt: new Date(),
      outcome: outcomeMessage,
    },
  });

  if (isConverted) {
    await prisma.case.update({
      where: { id: caseItem.id },
      data: {
        status: "RECOVERED",
        recoveredAmount: discountedAmount,
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
          interventionType: "OFFER_INCENTIVE",
          promoCode,
          discountPercentage: discountPct,
          originalAmount: caseItem.amount,
          recoveredAmount: discountedAmount,
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
        action: "INCENTIVE_OFFERED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "OFFER_INCENTIVE",
          promoCode,
          discountPercentage: discountPct,
          recipient: caseItem.customer.email,
          message: outcomeMessage,
        }),
      },
    });
  }

  return {
    success: isConverted,
    promoCode,
    recoveredAmount: isConverted ? discountedAmount : 0,
    outcome: outcomeMessage,
    simulated: true,
  };
}
