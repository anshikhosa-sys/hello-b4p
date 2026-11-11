# hello-b4p — Blueprints Grant Finder

A web app for the Finance team of Blueprints for Pangaea. Every morning it finds
grant opportunities (Grants.gov, foundation prospects from ProPublica, and a few
corporate/UMich funding pages), extracts the same fields from each, scores each
0–100 on how well it fits Blueprints, and shows the best matches on a dashboard
with the deadline, award size and a one-line reason for the score.

Runs entirely on free tiers: Vercel Hobby, Supabase Free, the Gemini API free
tier and GitHub Actions.

> Status: **in development.** The UI currently shows labeled sample data.
> Full setup steps (Supabase, Google sign-in, Gemini key, deployment) will be
> added here as each phase lands.

## Run it locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # fill in later; not needed for sample data
npm run dev                  # http://localhost:3000
```

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
