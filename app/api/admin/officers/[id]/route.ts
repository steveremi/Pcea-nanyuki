import { NextResponse } from "next/server";
import { z } from "zod";
import { ASSIGNABLE_ROLES, type AdminProfile } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

const patchSchema = z
  .object({
    role: z.enum(ASSIGNABLE_ROLES).optional(),
    is_active: z.boolean().optional(),
    full_name: z.string().trim().min(2).max(120).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one field to update",
  });

function canManage(role: string | undefined) {
  return role === "superadmin" || role === "chairman";
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!canManage(auth.profile.role)) {
    return NextResponse.json(
      { error: "Only the chairman can manage officers" },
      { status: 403 }
    );
  }
  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: "You cannot modify your own role from here" },
      { status: 400 }
    );
  }

  // Look up the target row to enforce the no-touching-superadmin rule
  const service = createServiceClient();
  const { data: target } = await service
    .from("admin_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<AdminProfile>();

  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Chairmen cannot edit superadmins. Only superadmin can.
  if (target.role === "superadmin" && auth.profile.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { error } = await service
    .from("admin_profiles")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!canManage(auth.profile.role)) {
    return NextResponse.json(
      { error: "Only the chairman can remove officers" },
      { status: 403 }
    );
  }
  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { data: target } = await service
    .from("admin_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<AdminProfile>();

  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "superadmin" && auth.profile.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: profErr } = await service
    .from("admin_profiles")
    .delete()
    .eq("id", id);
  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }
  await service.auth.admin.deleteUser(id);

  return NextResponse.json({ ok: true });
}
