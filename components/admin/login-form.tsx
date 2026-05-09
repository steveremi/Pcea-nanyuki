"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const supabase = React.useMemo(() => createClient(), []);
  const [showPwd, setShowPwd] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    // Verify admin profile exists
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Login failed — no user");
      return;
    }
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      toast.error(
        "Your account is not yet linked to an officer profile. Contact the chairman."
      );
      return;
    }
    if (!profile.is_active) {
      await supabase.auth.signOut();
      toast.error(
        "Your account is currently inactive. Contact the chairman."
      );
      return;
    }

    toast.success("Welcome back");
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field error={errors.email?.message}>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
      </Field>

      <Field error={errors.password?.message}>
        <Label htmlFor="password" required>
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            className="pr-11"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 grid place-items-center text-navy-500 hover:text-navy-900 transition rounded-md hover:bg-navy-900/5"
          >
            {showPwd ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
