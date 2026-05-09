import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type LookupItem = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type LookupSet = {
  districts: LookupItem[];
  ministries: LookupItem[];
  ageGroups: LookupItem[];
  membershipStatuses: LookupItem[];
  surveyAgeGroups: LookupItem[];
};

const LOOKUP_TABLES = [
  "districts",
  "ministries",
  "age_groups",
  "membership_statuses",
  "survey_age_groups",
] as const;

/** Fetch all lookups from the server (for server components). */
export async function fetchLookups(): Promise<LookupSet> {
  const supabase = await createServerClient();
  return doFetch(supabase as unknown as ClientLike);
}

/** Fetch all lookups from the browser. */
export async function fetchLookupsClient(): Promise<LookupSet> {
  const supabase = createBrowserClient();
  return doFetch(supabase as unknown as ClientLike);
}

type ClientLike = {
  from: (t: string) => {
    select: (cols: string) => {
      eq: (
        col: string,
        val: unknown
      ) => {
        order: (
          col: string,
          opts?: { ascending?: boolean }
        ) => Promise<{ data: LookupItem[] | null; error: unknown }>;
      };
    };
  };
};

async function doFetch(supabase: ClientLike): Promise<LookupSet> {
  const results = await Promise.all(
    LOOKUP_TABLES.map((table) =>
      supabase
        .from(table)
        .select("id, name, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    )
  );

  const [districts, ministries, ageGroups, membershipStatuses, surveyAgeGroups] =
    results.map((r) => (r.data ?? []) as LookupItem[]);

  return {
    districts,
    ministries,
    ageGroups,
    membershipStatuses,
    surveyAgeGroups,
  };
}
