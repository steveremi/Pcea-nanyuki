"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/types";
import { adminProfileSchema, type AdminProfileInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

export function AddOfficerForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProfileInput>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "secretary",
    },
  });

  async function onSubmit(values: AdminProfileInput) {
    const res = await fetch("/api/admin/officers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Could not create officer");
      return;
    }
    toast.success("Officer added");
    reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid sm:grid-cols-2 gap-4"
    >
      <Field error={errors.full_name?.message} className="sm:col-span-2">
        <Label required>Full name</Label>
        <Input placeholder="Jane Wanjiru" {...register("full_name")} />
      </Field>
      <Field error={errors.email?.message}>
        <Label required>Email</Label>
        <Input
          type="email"
          placeholder="officer@example.com"
          {...register("email")}
        />
      </Field>
      <Field error={errors.password?.message}>
        <Label required>Initial password</Label>
        <Input
          type="text"
          placeholder="At least 8 characters"
          {...register("password")}
        />
      </Field>
      <Field error={errors.role?.message} className="sm:col-span-2">
        <Label required>Role</Label>
        <Select {...register("role")}>
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Adding…
            </>
          ) : (
            <>
              <UserPlus className="size-4" /> Add officer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
