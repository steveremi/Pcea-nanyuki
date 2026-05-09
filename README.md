# PCEA Nanyuki Town Church — Youth Fellowship App

A Next.js 15 + Supabase application for the PCEA Nanyuki Town Church Youth
Fellowship. Two public flows (registration + survey) and a role-based admin
dashboard for the youth officers.

> Powered by **Alvania Data Group**.

---

## What's inside

- **`/`** — landing page with two pill CTAs (Register / Survey).
- **`/register`** — public youth fellowship registration form.
- **`/survey`** — public anonymous survey, with a conditional youth-only
  section (13–35).
- **`/admin/login`** — officer sign-in.
- **`/admin`** — dashboard with totals, district breakdown, recent records.
- **`/admin/registrations`** — searchable, filterable list. Detail view with
  edit + delete (delete gated by role).
- **`/admin/surveys`** — list + per-response detail view with delete.
- **`/admin/team`** — chairman manages other officers (add, change role,
  activate / deactivate).

## How officers log in

The officer login is **not advertised** anywhere on the public site — visitors to `/register` or `/survey` won't see any "admin" link. This is intentional.

There are two ways officers reach the login screen:

1. **Bookmark** — go directly to `yourdomain.com/admin/login`. Officers should add this to their phone home screen on first login.
2. **Magic backdoor** — on any public page, **press and hold the PCEA logo** in the top-left for 1.5 seconds. A small gold progress bar appears under the logo; when it completes, you're sent to the login page. Works on phone (touch-and-hold) and desktop (mouse-down).

Once on the login page, officers enter their email and password. The system verifies they exist in `admin_profiles` and `is_active = true`. If not, they're signed out instantly with an error.

### Roles & permissions

| Role            | View regs | Edit regs | Delete regs | Delete surveys | Manage officers |
|-----------------|:---------:|:---------:|:-----------:|:--------------:|:---------------:|
| Chairman        | ✓         | ✓         | ✓           | ✓              | ✓               |
| Vice Chairman   | ✓         | ✓         | ✓           | ✓              | —               |
| Secretary       | ✓         | ✓         | —           | ✓              | —               |
| Vice Secretary  | ✓         | ✓         | —           | —              | —               |
| Treasurer       | ✓         | ✓         | —           | —              | —               |

RLS in the database is the source of truth — UI permissions just match it.

---

## Setup

### 1. Install deps

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then in the SQL
Editor run the migration:

```
supabase/migrations/0001_init.sql
```

This creates the `registrations`, `survey_responses` and `admin_profiles`
tables, helper functions, and Row Level Security policies.

### 3. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Get these from **Supabase dashboard → Project settings → API**.

> ⚠️ The service-role key is **server-only**. Never expose it to the browser.

### 4. Create the first chairman

In the Supabase dashboard:

1. Go to **Authentication → Users → Add user** (with password, email
   confirmed).
2. Copy the new user's UUID.
3. Open the SQL editor and run:

```sql
insert into public.admin_profiles (id, full_name, role)
values ('<paste-the-uuid>', 'Your Name', 'chairman');
```

That's it — the chairman can now log in and add the rest of the team from
**`/admin/team`**.

### 5. Run

```bash
npm run dev
```

Visit:

- Public: <http://localhost:3000>
- Officer login: <http://localhost:3000/admin/login>

---

## Replacing the placeholder PCEA logo

The current logo (cross + book + shield) is a placeholder built in inline SVG
in `components/logo.tsx`. To swap it for the real PCEA crest:

1. Drop a transparent PNG at `public/pcea-logo.png` (≥ 256×256 ideally).
2. Open `components/logo.tsx` and replace the inline `<svg>` with:

```tsx
<img src="/pcea-logo.png" alt="PCEA" width={44} height={44} />
```

Everything will continue to work — the rest of the layout doesn't change.

---

## Deployment

Vercel is the easiest path:

1. Push the repo to GitHub.
2. Import to Vercel.
3. Add the same three environment variables.
4. Deploy. Done.

---

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first `@theme`, no JS config)
- Supabase (Postgres + Auth + RLS)
- React Hook Form + Zod
- shadcn-style primitives, lucide-react icons
- Sonner for toasts

---

© PCEA Nanyuki Town Church — Youth Fellowship. Powered by Alvania Data Group.
