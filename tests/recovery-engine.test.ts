import { classifyPaymentFailure } from "@/lib/detection/payment-retry";
import { classifyCheckoutAbandonment } from "@/lib/detection/checkout-abandonment";
import { classifySubscriptionFailure } from "@/lib/detection/subscription-failure";
import { classifyReceivableAging } from "@/lib/detection/receivable-overdue";
import { preclassifyCase } from "@/lib/detection";
import { generateDeterministicDiagnosis } from "@/lib/ai/diagnose";
import { IngestionEventSchema } from "@/lib/validation/event-schema";
import { formatAuditLogsAsJSON, formatAuditLogsAsCSV, AuditExportRecord } from "@/lib/export/audit-export";
import prisma from "@/lib/prisma";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== RUNNING RECOVERX AUTOMATED TEST SUITE ===\n");

  // 1. Detection Engine Tests
  const paymentClass = classifyPaymentFailure({ errorCode: "network_timeout" });
  assert(paymentClass.category === "NETWORK_TIMEOUT" && paymentClass.retryable === true, "Detection: Payment network timeout is retryable");

  const paymentExpired = classifyPaymentFailure({ errorCode: "expired_card" });
  assert(paymentExpired.category === "EXPIRED_CARD" && paymentExpired.retryable === false, "Detection: Expired card is not retryable");

  const checkoutClass = classifyCheckoutAbandonment({ dropoffStep: "shipping", sessionDurationSeconds: 120 }, 150);
  assert(checkoutClass.dropoffStage === "SHIPPING" && checkoutClass.incentiveEligible === true, "Detection: Checkout dropoff at shipping is incentive-eligible");

  const subClass = classifySubscriptionFailure({ failureReason: "card_expired", consecutiveFailedCycles: 2 });
  assert(subClass.reasonCategory === "CARD_EXPIRED" && subClass.actionRequired === "REQUEST_CARD_UPDATE", "Detection: Subscription card expiration requires card update");

  const arClass = classifyReceivableAging({ daysOverdue: 75 }, 8000);
  assert(arClass.agingBucket === "DELINQUENT_61_90" && arClass.collectionStrategy === "EXECUTIVE_ESCALATION", "Detection: 75 days AR overdue triggers executive escalation");

  const preclass = preclassifyCase("PAYMENT_RETRY", { errorCode: "insufficient_funds" }, 500);
  assert("category" in preclass && preclass.category === "INSUFFICIENT_FUNDS", "Detection: preclassifyCase works for payment retry");

  // 2. Deterministic AI Diagnosis Fallback Tests
  const diagContext = {
    caseId: "test-case-1",
    type: "PAYMENT_RETRY",
    amount: 500,
    currency: "USD",
    customerName: "Acme Corp",
    customerEmail: "acme@example.com",
    customerSegment: "ENTERPRISE",
    rawEventPayload: { errorCode: "network_timeout" },
  };
  const diag = generateDeterministicDiagnosis(diagContext);
  assert(diag.recommendedAction === "RETRY_PAYMENT" && diag.confidence > 0.8, "AI: Deterministic diagnosis recommends RETRY_PAYMENT for network timeout");

  // 3. Validation Schema Tests
  const validEvent = {
    eventType: "PAYMENT_FAILED",
    amount: 250,
    currency: "USD",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      segment: "VIP",
    },
    payload: { errorCode: "issuer_declined" },
  };
  const parseValid = IngestionEventSchema.safeParse(validEvent);
  assert(parseValid.success, "Validation: IngestionEventSchema parses valid payload");

  const invalidEvent = {
    eventType: "INVALID_EVENT_TYPE",
    amount: -10,
    currency: "US",
  };
  const parseInvalid = IngestionEventSchema.safeParse(invalidEvent);
  assert(!parseInvalid.success, "Validation: IngestionEventSchema rejects invalid payload");

  // 4. Audit Export Formatting Tests
  const sampleRecords: AuditExportRecord[] = [
    {
      auditId: "aud_1",
      caseId: "case_1",
      caseType: "PAYMENT_RETRY",
      customerName: "Acme Corp",
      customerEmail: "acme@example.com",
      actor: "AGENT",
      action: "REVENUE_RECOVERED",
      timestamp: new Date().toISOString(),
      detail: { summary: "Recovered $500" },
    },
  ];
  const jsonExport = formatAuditLogsAsJSON(sampleRecords);
  assert(jsonExport.includes("aud_1") && jsonExport.includes("Acme Corp"), "Export: formatAuditLogsAsJSON generates valid JSON string");

  const csvExport = formatAuditLogsAsCSV(sampleRecords);
  assert(csvExport.includes("Audit ID") && csvExport.includes("aud_1"), "Export: formatAuditLogsAsCSV generates valid CSV string");

  // 5. Database Verification
  const caseCount = await prisma.case.count();
  const customerCount = await prisma.customer.count();
  const auditCount = await prisma.auditLogEntry.count();
  assert(caseCount > 0 && customerCount > 0 && auditCount > 0, `Database: Seeded records present (cases: ${caseCount}, customers: ${customerCount}, audits: ${auditCount})`);

  console.log("\n========================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
