import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Star,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type AdminProfile } from "@/lib/types";
import { formatKES, formatDateShort } from "@/lib/utils";
import {
  RegistrationsTrend,
  AgeDistribution,
  MinistryPie,
} from "@/components/admin/dashboard-charts";

export const metadata = { title: "Dashboard · PCEA NTC Youth Admin" };
export const revalidate = 30; // refresh dashboard every 30 sec

type DashboardData = {
  reg_count: number;
  survey_count: number;
  total_amount: number;
  pending_amount: number;
  member_pct: number;
  avg_vibrancy: number;
  recent_regs: Array<{
    id: string;
    full_name: string;
    age_group: string;
    district: string;
    contact: string;
    amount: number;
    payment_status: string;
    mpesa_code: string | null;
    created_at: string;
  }>;
  recent_surveys: Array<{
    id: string;
    is_church_member: boolean;
    age_group: string;
    vibrancy_rating: number;
    created_at: string;
  }>;
  age_distribution: Array<{ age_group: string; count: number }>;
  ministry_distribution: Array<{ name: string; count: number }>;
  trend_14d: Array<{ day: string; count: number }>;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles").select("*").eq("id", user!.id).single<AdminProfile>();

  // Single round-trip for ALL dashboard data
  const { data: rpcData } = await supabase.rpc("dashboard_data");
  const d = (rpcData ?? {
    reg_count: 0, survey_count: 0, total_amount: 0, pending_amount: 0,
    member_pct: 0, avg_vibrancy: 0,
    recent_regs: [], recent_surveys: [],
    age_distribution: [], ministry_distribution: [], trend_14d: [],
  }) as DashboardData;

  // Fill in last 14 days (some days will have 0)
  const trendMap = new Map<string, number>();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    trendMap.set(dt.toISOString().slice(5, 10), 0);
  }
  d.trend_14d.forEach((p) => {
    if (trendMap.has(p.day)) trendMap.set(p.day, p.count);
  });
  const trendData = Array.from(trendMap.entries()).map(([day, count]) => ({ day, count }));

  const ageData = d.age_distribution.map((a) => ({ name: a.age_group, count: a.count }));
  const ministryData = d.ministry_distribution;

  return (
    <div className="space-y-3 max-w-[1400px] mx-auto w-full">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-[22px] font-semibold text-navy-900 leading-tight">
            {greeting()}, {profile!.full_name.split(" ")[0]}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {ROLE_LABELS[profile!.role]} ·{" "}
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Tile label="Registered" value={String(d.reg_count)} icon={Users} accent="navy" />
        <Tile label="Confirmed" value={formatKES(d.total_amount)} icon={TrendingUp} accent="gold" />
        <Tile label="Pending" value={formatKES(d.pending_amount)} icon={Clock} accent="navy" />
        <Tile label="Surveys" value={String(d.survey_count)} icon={ClipboardList} accent="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        <Panel className="lg:col-span-8" title="Registrations" subtitle="Last 14 days">
          <div className="h-[160px]">
            <RegistrationsTrend data={trendData} />
          </div>
        </Panel>

        <Panel className="lg:col-span-4" title="Survey rating" subtitle="Average vibrancy">
          {d.survey_count > 0 ? (
            <div className="h-[160px] flex flex-col items-center justify-center text-center">
              <div className="font-display text-5xl font-semibold text-navy-900 tabular-nums leading-none">
                {Number(d.avg_vibrancy).toFixed(1)}
                <span className="text-lg text-slate-400">/10</span>
              </div>
              <div className="flex gap-0.5 mt-3">
                {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                  <Star
                    key={i}
                    className={`size-3 ${i <= Math.round(d.avg_vibrancy) ? "fill-gold-500 text-gold-500" : "text-slate-200 fill-slate-200"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {d.survey_count} response{d.survey_count === 1 ? "" : "s"} · {d.member_pct}% members
              </p>
            </div>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel className="lg:col-span-4" title="By age" subtitle="All registrations">
          <div className="h-[160px]">
            <AgeDistribution data={ageData} />
          </div>
        </Panel>

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

        <Panel
          className="lg:col-span-4"
          title="Recent registrations"
          subtitle="Latest"
          right={
            <Link href="/admin/registrations" className="text-[11px] font-medium text-navy-600 hover:text-navy-900 inline-flex items-center gap-1">
              All <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          {d.recent_regs.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center"><Empty /></div>
          ) : (
            <div className="space-y-1.5 h-[160px] overflow-y-auto">
              {d.recent_regs.map((r) => (
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
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-[10px] font-medium text-slate-700 tabular-nums">
                      {formatKES(Number(r.amount))}
                    </div>
                    {r.payment_status === "pending" && r.amount > 0 && (
                      <span className="text-[9px] text-amber-600">pending</span>
                    )}
                    {r.payment_status === "confirmed" && (
                      <span className="text-[9px] text-emerald-600">✓ paid</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, right, className, children }: {
  title: string; subtitle?: string; right?: React.ReactNode; className?: string; children: React.ReactNode;
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

function Tile({ label, value, icon: Icon, accent }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent: "navy" | "gold";
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2.5">
      <div className={accent === "navy"
        ? "size-8 rounded-md bg-navy-50 text-navy-700 grid place-items-center shrink-0"
        : "size-8 rounded-md bg-gold-100 text-gold-700 grid place-items-center shrink-0"}>
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
