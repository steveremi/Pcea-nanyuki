-- =====================================================================
-- PCEA Nanyuki Town Church Youth Fellowship — Initial Schema
-- =====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUMS via CHECK constraints (simple, easy to extend)
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 2. REGISTRATIONS
-- ---------------------------------------------------------------------
create table if not exists public.registrations (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  age_group           text not null check (age_group in ('13-19', '20-25', '26-35')),
  district            text not null check (district in (
                        'Township','Majengo','Mt View','Posta','Hospital',
                        'Annex','Thingithu North','Thingithu South','Thingithu Central',
                        'Don''t have'
                      )),
  contact             text not null,
  ministries          text[] not null check (
                        array_length(ministries, 1) between 1 and 3
                        and ministries <@ array['Praise','Hospitality','Games','IT and Innovation','Bible Study','Planning']
                      ),
  membership_status   text not null check (membership_status in ('Full Member','Not Full Member')),
  amount              numeric(10,2) not null default 200 check (amount >= 0),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_registrations_created on public.registrations (created_at desc);
create index if not exists idx_registrations_age     on public.registrations (age_group);
create index if not exists idx_registrations_district on public.registrations (district);

-- ---------------------------------------------------------------------
-- 3. SURVEY RESPONSES
-- ---------------------------------------------------------------------
create table if not exists public.survey_responses (
  id                          uuid primary key default gen_random_uuid(),

  -- Section A: everyone
  is_church_member            boolean not null,
  age_group                   text not null check (age_group in ('13-35','36-50','51+')),
  vibrancy_rating             int not null check (vibrancy_rating between 1 and 10),
  weaknesses                  text,
  strengths                   text,
  programs_to_incorporate     text,
  fundraising_ideas           text,
  influence_rating            int not null check (influence_rating between 1 and 10),
  pull_teenagers              text,

  -- Section B: youth-only (13-35) — nullable
  feels_supported             boolean,
  serves_best                 boolean,
  service_hindrances          text,
  attends_youth_service       boolean,
  not_attending_reason        text,
  has_district                boolean,
  attends_fellowship          boolean,
  district_hindrance          text,
  would_like_to_join          boolean,

  -- Section C: everyone
  other_suggestions           text,

  created_at                  timestamptz not null default now()
);

create index if not exists idx_survey_created on public.survey_responses (created_at desc);
create index if not exists idx_survey_age     on public.survey_responses (age_group);

-- ---------------------------------------------------------------------
-- 4. ADMIN PROFILES (extends auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.admin_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in (
                'chairman','vice_chairman','treasurer','secretary','vice_secretary'
              )),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. AUTO-UPDATE updated_at
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_registrations_updated on public.registrations;
create trigger trg_registrations_updated before update on public.registrations
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_admin_profiles_updated on public.admin_profiles;
create trigger trg_admin_profiles_updated before update on public.admin_profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 6. HELPER: is the caller an active admin? what's their role?
-- ---------------------------------------------------------------------
create or replace function public.current_admin_role()
returns text language sql security definer set search_path = public as $$
  select role
  from public.admin_profiles
  where id = auth.uid() and is_active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true
  );
$$;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.registrations    enable row level security;
alter table public.survey_responses enable row level security;
alter table public.admin_profiles   enable row level security;

-- ---- registrations ----
drop policy if exists "Anyone can register"             on public.registrations;
drop policy if exists "Admins read registrations"       on public.registrations;
drop policy if exists "Admins update registrations"     on public.registrations;
drop policy if exists "Senior admins delete registrations" on public.registrations;

-- public INSERT (anon role) — anyone can register
create policy "Anyone can register"
  on public.registrations for insert
  to anon, authenticated
  with check (true);

-- admins read all
create policy "Admins read registrations"
  on public.registrations for select
  to authenticated
  using (public.is_admin());

-- chairman, vice_chairman, secretary, vice_secretary, treasurer can update
create policy "Admins update registrations"
  on public.registrations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- only chairman + vice_chairman can delete
create policy "Senior admins delete registrations"
  on public.registrations for delete
  to authenticated
  using (public.current_admin_role() in ('chairman','vice_chairman'));

-- ---- survey_responses ----
drop policy if exists "Anyone can submit survey"      on public.survey_responses;
drop policy if exists "Admins read surveys"           on public.survey_responses;
drop policy if exists "Senior admins delete surveys"  on public.survey_responses;

create policy "Anyone can submit survey"
  on public.survey_responses for insert
  to anon, authenticated
  with check (true);

create policy "Admins read surveys"
  on public.survey_responses for select
  to authenticated
  using (public.is_admin());

create policy "Senior admins delete surveys"
  on public.survey_responses for delete
  to authenticated
  using (public.current_admin_role() in ('chairman','vice_chairman','secretary'));

-- ---- admin_profiles ----
drop policy if exists "Admins see own profile"        on public.admin_profiles;
drop policy if exists "Admins see all profiles"       on public.admin_profiles;
drop policy if exists "Chairman manages profiles"     on public.admin_profiles;
drop policy if exists "Chairman inserts profiles"     on public.admin_profiles;
drop policy if exists "Chairman deletes profiles"     on public.admin_profiles;

-- everyone authenticated can see admin profiles (so admins can know each other)
create policy "Admins see all profiles"
  on public.admin_profiles for select
  to authenticated
  using (public.is_admin());

-- only chairman can insert/update/delete admin profiles
create policy "Chairman inserts profiles"
  on public.admin_profiles for insert
  to authenticated
  with check (public.current_admin_role() = 'chairman');

create policy "Chairman manages profiles"
  on public.admin_profiles for update
  to authenticated
  using (public.current_admin_role() = 'chairman')
  with check (public.current_admin_role() = 'chairman');

create policy "Chairman deletes profiles"
  on public.admin_profiles for delete
  to authenticated
  using (public.current_admin_role() = 'chairman');

-- ---------------------------------------------------------------------
-- 8. SEED THE FIRST CHAIRMAN (manual — see README)
-- ---------------------------------------------------------------------
-- After running this migration, do this in the SQL editor:
--
--   1. Create your auth user via Supabase dashboard → Authentication → Users → "Add User"
--      Email: chairman@example.com   Password: <strong password>
--
--   2. Copy the user's UUID from that page, then run:
--
--      insert into public.admin_profiles (id, full_name, role)
--      values ('<paste-uuid-here>', 'Your Name', 'chairman');
--
--   3. Log in at /admin/login. From there you can add other officers
--      (vice chairman, treasurer, secretary, vice secretary) through the
--      Team page in the admin dashboard.
-- ---------------------------------------------------------------------
