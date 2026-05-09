import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatKES } from "@/lib/utils";
import type { Registration, AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { fetchLookups } from "@/lib/lookups";
import { RegistrationEditCard } from "@/components/admin/registration-edit-card";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single<AdminProfile>();

  const { data: reg } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle<Registration>();

  if (!reg) notFound();

  const lookups = await fetchLookups();
  const canEdit = can(profile?.role, "registrations", "edit");
  const canDelete = can(profile?.role, "registrations", "delete");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/registrations"
        className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 transition"
      >
        <ArrowLeft className="size-4" /> Back to registrations
      </Link>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-semibold text-navy-900">
            {reg.full_name}
          </h1>
          <Badge variant={reg.membership_status === "Full Member" ? "green" : "muted"}>
            {reg.membership_status}
          </Badge>
        </div>
        <p className="text-sm text-navy-500 mt-1">
          Registered {formatDate(reg.created_at)}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-xl font-semibold text-navy-900">
                Profile
              </h2>
            </CardHeader>
            <CardBody className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <Detail label="Age group" value={reg.age_group} />
              <Detail label="District" value={reg.district} />
              <Detail label="Contact" value={reg.contact} mono />
              <Detail
                label="Amount paid"
                value={formatKES(Number(reg.amount))}
              />
              <Detail
                label="Ministries"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {reg.ministries.map((m) => (
                      <Badge key={m} variant="navy">
                        {m}
                      </Badge>
                    ))}
                  </div>
                }
                full
              />
              {reg.notes && (
                <Detail
                  label="Notes"
                  value={
                    <p className="text-sm text-navy-700 whitespace-pre-wrap">
                      {reg.notes}
                    </p>
                  }
                  full
                />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {canEdit && (
            <RegistrationEditCard
              registration={reg}
              canDelete={canDelete}
              ageGroups={lookups.ageGroups}
              districts={lookups.districts}
              ministries={lookups.ministries}
              membershipStatuses={lookups.membershipStatuses}
            />
          )}
          {!canEdit && (
            <Card>
              <CardBody>
                <p className="text-sm text-navy-600">
                  You have read-only access to this registration.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  full,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wider text-navy-500 font-medium">
        {label}
      </div>
      <div
        className={`mt-1 text-navy-900 font-medium ${
          mono ? "font-mono text-sm" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
