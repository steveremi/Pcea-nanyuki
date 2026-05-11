"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/lib/types";

export async function updatePaymentStatus(
  registrationId: string,
  newStatus: PaymentStatus
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }
  if (!["superadmin", "chairman", "treasurer"].includes(auth.profile.role)) {
    return { error: "Only the chairman or treasurer can update payments" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("registrations")
    .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  if (error) return { error: error.message };

  revalidatePath("/admin/payments");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin");
  return { success: true };
}
