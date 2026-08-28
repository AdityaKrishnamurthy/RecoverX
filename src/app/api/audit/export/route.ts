import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatAuditLogsAsJSON, formatAuditLogsAsCSV, AuditExportRecord } from "@/lib/export/audit-export";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const caseId = searchParams.get("caseId");

  const whereClause: any = {};
  if (caseId) {
    whereClause.caseId = caseId;
  }

  const logs = await prisma.auditLogEntry.findMany({
    where: whereClause,
    include: {
      case: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const records: AuditExportRecord[] = logs.map((l) => {
    let detail: Record<string, any> = {};
    try {
      detail = typeof l.detail === "string" ? JSON.parse(l.detail) : l.detail;
    } catch {
      detail = { raw: l.detail };
    }

    return {
      auditId: l.id,
      caseId: l.caseId,
      caseType: l.case.type,
      customerName: l.case.customer.name,
      customerEmail: l.case.customer.email,
      actor: l.actor,
      action: l.action,
      timestamp: l.createdAt.toISOString(),
      detail,
    };
  });

  if (format === "csv") {
    const csvData = formatAuditLogsAsCSV(records);
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-trail-${caseId ? caseId.slice(0, 8) : "all"}-${Date.now()}.csv"`,
      },
    });
  }

  const jsonData = formatAuditLogsAsJSON(records);
  return new NextResponse(jsonData, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-trail-${caseId ? caseId.slice(0, 8) : "all"}-${Date.now()}.json"`,
    },
  });
}
