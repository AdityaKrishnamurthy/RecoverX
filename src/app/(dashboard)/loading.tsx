import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 max-w-7xl w-full mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 w-64 bg-muted/70 rounded-lg" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card/40">
            <CardContent className="p-5 space-y-3">
              <div className="h-3 w-28 bg-muted/80 rounded" />
              <div className="h-7 w-36 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-border/50 bg-card/40">
        <CardHeader className="p-6 pb-4">
          <div className="h-5 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 w-full bg-muted/40 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
