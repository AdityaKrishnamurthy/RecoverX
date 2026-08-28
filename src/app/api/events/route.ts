import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { IngestionEventSchema } from "@/lib/validation/event-schema";
import { diagnoseCaseById } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = IngestionEventSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    let caseType = "PAYMENT_RETRY";
    if (data.eventType === "CHECKOUT_ABANDONED") caseType = "CHECKOUT_ABANDONMENT";
    else if (data.eventType === "SUBSCRIPTION_CHARGE_FAILED") caseType = "SUBSCRIPTION_FAILURE";
    else if (data.eventType === "INVOICE_OVERDUE") caseType = "RECEIVABLE_OVERDUE";

    // 1. Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { email: data.customer.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone || null,
          segment: data.customer.segment || "STANDARD",
        },
      });
    }

    // 2. Create Case
    const newCase = await prisma.case.create({
      data: {
        type: caseType,
        status: "DETECTED",
        amount: data.amount,
        currency: data.currency,
        riskScore: 0.5,
        customerId: customer.id,
      },
    });

    // 3. Create Event signal
    await prisma.event.create({
      data: {
        caseId: newCase.id,
        type: data.eventType,
        payload: JSON.stringify(data.payload),
      },
    });

    // 4. Initial Audit Log
    await prisma.auditLogEntry.create({
      data: {
        caseId: newCase.id,
        actor: "SYSTEM",
        action: "SIGNAL_INGESTED",
        detail: JSON.stringify({
          signal: data.eventType,
          summary: `Signal ${data.eventType} ingested for ${customer.name} (${data.currency} ${data.amount})`,
          metadata: data.payload,
        }),
      },
    });

    // 5. Run automatic diagnosis
    const diagResult = await diagnoseCaseById(newCase.id);

    return NextResponse.json(
      {
        success: true,
        caseId: newCase.id,
        status: "DIAGNOSED",
        case: diagResult.case,
        diagnosis: diagResult.diagnosis,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Ingestion API Error]:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error", detail: errorMsg }, { status: 500 });
  }
}
