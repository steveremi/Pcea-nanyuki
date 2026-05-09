// Domain types
//
// Lookup values (district, ministry, age_group, membership_status,
// survey age_group) are SOURCED FROM SUPABASE LOOKUP TABLES at runtime.
// Officers can add/remove them from the admin UI. So in TypeScript these
// are plain `string` — the database is the source of truth.
//
// Only `Role` stays as a strict literal type because the role check is
// hardcoded in RLS policies and changing it is a code-level decision.

export const ROLES = [
  "superadmin",
  "chairman",
  "vice_chairman",
  "treasurer",
  "secretary",
  "vice_secretary",
] as const;

/** Roles that can be assigned to officers from the UI.
 *  Superadmin is excluded — only the developer creates/deletes that
 *  via direct SQL access. */
export const ASSIGNABLE_ROLES = [
  "chairman",
  "vice_chairman",
  "treasurer",
  "secretary",
  "vice_secretary",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super Admin",
  chairman: "Chairman",
  vice_chairman: "Vice Chairman",
  treasurer: "Treasurer",
  secretary: "Secretary",
  vice_secretary: "Vice Secretary",
};

export type Registration = {
  id: string;
  full_name: string;
  age_group: string;
  district: string;
  contact: string;
  ministries: string[];
  membership_status: string;
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SurveyResponse = {
  id: string;
  is_church_member: boolean;
  age_group: string;
  vibrancy_rating: number;
  weaknesses: string | null;
  strengths: string | null;
  programs_to_incorporate: string | null;
  fundraising_ideas: string | null;
  influence_rating: number;
  pull_teenagers: string | null;
  feels_supported: boolean | null;
  serves_best: boolean | null;
  service_hindrances: string | null;
  attends_youth_service: boolean | null;
  not_attending_reason: string | null;
  has_district: boolean | null;
  attends_fellowship: boolean | null;
  district_hindrance: string | null;
  would_like_to_join: boolean | null;
  other_suggestions: string | null;
  created_at: string;
};

export type AdminProfile = {
  id: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
