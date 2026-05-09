import type { Role } from "./types";

/**
 * UI permission map. Mirrors RLS policies in 0001_init.sql.
 * RLS is the source of truth — these flags only control what's shown.
 *
 * Note: `superadmin` is the developer's emergency-access role.
 * It has every permission. It's not assignable from the UI; it's set
 * up via direct SQL in the database. Officers (chairman etc.) cannot
 * see, edit or delete superadmin profiles.
 */
export const PERMISSIONS = {
  registrations: {
    view: ["superadmin", "chairman", "vice_chairman", "treasurer", "secretary", "vice_secretary"],
    edit: ["superadmin", "chairman", "vice_chairman", "treasurer", "secretary", "vice_secretary"],
    delete: ["superadmin", "chairman", "vice_chairman"],
    export: ["superadmin", "chairman", "vice_chairman", "treasurer", "secretary"],
  },
  surveys: {
    view: ["superadmin", "chairman", "vice_chairman", "treasurer", "secretary", "vice_secretary"],
    delete: ["superadmin", "chairman", "vice_chairman", "secretary"],
    export: ["superadmin", "chairman", "vice_chairman", "secretary"],
  },
  team: {
    view: ["superadmin", "chairman", "vice_chairman", "treasurer", "secretary", "vice_secretary"],
    manage: ["superadmin", "chairman"],
  },
} as const satisfies Record<string, Record<string, readonly Role[]>>;

export function can(
  role: Role | null | undefined,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  if (!role) return false;
  const list = (PERMISSIONS[resource] as Record<string, readonly Role[]>)[action];
  if (!list) return false;
  return list.includes(role);
}

/** Roles whose presence should be hidden from non-superadmins. */
export function isHiddenRole(role: Role): boolean {
  return role === "superadmin";
}
