import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCvWithAI } from "@/lib/openrouter";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const app = await prisma.application.findUnique({
    where: { id },
    include: { job: { select: { title: true, department: true } } },
  });

  if (!app) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const textToAnalyze = [app.cvText, app.coverLetter].filter(Boolean).join("\n\n");
  if (!textToAnalyze) {
    return NextResponse.json(
      { error: "No hay texto de CV ni carta de presentación para analizar" },
      { status: 400 }
    );
  }

  const result = await analyzeCvWithAI(textToAnalyze, app.job.title, app.job.department);
  if (!result) {
    return NextResponse.json({ error: "El análisis con IA falló. Verificá OPENROUTER_API_KEY." }, { status: 500 });
  }

  const updates: Record<string, unknown> = {
    aiSummary: result.summary,
    aiProfile: JSON.stringify(result.profile),
    aiDepartment: result.profile.suggestedDepartment ?? null,
  };

  if (!app.skills && result.profile.skills.length > 0) {
    updates.skills = result.profile.skills.join(", ");
  }
  if (app.yearsExperience == null && result.profile.yearsExperience != null) {
    updates.yearsExperience = result.profile.yearsExperience;
  }
  if (!app.educationLevel && result.profile.educationLevel) {
    updates.educationLevel = result.profile.educationLevel;
  }

  await prisma.application.update({ where: { id }, data: updates });

  return NextResponse.json({ success: true, summary: result.summary, profile: result.profile });
}
