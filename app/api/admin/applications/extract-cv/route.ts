import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractCvText } from "@/lib/extractCvText";

// POST /api/admin/applications/extract-cv
// Body: { id } — extract text for one application
// Body: { all: true } — extract text for all applications with cvPath but no cvText
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.all) {
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

  if (body.id) {
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
}
