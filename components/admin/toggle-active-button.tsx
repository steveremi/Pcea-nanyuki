"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Power } from "lucide-react";

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onToggle() {
    const verb = isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${verb} this officer?`)) return;
    setPending(true);
    const res = await fetch(`/api/admin/officers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    setPending(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Could not update");
      return;
    }
    toast.success(`Officer ${verb}d`);
    router.refresh();
  }

  return (
    <button
      onClick={onToggle}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
        isActive
          ? "border border-cream-300 text-navy-700 hover:bg-terracotta-500/10 hover:border-terracotta-500/30 hover:text-terracotta-600"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }`}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Power className="size-3.5" />
      )}
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
