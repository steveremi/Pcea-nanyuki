"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, EyeOff, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { LookupItem } from "@/lib/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Table =
  | "districts"
  | "ministries"
  | "age_groups"
  | "membership_statuses"
  | "survey_age_groups";

export function LookupManager({
  table,
  items,
  label,
}: {
  table: Table;
  items: LookupItem[];
  label: string;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  async function add() {
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      toast.error("Enter a value first");
      return;
    }

    setPending(true);
    const maxSort = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
    const { error } = await supabase
      .from(table)
      .insert({ name: trimmed, sort_order: maxSort + 10 });
    setPending(false);

    if (error) {
      toast.error(
        error.code === "23505"
          ? `That ${label} already exists`
          : error.message || "Could not add"
      );
      return;
    }
    toast.success(`Added ${trimmed}`);
    setName("");
    router.refresh();
  }

  async function toggleActive(item: LookupItem) {
    const verb = item.is_active ? "hide" : "restore";
    if (!confirm(`Are you sure you want to ${verb} "${item.name}"?`)) return;

    const { error } = await supabase
      .from(table)
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message || "Could not update");
      return;
    }
    toast.success(item.is_active ? "Hidden" : "Restored");
    router.refresh();
  }

  async function remove(item: LookupItem) {
    if (
      !confirm(
        `Permanently delete "${item.name}"? Existing registrations using this ${label} will keep their value but no new registrations will be possible.`
      )
    )
      return;

    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) {
      toast.error(error.message || "Could not delete");
      return;
    }
    toast.success(`Deleted ${item.name}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Add a ${label}…`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button onClick={add} disabled={pending} size="md">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" /> Add
            </>
          )}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-sm text-navy-500 py-4 text-center">
            No values yet. Add the first one above.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-cream-300 rounded-lg px-4 py-2.5 bg-white"
            >
              <span
                className={`flex-1 text-sm font-medium ${
                  item.is_active ? "text-navy-900" : "text-navy-400 line-through"
                }`}
              >
                {item.name}
              </span>
              {!item.is_active && <Badge variant="muted">Hidden</Badge>}
              <button
                onClick={() => toggleActive(item)}
                title={item.is_active ? "Hide from forms" : "Restore"}
                className="text-navy-500 hover:text-navy-900 transition p-1"
              >
                {item.is_active ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
              <button
                onClick={() => remove(item)}
                title="Delete permanently"
                className="text-navy-500 hover:text-terracotta-600 transition p-1"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
