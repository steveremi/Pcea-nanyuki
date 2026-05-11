import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { fetchLookups } from "@/lib/lookups";
import { getSiteSettings } from "@/lib/site-settings";
import { LookupManager } from "@/components/admin/lookup-manager";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata = { title: "Settings · PCEA NTC Youth Admin" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles").select("*").eq("id", user!.id).single<AdminProfile>();

  if (!can(profile?.role, "team", "manage")) {
    redirect("/admin");
  }

  const [lookups, siteSettings] = await Promise.all([
    fetchLookups(),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Edit church info shown to the public, and manage the lists used in registration and survey forms.
        </p>
      </div>

      <section>
        <h2 className="font-display text-base font-semibold text-navy-900 mb-2">Church info</h2>
        <SiteSettingsForm initial={siteSettings} />
      </section>

      <section>
        <h2 className="font-display text-base font-semibold text-navy-900 mb-2">Lookup lists</h2>
        <p className="text-xs text-slate-500 mb-3">
          Adding or hiding a value here changes the dropdowns on the public forms instantly.
        </p>

        <div className="grid lg:grid-cols-2 gap-4">
          <LookupManager label="Districts" table="districts" items={lookups.districts} />
          <LookupManager label="Ministries" table="ministries" items={lookups.ministries} />
          <LookupManager label="Age groups (registration)" table="age_groups" items={lookups.ageGroups} />
          <LookupManager label="Membership statuses" table="membership_statuses" items={lookups.membershipStatuses} />
          <LookupManager label="Age groups (survey)" table="survey_age_groups" items={lookups.surveyAgeGroups} />
        </div>
      </section>
    </div>
  );
}
