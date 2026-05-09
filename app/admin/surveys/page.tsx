import Link from "next/link";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SurveyResponse, AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";

export const metadata = { title: "Surveys · PCEA NTC Youth Admin" };

export default async function SurveysListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single<AdminProfile>();

  const { data: surveys, count } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (surveys ?? []) as SurveyResponse[];

  const avgVibrancy = list.length
    ? (list.reduce((s, r) => s + r.vibrancy_rating, 0) / list.length).toFixed(1)
    : "—";
  const avgInfluence = list.length
    ? (list.reduce((s, r) => s + r.influence_rating, 0) / list.length).toFixed(1)
    : "—";
  const memberPct = list.length
    ? Math.round(
        (list.filter((r) => r.is_church_member).length / list.length) * 100
      )
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">
            Survey responses
          </h1>
          <p className="text-navy-600 text-sm mt-1">
            {count ?? 0} response{count === 1 ? "" : "s"}
          </p>
        </div>
        {can(profile?.role, "surveys", "export") && (
          <a
            href="/api/surveys/export"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-navy-900/20 text-sm font-semibold text-navy-900 hover:bg-navy-900 hover:text-cream-50 transition"
          >
            <Download className="size-4" /> Export CSV
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatChip label="Avg vibrancy" value={`${avgVibrancy} / 10`} />
        <StatChip label="Avg influence" value={`${avgInfluence} / 10`} />
        <StatChip label="Members" value={`${memberPct}%`} />
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.length ? (
          list.map((s) => <SurveyRow key={s.id} survey={s} />)
        ) : (
          <Card>
            <CardBody>
              <p className="text-sm text-navy-500 text-center py-8">
                No survey responses yet.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Card className="!rounded-xl">
      <div className="p-5">
        <div className="text-xs uppercase tracking-wider text-navy-500 font-medium">
          {label}
        </div>
        <div className="font-display text-2xl font-semibold text-navy-900 mt-1">
          {value}
        </div>
      </div>
    </Card>
  );
}

function SurveyRow({ survey: s }: { survey: SurveyResponse }) {
  return (
    <Link
      href={`/admin/surveys/${s.id}`}
      className="block group"
    >
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_0_rgba(15,42,71,0.05),0_18px_36px_-20px_rgba(15,42,71,0.2)]">
        <CardBody className="!p-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="size-12 rounded-xl bg-navy-900 text-cream-50 grid place-items-center font-display text-lg font-semibold">
                {s.vibrancy_rating}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-navy-500 font-medium">
                vibrancy
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={s.is_church_member ? "green" : "muted"}>
                  {s.is_church_member ? "Member" : "Visitor"}
                </Badge>
                <Badge variant="navy">{s.age_group}</Badge>
                <Badge variant="gold">
                  Influence: {s.influence_rating}/10
                </Badge>
              </div>
              {(s.strengths || s.weaknesses || s.other_suggestions) && (
                <p className="text-sm text-navy-700 mt-2 line-clamp-2">
                  {s.strengths || s.weaknesses || s.other_suggestions}
                </p>
              )}
              <p className="text-xs text-navy-500 mt-2">
                {formatDate(s.created_at)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
