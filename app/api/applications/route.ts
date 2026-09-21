import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractCvText } from "@/lib/extractCvText";
import {
  LIMITS,
  guardBeforeParse,
  guardPublicSubmission,
  isValidEmail,
  isValidUrl,
  oneOf,
  storeCvFromForm,
  text,
  years,
} from "@/lib/publicForm";

const EDUCATION = ["secundario", "terciario", "universitario_cursando", "universitario", "posgrado", "doctorado"] as const;
const WORK_MODE = ["presencial", "hibrido", "remoto", "indiferente"] as const;
const AVAILABILITY = ["inmediata", "2_semanas", "1_mes", "2_meses", "a_convenir"] as const;

export async function POST(req: NextRequest) {
  try {
    const early = guardBeforeParse(req, "apply");
    if (early) return early;

    const form = await req.formData();
    const blocked = guardPublicSubmission(form);
    if (blocked) return blocked;

    const jobId = text(form, "jobId", 64);
    const firstName = text(form, "firstName", LIMITS.name);
    const lastName = text(form, "lastName", LIMITS.name);
    const email = text(form, "email", LIMITS.email)?.toLowerCase() ?? null;
    const linkedinUrl = text(form, "linkedinUrl", LIMITS.url);

    if (!jobId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Nombre, apellido y email son obligatorios." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
    }
    if (!isValidUrl(linkedinUrl)) {
      return NextResponse.json({ error: "El link de LinkedIn no es válido." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId, isActive: true }, select: { id: true } });
    if (!job) {
      return NextResponse.json({ error: "El puesto ya no está disponible." }, { status: 404 });
    }

    const stored = await storeCvFromForm(form, "");
    if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
    const cvPath = stored.cvPath;
    const cvText = cvPath ? await extractCvText(cvPath) : null;

    const application = await prisma.application.create({
      data: {
        jobId,
        firstName,
        lastName,
        email,
        phone: text(form, "phone", LIMITS.phone),
        city: text(form, "city", LIMITS.city),
        linkedinUrl,
        yearsExperience: years(form, "yearsExperience"),
        educationLevel: oneOf(form, "educationLevel", EDUCATION),
        workMode: oneOf(form, "workMode", WORK_MODE),
        availability: oneOf(form, "availability", AVAILABILITY),
        salaryExpectation: text(form, "salaryExpectation", LIMITS.salary),
        skills: text(form, "skills", LIMITS.skills),
        coverLetter: text(form, "coverLetter", LIMITS.coverLetter),
        cvPath,
        cvText,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (err) {
    console.error("[applications]", err);
    return NextResponse.json({ error: "No pudimos guardar tu postulación. Intentá de nuevo." }, { status: 500 });
  }
}
