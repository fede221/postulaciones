import { readFile } from "fs/promises";
import path from "path";

export async function extractCvText(cvPath: string): Promise<string | null> {
  try {
    const fullPath = path.join(process.cwd(), cvPath.replace(/^\//, ""));
    const buffer = await readFile(fullPath);
    const ext = path.extname(cvPath).toLowerCase();

    if (ext === ".pdf") {
      // Lazy require avoids Next.js build-time test-file lookup bug in pdf-parse v1
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (
        buf: Buffer,
        opts?: Record<string, unknown>
      ) => Promise<{ text: string }>;
      const data = await pdfParse(buffer, { max: 0 });
      return data.text?.trim() || null;
    }

    if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || null;
    }

    return null;
  } catch {
    return null;
  }
}
