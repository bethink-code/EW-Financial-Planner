# EW Financial Planner

Estate planning and financial needs analysis tool for Elite Wealth.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui, wouter for routing
- **Backend**: Express.js serverless function on Vercel
- **Database**: Neon PostgreSQL via Drizzle ORM
- **Deployment**: Vercel (auto-deploys from GitHub main branch)

## Development

```bash
npm run dev          # Start local dev server on port 5000
npm run build:vercel # Build for Vercel (static + serverless)
npx tsc --noEmit     # Type check
npx drizzle-kit push # Push schema to database
```

## Project Structure

```
client/src/
  pages/              # Route pages (financial-plans, assurance, etc.)
  components/
    navigation/       # Nav layout, consolidated nav bar, needs dialog
    assurance/        # Assurance/insurance tables and forms
    retirement-funds/ # Retirement fund tables
    ...               # Other domain component groups
  lib/                # Utilities (formatting, queryClient, design-tokens)
server/
  api-handler.ts      # Vercel serverless entry point (DO NOT DELETE)
  index.ts            # Local dev server entry point
  routes.ts           # All API route definitions
  storage.ts          # IStorage interface, MemStorage, DbStorage
shared/
  schema.ts           # Drizzle schema + Zod validation + types
  navigation-config.ts # Navigation structure and needs config
api/
  index.js            # Built serverless bundle (committed to git, DO NOT gitignore)
```

## Databases

Two Neon PostgreSQL databases:
- **Dev**: configured in local `.env`
- **Prod**: configured in Vercel environment variables

**After any schema.ts change, push to BOTH databases:**
```bash
npx drizzle-kit push                    # pushes to dev (uses .env)
DATABASE_URL="<prod-url>" npx drizzle-kit push  # pushes to prod
```

## Key Rules

- `api/index.js` must stay committed — Vercel needs it as the serverless function
- `server/api-handler.ts` is the source for the serverless bundle — do not delete
- Financial plans (`/`) are the entry point — do not redirect `/` to `/assurance`
- The `initializeDefaultNeeds()` function seeds the needs table on cold start
- All calculator pages are wrapped in `NavigationLayout`
