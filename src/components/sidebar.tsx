"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  FileText, 
  Sparkles,
  Zap,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const navigation = [
  { name: "Recovery Queue", href: "/queue", icon: Layers, badge: "Live" },
  { name: "Analytics & ROI", href: "/analytics", icon: BarChart3 },
  { name: "Audit Trail", href: "/audit", icon: FileText },
];

export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/queue"
      onClick={onNavigate}
      className="h-16 flex items-center gap-3 px-6 border-b border-border/50 shrink-0 transition-colors hover:bg-muted/40"
    >
      <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
        <Sparkles className="size-5" />
      </div>
      <div>
        <div className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
          RecoveryAgent
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            v1.0
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Autonomous FinOps</p>
      </div>
    </Link>
  );
}

export function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Core Workflows
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("size-4.5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-semibold tracking-wide",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-emerald-500/15 text-emerald-600 border-none"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-border/50 bg-muted/20 shrink-0">
        <div className="rounded-lg p-3 border border-border/60 bg-background/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Activity className="size-3.5 text-emerald-500 animate-pulse" />
              Agent Engine
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Autonomous
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Monitoring payments, drop-offs, subscriptions & receivables.
          </p>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 border-r border-border/60 bg-card/60 backdrop-blur-md flex-col h-screen sticky top-0 shrink-0 select-none">
      <SidebarBrand />
      <SidebarNavContent />
    </aside>
  );
}
