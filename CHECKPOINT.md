# Checkpoint — 2026-05-12 (full-day session)

State of the codebase at end of day. Pick this up fresh next session.

## Mode

Demo prototype for Elite Wealth — UX-focused, client's real calculations, **not** handoff-grade. Mode A per CLAUDE.md. Memory: `~/.claude/projects/.../memory/project_mode_demo_prototype.md`.

## Headline state

- 37 modified/new files, **none committed yet**
- Type-check clean, vitest 27/27 passing
- Dev server should be on http://localhost:5000 (kicked over multiple times during the day — restart `npm run dev` if down)
- Two architectural memories captured: needs are self-sufficient ([`feedback_self_sufficient_needs.md`]) and Table+Hybrid are two views of one data interface that exist as a UX migration toggle ([`project_table_hybrid_duplication.md`])

## Major deliverables today

### Retirement need (morning session — committed in 2 prior commits, already on dev DB)
- SA 2025/26 tax module (`shared/sa-tax.ts`)
- Retirement projection engine extended for per-vehicle allocation (RA fill then voluntary)
- `current_annual_income` added to `retirement_parameters` schema (pushed to dev DB only)
- Setup → Parameters page exposes the new field
- Implement page rebuilt with allocation table + tax-saving callout

### DEL parity (lean)
- New `shared/del-calculations.ts` engine (estate / dependants / total / income positions)
- New `server/routes/del-projection.ts` exposing `/api/del-projection/:planId`
- DEL Project page rewritten with 4-gauge overview + per-position tabs (using existing `OverviewDashboard` + `ChartPanel` + new breakdown tables)
- DEL Implement page rewritten with recommended cover + position shortfall table

### Elite Wealth design system landed
- Full EW palette + typography tokens in `client/src/index.css` as `--ew-*` CSS variables (Inter font, primary navy `#092C4C`, brand blue `#016991`, tangerine `#EA8A2E`, tertiary blues, positive/negative status colours, neutrals, calculated-cell tints)
- Chart palette repointed to use EW tokens
- Project + Implement pages restyled across both needs
- Table view of editable tables polished — section headers brand-blue on tertiary-50, totals row navy bold, calculated cells with flat tint, vertical-align middle everywhere

### Table architecture cleanup
- 6 totals-row colSpan mismatches fixed across DBF / new-retirement / income-needs / working-assurance / assets / liabilities (assets+liabilities became dynamic via `clientEntities.length`)
- 2 section-header colSpan mismatches fixed (DBF + new-retirement)
- `.section-start` / `.section-end` / `[rowSpan]` overrides consolidated into one rule using `var(--ew-border)`
- `.entity-tight-spacing` + `pr-0.25 pl-0.25` cell padding hacks stripped from entity-owner-selector and entity-beneficiary-selector
- Inline `border-r border-neutral-200` per-cell separators stripped (cells flow visually within sections; `.section-start` is the single source of vertical dividers)
- Field-type rules (`.field-percentage` / `.field-currency` / `.field-years` / `.field-number`) trimmed to width + text-align + font-size only; `.table-input` owns padding
- Vertical-align middle applied globally via one CSS rule that beats Tailwind `.align-top`

### Hybrid view form primitives (afternoon session)
- `FieldGroup` rewritten — flat brand-blue uppercase title on white with full-width `var(--ew-border)` underline (was tinted strip with rounded corners; iterated based on user feedback)
- `FormField` label colour bumped to navy weight-500
- New `client/src/components/common/detail-form-header.tsx` — extracted shared title + Duplicate + Delete header; replaces 8 hand-rolled headers
- Switch components: hardcoded `data-[state=checked]:bg-blue-600` stripped, global rule `[role="switch"][data-state="checked"] { background-color: var(--ew-blue) }` added
- Lump-sum's calculated `<input readOnly>` → `<div className="calculated-field">` for parity
- Assurance's 4 raw `<input type="checkbox">` → shadcn `Switch` for parity
- Inner owner/beneficiary mini-tables in detail forms: stripped `table-header-12`, `bg-neutral-50`, `border border-neutral-200`, `border-b border-neutral-200`, `border-r border-neutral-200` — they now inherit global table CSS automatically

### Stepper / nav layout
- Need dropdown filtered to plan's needs (was showing all 12 in the catalogue)
- Plan-name pill padding fixed (was asymmetric `pl-4 pr-1` leftover from a missing chevron)

## What's saved across sessions (memory)

- `project_ew_financial_planner.md` — project setup, Vercel, Neon DBs
- `project_mode_demo_prototype.md` — Mode A, don't over-engineer
- `feedback_self_sufficient_needs.md` — each need owns its UI/state/calc; never bleed need-specific UI into shared forms
- `feedback_keep_stepper_pattern.md` — the FINANCIAL PLAN / NEED / STEPS top nav is canonical
- `project_table_hybrid_duplication.md` — Table view = legacy familiar UI; Hybrid view = new pattern users migrate to; toggle is a deliberate UX safety net; the duplicated **logic** under them is the bug

## What's documented for the next refactor pass

- [`AUDIT.md`](AUDIT.md) at the repo root — full editable-tables audit with priorities. Includes the "two views one data interface" framing, the dead-file pile (~2,500 lines), config-driven `<FieldSchema>` consolidation as long-term end state.

## Deferred (intentional, non-blocking)

- **~82 inline `style={{ width: 'fit-content', minWidth: 'XXpx' }}`** across 10 detail forms. Width utility classes (`.w-input-xs/sm/md/lg/xl/2xl`) added to `index.css`; per-input sweep deferred — too variable to bulk-replace safely.
- **Owner/beneficiary mini-tables consolidation** into one shared `OwnershipTable` primitive — biggest remaining audit item; cross-form regression risk; better as its own focused pass.
- **Prod DB schema push** — `retirement_parameters.current_annual_income` added to dev DB only. Run `DATABASE_URL="<prod>" npx drizzle-kit push` before any client demo on Vercel.
- **GitHub push** — local commits ahead of origin/main still not pushed (prior 2 from morning session + everything from this afternoon is uncommitted).
- **planId refactor** — out of scope for demo. Hardcoded `1` throughout.
- **DEL on faithful SA estate-duty engine** — current engine is lean (uses entered values, doesn't compute estate duty from gross-estate + abatement bands). Replace when product demands a full SA estate-duty methodology.

## Files modified this session (37 total)

**New:**
- `AUDIT.md`
- `client/src/components/common/detail-form-header.tsx`
- `server/routes/del-projection.ts`
- `shared/del-calculations.ts`
- `shared/sa-tax.ts`

**Modified:** every detail form, every Table-view component that had a totals row, the framework layout, the projection pages, the global CSS, the SA tax + retirement-calculations modules, the schema, the storage layer.

## How to run

```bash
npm run dev          # port 5000, dev server
npm test             # 27 vitest tests
npx tsc --noEmit     # type-check (one pre-existing error in server/api-handler.ts)
```

## Suggested first move next session

1. Commit. Either one big "design-system + hybrid-view cleanup" commit, or split by concern (engine work / design tokens / cleanup / etc.) — see `git status` to decide.
2. Browser walkthrough — most of today's work I couldn't visually verify. Key surfaces: Retirement Project / Implement, DEL Project / Implement, Hybrid detail forms for retirement-funds / DB-funds / voluntary-investments / assurance / liabilities / assets, Table views for the same.
3. Pick from the deferred list above, or take fresh direction from the user.
