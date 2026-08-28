import prisma from "@/lib/prisma";
import { executeRetryPayment } from "./retry-payment";
import { executeRequestCardUpdate } from "./request-card-update";
import { executeSendReminder } from "./send-reminder";
import { executeOfferIncentive } from "./offer-incentive";
import { executeEscalateHuman } from "./escalate-human";

export * from "./retry-payment";
export * from "./request-card-update";
export * from "./send-reminder";
export * from "./offer-incentive";
export * from "./escalate-human";

export async function executeIntervention(interventionId: string) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
  });

  if (!intervention) throw new Error(`Intervention ${interventionId} not found`);

  switch (intervention.type) {
    case "RETRY_PAYMENT":
      return await executeRetryPayment(interventionId);
    case "REQUEST_CARD_UPDATE":
      return await executeRequestCardUpdate(interventionId);
    case "SEND_REMINDER":
      return await executeSendReminder(interventionId);
    case "OFFER_INCENTIVE":
      return await executeOfferIncentive(interventionId);
    case "ESCALATE_HUMAN":
      return await executeEscalateHuman(interventionId);
    default:
      throw new Error(`Unknown intervention type: ${intervention.type}`);
  }
}

export async function processAllScheduledInterventions() {
  const pendingInterventions = await prisma.intervention.findMany({
    where: {
      status: "SCHEDULED",
    },
    select: { id: true, type: true },
  });

  const results = [];
  for (const item of pendingInterventions) {
    const outcome = await executeIntervention(item.id);
    results.push({ id: item.id, type: item.type, outcome });
  }

  return {
    processedCount: results.length,
    results,
  };
}
