import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "./StatusBadge";
import ApplicationCard from "./ApplicationCard";

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
    include: {
      job: { select: { title: true, department: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
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
          <Link
            href="/admin/applicants"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Ver historial por postulante →
          </Link>
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
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
