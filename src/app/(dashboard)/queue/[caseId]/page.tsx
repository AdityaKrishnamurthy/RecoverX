import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`Case #${caseId.slice(0, 8)}`}
        description="Full audit trail: Signal Detection → AI Diagnosis → Bounded Intervention → Outcome."
      >
        <Link href="/queue">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="size-3.5" />
            Back to Queue
          </Button>
        </Link>
      </Header>

      <main className="p-8 space-y-6 flex-1">
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recovery Timeline & Audit Trail</CardTitle>
            <CardDescription className="text-xs">
              Every step, decision reason, and stopping-rule evaluation is immutably logged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
              Timeline component will be populated in Plan 007.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
