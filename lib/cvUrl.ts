/**
 * Client-safe helpers for CV links. No Node APIs here so this can be imported
 * from client components. The server-side storage lives in `lib/cvStorage.ts`.
 */
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

export function cvFilename(cvPath: string): string | null {
  const name = cvPath.split(/[\\/]/).pop() ?? "";
  const lower = name.toLowerCase();
  return SAFE_NAME.test(name) && ALLOWED_EXT.some((ext) => lower.endsWith(ext)) ? name : null;
}

/** Admin-only URL for a stored CV, or null when there is no valid file. */
export function cvUrl(cvPath: string | null | undefined): string | null {
  if (!cvPath) return null;
  const name = cvFilename(cvPath);
  return name ? `/api/admin/cvs/${encodeURIComponent(name)}` : null;
}
