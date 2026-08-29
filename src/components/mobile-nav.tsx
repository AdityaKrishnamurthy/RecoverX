"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarBrand, SidebarNavContent } from "@/components/sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden text-muted-foreground hover:text-foreground -ml-1"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </Button>
      <SheetContent side="left" className="w-72 p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Recovery workflow navigation
        </SheetDescription>
        <SidebarBrand onNavigate={() => setOpen(false)} />
        <SidebarNavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
