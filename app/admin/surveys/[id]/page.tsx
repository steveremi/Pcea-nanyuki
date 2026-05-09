import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SurveyResponse, AdminProfile } from "@/lib/types";
import { can } from "@/lib/permissions";
import { DeleteSurveyButton } from "@/components/admin/delete-survey-button";

export default async function SurveyDetailPage({
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

  const { data: s } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("id", id)
    .maybeSingle<SurveyResponse>();

  if (!s) notFound();

  const isYouth = s.age_group === "13-35";
  const canDelete = can(profile?.role, "surveys", "delete");
  const fmtBool = (v: boolean | null) =>
    v === true ? "Yes" : v === false ? "No" : "—";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/admin/surveys"
        className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 transition"
      >
        <ArrowLeft className="size-4" /> Back to surveys
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">
            Survey response
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            {formatDate(s.created_at)}
          </p>
        </div>
        {canDelete && <DeleteSurveyButton id={s.id} />}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={s.is_church_member ? "green" : "muted"}>
              {s.is_church_member ? "Church member" : "Visitor"}
            </Badge>
            <Badge variant="navy">{s.age_group} years</Badge>
            <Badge variant="gold">Vibrancy: {s.vibrancy_rating}/10</Badge>
            <Badge variant="gold">Influence: {s.influence_rating}/10</Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <Block label="Weaknesses (areas to improve)" content={s.weaknesses} />
          <Block label="Strengths" content={s.strengths} />
          <Block
            label="Programs to incorporate"
            content={s.programs_to_incorporate}
          />
          <Block label="Fundraising ideas" content={s.fundraising_ideas} />
          <Block label="Pulling teenagers" content={s.pull_teenagers} />

          {isYouth && (
            <>
              <hr className="border-cream-200" />
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Youth section (13–35)
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <KV label="Feels supported" value={fmtBool(s.feels_supported)} />
                <KV
                  label="Serves to fullest"
                  value={fmtBool(s.serves_best)}
                />
                <KV
                  label="Attends youth service"
                  value={fmtBool(s.attends_youth_service)}
                />
                <KV
                  label="Has a district"
                  value={fmtBool(s.has_district)}
                />
                {s.has_district === true && (
                  <KV
                    label="Attends fellowship"
                    value={fmtBool(s.attends_fellowship)}
                  />
                )}
                {s.has_district === false && (
                  <KV
                    label="Would like to join"
                    value={fmtBool(s.would_like_to_join)}
                  />
                )}
              </div>
              <Block
                label="What hinders service"
                content={s.service_hindrances}
              />
              <Block
                label="Reason for not attending youth service"
                content={s.not_attending_reason}
              />
              <Block
                label="What hindered joining a district"
                content={s.district_hindrance}
              />
            </>
          )}

          <hr className="border-cream-200" />
          <Block
            label="Other suggestions"
            content={s.other_suggestions}
          />
        </CardBody>
      </Card>
    </div>
  );
}

function Block({
  label,
  content,
}: {
  label: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-navy-500 font-medium">
        {label}
      </div>
      <p className="mt-2 text-navy-800 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cream-300 bg-cream-50/50 px-4 py-3">
      <div className="text-xs text-navy-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="font-medium text-navy-900 mt-1">{value}</div>
    </div>
  );
}
