# CLAUDE.md — Zolai Web Platform

## What this is
zolai-web is the learner platform for the Zolai language (Tedim ZVS orthography). It provides a dictionary UI, curriculum lessons, chat, and contributions — all backed by a Prisma + PostgreSQL database.

## Stack
Next.js 16 (App Router) + Hono (chained RPC handlers) + Prisma + PostgreSQL/Neon + Better Auth + Tailwind CSS v4 + shadcn/ui + TypeScript.

## Key dirs
- `app/` — thin Next.js App Router routes (API mounts)
- `features/` — domain modules (dictionary, grammar, translation, curriculum, chat, forum, etc.)
- `prisma/schema.prisma` — full DB schema
- `scripts/` — seed/import scripts (dictionary, wiki, curriculum)
- `lib/api/` — typed Hono RPC client

## Run
```bash
bun run dev          # Start dev server (Turbopack)
bun run build        # Production build
bun run lint         # ESLint check
bunx prisma generate # Regenerate Prisma client
bunx prisma migrate dev --name <name>  # Apply migration
```

## Seed data
```bash
bunx tsx scripts/seed-dictionary.ts  # 24,891 dictionary entries from ${ZOLAI_ROOT:-../..}/data/
```

## Testing
```bash
npx playwright test        # E2E tests
npx playwright test --ui   # UI mode
```

## Full details
See `AGENTS.md` for commands, architecture rules, database schema, and code compliance checks.
