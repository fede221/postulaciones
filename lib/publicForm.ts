import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "./rateLimit";
import { saveCv, type CvValidationError } from "./cvStorage";

/** Hidden field name used as a honeypot on public forms. Bots fill it; humans never see it. */
export const HONEYPOT_FIELD = "website";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = {
  name: 100,
  email: 200,
  phone: 40,
  city: 120,
  url: 300,
  salary: 120,
  skills: 1000,
  coverLetter: 5000,
} as const;

export function text(form: FormData, name: string, max: number): string | null {
  const raw = form.get(name);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v.slice(0, max) : null;
}

export function years(form: FormData, name: string): number | null {
  const raw = form.get(name);
  if (typeof raw !== "string" || !raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 && n <= 60 ? n : null;
}

export function oneOf<T extends string>(form: FormData, name: string, allowed: readonly T[]): T | null {
  const raw = form.get(name);
  return typeof raw === "string" && (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

export function isValidEmail(v: string | null): v is string {
  return !!v && EMAIL_RE.test(v);
}

export function isValidUrl(v: string | null): boolean {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Multipart overhead on top of the 5 MB CV: anything bigger is not a legitimate submission. */
const MAX_BODY_BYTES = 7 * 1024 * 1024;

/**
 * Cheap checks that run BEFORE the body is parsed, so an abusive client cannot make
 * the server buffer large uploads: rate limit per address + declared size cap.
 */
export function guardBeforeParse(req: NextRequest, scope: string): NextResponse | null {
  const rl = checkRateLimit(`${scope}:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Recibimos demasiados envíos desde tu conexión. Probá de nuevo en un rato." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "El envío es demasiado grande (el CV admite hasta 5 MB)." }, { status: 413 });
  }
  return null;
}

/** Honeypot check, once the form is parsed. Returns a fake success for bots, or null to continue. */
export function guardPublicSubmission(form: FormData): NextResponse | null {
  const honey = form.get(HONEYPOT_FIELD);
  if (typeof honey === "string" && honey.trim() !== "") {
    // Pretend success so the bot learns nothing.
    return NextResponse.json({ success: true });
  }
  return null;
}

export const CV_ERROR_MESSAGES: Record<CvValidationError, string> = {
  too_large: "El archivo es demasiado grande (máx. 5 MB).",
  bad_type: "Formato no permitido. Subí tu CV en PDF, DOC o DOCX.",
  bad_content: "El archivo no parece ser un PDF o Word válido.",
};

export async function storeCvFromForm(
  form: FormData,
  prefix: string
): Promise<{ cvPath: string | null } | { error: string }> {
  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0) return { cvPath: null };
  const result = await saveCv(cv, prefix);
  if (!result.ok) return { error: CV_ERROR_MESSAGES[result.error] };
  return { cvPath: result.filename };
}
