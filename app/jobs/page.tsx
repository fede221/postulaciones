import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Puestos disponibles | Mi Empresa",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; location?: string }>;
}) {
  const params = await searchParams;
  const { department, location } = params;

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(department ? { department } : {}),
      ...(location ? { location } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const departments = await prisma.job.findMany({
    where: { isActive: true },
    distinct: ["department"],
    select: { department: true },
  });

  const locations = await prisma.job.findMany({
    where: { isActive: true },
    distinct: ["location"],
    select: { location: true },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-3">Puestos disponibles</h1>
          <p className="text-blue-100 text-lg">
            {jobs.length} {jobs.length === 1 ? "vacante abierta" : "vacantes abiertas"}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6">
              <h2 className="font-bold text-slate-700 mb-4">Filtros</h2>

              <form method="GET">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Área</label>
                  <select
                    name="department"
                    defaultValue={department || ""}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Todas las áreas</option>
                    {departments.map((d) => (
                      <option key={d.department} value={d.department}>
                        {d.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Ubicación</label>
                  <select
                    name="location"
                    defaultValue={location || ""}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Todas las ubicaciones</option>
                    {locations.map((l) => (
                      <option key={l.location} value={l.location}>
                        {l.location}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Aplicar filtros
                </button>
                {(department || location) && (
                  <Link
                    href="/jobs"
                    className="block text-center text-sm text-slate-500 hover:text-slate-700 mt-2"
                  >
                    Limpiar filtros
                  </Link>
                )}
              </form>
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1">
            {jobs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No hay vacantes disponibles</h3>
                <p className="text-slate-500">Intentá cambiar los filtros o volvé más tarde.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {job.department}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {job.type}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                          <span>📍 {job.location}</span>
                          <span>🗓 {new Date(job.createdAt).toLocaleDateString("es-AR")}</span>
                          <span>👥 {job._count.applications} postulaciones</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                          Ver puesto
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
