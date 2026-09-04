"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="hidden sm:block text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
