import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Analytics & Measured ROI"
        description="Recovered revenue over time, conversion breakdown by workflow, and stopping-rule efficacy."
      />

      <main className="p-8 space-y-6 flex-1">
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recovery Performance by Workflow</CardTitle>
            <CardDescription className="text-xs">
              Comparison across Payment Retries, Abandoned Checkouts, Subscriptions, and Receivables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground text-sm">
              <BarChart3 className="size-8 text-muted-foreground/50 mb-2" />
              Analytics charts will be populated in Plan 008.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
