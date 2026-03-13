import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { _count: { select: { applications: true } } },
  });

  if (!job || !job.isActive) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-blue-600">Puestos</Link>
          <span>/</span>
          <span className="text-slate-700">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {job.department}
                </span>
                <span className="bg-slate-100 text-slate-600 text-sm font-semibold px-3 py-1 rounded-full">
                  {job.type}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{job.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                <span>📍 {job.location}</span>
                <span>🗓 Publicado el {new Date(job.createdAt).toLocaleDateString("es-AR")}</span>
                <span>👥 {job._count.applications} postulaciones</span>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Descripción del puesto</h2>
                <div className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Requisitos</h2>
                <div className="text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
              <h2 className="font-bold text-slate-800 text-lg mb-5">¿Te interesa este puesto?</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">🏢</span>
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">🕐</span>
                  <span>{job.type}</span>
                </div>
              </div>

              <Link
                href={`/jobs/${job.id}/apply`}
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Postularme ahora
              </Link>

              <Link
                href="/jobs"
                className="block w-full text-center py-2 text-slate-500 text-sm hover:text-slate-700 mt-3 transition-colors"
              >
                ← Volver a vacantes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
