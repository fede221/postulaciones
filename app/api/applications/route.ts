import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const jobId = formData.get("jobId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const coverLetter = formData.get("coverLetter") as string | null;
    const cv = formData.get("cv") as File | null;

    if (!jobId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId, isActive: true } });
    if (!job) {
      return NextResponse.json({ error: "Puesto no encontrado" }, { status: 404 });
    }

    let cvPath: string | null = null;

    if (cv && cv.size > 0) {
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (cv.size > maxSize) {
        return NextResponse.json({ error: "El archivo es demasiado grande (máx. 5 MB)" }, { status: 400 });
      }

      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(cv.type)) {
        return NextResponse.json({ error: "Tipo de archivo no permitido. Usá PDF, DOC o DOCX." }, { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), "uploads", "cvs");
      await mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(cv.name);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      const bytes = await cv.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));

      cvPath = `/uploads/cvs/${filename}`;
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        coverLetter: coverLetter || null,
        cvPath,
      },
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
