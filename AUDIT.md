# Editable Tables Audit — 2026-05-12

Audit of the editable-table layer (hybrid tables + detail forms + Table-mode tables) across all financial domains. Carried out at the user's request when they suspected significant tech debt from the previous developer. **No code changes were made.** This document is for reference when you pick the cleanup up.

## TL;DR

**The Table view and the Hybrid view are a deliberate UX migration toggle.** Table is the legacy interface users are familiar with; Hybrid is the new pattern they're being moved to; the toggle lets users fall back when they're uncomfortable. **Both views must be preserved as a product feature.**

The technical problem is that each view is currently a **completely independent UI implementation of the same data interface**. For each financial domain (assurance, retirement funds, DB funds, voluntary investments, liabilities, assets, income needs, lump-sum bequests, income provisions, etc.) the previous developer built a Table view (`*-table.tsx`, often 400-900 lines) AND a Hybrid wrapper + detail form (`*-hybrid-table.tsx` + `*-detail-form.tsx`) end-to-end, with no shared field schema, mutation hook, formatters or validators. Every field is added twice. Every validation lives twice. Bug fixes get applied to one view and not the other. **This actively damages the migration:** a field added to the new Hybrid view and not to the legacy Table view leaves fallback users on a stale interface.

The fix is **one field-schema config + two renderers** so the two views stay perfectly in step as users migrate. Adding a field updates both renderings simultaneously.

Secondary findings: ~2,500 lines of orphaned dead code on disk; 518 `!important` declarations in `index.css` (partly an artefact of trying to make the two independent view implementations look visually consistent); type-safety holes in 24 files.

## Critical — blocks cleanup or causes real bugs

- **Two competing state-management patterns for the same job.** [retirement-fund-detail-form.tsx:14-20](client/src/components/retirement-funds/retirement-fund-detail-form.tsx#L14) takes `onUpdate` via props (parent owns the mutation). [voluntary-investment-detail-form.tsx:25](client/src/components/voluntary-investments/voluntary-investment-detail-form.tsx#L25) and [defined-benefit-fund-detail-form.tsx:26](client/src/components/defined-benefit-funds/defined-benefit-fund-detail-form.tsx#L26) `useMutation` inline. Cleanup cannot DRY these until one wins.

- **Imperative DOM mutation after blur, repeated ~15 times.** Every detail form / table writes `target.value = formattedValue` via `setTimeout` to push formatted text into uncontrolled inputs (`defaultValue` + `onBlur`). React owns the DOM and this fights it. Locations: [assets-table.tsx:170, 300, 563](client/src/components/assets/assets-table.tsx#L170), [assurance-detail-form.tsx:223, 344, 362](client/src/components/assurance/assurance-detail-form.tsx#L223), [voluntary-investment-detail-form.tsx:61](client/src/components/voluntary-investments/voluntary-investment-detail-form.tsx#L61), [defined-benefit-fund-detail-form.tsx:64](client/src/components/defined-benefit-funds/defined-benefit-fund-detail-form.tsx#L64), and others.

- **Dead / orphaned components still on disk (~2,500 lines deletable).**
  - `assurance/assurance-table.tsx` (239 lines)
  - `assurance/simplified-assurance-table.tsx` (487)
  - `assurance/enhanced-assurance-summary.tsx`
  - `assurance/assurance-summary.tsx`
  - `assurance/working-assurance-table.tsx.backup`
  - `retirement-funds/detailed-view.tsx` (505)
  - `retirement-funds/detailed-row.tsx` (323)
  - `retirement-funds/simple-table-with-beneficiaries.tsx`
  - `retirement-funds/summary-section.tsx`
  - `income-provisions/income-provisions-table.tsx` (217, superseded by `-table-new.tsx`)
  - Two stray `.md` design notes in component folders

  None of these are imported anywhere.

## High — significant tech debt, will hurt anyone editing these

- **Files over the project's 300-line limit.** Worst offenders:
  - [working-assurance-table.tsx](client/src/components/assurance/working-assurance-table.tsx) — 983 lines
  - [new-retirement-table.tsx](client/src/components/retirement-funds/new-retirement-table.tsx) — 756
  - [assets-table.tsx](client/src/components/assets/assets-table.tsx) — 634
  - [liabilities-table.tsx](client/src/components/liabilities/liabilities-table.tsx) — 624
  - [retirement-fund-detail-form.tsx](client/src/components/retirement-funds/retirement-fund-detail-form.tsx) — 532
  - [voluntary-investments-table.tsx](client/src/components/voluntary-investments/voluntary-investments-table.tsx) — 476
  - [assurance-detail-form.tsx](client/src/components/assurance/assurance-detail-form.tsx) — 450
  - [income-needs-table.tsx](client/src/components/income-needs/income-needs-table.tsx) — 444

- **`liabilities-table.tsx` contains its own hybrid render branch that is never reached.** Lines [446-608](client/src/components/liabilities/liabilities-table.tsx#L446) render a hybrid view, but the page only mounts this component when `viewMode === 'table'`. The actual hybrid path uses `liability-hybrid-table.tsx`. ~160 lines of dead code inside a live file.

- **518 `!important` declarations in [index.css](client/src/index.css) (1,726 lines).** Patterns like `.table-text-14`, `.section-start`, `.double-row-header-first` plus shadcn overrides indicate the previous dev fought shadcn's `Table` primitive and ended up styling raw `<table>` HTML, then forced specificity. Cleanup is one job, not many small ones.

- **Detail-form structural duplication.** [retirement-fund-detail-form.tsx](client/src/components/retirement-funds/retirement-fund-detail-form.tsx), [voluntary-investment-detail-form.tsx](client/src/components/voluntary-investments/voluntary-investment-detail-form.tsx), [defined-benefit-fund-detail-form.tsx](client/src/components/defined-benefit-funds/defined-benefit-fund-detail-form.tsx), `liability-detail-form.tsx`, `asset-detail-form.tsx`, `assurance-detail-form.tsx` all share the same skeleton: header + duplicate button + delete button + `<FieldGroup>`/`<FormField>` blocks + `handleInputBlur` with format-by-field-name switch + identical owner/beneficiary add/remove helpers. Realistic shared core ~150 lines per file.

## Medium — annoying but not urgent

- **Type-safety holes (42 hits in 24 files, excluding shadcn).** Notable: [retirement-fund-detail-form.tsx:16](client/src/components/retirement-funds/retirement-fund-detail-form.tsx#L16) (`value: any`), [liability-detail-form.tsx:25](client/src/components/liabilities/liability-detail-form.tsx#L25) (`select: (data: any[])`), and untyped `useQuery({ queryKey })` in 17 pages/components — counts default to `unknown` and break inference downstream.

- **Each hybrid table refetches `/api/client-details` independently.** [retirement-fund-detail-form.tsx:29](client/src/components/retirement-funds/retirement-fund-detail-form.tsx#L29), [liability-detail-form.tsx:23](client/src/components/liabilities/liability-detail-form.tsx#L23), `liabilities-table.tsx:27`, etc. React Query dedupes but each form treats this as private; should live in a context or page-level hook.

- **Inconsistent delete UX.** `liabilities-table.tsx:168` uses `window.confirm`; detail forms in `retirement-funds`/`voluntary-investments`/`assurance` delete with no confirmation; some tables have inline delete buttons, others require navigating to the detail form (e.g. `voluntary-investments-table.tsx` shows the button; `retirement-fund-hybrid-table.tsx` only on the detail form).

- **Index-as-key in chart-y components.** `hybrid-summary-card.tsx`, `area-chart.tsx`, `line-chart.tsx`, `bar-chart.tsx`. Low impact for a demo, but worth knowing.

## Code / file consolidation opportunities

The real target is to **collapse the two-view duplication** so each domain's editable interface is described once and rendered two ways.

- **One field-schema config per domain, two renderers.** Each domain (assurance, retirement funds, etc.) gets one config like `{ field, label, type, format, validate, group }[]`. A Table renderer turns that into cell columns; a Hybrid renderer turns the same config into `<FieldGroup>` / `<FormField>` blocks. Adding a field updates both views automatically.

- **A single `useResourceMutation<T>(endpoint)` hook** shared by both renderers. Replaces the inline `useMutation` + `setIsUpdating` + `setTimeout(target.value=…)` block currently duplicated across 6 detail forms and 6 tables.

- **Pick one layout primitive** — adopt [hybrid-view-wrapper.tsx](client/src/components/common/hybrid-view-wrapper.tsx) everywhere (4 domains use it) or delete it (the other 6 hand-roll the same layout). The choice should fall out of the config-driven rewrite.

- **Delete the dead-file pile in a single commit before any refactor.** ~2,500 lines including `.backup` and `.md` notes — these obscure search results and make every "is this used?" question harder than it should be.

**Rough sizing.** 6 Table views (~3,500 lines) + 6 Hybrid wrappers (~1,000 lines) + 6 Detail forms (~2,000 lines) = ~6,500 lines today. With one config + two renderers, realistic target is ~1,500-2,000 lines.

## What I did NOT check

Server routes / `storage.ts`, calculation correctness in `shared/`, drift between dev / prod schemas, and the income-needs / additional-estate-duty / residue / future-inflows detail forms beyond file sizes — patterns were extrapolated from the 5 domains spot-checked.

## Where each view stands right now (user's read)

- **Hybrid view: visually close.** Work here is logic-only — the duplicate mutation / formatter / validator plumbing beneath it. Do not redesign the visuals.
- **Table view: needs visual help.** Structurally it's the legacy interface so internals stay light-touch, but the visuals should come up to the same standard as Hybrid.

These two priorities are higher than the "one config, two renderers" consolidation (which is still the right end state, but later).

## Suggested order of operations (when you pick this up)

1. **Delete the dead-file pile** (~2,500 lines). No behaviour change, clears noise from search results.
2. **Visual pass on the Table view** so it matches the Hybrid view's polish (EW palette, calculated-cell tints, restrained styling). Bring it visually level with Hybrid before touching internals.
3. **Surgical logic cleanup under Hybrid** — extract `useResourceMutation` and convert the three core detail forms (retirement / DB fund / voluntary investment) to use it. Replace the `setTimeout(target.value=...)` blur pattern at the same time. Hybrid visuals do not change.
4. **Decide on the state-management pattern** as part of step 3 (props-up `onUpdate` vs. inline `useMutation`). Bake it into `useResourceMutation` so it's no longer a per-component decision.
5. **Only after the above** — and only if it still makes sense — consider the config-driven `<FieldSchema config={...}>` + two renderers consolidation. This is multi-day work with real regression risk on live forms; don't start it until 1-4 are done.
6. **Final pass: prune `!important` declarations from `index.css`** — many will be unreachable once the duplicate styling is removed.
