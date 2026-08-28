import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CUSTOMERS = [
  { name: "Acme Corp", email: "finance@acme.corp", phone: "+1-555-0192", segment: "ENTERPRISE" },
  { name: "Nova Logistics LLC", email: "ap@novalogistics.com", phone: "+1-555-0381", segment: "ENTERPRISE" },
  { name: "Pulse Technologies", email: "billing@pulsetech.io", phone: "+1-555-0482", segment: "SMB" },
  { name: "Zephyr Retail", email: "orders@zephyrretail.in", phone: "+91-98765-43210", segment: "SMB" },
  { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", phone: "+91-98123-45678", segment: "VIP" },
  { name: "Elena Rostova", email: "elena.r@finopt.de", phone: "+49-151-234567", segment: "VIP" },
  { name: "Devon Vance", email: "devon.v@vanceholding.com", phone: "+1-555-9921", segment: "ENTERPRISE" },
  { name: "Mira Nair", email: "mira.nair@studiobloom.in", phone: "+91-99887-76655", segment: "STANDARD" },
  { name: "Liam O'Connor", email: "liam@celticsolutions.ie", phone: "+353-87-1234567", segment: "STANDARD" },
  { name: "Sophia Chen", email: "sophia.chen@apexcloud.co", phone: "+1-555-4433", segment: "VIP" },
  { name: "HyperScale Media", email: "accounts@hyperscale.com", phone: "+1-555-8812", segment: "ENTERPRISE" },
  { name: "Rohan Varma", email: "rohan.v@varmaanalytics.in", phone: "+91-91234-56789", segment: "SMB" },
];

async function main() {
  console.log("🌱 Cleaning existing data...");
  await prisma.promiseToPay.deleteMany();
  await prisma.auditLogEntry.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.event.deleteMany();
  await prisma.case.deleteMany();
  await prisma.customer.deleteMany();

  console.log("👤 Seeding customers...");
  const createdCustomers = [];
  for (const c of CUSTOMERS) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  console.log("📦 Generating 52 realistic recovery cases across 4 workflow types...");

  // 1. PAYMENT_RETRY (13 cases)
  const paymentDeclineCodes = [
    { code: "insufficient_funds", desc: "Insufficient funds in issuer account", risk: 0.65 },
    { code: "issuer_declined", desc: "Generic card issuer security decline", risk: 0.45 },
    { code: "network_timeout", desc: "Acquiring bank timeout during 3DS", risk: 0.25 },
    { code: "card_velocity_exceeded", desc: "Card daily transaction frequency limit", risk: 0.55 },
    { code: "expired_card", desc: "Card expiration date passed", risk: 0.70 },
  ];

  for (let i = 1; i <= 13; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const decline = paymentDeclineCodes[i % paymentDeclineCodes.length];
    const isINR = i % 3 === 0;
    const amount = isINR ? 4500 + i * 1250 : 120 + i * 45;
    const currency = isINR ? "INR" : "USD";

    const caseItem = await prisma.case.create({
      data: {
        type: "PAYMENT_RETRY",
        status: "DETECTED",
        amount,
        currency,
        riskScore: decline.risk,
        customerId: cust.id,
      },
    });

    const eventPayload = {
      source: "payment_gateway",
      transactionId: `txn_${Math.random().toString(36).substring(2, 11)}`,
      errorCode: decline.code,
      errorMessage: decline.desc,
      cardBrand: ["visa", "mastercard", "amex", "rupay"][i % 4],
      cardLast4: `${1000 + ((i * 73) % 9000)}`,
      attemptNumber: 1,
      gatewayLatencyMs: 340 + (i * 25),
      issuerBank: ["JPMorgan Chase", "HDFC Bank", "Barclays", "ICICI Bank", "Citibank"][i % 5],
    };

    await prisma.event.create({
      data: {
        caseId: caseItem.id,
        type: "PAYMENT_FAILED",
        payload: JSON.stringify(eventPayload),
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "SIGNAL_DETECTED",
        detail: JSON.stringify({
          signal: "PAYMENT_FAILED",
          summary: `Payment of ${currency} ${amount} failed with ${decline.code}`,
          metadata: eventPayload,
        }),
      },
    });
  }

  // 2. CHECKOUT_ABANDONMENT (13 cases)
  const checkoutDropoffSteps = [
    { step: "payment_method_selection", reason: "Preferred UPI/local method absent", risk: 0.35 },
    { step: "shipping_calculation", reason: "Unexpected freight or customs fee", risk: 0.50 },
    { step: "otp_verification", reason: "SMS OTP delay / user dropped", risk: 0.40 },
    { step: "discount_code_error", reason: "Coupon expired or invalid", risk: 0.60 },
  ];

  for (let i = 1; i <= 13; i++) {
    const cust = createdCustomers[(i + 2) % createdCustomers.length];
    const dropoff = checkoutDropoffSteps[i % checkoutDropoffSteps.length];
    const isINR = i % 2 === 0;
    const amount = isINR ? 3200 + i * 850 : 85 + i * 35;
    const currency = isINR ? "INR" : "USD";

    const caseItem = await prisma.case.create({
      data: {
        type: "CHECKOUT_ABANDONMENT",
        status: "DETECTED",
        amount,
        currency,
        riskScore: dropoff.risk,
        customerId: cust.id,
      },
    });

    const eventPayload = {
      source: "checkout_telemetry",
      cartId: `cart_${Math.random().toString(36).substring(2, 10)}`,
      dropoffStep: dropoff.step,
      suspectedFriction: dropoff.reason,
      sessionDurationSeconds: 120 + i * 18,
      itemsCount: 1 + (i % 4),
      device: i % 2 === 0 ? "mobile" : "desktop",
      appliedDiscount: i % 3 === 0 ? "SAVE10" : null,
      exitPage: `/checkout/step-${dropoff.step}`,
    };

    await prisma.event.create({
      data: {
        caseId: caseItem.id,
        type: "CHECKOUT_ABANDONED",
        payload: JSON.stringify(eventPayload),
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "SIGNAL_DETECTED",
        detail: JSON.stringify({
          signal: "CHECKOUT_ABANDONED",
          summary: `Abandoned cart of ${currency} ${amount} at step ${dropoff.step}`,
          metadata: eventPayload,
        }),
      },
    });
  }

  // 3. SUBSCRIPTION_FAILURE (13 cases)
  const subscriptionPlans = [
    { name: "Pro Plan (Monthly)", priceUSD: 49, reason: "card_expired", risk: 0.60 },
    { name: "Team Tier (Monthly)", priceUSD: 199, reason: "insufficient_funds", risk: 0.50 },
    { name: "Enterprise SaaS (Annual)", priceUSD: 2400, reason: "mandate_revoked", risk: 0.75 },
    { name: "Growth Suite (Monthly)", priceUSD: 499, reason: "issuer_declined", risk: 0.40 },
  ];

  for (let i = 1; i <= 13; i++) {
    const cust = createdCustomers[(i + 4) % createdCustomers.length];
    const plan = subscriptionPlans[i % subscriptionPlans.length];
    const amount = plan.priceUSD;
    const currency = "USD";

    const caseItem = await prisma.case.create({
      data: {
        type: "SUBSCRIPTION_FAILURE",
        status: "DETECTED",
        amount,
        currency,
        riskScore: plan.risk,
        customerId: cust.id,
      },
    });

    const eventPayload = {
      source: "billing_engine",
      subscriptionId: `sub_${Math.random().toString(36).substring(2, 10)}`,
      planName: plan.name,
      consecutiveFailedCycles: 1 + (i % 2),
      failureReason: plan.reason,
      renewalPeriod: "monthly",
      gracePeriodEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      lastSuccessfulInvoiceDate: new Date(Date.now() - 31 * 86400000).toISOString(),
    };

    await prisma.event.create({
      data: {
        caseId: caseItem.id,
        type: "SUBSCRIPTION_CHARGE_FAILED",
        payload: JSON.stringify(eventPayload),
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "SIGNAL_DETECTED",
        detail: JSON.stringify({
          signal: "SUBSCRIPTION_CHARGE_FAILED",
          summary: `Recurring charge failed for ${plan.name} ($${amount}) due to ${plan.reason}`,
          metadata: eventPayload,
        }),
      },
    });
  }

  // 4. RECEIVABLE_OVERDUE (13 cases)
  const receivableAging = [
    { days: 14, bucket: "1-15 days overdue", risk: 0.30 },
    { days: 38, bucket: "31-45 days overdue", risk: 0.55 },
    { days: 65, bucket: "61-75 days overdue", risk: 0.80 },
    { days: 92, bucket: "90+ days overdue (Critical)", risk: 0.95 },
  ];

  for (let i = 1; i <= 13; i++) {
    const cust = createdCustomers[(i + 1) % createdCustomers.length];
    const aging = receivableAging[i % receivableAging.length];
    const amount = 3500 + i * 1150;
    const currency = "USD";

    const caseItem = await prisma.case.create({
      data: {
        type: "RECEIVABLE_OVERDUE",
        status: "DETECTED",
        amount,
        currency,
        riskScore: aging.risk,
        customerId: cust.id,
      },
    });

    const eventPayload = {
      source: "erp_invoicing",
      invoiceNumber: `INV-2026-${8000 + i * 37}`,
      poNumber: `PO-US-${10000 + i * 49}`,
      daysOverdue: aging.days,
      agingBucket: aging.bucket,
      issueDate: new Date(Date.now() - (aging.days + 30) * 86400000).toISOString(),
      dueDate: new Date(Date.now() - aging.days * 86400000).toISOString(),
      creditTerms: "Net 30",
      accountsPayableContact: cust.email,
      disputeRaised: false,
    };

    await prisma.event.create({
      data: {
        caseId: caseItem.id,
        type: "INVOICE_OVERDUE",
        payload: JSON.stringify(eventPayload),
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        caseId: caseItem.id,
        actor: "SYSTEM",
        action: "SIGNAL_DETECTED",
        detail: JSON.stringify({
          signal: "INVOICE_OVERDUE",
          summary: `Invoice ${eventPayload.invoiceNumber} ($${amount}) is ${aging.days} days overdue`,
          metadata: eventPayload,
        }),
      },
    });
  }

  const totalCases = await prisma.case.count();
  const casesByType = await prisma.case.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  console.log(`✅ Seed finished successfully! Total cases in DB: ${totalCases}`);
  console.log("📊 Breakdown by workflow type:", casesByType);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
