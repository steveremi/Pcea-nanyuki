"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import type { LookupItem } from "@/lib/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

type Props = {
  ageGroups: LookupItem[];
  districts: LookupItem[];
  ministries: LookupItem[];
  membershipStatuses: LookupItem[];
};

export function RegistrationForm({
  ageGroups,
  districts,
  ministries,
  membershipStatuses,
}: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      age_group: "",
      district: "",
      contact: "",
      ministries: [],
      membership_status: "",
      amount: 200,
      notes: "",
    },
  });

  const selectedMinistries = watch("ministries") ?? [];

  function toggleMinistry(m: string) {
    const current = selectedMinistries;
    if (current.includes(m)) {
      setValue(
        "ministries",
        current.filter((x) => x !== m),
        { shouldValidate: true }
      );
    } else {
      if (current.length >= 3) {
        toast.error("You can pick a maximum of 3 ministries");
        return;
      }
      setValue("ministries", [...current, m], { shouldValidate: true });
    }
  }

  async function onSubmit(values: RegistrationInput) {
    const { error } = await supabase.from("registrations").insert({
      full_name: values.full_name,
      age_group: values.age_group,
      district: values.district,
      contact: values.contact,
      ministries: values.ministries,
      membership_status: values.membership_status,
      amount: values.amount,
      notes: values.notes || null,
    });

    if (error) {
      console.error(error);
      toast.error("Could not save your registration. Please try again.");
      return;
    }

    toast.success("Registration submitted successfully.");
    router.push("/register/thanks");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. Full name */}
      <Field error={errors.full_name?.message}>
        <Label htmlFor="full_name" required>
          Full name
        </Label>
        <Input
          id="full_name"
          placeholder="e.g. Jane Wanjiru Mwangi"
          {...register("full_name")}
        />
      </Field>

      {/* 2. Age group */}
      <Field error={errors.age_group?.message}>
        <Label required>Age group</Label>
        <Controller
          control={control}
          name="age_group"
          render={({ field }) => (
            <RadioGroup
              name="age_group"
              value={field.value}
              onChange={field.onChange}
              columns={3}
              options={ageGroups.map((a) => ({
                value: a.name,
                label: `${a.name} years`,
              }))}
            />
          )}
        />
      </Field>

      {/* 3. District */}
      <Field error={errors.district?.message}>
        <Label required>District</Label>
        <Controller
          control={control}
          name="district"
          render={({ field }) => (
            <RadioGroup
              name="district"
              value={field.value}
              onChange={field.onChange}
              columns={3}
              options={districts.map((d) => ({
                value: d.name,
                label: d.name,
              }))}
            />
          )}
        />
      </Field>

      {/* 4. Contact */}
      <Field
        error={errors.contact?.message}
        hint="We'll only use this for fellowship updates."
      >
        <Label htmlFor="contact" required>
          Contact (phone)
        </Label>
        <Input
          id="contact"
          type="tel"
          placeholder="0712 345 678"
          {...register("contact")}
        />
      </Field>

      {/* 5. Ministries */}
      <Field
        error={errors.ministries?.message as string | undefined}
        hint={`Pick up to 3 — currently selected: ${selectedMinistries.length}/3`}
      >
        <Label required>Ministries you would like to serve in</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ministries.map((m) => {
            const checked = selectedMinistries.includes(m.name);
            return (
              <label
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 cursor-pointer transition-all ${
                  checked
                    ? "border-navy-900 ring-2 ring-navy-900/10"
                    : "border-cream-300 hover:border-navy-700/40"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onChange={() => toggleMinistry(m.name)}
                />
                <span className="text-sm font-medium text-navy-900">
                  {m.name}
                </span>
              </label>
            );
          })}
        </div>
      </Field>

      {/* 6. Membership status */}
      <Field error={errors.membership_status?.message}>
        <Label required>Membership status</Label>
        <Controller
          control={control}
          name="membership_status"
          render={({ field }) => (
            <RadioGroup
              name="membership_status"
              value={field.value}
              onChange={field.onChange}
              columns={2}
              options={membershipStatuses.map((m) => ({
                value: m.name,
                label: m.name,
                description:
                  m.name === "Full Member"
                    ? "Confirmed member of PCEA NTC"
                    : "Attending but not yet confirmed",
              }))}
            />
          )}
        />
      </Field>

      {/* 7. Amount */}
      <Field
        error={errors.amount?.message}
        hint="Registration contribution. The default is KES 200 — you can adjust."
      >
        <Label htmlFor="amount" required>
          Amount (KES)
        </Label>
        <Input
          id="amount"
          type="number"
          inputMode="numeric"
          min={0}
          step={50}
          {...register("amount")}
        />
      </Field>

      {/* Notes */}
      <Field error={errors.notes?.message} hint="Optional — anything else we should know.">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional"
          {...register("notes")}
        />
      </Field>

      <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isSubmitting}
          className="sm:min-w-56"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
        <p className="text-xs text-navy-500">
          By submitting you agree to be contacted by the youth office.
        </p>
      </div>
    </form>
  );
}
