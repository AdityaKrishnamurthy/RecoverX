import prisma from "@/lib/prisma";

export async function executeSendReminder(interventionId: string) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: { case: { include: { customer: true, promiseToPay: true } } },
  });

  if (!intervention) throw new Error(`Intervention ${interventionId} not found`);

  const caseItem = intervention.case;
  const isIndianCustomer = caseItem.currency === "INR" || (caseItem.customer.phone || "").startsWith("+91");

  // Standard or Hinglish-flavored copy
  const messageCopy = isIndianCustomer
    ? `Namaste ${caseItem.customer.name}, aapka payment of ${caseItem.currency} ${caseItem.amount} pending hai. Please complete it here: https://pay.recovery.io/inv/${caseItem.id.slice(0, 8)}`
    : `Hi ${caseItem.customer.name}, friendly reminder regarding your pending balance of ${caseItem.currency} ${caseItem.amount}. Review statement and pay securely: https://pay.recovery.io/inv/${caseItem.id.slice(0, 8)}`;

  // Simulation: 60% probability of clearing or confirming promise-to-pay
  const isRecovered = Math.random() < 0.60;

  const outcomeMessage = isRecovered
    ? `[SIMULATED] Reminder delivered via ${intervention.channel || "Email/SMS"}. Customer clicked link and settled invoice ${caseItem.currency} ${caseItem.amount}.`
    : `[SIMULATED] Reminder dispatched to ${caseItem.customer.email}. Delivery confirmed (HTTP 200). Awaiting customer payment.`;

  await prisma.intervention.update({
    where: { id: interventionId },
    data: {
      status: "EXECUTED",
      executedAt: new Date(),
      outcome: outcomeMessage,
    },
  });

  if (isRecovered) {
    await prisma.case.update({
      where: { id: caseItem.id },
      data: {
        status: "RECOVERED",
        recoveredAmount: caseItem.amount,
        recoveredAt: new Date(),
      },
    });

    if (caseItem.promiseToPay) {
      await prisma.promiseToPay.update({
        where: { caseId: caseItem.id },
        data: { status: "KEPT" },
      });
    }

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "REVENUE_RECOVERED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "SEND_REMINDER",
          recoveredAmount: caseItem.amount,
          currency: caseItem.currency,
          channel: intervention.channel,
          message: outcomeMessage,
        }),
      },
    });
  } else {
    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "AGENT",
        action: "REMINDER_DISPATCHED",
        detail: JSON.stringify({
          simulated: true,
          interventionType: "SEND_REMINDER",
          recipient: caseItem.customer.email,
          channel: intervention.channel,
          templateType: isIndianCustomer ? "HINGLISH_LOCALE" : "STANDARD_EN",
          messageSnippet: messageCopy,
        }),
      },
    });
  }

  return {
    success: isRecovered,
    channel: intervention.channel,
    messageCopy,
    outcome: outcomeMessage,
    simulated: true,
  };
}
