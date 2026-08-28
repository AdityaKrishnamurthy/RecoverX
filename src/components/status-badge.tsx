import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert,
  CreditCard,
  ShoppingCart,
  Repeat,
  FileSpreadsheet
} from "lucide-react";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  switch (status) {
    case "RECOVERED":
      return (
        <Badge className={cn("bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 gap-1 font-medium text-xs", className)}>
          <CheckCircle2 className="size-3 text-emerald-600" />
          Recovered
        </Badge>
      );
    case "INTERVENING":
      return (
        <Badge className={cn("bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 gap-1 font-medium text-xs", className)}>
          <Clock className="size-3 text-blue-600 animate-spin" />
          Intervening
        </Badge>
      );
    case "DIAGNOSING":
      return (
        <Badge className={cn("bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 gap-1 font-medium text-xs", className)}>
          <AlertCircle className="size-3 text-amber-600 animate-pulse" />
          Diagnosing
        </Badge>
      );
    case "ESCALATED":
      return (
        <Badge className={cn("bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 gap-1 font-medium text-xs", className)}>
          <ShieldAlert className="size-3 text-rose-600" />
          Escalated
        </Badge>
      );
    case "STOPPED":
      return (
        <Badge className={cn("bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30 gap-1 font-medium text-xs", className)}>
          <XCircle className="size-3 text-slate-500" />
          Stopped (Max Limits)
        </Badge>
      );
    case "DETECTED":
    default:
      return (
        <Badge className={cn("bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1 font-medium text-xs", className)}>
          <AlertTriangle className="size-3 text-amber-500" />
          Detected
        </Badge>
      );
  }
}

export function WorkflowTypeBadge({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "PAYMENT_RETRY":
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20", className)}>
          <CreditCard className="size-3" />
          Payment Retry
        </span>
      );
    case "CHECKOUT_ABANDONMENT":
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20", className)}>
          <ShoppingCart className="size-3" />
          Checkout Drop-off
        </span>
      );
    case "SUBSCRIPTION_FAILURE":
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20", className)}>
          <Repeat className="size-3" />
          Subscription Failure
        </span>
      );
    case "RECEIVABLE_OVERDUE":
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20", className)}>
          <FileSpreadsheet className="size-3" />
          B2B Receivables
        </span>
      );
    default:
      return <span className={cn("text-xs text-muted-foreground", className)}>{type}</span>;
  }
}
