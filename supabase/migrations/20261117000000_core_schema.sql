-- core tables for the grant finder: members, grants, scores, applications.
-- every table has row-level security on. signed-in umich.edu accounts can read;
-- grants and scores are written only by the ingest job (service role, which bypasses rls).

create extension if not exists pgcrypto;

-- helpers live outside the exposed api schema
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated, service_role;

-- true when the caller signed in with a umich.edu account
create or replace function app_private.is_umich_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email') like '%@umich.edu', false)
$$;

grant execute on function app_private.is_umich_user() to authenticated;

create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- members ----------
-- one row per finance team member. user_id links to auth.users once they sign in (phase 6);
-- sample members have no user_id.
create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text unique,
  display_name text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- grants ----------
create table public.grants (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('grants_gov', 'foundation', 'corporate', 'university')),
  source_id text not null,
  url text,
  funder text not null,
  title text not null,
  summary text,
  award_min numeric(12, 2) check (award_min is null or award_min >= 0),
  award_max numeric(12, 2) check (award_max is null or award_max >= 0),
  deadline date,
  posted_on date,
  eligibility_text text,
  -- fields pulled out by the ai in phase 4, kept as-is for the detail page
  extracted jsonb not null default '{}'::jsonb,
  -- hash of the listing text; extraction is cached on it
  content_hash text,
  is_sample boolean not null default false,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id),
  check (award_min is null or award_max is null or award_min <= award_max)
);

create index grants_deadline_idx on public.grants (deadline);

create trigger grants_touch before update on public.grants
  for each row execute function app_private.touch_updated_at();

-- ---------- grant_scores ----------
-- latest score per grant. breakdown: [{label, value, max, note}],
-- eligibility: [{label, pass: true|false|null, note}] where null means unknown (neutral)
create table public.grant_scores (
  grant_id uuid primary key references public.grants (id) on delete cascade,
  score smallint not null check (score between 0 and 100),
  reason text not null,
  match_reasons text[] not null default '{}',
  breakdown jsonb not null default '[]'::jsonb,
  eligibility jsonb not null default '[]'::jsonb,
  scoring_version text not null default 'v0',
  scored_at timestamptz not null default now()
);

create index grant_scores_score_idx on public.grant_scores (score desc);

-- ---------- applications ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  -- null when the grant isn't in the finder (e.g. added by hand)
  grant_id uuid references public.grants (id) on delete set null,
  title text not null,
  funder text,
  status text not null default 'researching'
    check (status in ('researching', 'drafting', 'submitted', 'awarded', 'declined')),
  owner_id uuid references public.members (id) on delete set null,
  amount_requested numeric(12, 2) check (amount_requested is null or amount_requested >= 0),
  amount_awarded numeric(12, 2) check (amount_awarded is null or amount_awarded >= 0),
  internal_deadline date,
  notes text,
  is_sample boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_grant_idx on public.applications (grant_id);
create index applications_status_idx on public.applications (status);

create trigger applications_touch before update on public.applications
  for each row execute function app_private.touch_updated_at();

-- ---------- row-level security ----------
alter table public.members enable row level security;
alter table public.grants enable row level security;
alter table public.grant_scores enable row level security;
alter table public.applications enable row level security;

-- nothing for anon. the policies below decide what signed-in users see.
revoke all on public.members, public.grants, public.grant_scores, public.applications from anon;
grant select on public.grants, public.grant_scores to authenticated;
grant select, insert, update on public.members to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.members, public.grants, public.grant_scores, public.applications to service_role;

create policy "umich users read grants" on public.grants
  for select to authenticated using (app_private.is_umich_user());

create policy "umich users read scores" on public.grant_scores
  for select to authenticated using (app_private.is_umich_user());

create policy "umich users read members" on public.members
  for select to authenticated using (app_private.is_umich_user());

-- a member can create and edit only their own row
create policy "members insert own row" on public.members
  for insert to authenticated
  with check (app_private.is_umich_user() and user_id = auth.uid());

create policy "members update own row" on public.members
  for update to authenticated
  using (app_private.is_umich_user() and user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "umich users read applications" on public.applications
  for select to authenticated using (app_private.is_umich_user());

create policy "umich users add applications" on public.applications
  for insert to authenticated
  with check (app_private.is_umich_user() and created_by = auth.uid());

create policy "umich users edit applications" on public.applications
  for update to authenticated
  using (app_private.is_umich_user())
  with check (app_private.is_umich_user());

-- only whoever created an application can delete it (admins come in phase 6)
create policy "creators delete applications" on public.applications
  for delete to authenticated
  using (app_private.is_umich_user() and created_by = auth.uid());
