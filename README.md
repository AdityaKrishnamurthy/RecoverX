# ⚡ AI Revenue Recovery Agent

> **Autonomous FinOps Recovery Agent** that detects revenue at risk, determines the optimal intervention using LLM-assisted forensic diagnosis, and executes bounded recovery workflows — across payment retries, abandoned checkouts, failed subscriptions, and overdue B2B receivables. Built for the **Razorpay Buildathon: AI Revenue Recovery Track**.

---

## 🎯 The Problem & The Solution

Revenue loss rarely happens in one clean step:
1. **Payment Failures**: Transient network timeouts vs expired cards vs issuer velocity limits.
2. **Checkout Drop-offs**: Price friction vs missing local payment methods (UPI/Wallets).
3. **Subscription Failures**: Expired cards vs insufficient balances vs revoked auto-debit mandates.
4. **B2B Receivables Delinquency**: Overdue aging invoices with uncaptured promise-to-pay commitments.

Traditional systems either spam customers blindly or fail to intervene. **AI Revenue Recovery** closes the loop with an autonomous 6-step lifecycle:
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
cd "AI Revenue Recovery"
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

See **`PROJECT-TEST.md`** (local only, not in this repo listing) for a plain-language walkthrough of what the project does and a manual test checklist.

---

## 🎬 4-Minute Demo Walkthrough Script

### Workflow 1: Payment Degradation Retry
1. Navigate to `/queue`. Filter by **Payment Retries**.
2. Notice cases diagnosed with `network_timeout` vs `insufficient_funds`.
3. Open Case Detail: Inspect how the agent applied a 300s jittered backoff for transient acquirer timeouts and recovered $480.00.

### Workflow 2: Checkout Drop-off Recovery
1. Filter by **Checkout Drop-offs**.
2. Open a case abandoned at `shipping_calculation`.
3. Inspect how the agent diagnosed price friction and dispatched a 10% coupon code (`RECOVER10`), converting the abandoned cart into net recovered revenue.

### Workflow 3: Subscription Dunning & Card Update
1. Filter by **Subscription Failures**.
2. Cases with `card_expired` trigger a non-disruptive card update link (`REQUEST_CARD_UPDATE`) without spamming payment gateways with repeat hard declines.

### Workflow 4: B2B Receivables & Promise-to-Pay
1. Filter by **B2B Receivables**.
2. Inspect aging buckets (15 days vs 65 days).
3. 30-day overdue cases capture a **Promise-to-Pay** commitment date, while 60+ day high-value cases execute a compliant **Human Ops Escalation**.

### Live Ingestion & Replay
- Click **"Simulate Signal"** in the top header to fire a live simulated event into `/api/events` and watch it appear in the queue within seconds!
- Click **"Export JSON / CSV"** in `/audit` to download the entire forensic ledger.

---

## 📄 License & Attribution
Built for the Razorpay Buildathon 2026. Code under the [MIT License](./LICENSE).
