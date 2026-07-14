export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import CvDropCard from "./CvDropCard";

export default async function CvDropsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const drops = await prisma.cvDrop.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, city: true, linkedinUrl: true,
      yearsExperience: true, educationLevel: true, workMode: true,
      availability: true, salaryExpectation: true,
      skills: true, coverLetter: true, cvPath: true, cvText: true,
      aiSummary: true, aiProfile: true, aiDepartment: true, reviewed: true, createdAt: true,
    },
  });

  const unreviewed = drops.filter((d) => !d.reviewed).length;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">CVs Espontáneos</h1>
            <p className="text-slate-500 text-sm mt-1">
              Personas que dejaron su CV sin postularse a un puesto específico.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{drops.length} recibidos</span>
            {unreviewed > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreviewed} nuevos
              </span>
            )}
          </div>
        </div>

        {drops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Sin CVs espontáneos aún</h3>
            <p className="text-slate-400 text-sm">Aparecerán aquí cuando alguien deje su CV desde la página pública.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drops.map((drop) => (
              <CvDropCard key={drop.id} drop={drop} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
