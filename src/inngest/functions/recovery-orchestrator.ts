import { inngest } from "../client";
import prisma from "@/lib/prisma";
import { diagnoseCaseById } from "@/lib/ai/engine";

export const executeRecoveryWorkflow = inngest.createFunction(
  {
    id: "execute-recovery-workflow",
    name: "Execute Autonomous Recovery Workflow",
    triggers: [{ event: "recovery/case.triggered" }],
  },
  async ({ event, step }) => {
    const { caseId } = (event.data || {}) as { caseId: string };

    // Step 1: Diagnosis & Classification
    await step.run("diagnose-case", async () => {
      const existingCase = await prisma.case.findUnique({
        where: { id: caseId },
      });

      if (!existingCase) {
        throw new Error(`Case ${caseId} not found`);
      }

      if (!existingCase.diagnosis) {
        return await diagnoseCaseById(caseId);
      }

      return {
        case: existingCase,
        diagnosis: {
          rootCause: existingCase.diagnosis,
          confidence: existingCase.diagnosisConfidence || 0.85,
        },
      };
    });

    // Step 2: Stopping Rule Check (Max Attempts & Expiry)
    const stoppingRuleCheck = await step.run("check-stopping-rules", async () => {
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: { interventions: true },
      });

      if (!caseItem) throw new Error("Case missing");

      const MAX_ATTEMPTS = caseItem.type === "RECEIVABLE_OVERDUE" ? 4 : 3;
      const attemptCount = caseItem.interventions.length;

      if (attemptCount >= MAX_ATTEMPTS) {
        await prisma.case.update({
          where: { id: caseId },
          data: { status: "STOPPED" },
        });

        await prisma.auditLogEntry.create({
          data: {
            caseId,
            actor: "AGENT",
            action: "STOPPING_RULE_TRIGGERED",
            detail: JSON.stringify({
              reason: `Stopping rule enforced: reached maximum allowed attempts (${MAX_ATTEMPTS}).`,
              attemptCount,
              workflowType: caseItem.type,
            }),
          },
        });

        return { shouldHalt: true, reason: "MAX_ATTEMPTS_REACHED", attemptCount };
      }

      return { shouldHalt: false, reason: null, attemptCount };
    });

    if (stoppingRuleCheck.shouldHalt) {
      return { status: "STOPPED", reason: stoppingRuleCheck.reason };
    }

    // Step 3: Create & Schedule Intervention Decision
    const interventionDecision = await step.run("record-intervention-decision", async () => {
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: { customer: true, events: true },
      });

      if (!caseItem) throw new Error("Case not found");

      let interventionType: "RETRY_PAYMENT" | "SEND_REMINDER" | "OFFER_INCENTIVE" | "REQUEST_CARD_UPDATE" | "ESCALATE_HUMAN" = "SEND_REMINDER";
      let channel = "EMAIL";

      if (caseItem.type === "PAYMENT_RETRY") {
        const diag = (caseItem.diagnosis || "").toLowerCase();
        if (diag.includes("expired")) {
          interventionType = "REQUEST_CARD_UPDATE";
          channel = "EMAIL_SMS";
        } else {
          interventionType = "RETRY_PAYMENT";
          channel = "PAYMENT_GATEWAY";
        }
      } else if (caseItem.type === "CHECKOUT_ABANDONMENT") {
        const diag = (caseItem.diagnosis || "").toLowerCase();
        if (diag.includes("price") || diag.includes("sensitivity") || diag.includes("friction")) {
          interventionType = "OFFER_INCENTIVE";
          channel = "WHATSAPP_SMS";
        } else {
          interventionType = "SEND_REMINDER";
          channel = "BROWSER_EMAIL";
        }
      } else if (caseItem.type === "SUBSCRIPTION_FAILURE") {
        const diag = (caseItem.diagnosis || "").toLowerCase();
        if (diag.includes("expired") || diag.includes("mandate")) {
          interventionType = "REQUEST_CARD_UPDATE";
          channel = "EMAIL_PORTAL";
        } else {
          interventionType = "RETRY_PAYMENT";
          channel = "SUBSCRIPTION_BILLING";
        }
      } else if (caseItem.type === "RECEIVABLE_OVERDUE") {
        const risk = caseItem.riskScore;
        if (risk >= 0.8) {
          interventionType = "ESCALATE_HUMAN";
          channel = "INTERNAL_OPS_QUEUE";
        } else {
          interventionType = "SEND_REMINDER";
          channel = "AR_STATEMENT_EMAIL";
        }
      }

      const intervention = await prisma.intervention.create({
        data: {
          caseId,
          type: interventionType,
          channel,
          status: "SCHEDULED",
          scheduledAt: new Date(),
          llmProvider: "autonomous-engine",
          llmReasoning: `Intervention ${interventionType} chosen based on root cause diagnosis: "${caseItem.diagnosis}" with risk ${caseItem.riskScore}.`,
        },
      });

      await prisma.case.update({
        where: { id: caseId },
        data: { status: "INTERVENING" },
      });

      await prisma.auditLogEntry.create({
        data: {
          caseId,
          actor: "AGENT",
          action: "INTERVENTION_CHOSEN",
          detail: JSON.stringify({
            interventionId: intervention.id,
            type: interventionType,
            channel,
            reasoning: intervention.llmReasoning,
          }),
        },
      });

      // For receivables overdue, create Promise-to-Pay tracking if applicable
      if (caseItem.type === "RECEIVABLE_OVERDUE" && interventionType === "SEND_REMINDER") {
        const promiseDate = new Date(Date.now() + 7 * 86400000);
        await prisma.promiseToPay.upsert({
          where: { caseId },
          create: {
            caseId,
            promisedAmount: caseItem.amount,
            promisedDate: promiseDate,
            status: "PENDING",
          },
          update: {},
        });

        await prisma.auditLogEntry.create({
          data: {
            caseId,
            actor: "AGENT",
            action: "PROMISE_TO_PAY_CAPTURED",
            detail: JSON.stringify({
              promisedAmount: caseItem.amount,
              promisedDate: promiseDate.toISOString(),
              status: "PENDING",
            }),
          },
        });
      }

      return intervention;
    });

    // Step 4: Execute Intervention via Action Simulator
    const executionOutcome = await step.run("execute-intervention", async () => {
      const { executeIntervention } = await import("@/lib/actions");
      return await executeIntervention(interventionDecision.id);
    });

    return {
      success: true,
      caseId,
      intervention: interventionDecision,
      outcome: executionOutcome,
    };
  }
);
