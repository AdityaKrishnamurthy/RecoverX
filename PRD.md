# PRD — AI Revenue Recovery

## Overview
An agent that detects revenue at risk, determines the right intervention, and executes a bounded recovery workflow — from payment failures and checkout abandonment to overdue receivables. Built for the Razorpay Buildathon "AI Revenue Recovery" track.

## Problem
Revenue loss rarely happens in one clean step: a payment degrades, a checkout gets abandoned, a subscription fails, or an invoice goes overdue. These signals are disconnected today. AI can close the loop — from detecting the problem, to diagnosing it, to choosing the right intervention, to recovering the money.

## Target User
A merchant or finance-ops team processing online payments/subscriptions/invoices, who wants revenue automatically chased and recovered without manual, ad-hoc follow-up.

## Core Loop
1. **Detect** — a signal arrives (payment failure, checkout abandonment, subscription charge failure, overdue invoice).
2. **Diagnose** — the agent determines root cause and confidence.
3. **Decide** — the agent picks the right intervention from an allowed action menu.
4. **Execute** — a bounded, durable workflow runs the intervention with retries, delays, and stopping rules.
5. **Recover / Escalate** — money is recovered, or the case is escalated on a compliant, staged path.
6. **Audit** — every step is logged to a full, exportable audit trail.

## In-Scope Recovery Workflows (MVP)
- **Payment degradation retry** — a payment fails or degrades (issuer decline, network error, etc.); the agent diagnoses the failure code, then retries with smart timing/an alternate method under a max-attempt stopping rule.
- **Checkout drop-off recovery** — a checkout is abandoned before completion; the agent diagnoses likely cause (price, friction, payment method) and sends a bounded nudge/incentive sequence.
- **Failed-subscription recovery** — a recurring charge fails; the agent diagnoses cause (expired card, insufficient funds) and retries or requests a card update, capped by a cool-down/attempt limit.
- **B2B receivables chaser** — an invoice goes overdue; the agent runs a compliant, staged reminder/escalation sequence and tracks promise-to-pay commitments (captured date + amount, marked kept/broken) as part of this workflow.

Mandate retry sequencing and Hinglish voice recovery are noted as post-MVP directions, not separate MVP tracks (see Out of Scope).

## Out of Scope (v1)
- Mandate retry sequencer and Hinglish voice recovery as standalone tracks.
- Real Razorpay webhook/API integration — MVP uses a simulated data generator.
- Real authentication / multi-tenancy — single open demo workspace.
- Real outbound email/SMS/voice sending — all channels are simulated executors that log realistic outcomes.

## Tech Stack
- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui (installed local to this project), polished with the `impeccable` skill. Deployed on Vercel.
- **Backend**: Next.js Route Handlers (monolith).
- **Database**: Postgres via Neon, Prisma ORM.
- **Workflow orchestration**: Inngest durable functions (retries, delays, stopping rules).
- **LLM calls**: Vercel AI SDK unifying xAI Grok, Mistral, and Google Gemini, all server-side only.

## Success Criteria / "The Bar"
- Dashboard shows **measured money recovered** across a seeded batch of cases.
- Every intervention respects a **stopping rule** (max attempts, cool-down, or opt-out).
- Every case has a complete, **exportable audit trail** from detection through outcome.
- Escalations follow a **compliant, staged sequence** — no spamming.

## Open Questions
- Real payment gateway (Razorpay live/test) integration — post-buildathon.
- Real messaging channels (email/SMS/WhatsApp/voice) — post-buildathon.
- Multi-tenant auth — post-buildathon, if this moves beyond a demo.
