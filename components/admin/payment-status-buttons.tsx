"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, XCircle, Clock, MinusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePaymentStatus } from "@/app/admin/payments/actions";
import type { PaymentStatus } from "@/lib/types";

const OPTS: { value: PaymentStatus; label: string; icon: typeof CheckCircle2; cls: string }[] = [
  { value: "confirmed", label: "Confirm", icon: CheckCircle2, cls: "text-emerald-700 hover:bg-emerald-50 border-emerald-200" },
  { value: "failed", label: "Failed", icon: XCircle, cls: "text-rose-700 hover:bg-rose-50 border-rose-200" },
  { value: "pending", label: "Reset", icon: Clock, cls: "text-navy-600 hover:bg-navy-50 border-navy-200" },
  { value: "waived", label: "Waive", icon: MinusCircle, cls: "text-amber-700 hover:bg-amber-50 border-amber-200" },
];

export function PaymentStatusButtons({
  id,
  current,
}: {
  id: string;
  current: PaymentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<PaymentStatus | null>(null);

  function go(status: PaymentStatus) {
    if (status === current) return;
    setBusyAction(status);
    startTransition(async () => {
      const result = await updatePaymentStatus(id, status);
      setBusyAction(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Marked as ${status}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTS.filter((o) => o.value !== current).map((opt) => {
        const Icon = opt.icon;
        const isBusy = pending && busyAction === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => go(opt.value)}
            disabled={pending}
            className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-md border text-xs font-medium transition disabled:opacity-50 ${opt.cls}`}
          >
            {isBusy ? <Loader2 className="size-3 animate-spin" /> : <Icon className="size-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
