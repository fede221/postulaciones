import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import JobActions from "./JobActions";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Puestos</h1>
            <p className="text-slate-500 text-sm mt-1">{jobs.length} puestos en total</p>
          </div>
          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            + Nuevo puesto
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <p className="text-5xl mb-4">💼</p>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hay puestos aún</h3>
            <p className="text-slate-500 mb-6">Creá el primer puesto para que los candidatos puedan postularse.</p>
            <Link
              href="/admin/jobs/new"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              + Crear puesto
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Puesto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Área</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">Ubicación</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Postulaciones</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{job.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{new Date(job.createdAt).toLocaleDateString("es-AR")}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{job.department}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{job.location}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/applications?jobId=${job.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {job._count.applications}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          job.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {job.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <JobActions job={job} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
