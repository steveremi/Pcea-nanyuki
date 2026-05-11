import { z } from "zod";
import { ASSIGNABLE_ROLES } from "./types";

// ----- Registration -----
export const registrationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Please enter your full name")
    .max(120, "Name is too long"),
  age_group: z.string().min(1, "Please pick your age group"),
  district: z.string().min(1, "Please pick your district"),
  contact: z
    .string()
    .trim()
    .regex(
      /^(?:\+?254|0)?[17]\d{8}$/,
      "Enter a valid Kenyan phone number (e.g. 0712345678)"
    ),
  ministries: z
    .array(z.string().min(1))
    .min(1, "Pick at least one ministry")
    .max(3, "You can pick a maximum of 3 ministries"),
  membership_status: z.string().min(1, "Please pick your membership status"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  mpesa_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{10}$/i, "M-Pesa code must be 10 letters/digits")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type RegistrationInput = z.infer<typeof registrationSchema>;

// ----- Survey -----
export const surveySchema = z
  .object({
    is_church_member: z.boolean(),
    age_group: z.string().min(1, "Please pick your age group"),
    vibrancy_rating: z.coerce.number().int().min(1).max(10),
    weaknesses: z.string().trim().max(2000).optional().or(z.literal("")),
    strengths: z.string().trim().max(2000).optional().or(z.literal("")),
    programs_to_incorporate: z.string().trim().max(2000).optional().or(z.literal("")),
    fundraising_ideas: z.string().trim().max(2000).optional().or(z.literal("")),
    influence_rating: z.coerce.number().int().min(1).max(10),
    pull_teenagers: z.string().trim().max(2000).optional().or(z.literal("")),

    feels_supported: z.boolean().optional(),
    serves_best: z.boolean().optional(),
    service_hindrances: z.string().trim().max(2000).optional().or(z.literal("")),
    attends_youth_service: z.boolean().optional(),
    not_attending_reason: z.string().trim().max(2000).optional().or(z.literal("")),
    has_district: z.boolean().optional(),
    attends_fellowship: z.boolean().optional(),
    district_hindrance: z.string().trim().max(2000).optional().or(z.literal("")),
    would_like_to_join: z.boolean().optional(),

    other_suggestions: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (v) => v.age_group !== "13-35" || v.feels_supported !== undefined,
    { message: "Please answer whether you feel supported", path: ["feels_supported"] }
  );
export type SurveyInput = z.infer<typeof surveySchema>;

// ----- Admin profile -----
export const adminProfileSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(72)
    .regex(/[A-Z]/, "Include at least 1 uppercase letter")
    .regex(/[a-z]/, "Include at least 1 lowercase letter")
    .regex(/[0-9]/, "Include at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Include at least 1 special character (!@#$ etc)"),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(ASSIGNABLE_ROLES),
});
export type AdminProfileInput = z.infer<typeof adminProfileSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;
