import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { toCSV } from "@/lib/csv";
import type { SurveyResponse } from "@/lib/types";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!can(auth.profile.role, "surveys", "export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await auth.supabase
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as SurveyResponse[];
  const csv = toCSV(rows, [
    { key: "is_church_member", label: "Is church member" },
    { key: "age_group", label: "Age group" },
    { key: "vibrancy_rating", label: "Vibrancy (1-10)" },
    { key: "weaknesses", label: "Weaknesses" },
    { key: "strengths", label: "Strengths" },
    { key: "programs_to_incorporate", label: "Programs to incorporate" },
    { key: "fundraising_ideas", label: "Fundraising ideas" },
    { key: "influence_rating", label: "Influence (1-10)" },
    { key: "pull_teenagers", label: "Pulling teenagers" },
    { key: "feels_supported", label: "Feels supported" },
    { key: "serves_best", label: "Serves best" },
    { key: "service_hindrances", label: "Service hindrances" },
    { key: "attends_youth_service", label: "Attends youth service" },
    { key: "not_attending_reason", label: "Not attending reason" },
    { key: "has_district", label: "Has district" },
    { key: "attends_fellowship", label: "Attends fellowship" },
    { key: "district_hindrance", label: "District hindrance" },
    { key: "would_like_to_join", label: "Would like to join" },
    { key: "other_suggestions", label: "Other suggestions" },
    { key: "created_at", label: "Submitted at" },
  ]);

  const filename = `pcea-ntc-surveys-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
