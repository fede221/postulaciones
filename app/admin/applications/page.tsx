import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "./StatusBadge";
import StatusUpdater from "./StatusUpdater";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const { jobId, status } = params;

  const applications = await prisma.application.findMany({
    where: {
      ...(jobId ? { jobId } : {}),
      ...(status ? { status } : {}),
    },
    include: { job: { select: { title: true, department: true } } },
    orderBy: { createdAt: "desc" },
  });

  const jobs = await prisma.job.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Postulaciones</h1>
            <p className="text-slate-500 text-sm mt-1">{applications.length} postulaciones</p>
          </div>
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-6">
          <select
            name="jobId"
            defaultValue={jobId || ""}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todos los puestos</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status || ""}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Filtrar
          </button>
          {(jobId || status) && (
            <Link href="/admin/applications" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition-colors">
              Limpiar
            </Link>
          )}
        </form>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hay postulaciones</h3>
            <p className="text-slate-500">Aún no se han recibido postulaciones para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString("es-AR")} · {new Date(app.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg">
                      {app.firstName} {app.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                      <span>✉️ {app.email}</span>
                      {app.phone && <span>📱 {app.phone}</span>}
                    </div>

                    <div className="mt-2">
                      <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">
                        {app.job.title}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{app.job.department}</span>
                    </div>

                    {app.coverLetter && (
                      <details className="mt-3">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                          Ver carta de presentación
                        </summary>
                        <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                          {app.coverLetter}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {app.cvPath && (
                      <a
                        href={app.cvPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        📄 Ver CV
                      </a>
                    )}
                    <StatusUpdater applicationId={app.id} currentStatus={app.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
