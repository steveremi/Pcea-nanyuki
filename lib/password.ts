/**
 * Generate a strong random password matching our validation rules:
 * - 12+ characters
 * - At least 1 uppercase, 1 lowercase, 1 number, 1 special
 * - Easy to read (no I/l/1/O/0 confusion)
 */
export function generatePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O
  const lower = "abcdefghjkmnpqrstuvwxyz"; // no i, l, o
  const nums = "23456789"; // no 0, 1
  const special = "!@#$%^&*";

  // Ensure at least one of each required class
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    nums[Math.floor(Math.random() * nums.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const allChars = upper + lower + nums + special;
  const remaining: string[] = [];
  for (let i = 0; i < length - required.length; i++) {
    remaining.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle
  const out = [...required, ...remaining];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}
