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
- **Primary Font**: Geist Sans / Inter for razor-sharp legibility.
- **Data & Numbers**: Geist Mono with `tabular-nums` (`font-variant-numeric: tabular-nums`) applied across all tables, KPI strips, currency values, and timestamps for alignment.

## Core Component Hierarchy
1. **Sidebar (`Sidebar`)**: Sticky navigation with live workflow badges, real-time agent status monitor.
2. **KPI Strip (`KpiStrip`)**: 4-card metric overview (Total At-Risk, Measured Recovered, Agent Success Rate, Active In-Flight Cases).
3. **Case Queue (`CaseTable`)**: Full DataTable with search, multi-workflow filtering, status filtering, and dual-axis sorting.
4. **Forensic Timeline (`CaseTimeline`)**: Chronological audit nodes with actor indicators (`AGENT` / `SYSTEM`), root-cause diagnosis insights, and expandable forensic JSON payloads.
5. **Detail Profile**: Account breakdown, risk score visualization, and Promise-to-Pay tracking.

## Compliance & Honesty Guarantees
- All simulated executions explicitly bear the `[SIMULATED]` forensic label in audit records and badges.
- All stopping rules display concrete attempt bounds.
