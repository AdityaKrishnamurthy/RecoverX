import { Header } from "@/components/header";
import { KpiStrip } from "@/components/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Filter, RefreshCw } from "lucide-react";

export default function QueuePage() {
  const initialKpis = {
    totalAtRisk: 148500,
    totalRecovered: 89400,
    recoveryRate: 60.2,
    activeCasesCount: 24,
    currency: "USD",
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Revenue Recovery Queue"
        description="Autonomous detection, triage, and bounded multi-channel recovery workflows."
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Filter className="size-3.5" />
          Filter Signals
        </Button>
        <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
          <Sparkles className="size-3.5" />
          Simulate Ingestion
        </Button>
      </Header>

      <main className="p-8 space-y-6 flex-1">
        <KpiStrip data={initialKpis} />

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Active At-Risk Cases</CardTitle>
                <CardDescription className="text-xs">
                  Real-time pipeline of payment retries, abandoned checkouts, failed subscriptions, and receivables.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg text-center p-6 text-muted-foreground">
              <RefreshCw className="size-8 text-muted-foreground/50 mb-3 animate-spin" />
              <p className="text-sm font-medium text-foreground">Loading Revenue Recovery Pipeline...</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Case queue table will be populated by Plan 002 seed data & Plan 007 table components.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
