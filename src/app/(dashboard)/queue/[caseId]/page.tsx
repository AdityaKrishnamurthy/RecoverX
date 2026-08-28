import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  FileText,
  Clock
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, WorkflowTypeBadge } from "@/components/status-badge";
import { CaseTimeline } from "@/components/case-timeline";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      customer: true,
      events: { orderBy: { createdAt: "asc" } },
      interventions: { orderBy: { createdAt: "asc" } },
      auditLogs: { orderBy: { createdAt: "asc" } },
      promiseToPay: true,
    },
  });

  if (!caseItem) {
    notFound();
  }

  const currencySym = caseItem.currency === "INR" ? "₹" : "$";

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`Case #${caseItem.id.slice(0, 8)}`}
        description={`Full forensic audit trail: Signal Detection → AI Diagnosis → Bounded Intervention → Recovery.`}
      >
        <Link href="/queue">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="size-3.5" />
            Back to Queue
          </Button>
        </Link>
      </Header>

      <main className="p-8 space-y-6 flex-1 max-w-6xl w-full mx-auto">
        {/* Case Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card/60 p-4 rounded-xl border border-border/70 shadow-xs">
          <div className="flex items-center gap-3">
            <WorkflowTypeBadge type={caseItem.type} className="text-xs py-1 px-2.5" />
            <StatusBadge status={caseItem.status} className="text-xs py-1 px-2.5" />
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Original At-Risk: </span>
              <span className="font-bold text-foreground tabular-nums">
                {currencySym}{caseItem.amount.toLocaleString()}
              </span>
            </div>

            {caseItem.recoveredAmount && (
              <div>
                <span className="text-muted-foreground">Measured Recovered: </span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {currencySym}{caseItem.recoveredAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer & Account Profile */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="size-3.5" />
                Customer Account Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5 text-xs">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-semibold text-foreground">{caseItem.customer.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground">{caseItem.customer.email}</span>
              </div>
              {caseItem.customer.phone && (
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="text-foreground">{caseItem.customer.phone}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Tier: </span>
                <span className="font-medium text-foreground">{caseItem.customer.segment}</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Root Cause Diagnosis */}
          <Card className="border-border/70 shadow-xs md:col-span-2 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  AI Forensic Diagnosis & Risk Analysis
                </CardTitle>
                {caseItem.diagnosisConfidence && (
                  <span className="text-xs font-mono text-muted-foreground">
                    Confidence: {Math.round(caseItem.diagnosisConfidence * 100)}%
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2 text-xs">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {caseItem.diagnosis || "Awaiting diagnosis engine analysis..."}
              </p>
              <div className="pt-2 flex items-center gap-4 text-muted-foreground text-[11px]">
                <span>Risk Score: {Math.round(caseItem.riskScore * 100)}%</span>
                <span>•</span>
                <span>Audited Events: {caseItem.auditLogs.length} entries</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promise To Pay Widget (if present) */}
        {caseItem.promiseToPay && (
          <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Promise-to-Pay Commitment Captured
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Promised Amount: {currencySym}{caseItem.promiseToPay.promisedAmount.toLocaleString()} • Target Date: {new Date(caseItem.promiseToPay.promisedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md">
                Status: {caseItem.promiseToPay.status}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Full Forensic Audit Timeline */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Chronological Audit Trail & Decision Logs
            </CardTitle>
            <CardDescription className="text-xs">
              Every signal, model inference, and bounded action is immutably logged for complete compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <CaseTimeline logs={caseItem.auditLogs} caseType={caseItem.type} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
