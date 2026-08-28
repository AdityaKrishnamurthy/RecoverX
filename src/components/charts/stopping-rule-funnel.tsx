import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, StopCircle, ArrowUpRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelProps {
  totalCases: number;
  recoveredCount: number;
  escalatedCount: number;
  stoppedCount: number;
  activeCount: number;
}

export function StoppingRuleFunnel({
  totalCases,
  recoveredCount,
  escalatedCount,
  stoppedCount,
  activeCount,
}: FunnelProps) {
  const safeTotal = totalCases > 0 ? totalCases : 1;
  const recoveredPct = Math.round((recoveredCount / safeTotal) * 100);
  const escalatedPct = Math.round((escalatedCount / safeTotal) * 100);
  const stoppedPct = Math.round((stoppedCount / safeTotal) * 100);
  const activePct = Math.round((activeCount / safeTotal) * 100);

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-sm font-semibold">Stopping Rules & Compliance Funnel</CardTitle>
        <CardDescription className="text-xs">
          Demonstrating bounded execution: every case adheres to maximum attempt limits or staged human handoff.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Auto Recovered
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
              {recoveredCount} <span className="text-xs font-normal text-muted-foreground">({recoveredPct}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Staged Escalation
            </span>
            <div className="text-xl font-bold font-mono text-rose-600 tabular-nums">
              {escalatedCount} <span className="text-xs font-normal text-muted-foreground">({escalatedPct}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-500/30 bg-slate-500/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Max-Attempt Stop
            </span>
            <div className="text-xl font-bold font-mono text-slate-600 tabular-nums">
              {stoppedCount} <span className="text-xs font-normal text-muted-foreground">({stoppedPct}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              In-Flight / Active
            </span>
            <div className="text-xl font-bold font-mono text-blue-600 tabular-nums">
              {activeCount} <span className="text-xs font-normal text-muted-foreground">({activePct}%)</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2.5">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Compliance Guarantee:</strong> Zero unbounded spamming. All workflows terminate cleanly on recovery, client resolution, or maximum attempt budget.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
