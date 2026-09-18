import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, readJson } from "@/lib/adminApi";
import { extractCvText } from "@/lib/extractCvText";

// POST /api/admin/applications/extract-cv
// Body: { id } — extract text for one application
// Body: { all: true } — extract text for all applications with cvPath but no cvText
export const POST = adminRoute(async (req) => {
  const body = await readJson(req);

  if (body.all === true) {
    const apps = await prisma.application.findMany({
      where: { cvPath: { not: null }, cvText: null },
      select: { id: true, cvPath: true },
    });

    let processed = 0;
    for (const app of apps) {
      if (!app.cvPath) continue;
      const text = await extractCvText(app.cvPath);
      if (text) {
        await prisma.application.update({ where: { id: app.id }, data: { cvText: text } });
        processed++;
      }
    }

    return NextResponse.json({ processed, total: apps.length });
  }

  if (typeof body.id === "string" && body.id) {
    const app = await prisma.application.findUnique({
      where: { id: body.id },
      select: { id: true, cvPath: true },
    });
    if (!app || !app.cvPath) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }
    const text = await extractCvText(app.cvPath);
    if (text) {
      await prisma.application.update({ where: { id: app.id }, data: { cvText: text } });
    }
    return NextResponse.json({ success: true, extracted: !!text });
  }

  return NextResponse.json({ error: "Falta id o all:true" }, { status: 400 });
});
