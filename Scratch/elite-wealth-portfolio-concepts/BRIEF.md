# Build Brief — Elite Wealth Portfolio Dashboard Concepts

**Project:** Elite Wealth (elitewealth.biz) — portfolio section redesign, concept exploration phase
**Deliverable:** An interactive concept deck presenting three design directions for the portfolio landing page, to be demonstrated to the client so they can choose a direction.
**Audience of the product:** Financial advisers in South Africa doing financial planning for their clients. This is an adviser tool, not a client-facing app.
**Reference prototype:** `reference-prototype.html` (single-file HTML prototype, included in this package) — use as the functional reference for layout, content, and interactions. This brief is the source of truth where they differ.

---

## 1. Context

Elite Wealth is wealth-management software used by advisers across South African banks and FSPs. The agency is redesigning it section by section; the current focus is the **portfolio section** — specifically what an adviser sees when they open a client and click "Portfolio".

The core adviser question the page must answer: **"Is this client on track with what we're trying to achieve together?"** — not just "what does this client own?"

### The three-level architecture

1. **Level 1 — Portfolio dashboard.** The landing snapshot. This is the main subject of the concepts.
2. **Level 2 — Slide-in detail panel.** An intermediate layer between dashboard and full product detail. Opens over the dashboard (right-hand slide-in), never navigates away.
3. **Level 3 — Full product detail.** The existing deep tab set per product: Details, Roles, Benefits, Values, Transactions, Structure, Status, Ongoing fees, Fees on premiums, Commspace, Asset split. **Unchanged and out of scope** — represented only as placeholder links from every Level 2 panel.

### Research grounding (informs the concepts; summarise in the deck intro if space allows)

Advisers look at a client portfolio through several lenses: holdings (what they own), plan/purpose (what the money is for, on/off track — the strongest industry trend, "goals-based planning"), protection gaps, review/compliance readiness (FAIS six-step process; step 6 is ongoing monitoring), change since last review, data hygiene, and household. The platform **already captures product purpose** (Emergency, Retirement, Saving for a goal: Education / Holiday / Other / Property / Vehicle) on each product — the concepts put this dormant data to work.

**Key decision from review with the client lead:** review readiness / attention items are **not a standalone concept** — they are a parallel layer integrated into every concept, expressed at different volumes.

---

## 2. The three concepts

All three share: the Elite Wealth product chrome (client bar + nav strip), Ben Meander demo data, the Level 2 slide-in panel system, and the attention layer. They differ in which lens leads.

### Concept A — "At a glance" (holdings-first, elevated)

The familiar category-grouped table, elevated into a scannable snapshot. Lowest change cost; existing mental models survive.

- **KPI band** (4 cards): Total investments `R 3 031 961` (4 products · 8 funds) · Monthly premiums `R 17 300` (Risk R 7 200 · Medical R 6 700 · Short term R 3 400) · Monthly contributions `R 7 500` (Company Pension Fund) · Next review `07 Oct 2026` (last reviewed 07/10/2025).
- **Attention strip** (see §3) directly under the KPI band.
- **Household filter chips:** Ben Meander (on), Shadow — spouse (on), Fudge — child (off), Family Trust (off); plus "In force only ✓" and currency selector on the right.
- **Category sections** as tables: Investments, Risk, Medical aid & short term. Columns: instrument, category, supplier, premium/income, current value, valuation date with a **freshness dot** (green ≤ 12 months, amber 1–3 years, red > 3 years). Risk rows get status pills ("In force", "Benefits not captured").
- **Row click** → Level 2 product snapshot panel.

### Concept B — "Plan view" (goals/purpose-first)

The portfolio organised around what the money is *for*, using the existing Product purpose field. Gaps are first-class objects.

- **Goal cards** in a responsive grid, each clickable → Level 2 goal panel:
  - **Retirement** — age 65, 14 yrs to go, 2 products. `R 2 071 961`, 24% of R 8.5m target, contributing R 7 500 p.m. Pill: "Behind target" (amber). **Inline reliability flag:** "⚠ Position unreliable — both valuations are 6 years old."
  - **Education — Fudge** — 2031, 1 product. `R 500 000`, 67% of R 750k target, no regular contribution. Pill: "On track" (green).
  - **Protection** — 5 products, `R 17 300 p.m.` Pill: "Cover not analysed" (amber). Foot: "Benefit amounts missing on 1 of 3 life policies."
  - **Emergency fund** — gap card (dashed red border): no products assigned, `R 0`, "≈ R 160k recommended (3 months' expenses)." Pill: "Gap" (red).
  - **Not yet assigned** — dashed card: ABSA Share portfolio `R 460 000`, no purpose captured. Pill: "Assign". Click → purpose-assignment panel. **This demonstrates graceful degradation** when purpose data is missing.
- **Attention strip** phrased in plan language: "Retirement is built on two 6-year-old valuations, and R 460k sits outside the plan."
- Below the grid: "All products — the full category view stays one click away" + a "View by product category →" button (placeholder).

### Concept C — "Command centre" (plan + holdings + persistent attention rail)

Doesn't choose between lenses. The most complete answer — and the densest. Two-column layout (~8/4 split, stacking on narrow screens).

- **Main column:**
  - **Mini plan strip:** 4 compact goal cards (Retirement R 2.07m amber, Education R 500k green, Protection R 17 300 p.m. amber, Emergency R 0 red-dashed), each with a thin progress bar and status dot, clickable → goal panels.
  - **Holdings table** with a **Purpose column** (showing the assignment, or a neutral "Not set" pill), values, freshness dots. Rows clickable → product panels.
  - **"Since last review · 07 Oct 2025"** card: ABSA revalued +R 460 000 (06/10/2025) · Asset split loaded — du Preez Rassie 100% (07/10/2025) · No transactions captured 10/03–10/06/2026.
- **Right rail (persistent):**
  - **Review readiness card:** a conic-gradient progress ring at 45%, "Review due 07 Oct 2026", "5 of 11 checks passing."
  - **Needs attention queue** — 6 items (see §3), each clickable → an action panel.
  - **Live interaction:** resolving an item in its panel marks the queue item done (strikethrough, "Done ✓") and increments the readiness ring by 9 points per item, turning green at ≥ 70%. This moment matters in the client demo — keep it.

---

## 3. The attention layer (shared, parallel — never a standalone screen)

The same six underlying issues surface in all three concepts, at different volumes:

| # | Severity | Issue | Action panel |
|---|----------|-------|--------------|
| 1 | High | Valuation 6 years old — Company Pension Fund (R 980 000 on 08/04/2020) | Quick value update form |
| 2 | High | Valuation 6 years old — Momentum International (R 1 091 961 on 08/04/2020) | Quick value update form |
| 3 | High | No life assured loaded — Liberty (to estate); cover analysis blocked | Select life assured |
| 4 | Med | Valuation 3 years old — Unit Trust (R 500 000 on 16/01/2023) | Quick value update form |
| 5 | Med | Product purpose not set — ABSA Share portfolio (R 460k outside the plan) | Purpose dropdown(s) |
| 6 | Med | Ongoing fees not configured — ABSA Share portfolio (all rows 0%) | Link to fee configuration (separate workstream) |

**Expressions per concept:**
- **A & B:** a slim amber **attention strip** (collapsible, "Show ▾ / Hide ▴") summarising the count + the single most important consequence + "Review readiness 45%". Expanding reveals the top 3 items as queue rows. B's copy is phrased in plan terms, A's in data terms.
- **B additionally:** inline reliability flags inside affected goal cards.
- **C:** the full queue as a persistent rail with the readiness ring.

**Principle to preserve:** an attention item always states its *consequence* ("affects Retirement goal & totals"), not just the fact. Saving from a Level 2 panel writes to the same data as the existing Level 3 tabs — Level 2 is a faster door, not a new database.

---

## 4. Level 2 slide-in panel system

- Slides in from the right, `min(520px, 94vw)`, over a dimming overlay. Close via ×, overlay click, or Escape. Smooth transform transition; respect `prefers-reduced-motion`.
- Header: teal background, kicker line ("Product snapshot" / "Goal · Level 2" / "Action · Level 2"), title.
- **Panel types:**
  1. **Product snapshot** (per product): key facts grid (category, supplier, value + date coloured by freshness, owner, purpose, status), fund list with values where applicable, fee status line, contextual warning notes.
  2. **Goal drill-in:** position grid (target, current, contributing, projected shortfall), progress bar, list of products serving the goal (with stale-data dots), reliability note, action buttons ("Adjust target", "Model contribution increase", "Capture benefits", "Run cover gap analysis" — placeholders).
  3. **Action / fix panels:** the six attention items — minimal forms (value + date inputs, dropdowns) with a Save button. In Concept C, Save triggers the resolve interaction.
- **Every panel ends with the Level 3 placeholder block:** a dashed box, "Level 3 — full product detail (existing screens, unchanged)", containing the 11 tab names as small link chips. The fix-fees and goal-emergency panels may omit or adapt this where it doesn't apply.

---

## 5. Demo data — Ben Meander (use exactly; from client's demo environment)

**Client:** Ben Meander · DEMO/1/1588 · Potential client · My Company · 51 years old · Married ANC with accrual. Household: Shadow Meander (spouse), Fudge Meander (child), Meander Family Trust.

**Investments (total R 3 031 961):**
| Product | Category | Supplier | Value | Value date | Funds |
|---|---|---|---|---|---|
| ABSA Share portfolio | Direct Shares | ABSA Stockbrokers | R 460 000 | 06/10/2025 | Alexander Forbes Grp Hldgs R 100k · MTN Group R 100k · Vodacom R 260k |
| Company Pension Fund | Pension Fund | Supplier unknown | R 980 000 | 08/04/2020 | Balanced Portfolio. Contribution R 7 500 p.m. |
| Momentum International Investment Option | Offshore Investment | Momentum Wealth Intl | R 1 091 961 | 08/04/2020 | Sanlam Global Best Ideas (A) |
| Unit Trust | Unit Trust Portfolio | Allan Gray | R 500 000 | 16/01/2023 | Coronation Balanced Plus A |

**Risk (R 7 200 p.m.):** Liberty (to estate), Liberty Group Limited, L123456789, R 3 100 p.m. · Myriad (to spouse), Momentum Myriad, M123456789, R 2 100 p.m. · Old Mutual (to child), Old Mutual Life, OM123456789, R 2 000 p.m.

**Medical aid:** Discovery Classic Delta Saver, Discovery Health, R 6 700 p.m. **Short term:** Santam Short Term Product, Santam, R 3 400 p.m.

**Demo goal assignments (invented for the concepts; flag as illustrative):** Retirement ← Pension + Momentum (target R 8.5m by 2040, projected ≈ R 6.1m, shortfall R 2.4m) · Education ← Unit Trust (target R 750k by 2031) · Protection ← all risk/medical/short-term · Emergency ← none (basis: expenses ≈ R 53 000 p.m. → 3-month buffer ≈ R 160 000) · ABSA Share portfolio ← unassigned.

**Purpose dropdown values (existing field, use verbatim):** `[ -- Please select an entry -- ]`, Emergency, Retirement, Saving for a goal: Education, Saving for a goal: Holiday, Saving for a goal: Other, Saving for a goal: Property, Saving for a goal: Vehicle.

---

## 6. Visual language

Match Elite Wealth's existing product so the client sees their product evolved, not replaced.

- **Tokens:** teal-900 `#014C66` · teal-800 `#015D7E` (sidebar, panel header) · teal-700 `#06738F` (headings, links) · teal-100 `#D7EAF3` (nav strip, table headers) · teal-50 `#EBF5FA` · ink `#1C2B33` · ink-soft `#51656F` · line `#BFD9E4` · page `#F2F7FA` · good `#1E8E5A`/`#E3F4EC` · warn `#B97509`/`#FCF1DC` · bad `#C2403A`/`#FAE6E4`.
- **Type:** Segoe UI / Roboto / Helvetica Neue stack, 15px base. Section headings: small, uppercase, letter-spaced, teal-700 (matches their "ONGOING FEE" / "PREMIUM DETAILS" style). Tabular numerals for money. Amounts formatted SA-style with spaces: `R 3 031 961`.
- **Product chrome on every concept:** narrow dark-teal left sidebar (decorative, 46px), client bar (name, ref, meta, "Related entities ▾", "New client"), nav strip (Home · Activity dashboard · Client engagement · Client info · **Portfolio** (active) · Assets & liabilities · Budget · Investment planning).
- Cards: white, 1px line border, 8px radius, subtle shadow on hover for clickables. Restraint: this is a working tool, not a marketing page.

## 7. Presenter wrapper

- Dark-teal header: kicker "Elite Wealth · Portfolio redesign · Concept exploration", title "Portfolio landing — three concept directions", and three concept tabs (name + one-line subtitle) switching the visible concept. Switching closes any open panel and scrolls to top.
- A one-paragraph **concept note** under the header per concept (copy in §2 intros / reference prototype).
- Footnote under each concept: "Concept mockups · demo data (Ben Meander) · Level 3 — the full product detail tab set — is unchanged in all three concepts and reachable from every Level 2 panel."

## 8. Technical requirements

- Static front-end, no backend; all state in memory. Vanilla JS or a light framework — whatever builds cleanest, but it must run by opening locally / simple static hosting (the agency will demo it in a meeting, possibly screen-shared).
- Single-page with the three concepts switchable (preferred), or three pages with a shared switcher — single-page matches the demo flow better.
- Desktop-first (adviser tool, demoed on a laptop/projector); degrade gracefully to ~768px. No mobile-specific work.
- Keyboard: Escape closes the panel; visible focus states. Respect `prefers-reduced-motion`.
- No external dependencies that require network access at demo time (no CDN fonts/libraries — assume offline).

## 9. Out of scope

- Level 3 screens (existing product detail tabs) — placeholder links only.
- The ongoing-fees configuration redesign (separate, in-progress workstream) — the fix-fees panel links to it conceptually only.
- Real calculations, projections, or data integration — all numbers are demo fixtures.
- Authentication, persistence, multi-client navigation.

## 10. Acceptance checklist

- [ ] Three concepts switchable; each renders the full Elite Wealth chrome and Ben Meander data.
- [ ] Attention layer present in all three at the correct volume (strip / in-goal flags / rail) — never as a standalone screen.
- [ ] All clickable rows, goal cards, and queue items open the correct Level 2 panel; every applicable panel ends with the Level 3 tab placeholder.
- [ ] Concept C resolve interaction works: saving a fix marks the item done and the readiness ring climbs (45% → +9 per item, green ≥ 70%).
- [ ] Attention strip collapses/expands in A and B.
- [ ] Freshness dots correct everywhere (green ≤ 12m, amber 1–3y, red > 3y) against the demo value dates.
- [ ] Money formatted SA-style throughout; no lorem ipsum — all copy real and adviser-voiced.
- [ ] Runs offline from a static file/folder.
