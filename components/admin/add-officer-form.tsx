"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus, Wand2, Copy, Eye, EyeOff } from "lucide-react";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/types";
import { adminProfileSchema, type AdminProfileInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { generatePassword } from "@/lib/password";

export function AddOfficerForm() {
  const router = useRouter();
  const [showPwd, setShowPwd] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  const currentPwd = watch("password");

  function doGenerate() {
    const pwd = generatePassword(12);
    setValue("password", pwd, { shouldValidate: true });
    setShowPwd(true);
  }

  function copyPwd() {
    if (!currentPwd) return;
    navigator.clipboard.writeText(currentPwd);
    toast.success("Password copied — share it privately with the officer");
  }

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
    toast.success(`Officer added. They'll be asked to change their password on first login.`);
    reset();
    setShowPwd(false);
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
          autoComplete="off"
          {...register("email")}
        />
      </Field>

      <Field error={errors.password?.message}>
        <Label required>Initial password</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="At least 10 chars · Aa1!"
              autoComplete="off"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={doGenerate}
            className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-navy-200 bg-navy-50 text-xs font-medium text-navy-800 hover:bg-navy-100 transition shrink-0"
            title="Generate a strong password"
          >
            <Wand2 className="size-3.5" /> Generate
          </button>
          {currentPwd && (
            <button
              type="button"
              onClick={copyPwd}
              className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
              title="Copy password"
            >
              <Copy className="size-3.5" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Officer will be forced to change this on first login.
        </p>
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
