// Domain types

export const ROLES = [
  "superadmin",
  "chairman",
  "vice_chairman",
  "treasurer",
  "secretary",
  "vice_secretary",
] as const;

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

export const PAYMENT_STATUSES = ["pending", "confirmed", "failed", "waived"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending verification",
  confirmed: "Confirmed",
  failed: "Failed / not received",
  waived: "Waived",
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
  mpesa_code: string | null;
  payment_status: PaymentStatus;
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
  must_change_password: boolean;
};

export type SiteSetting = {
  key: string;
  value: string;
  updated_at: string;
};
