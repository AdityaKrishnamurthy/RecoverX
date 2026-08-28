import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { diagnoseAllPendingCases } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Clean tables
    await prisma.promiseToPay.deleteMany();
    await prisma.auditLogEntry.deleteMany();
    await prisma.intervention.deleteMany();
    await prisma.event.deleteMany();
    await prisma.case.deleteMany();
    await prisma.customer.deleteMany();

    // 2. Re-seed base dataset
    const CUSTOMERS = [
      { name: "Acme Corp", email: "finance@acme.corp", phone: "+1-555-0192", segment: "ENTERPRISE" },
      { name: "Nova Logistics LLC", email: "ap@novalogistics.com", phone: "+1-555-0381", segment: "ENTERPRISE" },
      { name: "Pulse Technologies", email: "billing@pulsetech.io", phone: "+1-555-0482", segment: "SMB" },
      { name: "Zephyr Retail", email: "orders@zephyrretail.in", phone: "+91-98765-43210", segment: "SMB" },
      { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", phone: "+91-98123-45678", segment: "VIP" },
      { name: "Sophia Chen", email: "sophia.chen@apexcloud.co", phone: "+1-555-4433", segment: "VIP" },
    ];

    const createdCustomers = [];
    for (const c of CUSTOMERS) {
      createdCustomers.push(await prisma.customer.create({ data: c }));
    }

    // Generate 12 fresh cases
    for (let i = 1; i <= 3; i++) {
      // 1. Payment
      const c1 = await prisma.case.create({
        data: {
          type: "PAYMENT_RETRY",
          status: "DETECTED",
          amount: 250 + i * 80,
          currency: "USD",
          customerId: createdCustomers[0].id,
        },
      });
      await prisma.event.create({
        data: {
          caseId: c1.id,
          type: "PAYMENT_FAILED",
          payload: JSON.stringify({ errorCode: "insufficient_funds", cardBrand: "visa", cardLast4: "4242" }),
        },
      });

      // 2. Abandoned
      const c2 = await prisma.case.create({
        data: {
          type: "CHECKOUT_ABANDONMENT",
          status: "DETECTED",
          amount: 140 + i * 35,
          currency: "USD",
          customerId: createdCustomers[3].id,
        },
      });
      await prisma.event.create({
        data: {
          caseId: c2.id,
          type: "CHECKOUT_ABANDONED",
          payload: JSON.stringify({ dropoffStep: "shipping_calculation", sessionDurationSeconds: 190 }),
        },
      });

      // 3. Subscription
      const c3 = await prisma.case.create({
        data: {
          type: "SUBSCRIPTION_FAILURE",
          status: "DETECTED",
          amount: 199,
          currency: "USD",
          customerId: createdCustomers[2].id,
        },
      });
      await prisma.event.create({
        data: {
          caseId: c3.id,
          type: "SUBSCRIPTION_CHARGE_FAILED",
          payload: JSON.stringify({ failureReason: "card_expired", planName: "Team Tier" }),
        },
      });

      // 4. Receivables
      const c4 = await prisma.case.create({
        data: {
          type: "RECEIVABLE_OVERDUE",
          status: "DETECTED",
          amount: 4500 + i * 1200,
          currency: "USD",
          customerId: createdCustomers[1].id,
        },
      });
      await prisma.event.create({
        data: {
          caseId: c4.id,
          type: "INVOICE_OVERDUE",
          payload: JSON.stringify({ invoiceNumber: `INV-2026-${9000 + i}`, daysOverdue: 35 }),
        },
      });
    }

    // Auto-diagnose and process
    await diagnoseAllPendingCases();

    return NextResponse.json({ success: true, message: "Demo batch reset and diagnosed successfully!" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
