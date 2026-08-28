import { ArrowUpRight, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiData {
  totalAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
  activeCasesCount: number;
  currency?: string;
}

interface KpiStripProps {
  data?: KpiData;
  isLoading?: boolean;
}

export function KpiStrip({ data, isLoading }: KpiStripProps) {
  const currencySymbol = data?.currency === "INR" ? "₹" : "$";
  const atRisk = data?.totalAtRisk ?? 0;
  const recovered = data?.totalRecovered ?? 0;
  const rate = data?.recoveryRate ?? 0;
  const activeCount = data?.activeCasesCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total At Risk */}
      <Card className="bg-card/50 border-amber-500/20 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-amber-500/80" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue At Risk
            </span>
            <div className="size-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-foreground">
              {currencySymbol}{atRisk.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">Under Monitoring</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Recovered */}
      <Card className="bg-card/50 border-emerald-500/20 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500/80" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Measured Recovered
            </span>
            <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-emerald-600">
              {currencySymbol}{recovered.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center">
              <ArrowUpRight className="size-3 mr-0.5" />
              Verified
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Rate */}
      <Card className="bg-card/50 border-blue-500/20 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-blue-500/80" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Success Rate
            </span>
            <div className="size-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-foreground">
              {rate.toFixed(1)}%
            </div>
            <span className="text-[11px] text-muted-foreground">Overall ROI</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Interventions */}
      <Card className="bg-card/50 border-border/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-primary/40" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Cases In Flight
            </span>
            <div className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-foreground">
              {activeCount}
            </div>
            <span className="text-[11px] text-muted-foreground">Bounded Executions</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
