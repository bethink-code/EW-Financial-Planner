# Checkpoint — 2026-05-07

State of the codebase at the close of this session. Pick this up tomorrow.

## Where we are

- Pre-existing cleanup pass landed earlier (commits `d9a1cc6a`, `5d372e91` on `main`, pushed to GitHub).
- Retirement need MVP landed locally (commit `aeda8e2e`, **not pushed**).
- Framework migration — DEL + Retirement on the same self-contained-needs pattern — landing in this commit, **also not pushed**.

Local commits ahead of `origin/main`: 2 (retirement MVP + framework migration).
Tag `prototype-v1` already pushed — that's the immutable pre-cleanup reference point.

## What's working

- Two financial-planning needs render end-to-end: **Death with estate liquidity** (mock-data Project) and **Retirement** (live projection engine).
- Both needs use one framework — `client/src/needs/_framework/` — sharing chrome, action bar, smart-landing.
- Each need is self-contained: own config, own URLs (`/needs/<id>/...`), own page tree.
- Plan dashboard's Retirement card pulls live numbers from `/api/retirement-projection/:planId`. DEL's card still uses mock JSON in the schema.
- Retirement projection engine: 27 vitest tests passing, pure functions in `shared/retirement-calculations.ts`.
- Schema additions pushed to **dev DB**. Prod DB push outstanding.

## Open before next deploy

| Item | Why it matters | Where |
|---|---|---|
| **Prod DB schema push** | Vercel will 500 on retirement endpoints until tables exist | `DATABASE_URL="<prod>" npx drizzle-kit push` |
| **GitHub push** | 2 local commits not on `main` yet | `git push origin main` |

## Deferred (intentional, non-blocking for MVP)

1. **Surfacing projection inputs on existing forms.** Retirement Funds, Defined Benefit Funds, Voluntary Investments forms don't yet expose the new `monthlyContribution` / `contributionEscalation` / `growthRate` columns. Defaults work (10% growth, R 0 contribution) so the projection runs, but the values can only be edited via DB until the form UIs are updated. *Touchpoints: `client/src/components/{retirement-funds,defined-benefit-funds,voluntary-investments}/*-detail-form.tsx`.*
2. **Plan-scoped routing.** `planId = 1` is hardcoded in retirement pages and the framework's `NeedLayout` (matching the existing convention). Replace when the chrome learns the current plan.
3. **DEL on live projection data.** DEL's project tab and plan-dashboard summary card use hardcoded numbers. The pattern for live data is in retirement; DEL can adopt it. *Touchpoints: `client/src/pages/needs/death-estate-liquidity/project.tsx`, `financial-plan-summary.tsx`.*
4. **Per-vehicle contribution split** in retirement Implement step. Currently we recommend a single monthly top-up; the legacy reference splits across retirement funds + voluntary investments with per-vehicle tax/growth/escalation.
5. **Tax handling at retirement.** `autoCalculateTax` flag is plumbed but the engine treats taxRate as a per-row input only — no SA tax bracket tables, no RA contribution deduction logic.
6. **The other 10 needs.** Death, Permanent disability, Temporary disability, Dread disease, Lump sum & recurring investment, Portfolio comparison, Contribution & income analysis, Saving for a future need, Income from capital, Debt repayment — all still placeholder stubs.

## Architecture you'll want to re-read tomorrow

- **`client/src/needs/README.md`** — the framework contract + how-to-add-a-need.
- **`client/src/needs/_framework/`** — types, flatten, NeedLayout, NeedActionBar, landing helper.
- **`client/src/needs/retirement/config.ts`** — example of a flat (no-children) need config.
- **`client/src/needs/death-estate-liquidity/config.ts`** — example with nested `section.children` (Setup→Parameters→[Residue, Additional estate duty]; Build→Retirement Funds→[Retirement funds, Defined benefit]; etc.).
- **`shared/retirement-calculations.ts`** + **`*.test.ts`** — pure projection engine, the model for any future need that projects.

## How to run

```bash
npm run dev          # auto-frees port 5000, starts the server
npm test             # vitest run
npm run build:vercel # production build + bundle api/index.js
```

## Open architectural questions to think on

- **Plan ID propagation.** The framework currently hardcodes planId=1. Two cleanish options: (a) carry it in URLs (`/needs/<id>/<planId>/...`), (b) set it once in a context provider when the user enters from a plan dashboard. (b) is less URL noise.
- **DEL migration to live data.** Should DEL's `/api/del-projection/:planId` mirror retirement's projection endpoint — server-side aggregator + pure-function engine? If yes, what existing inline calc lives in `client/src/pages/needs/death-estate-liquidity/project.tsx` should move into `shared/del-calculations.ts`?
- **Smart-landing readiness for DEL.** Right now DEL's smart-landing is hardcoded `ready=true` (always lands on Project). Replace when DEL has a real projection endpoint.
- **Should the projection input columns be split off from the existing `retirementFunds` table** into a separate retirement-specific table, or stay as additional columns? Current shape: additional columns on the existing table (chosen because retirement and DEL share the same fund records — it's the same physical fund being modelled differently).

## Tags / refs

- `prototype-v1` (pushed) — pre-cleanup snapshot.
- (commit hash for framework refactor will land below the commit message).
