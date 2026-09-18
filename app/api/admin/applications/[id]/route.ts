import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, BadRequest, readJson } from "@/lib/adminApi";

const STATUSES = ["pending", "reviewing", "accepted", "rejected"] as const;
type Ctx = { params: Promise<{ id: string }> };

/** Accepts ONLY `status` (+ optional `note` for the history) and `notes` (internal notes). */
export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const body = await readJson(req);

  let status: string | undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !(STATUSES as readonly string[]).includes(body.status)) {
      throw new BadRequest("Estado inválido.");
    }
    status = body.status;
  }

  let notes: string | undefined;
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") throw new BadRequest("Las notas deben ser texto.");
    notes = body.notes.slice(0, 10000);
  }

  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 2000) : null;

  const current = await prisma.application.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data = {
    ...(notes !== undefined ? { notes } : {}),
    ...(status !== undefined ? { status } : {}),
  };
  const include = { statusHistory: { orderBy: { createdAt: "asc" as const } } };

  if (status !== undefined && status !== current.status) {
    // History entry first so the returned application already includes it.
    const [, app] = await prisma.$transaction([
      prisma.applicationStatusHistory.create({
        data: { applicationId: id, fromStatus: current.status, toStatus: status, note },
      }),
      prisma.application.update({ where: { id }, data, include }),
    ]);
    return NextResponse.json(app);
  }

  const app = await prisma.application.update({ where: { id }, data, include });
  return NextResponse.json(app);
});
