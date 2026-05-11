import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  treasurer_mpesa_number: string;
  treasurer_name: string;
  church_name: string;
};

const DEFAULTS: SiteSettings = {
  treasurer_mpesa_number: "0769941382",
  treasurer_name: "Treasurer",
  church_name: "PCEA Nanyuki Town Church",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  const map: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string }) => {
    map[r.key] = r.value;
  });

  return {
    treasurer_mpesa_number: map.treasurer_mpesa_number ?? DEFAULTS.treasurer_mpesa_number,
    treasurer_name: map.treasurer_name ?? DEFAULTS.treasurer_name,
    church_name: map.church_name ?? DEFAULTS.church_name,
  };
}
