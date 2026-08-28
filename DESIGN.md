# DESIGN.md — AI Revenue Recovery

> This document is the pre-build UI/UX direction. It will be re-derived and finalized from the shipped UI by the `impeccable` skill's documenter step during Plan 007 — treat it as a brief, not a locked spec.

## Overview
A data-dense, trustworthy "fintech ops" dashboard. The product must make risk and recovered money legible at a glance — every number on screen should feel traceable and auditable, not decorative.

## Colors
Semantic risk/status palette over a neutral base:
- **Amber** — at-risk / diagnosing
- **Red** — escalated / critical / stopped
- **Green** — recovered
- **Blue** — in-progress / intervening

Exact hex values, tints, and dark-mode pairing to be finalized with the `dataviz` and `impeccable` skills during Plan 007/008 — don't hardcode a palette here.

## Typography
Clean sans (e.g. Inter or Geist). Tabular figures (`font-variant-numeric: tabular-nums`) for all money and metric values so they align in tables and KPI cards.

## Layout
Sidebar navigation: Queue, Case Detail, Analytics, Audit Trail. Top KPI strip on the Queue view: total at-risk, total recovered, recovery rate, active cases.

## Key Screens
- **Case Queue** — filterable/sortable table of all cases (by type, status, amount, risk).
- **Case Detail** — full timeline of a single case: detect → diagnose → intervene → outcome, sourced from its audit trail.
- **Analytics** — recovered-money-over-time and by-workflow-type breakdowns.
- **Audit Trail** — full log viewer with export, per case or per batch.

## Components
shadcn/ui as the base primitive set: `Table`/`DataTable`, `Badge` (for status/severity, using variants rather than ad-hoc colors), `Card` (KPI tiles), `Tabs`, `Sheet`/`Drawer` (case detail), plus a chart wrapper for analytics.

## Do's and Don'ts
- **Do** make every number on a KPI card or chart traceable back to a specific audit trail entry.
- **Don't** invent chart types or ad-hoc colors outside the `dataviz` skill's guidance when that work happens in Plan 008.
- **Don't** let the UI imply a real payment/message was sent — simulated actions should read as clearly simulated in any exported audit record, honestly labeled.
