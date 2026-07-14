import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractCvText } from "@/lib/extractCvText";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string | null)?.trim() || null;
    const city = (formData.get("city") as string | null)?.trim() || null;
    const linkedinUrl = (formData.get("linkedinUrl") as string | null)?.trim() || null;
    const yearsExperienceRaw = formData.get("yearsExperience") as string | null;
    const yearsExperience = yearsExperienceRaw ? parseInt(yearsExperienceRaw, 10) : null;
    const educationLevel = (formData.get("educationLevel") as string | null) || null;
    const workMode = (formData.get("workMode") as string | null) || null;
    const availability = (formData.get("availability") as string | null) || null;
    const salaryExpectation = (formData.get("salaryExpectation") as string | null)?.trim() || null;
    const skills = (formData.get("skills") as string | null)?.trim() || null;
    const coverLetter = (formData.get("coverLetter") as string | null)?.trim() || null;
    const cv = formData.get("cv") as File | null;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Nombre, apellido y email son obligatorios." }, { status: 400 });
    }

    let cvPath: string | null = null;
    if (cv && cv.size > 0) {
      if (cv.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "El archivo es demasiado grande (máx. 5 MB)." }, { status: 400 });
      }
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(cv.type)) {
        return NextResponse.json({ error: "Tipo de archivo no permitido. Usá PDF, DOC o DOCX." }, { status: 400 });
      }
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "cvs");
      await mkdir(uploadsDir, { recursive: true });
      const ext = path.extname(cv.name);
      const filename = `drop-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      await writeFile(path.join(uploadsDir, filename), Buffer.from(await cv.arrayBuffer()));
      cvPath = `/uploads/cvs/${filename}`;
    }

    const cvText = cvPath ? await extractCvText(cvPath) : null;

    await prisma.cvDrop.create({
      data: {
        firstName, lastName, email, phone, city, linkedinUrl,
        yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
        educationLevel, workMode, availability, salaryExpectation,
        skills, coverLetter, cvPath, cvText: cvText || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cv-drop]", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
