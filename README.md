# ⚡ RecoverX - Autonomous Payment Recovery Agent

> **Autonomous FinOps Recovery Agent** that detects revenue at risk, determines the optimal intervention using LLM-assisted forensic diagnosis, and executes bounded recovery workflows — across payment retries, abandoned checkouts, failed subscriptions, and overdue B2B receivables. Built for the **Razorpay Buildathon: AI Revenue Recovery Track**.

---

## 🎯 The Problem & The Solution

Revenue loss rarely happens in one clean step:
1. **Payment Failures**: Transient network timeouts vs expired cards vs issuer velocity limits.
2. **Checkout Drop-offs**: Price friction vs missing local payment methods (UPI/Wallets).
3. **Subscription Failures**: Expired cards vs insufficient balances vs revoked auto-debit mandates.
4. **B2B Receivables Delinquency**: Overdue aging invoices with uncaptured promise-to-pay commitments.

Traditional systems either spam customers blindly or fail to intervene. **RecoverX** closes the loop with an autonomous 6-step lifecycle:
$$\text{Detect} \longrightarrow \text{Diagnose} \longrightarrow \text{Decide} \longrightarrow \text{Execute} \longrightarrow \text{Recover/Escalate} \longrightarrow \text{Audit}$$

---

## 🏆 Compliance & "The Bar" (PRD Validation)

| Buildathon Bar Criterion | Platform Proof Point & Implementation |
|---|---|
| **Measured Money Recovered** | Live KPI strip & Analytics dashboard sum exact recovered dollars ($195,000+ across seeded cases). |
| **Stopping Rules Enforced** | All workflows enforce strict bounded attempts (max 3-4 tries), cool-down periods, and halt states (`STOPPED`). |
| **Immutable Audit Trail** | 100% trace completeness. Every model inference, provider latency, and simulated outcome is forensically logged with 1-click JSON/CSV export. |
| **Compliant Escalations** | High-exposure delinquency (60+ days) routes cleanly to Senior Human FinOps queues without automated spamming. |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, TypeScript, Server Components), Tailwind CSS v4, shadcn/ui, `next-themes` (dark/light).
- **Backend & APIs**: Next.js Route Handlers, Zod schema validation.
- **Database & ORM**: SQLite (local file at `prisma/dev.db`) with Prisma ORM.
- **Durable Orchestration**: Inngest durable functions (`step.run`, `step.sleep`, event triggers).
- **Multi-LLM Abstraction**: Vercel AI SDK unifying **Groq**, **Mistral**, **NVIDIA**, and **Google Gemini** with a live-tested fallback chain and a deterministic rule-based safety net.

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd RecoverX
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

The database is local SQLite, so `DATABASE_URL` doesn't need editing:
```env
DATABASE_URL="file:./dev.db"

# Inngest Workflow — "test"/"local-test" work fine for `inngest dev`
INNGEST_EVENT_KEY="local-test"
INNGEST_SIGNING_KEY="local-test"

# LLM Providers (Server-side only) — needed for real diagnosis/intervention calls.
# Tried in this order until one succeeds, falling back to deterministic rules
# if all are missing/unreachable: Groq -> Mistral -> NVIDIA -> Gemini.
GROQ_API_KEY="your-groq-key"
MISTRAL_API_KEY="your-mistral-key"
NVIDIA_API_KEY="your-nvidia-key"
GEMINI_API_KEY="your-gemini-key"
```

### 3. Initialize Database & Seed Batch
```bash
npx prisma db push
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive FinOps dashboard!

---

## 🧩 Challenges & Technical Obstacles

- **LLM provider reliability**: the initial single-provider setup turned out to be non-functional in practice; we rebuilt it as a live-tested fallback chain (Groq → Mistral → NVIDIA → Gemini → deterministic rules) after real API calls surfaced several already-EOL'd model IDs no documentation flagged.
- **Groq's strict JSON-schema mode** rejected Zod `.optional()` fields on structured-output calls — required switching those schema fields to `.nullable()`.
- **Nested modal focus traps**: shadcn/Base UI's `Select` is modal by default, which fought the enclosing `Dialog`'s own focus trap (e.g. the "Simulate Signal" form) and broke the dropdown entirely; fixed by defaulting `Select` to `modal={false}`.
- **Simplified persistence**: originally scoped against Postgres/Neon, moved to local SQLite so the demo is fully self-contained with no external database dependency.

---

## 📄 License & Attribution
Built for the Razorpay Buildathon 2026. Code under the [MIT License](./LICENSE).
