/**
 * One-off: move CV files from the public folder to private storage.
 *   npx tsx scripts/migrate-cvs.ts
 * Database rows keep working because `cvPath` is resolved by basename.
 */
import { mkdir, readdir, rename } from "fs/promises";
import path from "path";

const FROM = path.join(process.cwd(), "public", "uploads", "cvs");
const TO = path.join(process.cwd(), "storage", "cvs");

async function main() {
  await mkdir(TO, { recursive: true });
  let files: string[] = [];
  try {
    files = await readdir(FROM);
  } catch {
    console.log("Nada que migrar: no existe", FROM);
    return;
  }
  let moved = 0;
  for (const f of files) {
    await rename(path.join(FROM, f), path.join(TO, f));
    moved++;
  }
  console.log(`Migrados ${moved} archivo(s) a ${TO}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
