"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  ArrowUpDown, 
  ExternalLink, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatusBadge, WorkflowTypeBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

export interface CaseRow {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  riskScore: number;
  diagnosis: string | null;
  diagnosisConfidence: number | null;
  recoveredAmount: number | null;
  recoveredAt: string | Date | null;
  createdAt: string | Date;
  customer: {
    name: string;
    email: string;
    segment: string;
  };
}

interface CaseTableProps {
  initialCases: CaseRow[];
}

const WORKFLOW_FILTER_LABELS: Record<string, string> = {
  ALL: "All Workflows",
  PAYMENT_RETRY: "Payment Retries",
  CHECKOUT_ABANDONMENT: "Checkout Drop-offs",
  SUBSCRIPTION_FAILURE: "Subscription Failures",
  RECEIVABLE_OVERDUE: "B2B Receivables",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "All Statuses",
  RECOVERED: "Recovered",
  INTERVENING: "Intervening",
  DIAGNOSING: "Diagnosing",
  ESCALATED: "Escalated",
  STOPPED: "Stopped",
  DETECTED: "Detected",
};

export function CaseTable({ initialCases }: CaseTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"amount" | "riskScore" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = (field: "amount" | "riskScore" | "createdAt") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredCases = useMemo(() => {
    return initialCases
      .filter((c) => {
        const matchesSearch =
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          c.customer.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.diagnosis && c.diagnosis.toLowerCase().includes(search.toLowerCase()));

        const matchesType = typeFilter === "ALL" || c.type === typeFilter;
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "createdAt") {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [initialCases, search, typeFilter, statusFilter, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Controls Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/40 p-3.5 rounded-xl border border-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search cases, customers, reasons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
            <SelectTrigger className="h-10 text-sm w-44 bg-background">
              <SelectValue>
                {(val: string) => WORKFLOW_FILTER_LABELS[val] ?? val}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-auto min-w-56">
              <SelectItem value="ALL">All Workflows</SelectItem>
              <SelectItem value="PAYMENT_RETRY">Payment Retries</SelectItem>
              <SelectItem value="CHECKOUT_ABANDONMENT">Checkout Drop-offs</SelectItem>
              <SelectItem value="SUBSCRIPTION_FAILURE">Subscription Failures</SelectItem>
              <SelectItem value="RECEIVABLE_OVERDUE">B2B Receivables</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="h-10 text-sm w-36 bg-background">
              <SelectValue>
                {(val: string) => STATUS_FILTER_LABELS[val] ?? val}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-auto min-w-40">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="RECOVERED">Recovered</SelectItem>
              <SelectItem value="INTERVENING">Intervening</SelectItem>
              <SelectItem value="DIAGNOSING">Diagnosing</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
              <SelectItem value="STOPPED">Stopped</SelectItem>
              <SelectItem value="DETECTED">Detected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-32 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground">Case ID</TableHead>
              <TableHead className="w-44 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground">Workflow</TableHead>
              <TableHead className="h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground">Customer</TableHead>
              <TableHead
                className="w-32 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  At Risk
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead
                className="w-32 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("riskScore")}
              >
                <div className="flex items-center justify-end gap-1">
                  Risk
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead className="w-36 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="w-28 h-11 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                  No cases found matching the active filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((c) => {
                const currencySym = c.currency === "INR" ? "₹" : "$";
                const riskPct = Math.round(c.riskScore * 100);

                return (
                  <TableRow key={c.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3.5 font-mono text-sm text-foreground font-semibold">
                      #{c.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <WorkflowTypeBadge type={c.type} />
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {c.customer.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {c.customer.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 text-right font-mono font-bold text-sm tabular-nums text-foreground">
                      {currencySym}{c.amount.toLocaleString()}
                      {c.recoveredAmount && (
                        <div className="text-xs text-emerald-600 font-medium">
                          +{currencySym}{c.recoveredAmount.toLocaleString()} rec.
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              riskPct > 70 ? "bg-rose-500" : riskPct > 40 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${riskPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                          {riskPct}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <StatusBadge status={c.status} />
                    </TableCell>

                    <TableCell className="py-3.5 text-right">
                      <Link href={`/queue/${c.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1 opacity-80 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          Details
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
