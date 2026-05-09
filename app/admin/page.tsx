import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type Registration, type SurveyResponse } from "@/lib/types";
import { formatKES, formatDateShort } from "@/lib/utils";
import {
  RegistrationsTrend,
  AgeDistribution,
  MinistryPie,
} from "@/components/admin/dashboard-charts";

export const metadata = { title: "Dashboard · PCEA NTC Youth Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const [
    { data: regsForAnalytics, count: regCount },
    { data: surveysForAnalytics, count: surveyCount },
    { data: recentRegs },
    { data: recentSurveys },
  ] = await Promise.all([
    supabase
      .from("registrations")
      .select("amount, age_group, district, ministries, created_at", { count: "exact" }),
    supabase
      .from("survey_responses")
      .select("vibrancy_rating, influence_rating, is_church_member, age_group, created_at", { count: "exact" }),
    supabase.from("registrations").select("*").order("created_at", { ascending: false }).limit(4),
    supabase.from("survey_responses").select("*").order("created_at", { ascending: false }).limit(4),
  ]);

  type RegLite = Pick<Registration, "amount" | "age_group" | "district" | "ministries" | "created_at">;
  type SurveyLite = Pick<SurveyResponse, "vibrancy_rating" | "influence_rating" | "is_church_member" | "age_group" | "created_at">;
  const allRegs = (regsForAnalytics ?? []) as RegLite[];
  const allSurveys = (surveysForAnalytics ?? []) as SurveyLite[];

  const totalRevenue = allRegs.reduce((s, r) => s + Number(r.amount), 0);

  const trendMap = new Map<string, number>();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().slice(5, 10), 0);
  }
  allRegs.forEach((r) => {
    const k = new Date(r.created_at).toISOString().slice(5, 10);
    if (trendMap.has(k)) trendMap.set(k, (trendMap.get(k) ?? 0) + 1);
  });
  const trendData = Array.from(trendMap.entries()).map(([day, count]) => ({ day, count }));

  const ageMap = new Map<string, number>();
  allRegs.forEach((r) => ageMap.set(r.age_group, (ageMap.get(r.age_group) ?? 0) + 1));
  const ageData = Array.from(ageMap.entries()).sort().map(([name, count]) => ({ name, count }));

  const ministryMap = new Map<string, number>();
  allRegs.forEach((r) => r.ministries?.forEach((m) => ministryMap.set(m, (ministryMap.get(m) ?? 0) + 1)));
  const ministryData = Array.from(ministryMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const avgVibrancy = allSurveys.length ? allSurveys.reduce((s, r) => s + r.vibrancy_rating, 0) / allSurveys.length : 0;
  const memberPct = allSurveys.length
    ? Math.round((allSurveys.filter((s) => s.is_church_member).length / allSurveys.length) * 100)
    : 0;

  return (
    <div className="space-y-3 max-w-[1400px] mx-auto w-full">
      {/* Welcome strip */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-[22px] font-semibold text-navy-900 leading-tight">
            {greeting()}, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]} ·{" "}
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Compact stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Tile label="Registered" value={String(regCount ?? 0)} icon={Users} accent="navy" />
        <Tile label="Contributions" value={formatKES(totalRevenue)} icon={TrendingUp} accent="gold" />
        <Tile label="Surveys" value={String(surveyCount ?? 0)} icon={ClipboardList} accent="navy" />
        <Tile label="Members" value={allSurveys.length ? `${memberPct}%` : "—"} icon={CheckCircle2} accent="gold" />
      </div>

      {/* Main grid — fits in viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Trend chart - largest */}
        <Panel className="lg:col-span-8" title="Registrations" subtitle="Last 14 days">
          <div className="h-[160px]">
            <RegistrationsTrend data={trendData} />
          </div>
        </Panel>

        {/* Survey rating */}
        <Panel className="lg:col-span-4" title="Survey rating" subtitle="Avg vibrancy">
          {allSurveys.length > 0 ? (
            <div className="h-[160px] flex flex-col items-center justify-center text-center">
              <div className="font-display text-5xl font-semibold text-navy-900 tabular-nums leading-none">
                {avgVibrancy.toFixed(1)}
                <span className="text-lg text-slate-400">/10</span>
              </div>
              <div className="flex gap-0.5 mt-3">
                {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                  <Star
                    key={i}
                    className={`size-3 ${i <= Math.round(avgVibrancy) ? "fill-gold-500 text-gold-500" : "text-slate-200 fill-slate-200"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {allSurveys.length} response{allSurveys.length === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <Empty />
          )}
        </Panel>

        {/* By age */}
        <Panel className="lg:col-span-4" title="By age" subtitle="All registrations">
          <div className="h-[160px]">
            <AgeDistribution data={ageData} />
          </div>
        </Panel>

        {/* Ministries pie */}
        <Panel className="lg:col-span-4" title="Ministries" subtitle="Most-picked">
          {ministryData.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center"><Empty /></div>
          ) : (
            <div className="h-[160px] flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <MinistryPie data={ministryData} />
              </div>
              <div className="flex flex-col gap-1 w-[110px]">
                {ministryData.slice(0, 5).map((m, i) => (
                  <div key={m.name} className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className="size-2 rounded-sm shrink-0"
                      style={{ backgroundColor: ["#0f2a47", "#c9a961", "#547ba6", "#c45a3f", "#a88639"][i] }}
                    />
                    <span className="flex-1 text-slate-600 truncate">{m.name}</span>
                    <span className="text-slate-500 tabular-nums font-medium">{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Recent registrations */}
        <Panel
          className="lg:col-span-4"
          title="Recent registrations"
          subtitle="Latest 4"
          right={
            <Link href="/admin/registrations" className="text-[11px] font-medium text-navy-600 hover:text-navy-900 inline-flex items-center gap-1">
              All <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          {(recentRegs as Registration[] | null)?.length ? (
            <div className="space-y-1.5 h-[160px] overflow-y-auto">
              {(recentRegs as Registration[]).map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/registrations/${r.id}`}
                  className="flex items-center gap-2 py-1 px-1 rounded hover:bg-slate-50 transition"
                >
                  <div className="size-7 rounded-full bg-navy-50 text-navy-900 grid place-items-center font-semibold text-[10px] shrink-0">
                    {r.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-navy-900 truncate leading-tight">{r.full_name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{r.district}</div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-700 tabular-nums shrink-0">
                    {formatKES(Number(r.amount))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center"><Empty /></div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  right,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-3.5 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-navy-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Tile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "navy" | "gold";
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2.5">
      <div
        className={
          accent === "navy"
            ? "size-8 rounded-md bg-navy-50 text-navy-700 grid place-items-center shrink-0"
            : "size-8 rounded-md bg-gold-100 text-gold-700 grid place-items-center shrink-0"
        }
      >
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="font-display text-[17px] font-semibold text-navy-900 leading-tight mt-0.5 truncate">{value}</div>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-[11px] text-slate-400">No data yet</p>;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
