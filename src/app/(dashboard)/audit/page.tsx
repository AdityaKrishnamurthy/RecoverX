import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Immutable Audit Trail"
        description="Inspect and export forensic logs for all agent interventions, compliance checks, and stopping rules."
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="size-3.5" />
          Export JSON / CSV
        </Button>
      </Header>

      <main className="p-8 space-y-6 flex-1">
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">System & Agent Event Logs</CardTitle>
            <CardDescription className="text-xs">
              Full trace of every signal received, model diagnosis, LLM provider reasoning, and simulated execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground text-sm">
              <FileText className="size-8 text-muted-foreground/50 mb-2" />
              Audit log viewer will be populated in Plan 008.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
