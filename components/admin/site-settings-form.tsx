"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { updateSiteSetting } from "@/app/admin/settings/site/actions";

type Props = {
  initial: {
    treasurer_mpesa_number: string;
    treasurer_name: string;
    church_name: string;
  };
};

export function SiteSettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(initial);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function save(key: keyof typeof values) {
    if (values[key] === initial[key]) {
      toast.message("No changes");
      return;
    }
    setBusyKey(key);
    startTransition(async () => {
      const result = await updateSiteSetting(key, values[key]);
      setBusyKey(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Saved");
      initial[key] = values[key];
    });
  }

  const fields: Array<{
    key: keyof typeof values;
    label: string;
    hint: string;
    placeholder: string;
  }> = [
    {
      key: "treasurer_mpesa_number",
      label: "Treasurer M-Pesa number",
      hint: "Shown on the registration form so youth know where to send contributions",
      placeholder: "0712345678",
    },
    {
      key: "treasurer_name",
      label: "Treasurer name",
      hint: "Displayed alongside the M-Pesa number for clarity",
      placeholder: "John Mwangi",
    },
    {
      key: "church_name",
      label: "Church name",
      hint: "Shown in headers, page titles, and emails",
      placeholder: "PCEA Nanyuki Town Church",
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const dirty = values[f.key] !== initial[f.key];
        const isBusy = pending && busyKey === f.key;
        return (
          <div key={f.key} className="bg-white rounded-lg border border-slate-200 p-4">
            <label className="block">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-navy-900">{f.label}</span>
                {dirty && <span className="text-[10px] text-gold-700 font-medium">Unsaved</span>}
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{f.hint}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => save(f.key)}
                  disabled={!dirty || isBusy}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-navy-900 text-cream-50 text-xs font-semibold hover:bg-navy-800 disabled:opacity-40 disabled:hover:bg-navy-900 transition"
                >
                  {isBusy ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                  Save
                </button>
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}
