# AGENTS.md

## Source of truth
Read in this order before doing any work: `PRD.md` (what/why), `DESIGN.md` (UI/UX — read before any frontend work), `plans/PLANS.md` (status table), then the specific numbered plan in `plans/`. Work one plan at a time, in order.

## Ground rules
- Don't invent scope, dependencies, or design choices that aren't named in the current plan — stop and ask.
- Clean code: no dead code, no premature abstraction, no half-finished implementations.
- All LLM API keys (Grok/Mistral/Gemini) and DB/Inngest credentials are read server-side only (route handlers / Inngest functions) — never shipped to the client.
- shadcn/ui and the `impeccable` skill are installed local to this project only, never globally.

## Git workflow
One commit per finished, verified step group. Commit message format: `<plan-number>: <short lowercase description>` — no Conventional Commit prefixes (`feat:`, `fix:`, etc.), no "step group" wording. Never amend, rebase, or force-push without being explicitly asked.

## Stop conditions
Stop and ask before proceeding if: a plan's drift-check fails, a step implies a dependency not named in the plan, a requirement is ambiguous, or you're about to touch secrets/deploy config outside the current plan's stated scope.
