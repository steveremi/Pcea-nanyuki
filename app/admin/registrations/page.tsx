import Link from "next/link";
import { Search, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, formatKES, maskPhone } from "@/lib/utils";
import type { Registration, AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { fetchLookups } from "@/lib/lookups";

export const metadata = { title: "Registrations · PCEA NTC Youth Admin" };
export const dynamic = "force-dynamic";

export default async function RegistrationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; district?: string; age?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const lookups = await fetchLookups();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single<AdminProfile>();

  let query = supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (sp.q) query = query.ilike("full_name", `%${sp.q}%`);
  if (sp.district) query = query.eq("district", sp.district);
  if (sp.age) query = query.eq("age_group", sp.age);

  const { data: registrations } = await query;
  const list = (registrations ?? []) as Registration[];

  const totalAmount = list.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">
            Registrations
          </h1>
          <p className="text-navy-600 text-sm mt-1">
            {list.length} record{list.length === 1 ? "" : "s"} ·{" "}
            {formatKES(totalAmount)} total
          </p>
        </div>
        {can(profile?.role, "registrations", "export") && (
          <a
            href="/api/registrations/export"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-navy-900/20 text-sm font-semibold text-navy-900 hover:bg-navy-900 hover:text-cream-50 transition"
          >
            <Download className="size-4" /> Export CSV
          </a>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <form className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-navy-400" />
              <input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search by name…"
                className="h-11 w-full rounded-lg border border-cream-300 bg-white pl-10 pr-4 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
              />
            </div>
            <select
              name="district"
              defaultValue={sp.district ?? ""}
              className="h-11 rounded-lg border border-cream-300 bg-white px-4 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
            >
              <option value="">All districts</option>
              {lookups.districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              name="age"
              defaultValue={sp.age ?? ""}
              className="h-11 rounded-lg border border-cream-300 bg-white px-4 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
            >
              <option value="">All ages</option>
              {lookups.ageGroups.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <div className="sm:col-span-3 flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-navy-900 text-cream-50 text-sm font-semibold hover:bg-navy-800 transition"
              >
                Apply filters
              </button>
              <Link
                href="/admin/registrations"
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-sm font-medium text-navy-700 hover:bg-navy-900/5 transition"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100/80 border-b border-cream-200">
                <tr className="text-left text-xs uppercase tracking-wider text-navy-600">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Age</th>
                  <th className="px-6 py-3 font-semibold">District</th>
                  <th className="px-6 py-3 font-semibold">Contact</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {list.length ? (
                  list.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-cream-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/registrations/${r.id}`}
                          className="font-medium text-navy-900 hover:underline"
                        >
                          {r.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-navy-700">
                        {r.age_group}
                      </td>
                      <td className="px-6 py-4 text-navy-700">
                        {r.district}
                      </td>
                      <td className="px-6 py-4 text-navy-700 tabular-nums">
                        {maskPhone(r.contact)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            r.membership_status === "Full Member"
                              ? "green"
                              : "muted"
                          }
                        >
                          {r.membership_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-navy-900 tabular-nums">
                        {formatKES(Number(r.amount))}
                      </td>
                      <td className="px-6 py-4 text-navy-500 whitespace-nowrap">
                        {formatDateShort(r.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-navy-500"
                    >
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
