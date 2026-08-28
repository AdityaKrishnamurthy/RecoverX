"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Bot, 
  Cpu, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCode2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuditLogItem {
  id: string;
  caseId: string;
  actor: string;
  action: string;
  detail: string;
  createdAt: string | Date;
}

interface CaseTimelineProps {
  logs: AuditLogItem[];
  caseType?: string;
}

export function CaseTimeline({ logs }: CaseTimelineProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getActionMeta = (action: string) => {
    switch (action) {
      case "SIGNAL_DETECTED":
      case "SIGNAL_INGESTED":
        return {
          label: "Signal Detected",
          color: "border-amber-500/40 bg-amber-500/10 text-amber-600",
          icon: AlertCircle,
        };
      case "DIAGNOSIS_COMPLETED":
        return {
          label: "AI Diagnosis & Root Cause Analysis",
          color: "border-purple-500/40 bg-purple-500/10 text-purple-600",
          icon: Sparkles,
        };
      case "INTERVENTION_CHOSEN":
      case "CARD_UPDATE_REQUESTED":
      case "REMINDER_DISPATCHED":
      case "INCENTIVE_OFFERED":
        return {
          label: "Bounded Intervention Dispatched",
          color: "border-blue-500/40 bg-blue-500/10 text-blue-600",
          icon: Clock,
        };
      case "REVENUE_RECOVERED":
        return {
          label: "Money Successfully Recovered",
          color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
          icon: CheckCircle2,
        };
      case "HUMAN_ESCALATION_DISPATCHED":
        return {
          label: "Escalated to Human Ops",
          color: "border-rose-500/40 bg-rose-500/10 text-rose-600",
          icon: ShieldAlert,
        };
      case "STOPPING_RULE_TRIGGERED":
        return {
          label: "Stopping Rule Enforced (Halt)",
          color: "border-slate-500/40 bg-slate-500/10 text-slate-600",
          icon: ShieldAlert,
        };
      default:
        return {
          label: action.replace(/_/g, " "),
          color: "border-border bg-muted text-foreground",
          icon: Bot,
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-border/70">
      {sortedLogs.map((log, index) => {
        const meta = getActionMeta(log.action);
        const isExpanded = !!expandedLogs[log.id];

        let parsedDetail: Record<string, any> = {};
        try {
          parsedDetail = typeof log.detail === "string" ? JSON.parse(log.detail) : log.detail;
        } catch {
          parsedDetail = { raw: log.detail };
        }

        const date = new Date(log.createdAt);
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return (
          <div key={log.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={cn(
                "absolute -left-[30px] top-1 size-8 rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                meta.color
              )}
            >
              <meta.icon className="size-4" />
            </div>

            {/* Event Box */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground tracking-tight">
                    {meta.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 font-medium",
                      log.actor === "AGENT"
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {log.actor}
                  </Badge>
                  {parsedDetail.simulated && (
                    <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-slate-500 border-slate-500/20">
                      Simulated Action
                    </Badge>
                  )}
                </div>

                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {formattedDate}, {formattedTime}
                </span>
              </div>

              {/* Summary Description */}
              {parsedDetail.summary && (
                <p className="text-xs text-foreground/90 mt-2 font-medium">
                  {parsedDetail.summary}
                </p>
              )}

              {/* Diagnosis Details */}
              {parsedDetail.rootCause && (
                <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Diagnosed Root Cause
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Confidence: {Math.round((parsedDetail.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {parsedDetail.rootCause}
                  </p>
                  {parsedDetail.reasoning && (
                    <p className="text-[11px] text-muted-foreground italic mt-1">
                      Reasoning: {parsedDetail.reasoning}
                    </p>
                  )}
                  {parsedDetail.provider && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
                      <Cpu className="size-3" />
                      Inferred via {parsedDetail.provider} ({parsedDetail.modelName || "model"}) in {parsedDetail.latencyMs || 0}ms
                    </div>
                  )}
                </div>
              )}

              {/* Outcome or Reason */}
              {parsedDetail.message && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/30 p-2.5 rounded-md border border-border/40">
                  {parsedDetail.message}
                </p>
              )}

              {/* Expandable JSON Payload explorer */}
              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(log.id)}
                  className="text-[11px] h-7 text-muted-foreground hover:text-foreground gap-1 px-2 -ml-2"
                >
                  <FileCode2 className="size-3" />
                  {isExpanded ? "Hide Forensic Data" : "Inspect Raw Forensic Event"}
                  {isExpanded ? <ChevronUp className="size-3 ml-0.5" /> : <ChevronDown className="size-3 ml-0.5" />}
                </Button>
              </div>

              {isExpanded && (
                <pre className="mt-2 p-3 rounded-lg bg-zinc-950 text-zinc-200 text-[11px] font-mono overflow-x-auto border border-zinc-800 leading-normal max-h-64">
                  {JSON.stringify(parsedDetail, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
