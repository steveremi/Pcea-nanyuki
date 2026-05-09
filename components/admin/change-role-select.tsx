"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type Role } from "@/lib/types";

export function ChangeRoleSelect({ id, role }: { id: string; role: Role }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    if (newRole === role) return;
    setPending(true);
    const res = await fetch(`/api/admin/officers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setPending(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Could not update role");
      return;
    }
    toast.success("Role updated");
    router.refresh();
  }

  return (
    <select
      defaultValue={role}
      onChange={onChange}
      disabled={pending}
      className="h-9 rounded-lg border border-cream-300 bg-white px-3 text-xs font-medium focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none disabled:opacity-50"
    >
      {ASSIGNABLE_ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}
