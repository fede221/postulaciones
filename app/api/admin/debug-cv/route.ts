import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractCvText } from "@/lib/extractCvText";

// GET /api/admin/debug-cv?id=<applicationId>
// Tests CV text extraction for a specific application and returns diagnostics
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta ?id=" }, { status: 400 });

  const app = await prisma.application.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, cvPath: true, cvText: true },
  });

  if (!app) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!app.cvPath) return NextResponse.json({ error: "Esta postulación no tiene CV adjunto" }, { status: 400 });

  const extracted = await extractCvText(app.cvPath);

  // Persist if extraction succeeded
  if (extracted) {
    await prisma.application.update({ where: { id }, data: { cvText: extracted } });
  }

  return NextResponse.json({
    applicant: `${app.firstName} ${app.lastName}`,
    cvPath: app.cvPath,
    alreadyHadText: !!app.cvText,
    extractedNow: !!extracted,
    charCount: extracted?.length ?? 0,
    preview: extracted?.slice(0, 300) ?? null,
  });
}
