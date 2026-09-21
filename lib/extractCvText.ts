import path from "path";
import { readCv } from "./cvStorage";

export async function extractCvText(cvPath: string): Promise<string | null> {
  const file = await readCv(cvPath);
  if (!file) {
    console.error("[extractCvText] Cannot read file:", cvPath);
    return null;
  }

  const ext = path.extname(file.filename).toLowerCase();

  try {
    if (ext === ".pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(file.buffer);
      const text = data.text?.trim() ?? "";
      return text || null;
    }

    if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const text = result.value?.trim() ?? "";
      return text || null;
    }

    return null;
  } catch (e) {
    console.error("[extractCvText] Extraction failed for", file.filename, e);
    return null;
  }
}
