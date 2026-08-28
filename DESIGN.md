# DESIGN.md — AI Revenue Recovery (Shipped Design Specification)

Derived and finalized by the `impeccable` design system review for fintech operations.

## Overview
A high-density, authoritative FinOps autonomous recovery interface. Every metric on screen connects to immutable audit trail events.

## Color System
- **Emerald** (`#10b981` / `emerald-600` / `bg-emerald-500/15`): Measured revenue recovered, kept promises, verified capture.
- **Amber** (`#f59e0b` / `amber-600` / `bg-amber-500/15`): At-risk revenue, signal diagnosis in flight, 0-30 day aging.
- **Blue** (`#3b82f6` / `blue-600` / `bg-blue-500/15`): Active intervening workflows, scheduled retries, overall ROI rate.
- **Rose** (`#f43f5e` / `rose-600` / `bg-rose-500/15`): Escalated high-exposure cases, human ops intervention required.
- **Slate** (`#64748b` / `slate-500`): Bounded execution stops, max-attempts enforcement, neutral secondary text.

## Typography
- **Primary Font**: Geist Sans, self-hosted via `next/font/google` and bound through `--font-geist-sans` → `--font-sans`. KPI figures use `font-extrabold`; primary table/data content sits at `text-sm`/`font-semibold` rather than `text-xs`, reserving `text-xs` for column headers, badges, and secondary metadata.
- **Data & Numbers**: Geist Mono with `tabular-nums` (`font-variant-numeric: tabular-nums`) applied across all tables, KPI strips, currency values, and timestamps for alignment.

## Theming
- Light and dark themes both fully defined in `globals.css` (`:root` / `.dark`), toggled via `next-themes` (`attribute="class"`, `defaultTheme="system"`). `ThemeToggle` (Sun/Moon/System dropdown) lives in the persistent `Header`, present on every dashboard route.
- Next.js's dev-mode route indicator is disabled (`devIndicators: false` in `next.config.ts`) so it never overlaps the UI.

## Core Component Hierarchy
1. **Sidebar (`Sidebar`)**: Sticky navigation with live workflow badges, real-time agent status monitor. Hidden below `lg`; replaced by `MobileNav`, a hamburger-triggered `Sheet` sharing the same nav content (`SidebarNavContent`) so desktop and mobile stay in sync.
2. **KPI Strip (`KpiStrip`)**: 4-card metric overview (Total At-Risk, Measured Recovered, Agent Success Rate, Active In-Flight Cases).
3. **Case Queue (`CaseTable`)**: Full DataTable with search, multi-workflow filtering, status filtering, and dual-axis sorting.
4. **Forensic Timeline (`CaseTimeline`)**: Chronological audit nodes with actor indicators (`AGENT` / `SYSTEM`), root-cause diagnosis insights, and expandable forensic JSON payloads.
5. **Detail Profile**: Account breakdown, risk score visualization, and Promise-to-Pay tracking.

## Compliance & Honesty Guarantees
- All simulated executions explicitly bear the `[SIMULATED]` forensic label in audit records and badges.
- All stopping rules display concrete attempt bounds.

## Component Behavior Notes
- `Select` (`components/ui/select.tsx`) defaults to `modal={false}`. Base UI's Select is modal by default, which fights an ancestor `Dialog`'s own modal focus trap when nested (e.g. the "Simulate Signal" form) and breaks the popup's rendering/interaction. Non-modal is correct for every current usage; pass `modal` explicitly on a future case that truly needs it.
