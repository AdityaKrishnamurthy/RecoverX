"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary]:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-rose-500/30 bg-rose-500/5 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="size-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle className="text-base font-semibold text-rose-700 dark:text-rose-400">
            Pipeline Query Interrupted
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {error.message || "An unexpected error occurred while querying the revenue recovery database."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Button onClick={() => reset()} size="sm" className="gap-2 text-xs bg-rose-600 hover:bg-rose-500 text-white">
            <RefreshCw className="size-3.5" />
            Retry Query
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
