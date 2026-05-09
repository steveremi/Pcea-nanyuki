import { NextResponse } from "next/server";
import { adminProfileSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!["superadmin", "chairman"].includes(auth.profile.role)) {
    return NextResponse.json(
      { error: "Only the chairman can add officers" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  // Create the auth user
  const { data: created, error: createErr } =
    await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Could not create user" },
      { status: 400 }
    );
  }

  // Insert admin_profile
  const { error: profileErr } = await service.from("admin_profiles").insert({
    id: created.user.id,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    is_active: true,
  });

  if (profileErr) {
    // rollback the auth user so we don't end up with orphans
    await service.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: profileErr.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
