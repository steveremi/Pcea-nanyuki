import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { toCSV } from "@/lib/csv";
import type { Registration } from "@/lib/types";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!can(auth.profile.role, "registrations", "export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await auth.supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Registration[];
  const csv = toCSV(rows, [
    { key: "full_name", label: "Full name" },
    { key: "age_group", label: "Age group" },
    { key: "district", label: "District" },
    { key: "contact", label: "Contact" },
    { key: "ministries", label: "Ministries" },
    { key: "membership_status", label: "Membership status" },
    { key: "amount", label: "Amount (KES)" },
    { key: "notes", label: "Notes" },
    { key: "created_at", label: "Registered at" },
  ]);

  const filename = `pcea-ntc-registrations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
