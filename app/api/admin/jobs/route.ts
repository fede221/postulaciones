import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { title, department, location, type, description, requirements, isActive } = body;

  if (!title || !department || !location || !type || !description || !requirements) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: { title, department, location, type, description, requirements, isActive: isActive ?? true },
  });

  return NextResponse.json(job);
}
