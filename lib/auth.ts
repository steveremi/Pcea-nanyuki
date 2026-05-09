import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/types";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (!profile || !profile.is_active) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { user, profile, supabase };
}
