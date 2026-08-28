"use client";

import { ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}
