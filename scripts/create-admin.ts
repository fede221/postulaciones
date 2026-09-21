/**
 * Create or update a panel user.
 *   npx tsx scripts/create-admin.ts <email> <password> [name]
 * The password is hashed with bcrypt; nothing is stored in plain text.
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const [email, password, name = "RRHH"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Uso: npx tsx scripts/create-admin.ts <email> <password> [nombre]");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.admin.upsert({
      where: { email: email.toLowerCase() },
      update: { password: hashed, name },
      create: { email: email.toLowerCase(), password: hashed, name },
    });
    const ok = await bcrypt.compare(password, user.password);
    console.log(`Usuario listo: ${user.email} (${user.name}) · verificación de contraseña: ${ok ? "OK" : "FALLÓ"}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
