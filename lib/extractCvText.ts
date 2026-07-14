import { readFile } from "fs/promises";
import path from "path";

export async function extractCvText(cvPath: string): Promise<string | null> {
  const fullPath = path.join(process.cwd(), "public", cvPath.replace(/^\//, ""));
  const ext = path.extname(cvPath).toLowerCase();

  let buffer: Buffer;
  try {
    buffer = await readFile(fullPath);
  } catch (e) {
    console.error("[extractCvText] Cannot read file:", fullPath, e);
    return null;
  }

  try {
    if (ext === ".pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      const text = data.text?.trim() ?? "";
      console.log(`[extractCvText] PDF extracted ${text.length} chars from ${path.basename(cvPath)}`);
      return text || null;
    }

    if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim() ?? "";
      console.log(`[extractCvText] DOCX extracted ${text.length} chars from ${path.basename(cvPath)}`);
      return text || null;
    }

    console.warn("[extractCvText] Unsupported extension:", ext);
    return null;
  } catch (e) {
    console.error("[extractCvText] Extraction failed for", path.basename(cvPath), e);
    return null;
  }
}
