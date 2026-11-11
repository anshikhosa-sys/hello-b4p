# Blueprints Grant Finder — working rules

Web app for the Finance team of Blueprints for Pangaea (student-run 501(c)(3)
at the University of Michigan that redistributes surplus medical supplies).
Every morning it finds grant opportunities, extracts the same fields from each,
scores each 0-100 on fit, and shows the best matches on a dashboard. Members
start applications from a match and mark grants as good/bad fit; those labels
tune the scoring later.

Leadership approved **only the Grant Finder**. Don't add other modules
(outreach pipeline, writing coach, task lists, etc.) unless asked.

## Repo and workflow

- Remote: `origin` = https://github.com/anshikhosa-sys/hello-b4p.git (public). Branch `main`.
- **All work on this project is committed and pushed to that repo.** Commit after
  each phase/logical change with a clear message, then push to `main`.
- Commits use the GitHub noreply identity set in this repo's local git config.
- This folder is standalone. Never add other local projects as dependencies or
  submodules, never copy their history, config or secrets, and never mention the
  private project the UI styling came from (code, comments, docs, commits).

## Hard rules

1. **$0 to run.** Only free tiers: Vercel Hobby, Supabase Free (Postgres + Auth),
   Gemini API free tier, GitHub Actions (public repo), Grants.gov public API,
   ProPublica Nonprofit Explorer API. Ask before adding any service. Nothing that
   needs a credit card.
2. **Public repo: no secrets.** Every key lives in env vars. `.env.example` has
   placeholders only; `.env*` is gitignored (except `.env.example`). Before every
   push, scan the staged diff for anything key-like (`npm run check:secrets`).
3. **Verify external APIs by calling them.** Save a small real response under
   `fixtures/` and build parsers and tests from it. Never guess field names or
   query parameters.
4. **Don't invent facts about Blueprints.** The org profile lives in
   `config/profile.md` with TODO placeholders the user fills in.
5. **Privacy.** Free Gemini usage may be used by Google to improve its models.
   Only send public grant text and the public org profile to the AI. Never
   personal, member or donor information.
6. **Swappable AI.** Every AI call goes through `lib/ai.ts`. Model name comes from
   `GEMINI_MODEL` (default `gemini-3.5-flash-lite`, a current free-tier
   Flash-Lite model per Google's pricing page, checked Nov 2026).
7. **Validate everything** with `zod`: every external API response and every AI output.
8. **Access is enforced by row-level security**, not only in the UI. Only
   `@umich.edu` accounts may sign in; admins come from `ADMIN_EMAILS`.
9. **A failure in one source never stops the others** in the daily ingest.
10. AI extraction is cached by content hash; the same listing is never sent twice.
    Back off on HTTP 429 and stop cleanly (logged) when the daily quota is used up.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4, deployed on Vercel Hobby.
- Supabase: Postgres, SQL migrations in `supabase/migrations/`, Auth with Google
  sign-in, RLS on every table.
- `zod`, `@google/genai` (JSON-schema structured output), `vitest`, Prettier + ESLint.
- Daily job: `npm run ingest` (Node/TypeScript), run by a scheduled GitHub Actions
  workflow with a manual "Run workflow" trigger. Not Vercel Cron.
- `npm run seed` loads clearly labeled sample data so the UI can be demoed without keys.

## Layout

```
app/                 Next.js routes
  page.tsx           dashboard: ranked matches
  grants/[id]/       grant detail (score breakdown, eligibility, extracted fields)
  applications/      tracker: table + board by status
  prospects/         foundation prospects from ProPublica
  settings/          admins only: weights, keywords, sources, run log
components/          shared UI (ui.tsx primitives, Sidebar, TopBar)
lib/                 app code: ai.ts (the only AI entry point), db, scoring, sources
config/              DATA ONLY: profile.md, search.ts, sources.ts, scoring.ts
scripts/             ingest, seed
supabase/migrations/ SQL migrations + RLS policies
fixtures/            small real API responses used by tests
tests/               vitest
.github/workflows/   daily ingest
```

## Commands

```
npm run dev            # app on http://localhost:3000
npm test               # vitest
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run format         # prettier --write
npm run check:secrets  # scan staged diff for key-like strings (run before push)
```

## Conventions

- Config is data, logic is code: no weights, keywords or thresholds in `lib/`.
- Missing data is neutral, never a penalty, and the reasons say so.
- Every scoring factor has unit tests.
- Sample data is always labeled "Sample data" in the UI.
