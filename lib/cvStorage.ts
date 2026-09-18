import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { cvFilename } from "./cvUrl";

/**
 * CV files are personal data. They live OUTSIDE `public/` and are only served
 * through the authenticated route `/api/admin/cvs/[filename]`.
 *
 * `cvPath` in the database may hold either a bare filename (new records) or a
 * legacy `/uploads/cvs/<filename>` path; both resolve by basename.
 */
export const CV_DIR = path.join(process.cwd(), "storage", "cvs");
const LEGACY_DIR = path.join(process.cwd(), "public", "uploads", "cvs");

export const CV_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx"]);

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export type CvValidationError = "too_large" | "bad_type" | "bad_content";

function sniffExtension(buf: Buffer, ext: string): boolean {
  if (ext === ".pdf") return buf.subarray(0, 5).toString("latin1") === "%PDF-";
  // DOCX is a ZIP container: "PK\x03\x04"
  if (ext === ".docx") return buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
  // Legacy .doc is an OLE compound file: D0 CF 11 E0
  if (ext === ".doc") return buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0;
  return false;
}

/** Validates and persists an uploaded CV. Returns the stored filename or a validation error. */
export async function saveCv(
  file: File,
  prefix = ""
): Promise<{ ok: true; filename: string } | { ok: false; error: CvValidationError }> {
  if (file.size > CV_MAX_BYTES) return { ok: false, error: "too_large" };

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return { ok: false, error: "bad_type" };

  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffExtension(buf, ext)) return { ok: false, error: "bad_content" };

  await mkdir(CV_DIR, { recursive: true });
  const filename = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  await writeFile(path.join(CV_DIR, filename), buf);
  return { ok: true, filename };
}

export { cvFilename, cvUrl } from "./cvUrl";

/** Absolute path of a stored CV, checking the private dir first and the legacy public dir second. */
export async function resolveCvFile(cvPath: string): Promise<string | null> {
  const name = cvFilename(cvPath);
  if (!name) return null;
  for (const dir of [CV_DIR, LEGACY_DIR]) {
    const full = path.join(dir, name);
    try {
      const s = await stat(full);
      if (s.isFile()) return full;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Best-effort removal of a stored CV (used when its record is deleted). Never throws. */
export async function deleteCv(cvPath: string): Promise<void> {
  const full = await resolveCvFile(cvPath);
  if (!full) return;
  try {
    await unlink(full);
  } catch (e) {
    console.error("[cvStorage] could not delete", path.basename(full), e);
  }
}

export async function readCv(cvPath: string): Promise<{ buffer: Buffer; mime: string; filename: string } | null> {
  const full = await resolveCvFile(cvPath);
  if (!full) return null;
  const filename = path.basename(full);
  const mime = MIME_BY_EXT[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
  return { buffer: await readFile(full), mime, filename };
}

