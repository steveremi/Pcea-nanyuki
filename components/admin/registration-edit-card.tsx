"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { type Registration } from "@/lib/types";
import type { LookupItem } from "@/lib/lookups";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function RegistrationEditCard({
  registration,
  canDelete,
  ageGroups,
  districts,
  ministries,
  membershipStatuses,
}: {
  registration: Registration;
  canDelete: boolean;
  ageGroups: LookupItem[];
  districts: LookupItem[];
  ministries: LookupItem[];
  membershipStatuses: LookupItem[];
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [deleting, setDeleting] = React.useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: registration.full_name,
      age_group: registration.age_group,
      district: registration.district,
      contact: registration.contact,
      ministries: registration.ministries,
      membership_status: registration.membership_status,
      amount: Number(registration.amount),
      notes: registration.notes ?? "",
    },
  });

  const selectedMinistries = watch("ministries") ?? [];

  function toggleMinistry(m: string) {
    const current = selectedMinistries;
    if (current.includes(m)) {
      setValue(
        "ministries",
        current.filter((x) => x !== m),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      if (current.length >= 3) {
        toast.error("Maximum 3 ministries");
        return;
      }
      setValue("ministries", [...current, m], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }

  async function onSubmit(values: RegistrationInput) {
    const { error } = await supabase
      .from("registrations")
      .update({
        full_name: values.full_name,
        age_group: values.age_group,
        district: values.district,
        contact: values.contact,
        ministries: values.ministries,
        membership_status: values.membership_status,
        amount: values.amount,
        notes: values.notes || null,
      })
      .eq("id", registration.id);

    if (error) {
      console.error(error);
      toast.error("Could not save changes");
      return;
    }
    toast.success("Saved");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm(`Delete registration for ${registration.full_name}? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", registration.id);
    setDeleting(false);
    if (error) {
      console.error(error);
      toast.error("Could not delete");
      return;
    }
    toast.success("Deleted");
    router.push("/admin/registrations");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-xl font-semibold text-navy-900">
          Edit
        </h2>
        <p className="text-xs text-navy-500 mt-0.5">
          Save changes or delete this record.
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field error={errors.full_name?.message}>
            <Label htmlFor="full_name" required>
              Full name
            </Label>
            <Input id="full_name" {...register("full_name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field error={errors.age_group?.message}>
              <Label required>Age</Label>
              <Controller
                control={control}
                name="age_group"
                render={({ field }) => (
                  <Select {...field}>
                    {ageGroups.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field error={errors.district?.message}>
              <Label required>District</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Select {...field}>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field error={errors.contact?.message}>
            <Label htmlFor="contact" required>
              Contact
            </Label>
            <Input id="contact" {...register("contact")} />
          </Field>

          <Field
            error={errors.ministries?.message as string | undefined}
            hint={`${selectedMinistries.length}/3 selected`}
          >
            <Label required>Ministries</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {ministries.map((m) => {
                const checked = selectedMinistries.includes(m.name);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-xs transition ${
                      checked
                        ? "border-navy-900 bg-navy-900/5"
                        : "border-cream-300 hover:border-navy-700/40"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleMinistry(m.name)}
                    />
                    <span className="text-navy-900 font-medium">{m.name}</span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field error={errors.membership_status?.message}>
            <Label required>Membership</Label>
            <Controller
              control={control}
              name="membership_status"
              render={({ field }) => (
                <Select {...field}>
                  {membershipStatuses.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </Field>

          <Field error={errors.amount?.message}>
            <Label htmlFor="amount" required>
              Amount (KES)
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              {...register("amount")}
            />
          </Field>

          <Field error={errors.notes?.message}>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </Field>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save changes
                </>
              )}
            </Button>
            {canDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" /> Delete registration
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
