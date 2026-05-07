# Needs framework

A **need** is a single advice domain inside a financial plan (e.g. *Death with estate liquidity*, *Retirement*, *Permanent disability*). Each need is a **self-contained module** — its own steps, its own pages, its own URLs, its own action bar — that plugs into one shared framework.

## Layout

```
client/src/needs/
├── _framework/           # the contract — every need uses these
│   ├── types.ts          # NeedConfig, NeedStep, NeedSubStep, FlatNeedItem
│   ├── flatten.ts        # flattenNeed, findCurrentStep, findItemByPath
│   ├── layout.tsx        # <NeedLayout config={...}> — top chrome
│   ├── action-bar.tsx    # <NeedActionBar config={...}> — bottom Previous/Next
│   ├── landing.ts        # getNeedLandingPath(config, ready)
│   └── index.ts          # public exports
├── death-estate-liquidity/
│   ├── config.ts         # NeedConfig — steps + sub-steps + URLs
│   ├── layout.tsx        # tiny wrapper: <NeedLayout config={delConfig}>
│   └── landing.ts        # tiny wrapper: getNeedLandingPath(delConfig, ...)
└── retirement/
    ├── config.ts
    ├── layout.tsx
    └── landing.ts
```

The framework lives in `_framework/`. A need module owns three small files plus its content pages.

## Adding a new need

1. **Schema + storage + routes** — server-side. Add tables, IStorage methods, route module(s). Pure-function calculation engine in `shared/<need>-calculations.ts` if the need projects.

2. **Pages** — React components under `client/src/pages/needs/<need>/...` (or wherever you like; the framework doesn't care). Plain page components, no layout.

3. **Module** — `client/src/needs/<need>/`:
   - `config.ts` — declare a `NeedConfig` (steps, sub-steps, URLs). Conventionally URLs are `/needs/<id>/<step>/<sub-step>`.
   - `layout.tsx` — re-export `<NeedLayout config={yourConfig}>`.
   - `landing.ts` — re-export `getNeedLandingPath(yourConfig, ready)`.

4. **Routes** — register each leaf path in `App.tsx` wrapped in `<YourLayout>`. Group paths (sections with `children`) don't need routes — only the children do.

5. **Shared dropdown entry** — add the need to `shared/navigation-config.ts` as a **bare entry** (`{ id, label, path, hasContent }`) so it appears in the cross-need switcher dropdown. Don't put steps/sections there — those belong in the local `config.ts`.

6. **Plan-dashboard summary card** — add a card to `financial-plan-summary.tsx` matching the need's `key`, ideally driven by a projection endpoint.

## Why self-contained

Earlier iterations leaked between needs: shared sub-step paths (`/client-details`, `/new-retirement-funds`), a global navigation config, a global action bar. Walking through Retirement would drag you back into DEL's chrome because the two needs were structurally entangled.

Self-containment fixes this:
- Every URL inside a need is need-prefixed (`/needs/<id>/...`).
- The chrome and action bar are fed only the current need's config — they can't see other needs' steps.
- Multiple needs reusing the same data form (e.g. Retirement and DEL both render the Voluntary Investments form) just mount the same component on different need-prefixed routes; the data is shared at the API layer, the UI context is not.

## Conventions

- `step.id` should be one of `setup` / `build` / `project` / `implement` so the framework can find the project step for smart-landing. (Other ids work, but `getNeedLandingPath` looks for `project` specifically.)
- Two levels of nesting maximum: `step.sections` and `section.children`. If you need three, flatten the deepest layer.
- Sections with `children` are group anchors — they appear in the chrome's step dropdown but never receive direct navigation. Only the children do.
- `basePath` should match the URL prefix of every step path, by convention.
