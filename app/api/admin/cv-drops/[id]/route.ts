import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, BadRequest, optionalBoolean, readJson } from "@/lib/adminApi";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const reviewed = optionalBoolean((await readJson(req)).reviewed);
  if (reviewed === undefined) throw new BadRequest("Falta el campo reviewed.");

  await prisma.cvDrop.update({ where: { id }, data: { reviewed } });
  return NextResponse.json({ success: true });
});
