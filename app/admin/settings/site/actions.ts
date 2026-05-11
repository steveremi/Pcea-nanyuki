"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function updateSiteSetting(key: string, value: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  if (!["superadmin", "chairman"].includes(auth.profile.role)) {
    return { error: "Only the chairman can edit site settings" };
  }

  const trimmed = value.trim();
  if (!trimmed) return { error: "Value cannot be empty" };
  if (trimmed.length > 200) return { error: "Value too long" };

  const service = createServiceClient();
  const { error } = await service
    .from("site_settings")
    .upsert({ key, value: trimmed }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/register");
  return { success: true };
}
