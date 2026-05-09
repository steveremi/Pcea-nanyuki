# START HERE — PCEA NTC Youth Fellowship

Step-by-step. Do these in order.

---

## 0. Replace your existing project with this zip

Open a terminal and run:

```bash
# Backup your env
cp ~/projects/pcea-ntc-youth/.env.local ~/pcea-env-backup 2>/dev/null

# Replace project
cd ~/projects
sudo rm -rf pcea-ntc-youth
unzip ~/Downloads/pcea-ntc-youth.zip
cd pcea-ntc-youth

# Restore env
cp ~/pcea-env-backup .env.local 2>/dev/null

npm install
```

---

## 1. Run the new database migration (0003)

In your terminal:

```bash
cat supabase/migrations/0003_lookup_tables.sql | xclip -selection clipboard
```

Then in Supabase **SQL Editor → + New query**:
- Click in the editor → `Ctrl+A` → `Delete` (must be EMPTY)
- `Ctrl+V` to paste the SQL
- First line should read: `-- =====================================================================`
- Click **Run**

You should see "Success. No rows returned."

This adds 5 lookup tables (districts, ministries, age_groups, membership_statuses, survey_age_groups), seeds them with the current values, and adds RLS so only superadmin/chairman can manage them.

### Verify

In a new query:

```sql
select 'districts' as table, count(*) from public.districts
union all select 'ministries', count(*) from public.ministries
union all select 'age_groups', count(*) from public.age_groups
union all select 'membership_statuses', count(*) from public.membership_statuses
union all select 'survey_age_groups', count(*) from public.survey_age_groups;
```

Should show:
- districts: 10
- ministries: 6
- age_groups: 3
- membership_statuses: 2
- survey_age_groups: 3

---

## 2. Run locally

```bash
npm run dev
```

Open `http://localhost:3001` in **Incognito** (`Ctrl+Shift+N`).

**Tests to run, in order:**

1. **Logo** — real PCEA crest top-left? ✅
2. **Public registration** — fill `/register` → submit → redirects to `/register/thanks`
3. **DB check** — Supabase Table Editor → `registrations` shows your row
4. **Public survey** — fill `/survey` (try age 13-35 to see youth section) → submit
5. **DB check** — `survey_responses` shows your row
6. **Long-press logo** — hold the PCEA logo for 1.5 sec on home page → goes to `/admin/login`
7. **Login** — `whitelist108@gmail.com` + your password → land on dashboard
8. **Settings** — sidebar shows Settings (only for chairman/superadmin) → click it → manage districts/ministries
9. **Test lookup add** — add a test district like "Demo District" → go back to `/register` in another tab → "Demo District" should appear in the list
10. **Officers** — sidebar → Officers → add a test chairman/secretary, log out, log in as them, log out, log back in as superadmin

If all 10 pass, you're ready to deploy.

---

## 3. Push to GitHub

```bash
cd ~/projects/pcea-ntc-youth
git init
git add .
git commit -m "Initial: PCEA NTC Youth Fellowship app"
```

Create the repo:
1. <https://github.com/new>
2. Name: `pcea-ntc-youth`
3. Private (recommended)
4. Don't tick any pre-init options
5. Click Create

Push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/pcea-ntc-youth.git
git branch -M main
git push -u origin main
```

For password, use a Personal Access Token: <https://github.com/settings/tokens>

`.env.local` is in `.gitignore` so keys don't leak.

---

## 4. Deploy to Vercel

1. <https://vercel.com> → sign in with GitHub
2. **Add New** → **Project** → import `pcea-ntc-youth`
3. Before clicking Deploy, expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (leave blank for now)
4. Click **Deploy**. Wait 2 min.

Once deployed, your URL is something like `pcea-ntc-youth-xyz.vercel.app`.

Set `NEXT_PUBLIC_SITE_URL` to that URL → redeploy.

---

## 5. Share the public links

```
https://YOUR-DOMAIN.vercel.app/register
https://YOUR-DOMAIN.vercel.app/survey
```

Officers reach login by:
- Bookmarking `https://YOUR-DOMAIN.vercel.app/admin/login`
- OR long-pressing the logo on any public page

---

## Day-to-day

```bash
git add .
git commit -m "what changed"
git push
```

Vercel auto-deploys.

---

## When you step away

```sql
delete from auth.users where email = 'whitelist108@gmail.com';
```

---

## Roles

| Role            | View regs | Edit regs | Delete regs | Delete surveys | Manage officers | Manage lookups |
|-----------------|:---------:|:---------:|:-----------:|:--------------:|:---------------:|:--------------:|
| Superadmin (you, hidden) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chairman        | ✓         | ✓         | ✓           | ✓              | ✓               | ✓              |
| Vice Chairman   | ✓         | ✓         | ✓           | ✓              | —               | —              |
| Secretary       | ✓         | ✓         | —           | ✓              | —               | —              |
| Vice Secretary  | ✓         | ✓         | —           | —              | —               | —              |
| Treasurer       | ✓         | ✓         | —           | —              | —               | —              |

Database RLS is the source of truth — UI permissions match.

---

WhatsApp: <https://wa.me/254702841059> (Remi)
