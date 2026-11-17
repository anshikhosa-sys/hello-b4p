# hello-b4p — Blueprints Grant Finder

A web app for the Finance team of Blueprints for Pangaea. Every morning it finds
grant opportunities (Grants.gov, foundation prospects from ProPublica, and a few
corporate/UMich funding pages), extracts the same fields from each, scores each
0–100 on how well it fits Blueprints, and shows the best matches on a dashboard
with the deadline, award size and a one-line reason for the score.

Runs entirely on free tiers: Vercel Hobby, Supabase Free, the Gemini API free
tier and GitHub Actions.

> Status: **MVP.** Dashboard of ranked matches, a grant detail page with the score
> breakdown and eligibility, and an applications board. Live grant sources (Grants.gov,
> foundations) and AI scoring come in later phases; until then the app shows
> labeled sample data.

## Run it locally

Requires Node 20+.

```bash
npm install
npm run dev -- -p 3100        # http://localhost:3100
```

With no Supabase keys in `.env.local`, the app runs on built-in sample data
(the top bar says so). To use a real database:

1. `cp .env.example .env.local` and fill in the Supabase URL and keys.
2. Create the tables: paste `supabase/migrations/*.sql` into Supabase → SQL Editor
   and run it, or set `SUPABASE_DB_URL` and run `npm run db:migrate`.
3. `npm run seed` loads sample rows (flagged and labeled "Sample data").
   `npm run seed -- --clear` removes them. Neither touches real rows.

## Pages

- `/`: open grants ranked by fit score, upcoming deadlines, applications in progress, results so far
- `/grants/[id]`: score breakdown, eligibility checks (unknown counts as neutral), extracted fields
- `/applications`: board by status (Researching, Drafting, Submitted, Awarded, Declined)

## Checks

```bash
npm test             # unit tests
npm run lint
npm run typecheck
npm run check:secrets   # scan staged changes for key-like strings before pushing
```

## Contributing

Project rules (free tiers only, no secrets in the repo, privacy limits on what
goes to the AI) are in [CLAUDE.md](CLAUDE.md). Fill in the org profile in
[config/profile.md](config/profile.md).
