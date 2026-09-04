export interface AuditExportRecord {
  auditId: string;
  caseId: string;
  caseType: string;
  customerName: string;
  customerEmail: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: Record<string, unknown>;
}

export function formatAuditLogsAsJSON(records: AuditExportRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function formatAuditLogsAsCSV(records: AuditExportRecord[]): string {
  const headers = [
    "Audit ID",
    "Case ID",
    "Workflow Type",
    "Customer Name",
    "Customer Email",
    "Actor",
    "Action",
    "Timestamp",
    "Detail Summary",
  ];

  const escapeCSV = (val: string) => `"${String(val).replace(/"/g, '""')}"`;

  const rows = records.map((r) => {
    const summary =
      (typeof r.detail.summary === "string" && r.detail.summary) ||
      (typeof r.detail.rootCause === "string" && r.detail.rootCause) ||
      (typeof r.detail.message === "string" && r.detail.message) ||
      (typeof r.detail.reason === "string" && r.detail.reason) ||
      "";
    return [
      escapeCSV(r.auditId),
      escapeCSV(r.caseId),
      escapeCSV(r.caseType),
      escapeCSV(r.customerName),
      escapeCSV(r.customerEmail),
      escapeCSV(r.actor),
      escapeCSV(r.action),
      escapeCSV(r.timestamp),
      escapeCSV(summary),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
