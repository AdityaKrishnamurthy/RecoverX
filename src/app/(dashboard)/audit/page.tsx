import prisma from "@/lib/prisma";
import { Header } from "@/components/header";
import { CaseTimeline, AuditLogItem } from "@/components/case-timeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const auditLogs = await prisma.auditLogEntry.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      case: {
        include: { customer: true },
      },
    },
  });

  const totalLogsCount = await prisma.auditLogEntry.count();

  const formattedLogs: AuditLogItem[] = auditLogs.map((l) => ({
    id: l.id,
    caseId: l.caseId,
    actor: l.actor,
    action: l.action,
    detail: l.detail,
    createdAt: l.createdAt,
  }));

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Immutable Audit Trail & Compliance Viewer"
        description="Forensic log of every signal detection, model reasoning, simulated execution, and stopping rule."
      >
        <a href="/api/audit/export?format=json" download="audit-trail.json" target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="size-3.5" />
            Export JSON
          </Button>
        </a>

        <a href="/api/audit/export?format=csv" download="audit-trail.csv" target="_blank">
          <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </a>
      </Header>

      <main className="p-8 space-y-6 flex-1 max-w-5xl w-full mx-auto">
        {/* Compliance Guarantee Banner */}
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Database className="size-4.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Audit Trail Ledger ({totalLogsCount} total entries recorded)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Structured JSON payloads, LLM provider fallback traces, and latency timestamps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              100% Traceable
            </span>
          </div>
        </div>

        {/* Timeline viewer */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Latest System & Agent Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log stream of autonomous recovery events.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <CaseTimeline logs={formattedLogs} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
