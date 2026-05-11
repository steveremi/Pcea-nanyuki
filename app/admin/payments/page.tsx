import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, MinusCircle, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatKES, formatDateShort } from "@/lib/utils";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  type Registration,
  type AdminProfile,
  type PaymentStatus,
} from "@/lib/types";
import { PaymentStatusButtons } from "@/components/admin/payment-status-buttons";

export const metadata = { title: "Payments · PCEA NTC Youth Admin" };
export const dynamic = "force-dynamic";

type FilterValue = PaymentStatus | "all";

const STATUS_ICONS: Record<PaymentStatus, typeof CheckCircle2> = {
  confirmed: CheckCircle2,
  failed: XCircle,
  pending: Clock,
  waived: MinusCircle,
};

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  waived: "bg-slate-50 text-slate-600 border-slate-200",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const requested = sp.status as FilterValue | undefined;
  const filter: FilterValue =
    requested && (PAYMENT_STATUSES.includes(requested as PaymentStatus) || requested === "all")
      ? requested
      : "pending";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("admin_profiles").select("*").eq("id", user!.id).single<AdminProfile>();

  if (!profile || !["superadmin", "chairman", "treasurer"].includes(profile.role)) {
    redirect("/admin");
  }

  let query = supabase
    .from("registrations")
    .select("*")
    .gt("amount", 0)
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("payment_status", filter);
  }
  const { data } = await query;
  const list = (data ?? []) as Registration[];

  const { data: counts } = await supabase
    .from("registrations")
    .select("payment_status, amount")
    .gt("amount", 0);

  const stats = { pending: 0, confirmed: 0, failed: 0, waived: 0, all: 0, totalPending: 0, totalConfirmed: 0 };
  (counts ?? []).forEach((r: { payment_status: PaymentStatus; amount: number }) => {
    stats[r.payment_status]++;
    stats.all++;
    if (r.payment_status === "pending") stats.totalPending += Number(r.amount);
    if (r.payment_status === "confirmed") stats.totalConfirmed += Number(r.amount);
  });

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto w-full">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-navy-900">Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.pending} awaiting verification · {formatKES(stats.totalPending)} pending · {formatKES(stats.totalConfirmed)} confirmed
          </p>
        </div>
      </header>

      <div className="flex gap-2 flex-wrap">
        {([
          { v: "pending" as const, label: `Pending (${stats.pending})` },
          { v: "confirmed" as const, label: `Confirmed (${stats.confirmed})` },
          { v: "failed" as const, label: `Failed (${stats.failed})` },
          { v: "waived" as const, label: `Waived (${stats.waived})` },
          { v: "all" as const, label: `All (${stats.all})` },
        ]).map((p) => {
          const active = filter === p.v;
          return (
            <Link
              key={p.v}
              href={`/admin/payments?status=${p.v}`}
              className={`px-3 h-8 rounded-full text-xs font-medium border flex items-center transition ${
                active ? "bg-navy-900 text-cream-50 border-navy-900" : "bg-white text-navy-700 border-slate-200 hover:border-navy-300"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No {filter !== "all" ? filter : ""} payments.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-navy-50/40 border-b border-slate-200">
              <tr className="text-left text-[10px] uppercase tracking-wider text-navy-600">
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Phone</th>
                <th className="px-4 py-2.5 font-semibold">M-Pesa Code</th>
                <th className="px-4 py-2.5 font-semibold">Amount</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold w-px">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((r) => {
                const StIcon = STATUS_ICONS[r.payment_status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/registrations/${r.id}`} className="font-medium text-navy-900 hover:underline inline-flex items-center gap-1">
                        {r.full_name}
                        <ArrowUpRight className="size-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-navy-700 tabular-nums">{r.contact}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-navy-800">{r.mpesa_code ?? "—"}</td>
                    <td className="px-4 py-2.5 font-medium text-navy-900 tabular-nums">{formatKES(Number(r.amount))}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{formatDateShort(r.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-medium border ${STATUS_CLASSES[r.payment_status]}`}>
                        <StIcon className="size-3" />
                        {PAYMENT_STATUS_LABELS[r.payment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <PaymentStatusButtons id={r.id} current={r.payment_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
