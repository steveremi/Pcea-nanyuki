"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Smartphone, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import type { LookupSet } from "@/lib/lookups";
import type { SiteSettings } from "@/lib/site-settings";

type Props = {
  lookups: LookupSet;
  settings: SiteSettings;
};

export function RegistrationForm({ lookups, settings }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      age_group: "",
      district: "",
      contact: "",
      ministries: [],
      membership_status: "",
      amount: 0,
      mpesa_code: "",
      notes: "",
    },
  });

  const ministries = watch("ministries") ?? [];
  const amount = Number(watch("amount") ?? 0);

  function toggleMinistry(name: string) {
    if (ministries.includes(name)) {
      setValue(
        "ministries",
        ministries.filter((m) => m !== name),
        { shouldValidate: true }
      );
    } else {
      if (ministries.length >= 3) {
        toast.error("You can pick a maximum of 3 ministries");
        return;
      }
      setValue("ministries", [...ministries, name], { shouldValidate: true });
    }
  }

  function copyTreasurerNumber() {
    navigator.clipboard.writeText(settings.treasurer_mpesa_number);
    toast.success("M-Pesa number copied");
  }

  async function onSubmit(values: RegistrationInput) {
    setSubmitting(true);
    const supabase = createClient();

    if (values.amount > 0 && !values.mpesa_code) {
      toast.error("Please enter the M-Pesa confirmation code");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("registrations").insert({
      full_name: values.full_name,
      age_group: values.age_group,
      district: values.district,
      contact: values.contact,
      ministries: values.ministries,
      membership_status: values.membership_status,
      amount: values.amount,
      mpesa_code: values.mpesa_code || null,
      notes: values.notes || null,
      payment_status: values.amount > 0 ? "pending" : "waived",
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error(error.message || "Could not save. Please try again.");
      return;
    }

    startTransition(() => {
      router.push("/register/thanks");
    });
  }

  const busy = submitting || pending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-white rounded-2xl border border-cream-300 p-5 sm:p-8 shadow-[0_1px_0_rgba(15,42,71,0.04)]"
    >
      <Field error={errors.full_name?.message}>
        <Label required>Full name</Label>
        <Input
          {...register("full_name")}
          placeholder="e.g. Jane Wanjiru"
          autoComplete="name"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field error={errors.age_group?.message}>
          <Label required>Age group</Label>
          <select
            {...register("age_group")}
            className="h-11 w-full rounded-lg border border-cream-300 bg-white px-3 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Select…</option>
            {lookups.ageGroups.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </Field>

        <Field error={errors.district?.message}>
          <Label required>District</Label>
          <select
            {...register("district")}
            className="h-11 w-full rounded-lg border border-cream-300 bg-white px-3 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Select…</option>
            {lookups.districts.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field error={errors.contact?.message}>
        <Label required>Phone number</Label>
        <Input
          {...register("contact")}
          placeholder="0712345678"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      <Field error={errors.ministries?.message}>
        <Label required>Ministries (pick up to 3)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {lookups.ministries.map((m) => {
            const checked = ministries.includes(m.name);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMinistry(m.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition text-left ${
                  checked
                    ? "border-navy-700 bg-navy-50 text-navy-900"
                    : "border-cream-300 bg-white text-navy-700 hover:border-navy-300"
                }`}
              >
                <span
                  className={`size-4 rounded grid place-items-center border ${
                    checked
                      ? "bg-navy-700 border-navy-700 text-white"
                      : "border-cream-300"
                  }`}
                >
                  {checked && <CheckCircle2 className="size-3" />}
                </span>
                <span className="flex-1 truncate">{m.name}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field error={errors.membership_status?.message}>
        <Label required>Membership status</Label>
        <select
          {...register("membership_status")}
          className="h-11 w-full rounded-lg border border-cream-300 bg-white px-3 text-sm focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>Select…</option>
          {lookups.membershipStatuses.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </Field>

      <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4 space-y-4">
        <div className="flex items-start gap-2">
          <Smartphone className="size-4 text-navy-700 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-navy-900">
              Contribution (optional)
            </h3>
            <p className="text-xs text-navy-600 mt-0.5">
              Send M-Pesa to{" "}
              <button
                type="button"
                onClick={copyTreasurerNumber}
                className="font-semibold text-navy-900 underline-offset-2 hover:underline inline-flex items-center gap-1"
              >
                {settings.treasurer_mpesa_number}
                <Copy className="size-3" />
              </button>{" "}
              ({settings.treasurer_name}), then paste the confirmation code below.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field error={errors.amount?.message}>
            <Label>Amount (Ksh)</Label>
            <Input
              type="number"
              min={0}
              step={50}
              {...register("amount")}
              placeholder="0"
              inputMode="numeric"
            />
          </Field>

          <Field error={errors.mpesa_code?.message}>
            <Label>{amount > 0 ? "M-Pesa code (required)" : "M-Pesa code"}</Label>
            <Input
              {...register("mpesa_code")}
              placeholder="e.g. KH1A23B4CD"
              className="uppercase"
              maxLength={10}
            />
          </Field>
        </div>
        {amount > 0 && (
          <p className="text-[11px] text-navy-500">
            The treasurer will verify your code and confirm your payment.
          </p>
        )}
      </div>

      <Field error={errors.notes?.message}>
        <Label>Anything else? (optional)</Label>
        <Textarea
          {...register("notes")}
          placeholder="Optional note for the team"
          rows={3}
        />
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-navy-900 text-cream-50 text-sm font-semibold hover:bg-navy-800 transition disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit registration"
        )}
      </button>
    </form>
  );
}
