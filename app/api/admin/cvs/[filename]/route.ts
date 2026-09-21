import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readCv } from "@/lib/cvStorage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { filename } = await params;
  const file = await readCv(filename);
  if (!file) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.buffer.length),
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
