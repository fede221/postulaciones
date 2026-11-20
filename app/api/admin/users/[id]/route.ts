import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminRoute, BadRequest } from "@/lib/adminApi";

export const DELETE = adminRoute(async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);

  const target = await prisma.admin.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (target.email === session?.user?.email) {
    throw new BadRequest("No podés eliminar tu propio usuario.");
  }

  const count = await prisma.admin.count();
  if (count <= 1) throw new BadRequest("No se puede eliminar el único usuario administrador.");

  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
