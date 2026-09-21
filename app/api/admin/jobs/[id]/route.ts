import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, BadRequest, optionalBoolean, readJson } from "@/lib/adminApi";
import { deleteCv } from "@/lib/cvStorage";
import { parseJobFields } from "@/lib/jobFields";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const body = await readJson(req);
  const isActive = optionalBoolean(body.isActive);
  const job = await prisma.job.update({
    where: { id },
    data: { ...parseJobFields(body), ...(isActive === undefined ? {} : { isActive }) },
  });
  return NextResponse.json(job);
});

/** Only toggles visibility. Anything else in the body is ignored on purpose. */
export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const isActive = optionalBoolean((await readJson(req)).isActive);
  if (isActive === undefined) throw new BadRequest("Falta el campo isActive.");
  const job = await prisma.job.update({ where: { id }, data: { isActive } });
  return NextResponse.json(job);
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const { id } = await params;

  const applications = await prisma.application.findMany({ where: { jobId: id }, select: { cvPath: true } });

  // Status history has ON DELETE RESTRICT, so it goes first — all or nothing.
  await prisma.$transaction([
    prisma.applicationStatusHistory.deleteMany({ where: { application: { jobId: id } } }),
    prisma.application.deleteMany({ where: { jobId: id } }),
    prisma.job.delete({ where: { id } }),
  ]);

  // The records are gone; don't leave their CVs (personal data) orphaned on disk.
  await Promise.all(applications.map((a) => (a.cvPath ? deleteCv(a.cvPath) : null)));

  return NextResponse.json({ success: true });
});
