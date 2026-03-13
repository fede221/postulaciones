import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, note, notes, ...rest } = body;

  // Fetch current application to know the previous status
  const current = await prisma.application.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updateData: Record<string, unknown> = { ...rest };
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;

  // Write status history entry if status is changing
  if (status !== undefined && status !== current.status) {
    const [app] = await prisma.$transaction([
      prisma.application.update({
        where: { id },
        data: updateData,
        include: { statusHistory: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: current.status,
          toStatus: status,
          note: note?.trim() || null,
        },
      }),
    ]);
    return NextResponse.json(app);
  }

  const app = await prisma.application.update({
    where: { id },
    data: updateData,
    include: { statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(app);
}
