import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { formatDateShort } from "@/lib/utils";
import { AddOfficerForm } from "@/components/admin/add-officer-form";
import { ChangeRoleSelect } from "@/components/admin/change-role-select";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";

export const metadata = { title: "Officers · PCEA NTC Youth Admin" };

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single<AdminProfile>();

  // Only chairman/superadmin can access this page at all
  if (!can(profile?.role, "team", "manage")) {
    redirect("/admin");
  }

  const { data: officers } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const list = (officers ?? []) as AdminProfile[];
  const canManage = true; // We already checked above

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">
          Officers
        </h1>
        <p className="text-navy-600 text-sm mt-1">
          {canManage
            ? "Add new officers and manage roles. Only the chairman can do this."
            : "Read-only view of the officer team."}
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-semibold text-navy-900">
              Add a new officer
            </h2>
            <p className="text-sm text-navy-600 mt-1">
              They'll receive the credentials below. Share them privately.
            </p>
          </CardHeader>
          <CardBody>
            <AddOfficerForm />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-navy-900">
            Current officers
          </h2>
        </CardHeader>
        <CardBody className="!p-0">
          <div className="divide-y divide-cream-200">
            {list.length ? (
              list.map((o) => {
                const isSelf = o.id === profile?.id;
                return (
                  <div
                    key={o.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="size-10 rounded-full bg-navy-900/10 text-navy-900 grid place-items-center font-semibold text-sm">
                      {o.full_name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-navy-900 flex items-center gap-2">
                        {o.full_name}
                        {isSelf && (
                          <Badge variant="gold">You</Badge>
                        )}
                        {!o.is_active && (
                          <Badge variant="terracotta">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-xs text-navy-500">
                        {ROLE_LABELS[o.role]} · joined{" "}
                        {formatDateShort(o.created_at)}
                      </div>
                    </div>

                    {canManage && !isSelf ? (
                      <div className="flex items-center gap-2">
                        <ChangeRoleSelect id={o.id} role={o.role} />
                        <ToggleActiveButton
                          id={o.id}
                          isActive={o.is_active}
                        />
                      </div>
                    ) : (
                      <Badge variant="navy">{ROLE_LABELS[o.role]}</Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="px-6 py-12 text-center text-sm text-navy-500">
                No officers yet.
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
