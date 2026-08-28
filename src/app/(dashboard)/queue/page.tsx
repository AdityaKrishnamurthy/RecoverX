import prisma from "@/lib/prisma";
import { Header } from "@/components/header";
import { KpiStrip } from "@/components/kpi-strip";
import { CaseTable } from "@/components/case-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Layers } from "lucide-react";

import { DemoControls } from "@/components/demo-controls";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const cases = await prisma.case.findMany({
    include: {
      customer: {
        select: { name: true, email: true, segment: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAtRisk = cases.reduce((acc, c) => acc + c.amount, 0);
  const totalRecovered = cases.reduce((acc, c) => acc + (c.recoveredAmount || 0), 0);
  const activeCasesCount = cases.filter((c) => c.status === "INTERVENING" || c.status === "DETECTED" || c.status === "DIAGNOSING").length;
  const recoveredCasesCount = cases.filter((c) => c.status === "RECOVERED").length;
  const recoveryRate = cases.length > 0 ? (recoveredCasesCount / cases.length) * 100 : 0;

  const kpis = {
    totalAtRisk,
    totalRecovered,
    recoveryRate,
    activeCasesCount,
    currency: "USD",
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Revenue Recovery Queue"
        description="Autonomous detection, triage, and bounded multi-channel recovery workflows."
      >
        <DemoControls />
      </Header>

      <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        <KpiStrip data={kpis} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Real-Time Case Pipeline ({cases.length} total)
            </h2>
          </div>

          <CaseTable initialCases={cases} />
        </div>
      </main>
    </div>
  );
}
