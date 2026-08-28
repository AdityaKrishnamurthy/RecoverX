export interface AuditExportRecord {
  auditId: string;
  caseId: string;
  caseType: string;
  customerName: string;
  customerEmail: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: Record<string, any>;
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
    const summary = r.detail.summary || r.detail.rootCause || r.detail.message || r.detail.reason || "";
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
