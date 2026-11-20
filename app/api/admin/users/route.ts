import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminRoute, BadRequest, readJson, requiredString } from "@/lib/adminApi";

export const GET = adminRoute(async () => {
  const users = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
});

export const POST = adminRoute(async (req: NextRequest) => {
  const body = await readJson(req);

  const name = requiredString(body.name, "Nombre", 100);
  const email = requiredString(body.email, "Email", 254).toLowerCase();
  const password = requiredString(body.password, "Contraseña", 72);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequest("El email no tiene un formato válido.");
  }
  if (password.length < 8) {
    throw new BadRequest("La contraseña debe tener al menos 8 caracteres.");
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw new BadRequest("Ya existe un usuario con ese email.");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.admin.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
});
