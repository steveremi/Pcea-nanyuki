function escape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s =
    Array.isArray(v)
      ? v.join(", ")
      : typeof v === "boolean"
      ? v
        ? "Yes"
        : "No"
      : String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; label: string }[]
): string {
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => escape(r[c.key])).join(","))
    .join("\r\n");
  return header + "\r\n" + body;
}
