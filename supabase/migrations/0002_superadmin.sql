-- =====================================================================
-- Migration 0002 — Add `superadmin` role
-- =====================================================================
-- Run this in Supabase SQL Editor after 0001_init.sql.
--
-- What it does:
--   1. Updates the role CHECK constraint to allow 'superadmin'
--   2. Updates RLS policies so:
--      - superadmin has ALL chairman powers (manage officers,
--        delete registrations & surveys)
--      - normal officers (chairman etc.) CANNOT see, edit or delete
--        superadmin rows in admin_profiles  → the developer's account
--        is hidden from the church team
-- =====================================================================

-- 1. Drop the old CHECK constraint and add a new one allowing 'superadmin'
alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check check (role in (
    'superadmin','chairman','vice_chairman',
    'treasurer','secretary','vice_secretary'
  ));

-- 2. Update RLS policies to give superadmin full power AND
--    hide superadmin rows from non-superadmins.

-- ---- registrations ----
-- senior delete: superadmin OR chairman OR vice_chairman
drop policy if exists "Senior admins delete registrations" on public.registrations;
create policy "Senior admins delete registrations"
  on public.registrations for delete
  to authenticated
  using (public.current_admin_role() in ('superadmin','chairman','vice_chairman'));

-- ---- surveys ----
drop policy if exists "Senior admins delete surveys" on public.survey_responses;
create policy "Senior admins delete surveys"
  on public.survey_responses for delete
  to authenticated
  using (public.current_admin_role() in ('superadmin','chairman','vice_chairman','secretary'));

-- ---- admin_profiles (the important one) ----
-- everyone authenticated admin can SEE other profiles, EXCEPT non-superadmins
-- cannot see superadmin profiles
drop policy if exists "Admins see all profiles" on public.admin_profiles;
create policy "Admins see all profiles"
  on public.admin_profiles for select
  to authenticated
  using (
    public.is_admin()
    and (
      public.current_admin_role() = 'superadmin'
      or role <> 'superadmin'
    )
  );

-- INSERT: superadmin OR chairman can add officers,
--         BUT only superadmin can create another superadmin
drop policy if exists "Chairman inserts profiles" on public.admin_profiles;
create policy "Senior admins insert profiles"
  on public.admin_profiles for insert
  to authenticated
  with check (
    (public.current_admin_role() in ('superadmin','chairman'))
    and (
      public.current_admin_role() = 'superadmin'
      or role <> 'superadmin'
    )
  );

-- UPDATE: superadmin can update anyone (incl. other superadmins);
--         chairman can update everyone EXCEPT superadmins;
--         no one can change a row's role TO superadmin unless they ARE superadmin
drop policy if exists "Chairman manages profiles" on public.admin_profiles;
create policy "Senior admins manage profiles"
  on public.admin_profiles for update
  to authenticated
  using (
    case
      when public.current_admin_role() = 'superadmin' then true
      when public.current_admin_role() = 'chairman' then role <> 'superadmin'
      else false
    end
  )
  with check (
    case
      when public.current_admin_role() = 'superadmin' then true
      when public.current_admin_role() = 'chairman' then role <> 'superadmin'
      else false
    end
  );

-- DELETE: superadmin can delete anyone (incl. self);
--         chairman can delete everyone EXCEPT superadmins
drop policy if exists "Chairman deletes profiles" on public.admin_profiles;
create policy "Senior admins delete profiles"
  on public.admin_profiles for delete
  to authenticated
  using (
    case
      when public.current_admin_role() = 'superadmin' then true
      when public.current_admin_role() = 'chairman' then role <> 'superadmin'
      else false
    end
  );
