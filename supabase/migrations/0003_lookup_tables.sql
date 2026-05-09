-- =====================================================================
-- Migration 0003 — Lookup tables for districts, ministries, age groups,
-- membership statuses, and survey age groups.
-- =====================================================================
-- Run this in Supabase SQL Editor after 0002_superadmin.sql.
--
-- What it does:
--   1. Creates 5 lookup tables: districts, ministries, age_groups,
--      membership_statuses, survey_age_groups
--   2. Seeds them with the current values
--   3. Drops the old hardcoded CHECK constraints on registrations and
--      survey_responses (they're now FK-validated by lookup tables)
--   4. Adds proper foreign keys / FK-style validation
--   5. Adds RLS so the public can READ them but only superadmin/chairman
--      can write (so the chairman can add a new district from the UI)
-- =====================================================================

-- =====================================================================
-- 1. DISTRICTS
-- =====================================================================
create table if not exists public.districts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.districts (name, sort_order) values
  ('Township',           10),
  ('Majengo',            20),
  ('Mt View',            30),
  ('Posta',              40),
  ('Hospital',           50),
  ('Annex',              60),
  ('Thingithu North',    70),
  ('Thingithu South',    80),
  ('Thingithu Central',  90),
  ('Don''t have',       100)
on conflict (name) do nothing;

-- =====================================================================
-- 2. MINISTRIES
-- =====================================================================
create table if not exists public.ministries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.ministries (name, sort_order) values
  ('Praise',            10),
  ('Hospitality',       20),
  ('Games',             30),
  ('IT and Innovation', 40),
  ('Bible Study',       50),
  ('Planning',          60)
on conflict (name) do nothing;

-- =====================================================================
-- 3. REGISTRATION AGE GROUPS
-- =====================================================================
create table if not exists public.age_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.age_groups (name, sort_order) values
  ('13-19', 10),
  ('20-25', 20),
  ('26-35', 30)
on conflict (name) do nothing;

-- =====================================================================
-- 4. MEMBERSHIP STATUSES
-- =====================================================================
create table if not exists public.membership_statuses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.membership_statuses (name, sort_order) values
  ('Full Member',     10),
  ('Not Full Member', 20)
on conflict (name) do nothing;

-- =====================================================================
-- 5. SURVEY AGE GROUPS
-- =====================================================================
create table if not exists public.survey_age_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.survey_age_groups (name, sort_order) values
  ('13-35', 10),
  ('36-50', 20),
  ('51+',   30)
on conflict (name) do nothing;

-- =====================================================================
-- 6. UPDATE REGISTRATIONS TABLE
-- Replace text CHECK constraints with FK validation against lookup tables.
-- We keep the existing text columns (no data migration needed) but ensure
-- values stay in sync via a trigger that validates against the lookups.
-- =====================================================================
alter table public.registrations
  drop constraint if exists registrations_age_group_check,
  drop constraint if exists registrations_district_check,
  drop constraint if exists registrations_membership_status_check,
  drop constraint if exists registrations_ministries_check;

create or replace function public.validate_registration()
returns trigger language plpgsql as $$
begin
  -- age_group must exist and be active
  if not exists (
    select 1 from public.age_groups
    where name = new.age_group and is_active = true
  ) then
    raise exception 'Invalid age_group: %', new.age_group;
  end if;

  -- district must exist and be active
  if not exists (
    select 1 from public.districts
    where name = new.district and is_active = true
  ) then
    raise exception 'Invalid district: %', new.district;
  end if;

  -- membership_status must exist and be active
  if not exists (
    select 1 from public.membership_statuses
    where name = new.membership_status and is_active = true
  ) then
    raise exception 'Invalid membership_status: %', new.membership_status;
  end if;

  -- 1-3 ministries, all must exist and be active
  if array_length(new.ministries, 1) is null
     or array_length(new.ministries, 1) < 1
     or array_length(new.ministries, 1) > 3 then
    raise exception 'Pick between 1 and 3 ministries';
  end if;

  if exists (
    select 1
    from unnest(new.ministries) m
    where not exists (
      select 1 from public.ministries
      where name = m and is_active = true
    )
  ) then
    raise exception 'Invalid ministry in: %', new.ministries;
  end if;

  return new;
end $$;

drop trigger if exists trg_validate_registration on public.registrations;
create trigger trg_validate_registration
  before insert or update on public.registrations
  for each row execute function public.validate_registration();

-- =====================================================================
-- 7. UPDATE SURVEY_RESPONSES TABLE
-- =====================================================================
alter table public.survey_responses
  drop constraint if exists survey_responses_age_group_check;

create or replace function public.validate_survey_response()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.survey_age_groups
    where name = new.age_group and is_active = true
  ) then
    raise exception 'Invalid age_group: %', new.age_group;
  end if;
  return new;
end $$;

drop trigger if exists trg_validate_survey_response on public.survey_responses;
create trigger trg_validate_survey_response
  before insert or update on public.survey_responses
  for each row execute function public.validate_survey_response();

-- =====================================================================
-- 8. RLS — public reads, superadmin/chairman writes
-- =====================================================================
alter table public.districts            enable row level security;
alter table public.ministries           enable row level security;
alter table public.age_groups           enable row level security;
alter table public.membership_statuses  enable row level security;
alter table public.survey_age_groups    enable row level security;

-- Generic policy maker
do $$
declare
  t text;
begin
  foreach t in array array[
    'districts','ministries','age_groups',
    'membership_statuses','survey_age_groups'
  ] loop
    execute format('drop policy if exists "Anyone can read %1$s" on public.%1$s;', t);
    execute format(
      'create policy "Anyone can read %1$s" on public.%1$s '
      'for select to anon, authenticated using (true);',
      t
    );

    execute format('drop policy if exists "Senior admins write %1$s" on public.%1$s;', t);
    execute format(
      'create policy "Senior admins write %1$s" on public.%1$s '
      'for all to authenticated '
      'using (public.current_admin_role() in (''superadmin'',''chairman'')) '
      'with check (public.current_admin_role() in (''superadmin'',''chairman''));',
      t
    );
  end loop;
end $$;
