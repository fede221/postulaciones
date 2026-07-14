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

  const drop = await prisma.cvDrop.findUnique({ where: { id } });
  if (!drop) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const textToAnalyze = [drop.cvText, drop.coverLetter].filter(Boolean).join("\n\n");
  if (!textToAnalyze) {
    return NextResponse.json(
      { error: "No hay texto de CV ni presentación para analizar" },
      { status: 400 }
    );
  }

  // No specific job — pass generic context so AI focuses on profile classification
  const result = await analyzeCvWithAI(textToAnalyze, "Postulación espontánea", "General");
  if (!result) {
    return NextResponse.json({ error: "El análisis con IA falló. Verificá OPENROUTER_API_KEY." }, { status: 500 });
  }

  const updates: Record<string, unknown> = {
    aiSummary: result.summary,
    aiProfile: JSON.stringify(result.profile),
  };

  // Auto-fill profile fields only if not already set
  if (!drop.skills && result.profile.skills.length > 0) {
    updates.skills = result.profile.skills.join(", ");
  }
  if (drop.yearsExperience == null && result.profile.yearsExperience != null) {
    updates.yearsExperience = result.profile.yearsExperience;
  }
  if (!drop.educationLevel && result.profile.educationLevel) {
    updates.educationLevel = result.profile.educationLevel;
  }

  await prisma.cvDrop.update({ where: { id }, data: updates });

  return NextResponse.json({ success: true, summary: result.summary, profile: result.profile });
}
