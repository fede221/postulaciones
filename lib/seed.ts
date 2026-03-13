import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@empresa.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.admin.create({
    data: { email, password: hashed, name: "Administrador" },
  });
}
