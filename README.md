# zolai-web — Zolai learner platform

Next.js + Hono + Prisma learner platform: dictionary UI, curriculum, chat, mind map.

## Stack
Next.js · Hono · Prisma · shadcn (CSS tokens)

## Quick start
```bash
bun install && bun run dev
```
Configure `.env` (placeholders only — see `.env.example`). Prisma:
`npx prisma migrate dev` (SQLite dev / Neon prod).

## Docs
`context/` (six-file set) is ground truth. See `docs/` for API + feature guides.
