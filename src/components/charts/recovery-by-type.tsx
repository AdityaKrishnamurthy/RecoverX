"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WorkflowTypeBadge } from "@/components/status-badge";

export interface WorkflowMetric {
  type: string;
  totalAtRisk: number;
  totalRecovered: number;
  caseCount: number;
  recoveredCount: number;
}

interface RecoveryByTypeProps {
  metrics: WorkflowMetric[];
}

export function RecoveryByType({ metrics }: RecoveryByTypeProps) {
  const maxAtRisk = Math.max(...metrics.map((m) => m.totalAtRisk), 1);

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-sm font-semibold">Recovery Performance by Workflow</CardTitle>
        <CardDescription className="text-xs">
          Forensic breakdown of recovered dollars vs at-risk capital across all 4 recovery channels.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-5">
        {metrics.map((item) => {
          const rate = item.totalAtRisk > 0 ? (item.totalRecovered / item.totalAtRisk) * 100 : 0;
          const barWidthRisk = (item.totalAtRisk / maxAtRisk) * 100;
          const barWidthRec = (item.totalRecovered / maxAtRisk) * 100;

          return (
            <div key={item.type} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <WorkflowTypeBadge type={item.type} />
                  <span className="text-[11px] text-muted-foreground">
                    ({item.recoveredCount}/{item.caseCount} cases recovered)
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-muted-foreground text-xs">
                    At Risk: <strong className="text-foreground">${item.totalAtRisk.toLocaleString()}</strong>
                  </span>
                  <span className="text-emerald-600 font-bold text-xs">
                    Recovered: ${item.totalRecovered.toLocaleString()} ({rate.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Stacked Comparative Bar */}
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-amber-500/40 absolute left-0 top-0 rounded-full transition-all duration-500"
                  style={{ width: `${barWidthRisk}%` }}
                />
                <div
                  className="h-full bg-emerald-500 absolute left-0 top-0 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${barWidthRec}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
