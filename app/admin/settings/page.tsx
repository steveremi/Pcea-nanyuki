import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { fetchLookups } from "@/lib/lookups";
import { LookupManager } from "@/components/admin/lookup-manager";

export const metadata = { title: "Settings · PCEA NTC Youth Admin" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single<AdminProfile>();

  if (!can(profile?.role, "team", "manage")) {
    redirect("/admin");
  }

  const lookups = await fetchLookups();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">
          Settings
        </h1>
        <p className="text-navy-600 text-sm mt-1">
          Manage the lists shown in the registration and survey forms. Adding
          a value here makes it instantly available on the public forms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Districts
          </h2>
          <p className="text-sm text-navy-600 mt-1">
            Shown on registration form.
          </p>
        </CardHeader>
        <CardBody>
          <LookupManager
            table="districts"
            items={lookups.districts}
            label="district"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Ministries
          </h2>
          <p className="text-sm text-navy-600 mt-1">
            Service ministries youth can pick on registration (max 3).
          </p>
        </CardHeader>
        <CardBody>
          <LookupManager
            table="ministries"
            items={lookups.ministries}
            label="ministry"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Registration age groups
          </h2>
          <p className="text-sm text-navy-600 mt-1">
            Used on the public registration form.
          </p>
        </CardHeader>
        <CardBody>
          <LookupManager
            table="age_groups"
            items={lookups.ageGroups}
            label="age group"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Membership statuses
          </h2>
        </CardHeader>
        <CardBody>
          <LookupManager
            table="membership_statuses"
            items={lookups.membershipStatuses}
            label="membership status"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Survey age groups
          </h2>
          <p className="text-sm text-navy-600 mt-1">
            Used on the public survey form.
          </p>
        </CardHeader>
        <CardBody>
          <LookupManager
            table="survey_age_groups"
            items={lookups.surveyAgeGroups}
            label="age group"
          />
        </CardBody>
      </Card>
    </div>
  );
}
