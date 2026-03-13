import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { q } = await searchParams;

  // Get all applications grouped by email
  const applications = await prisma.application.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
          ],
        }
      : undefined,
    include: { job: { select: { title: true, department: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Group by email
  const byEmail = new Map<
    string,
    {
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      applications: typeof applications;
      lastApplied: Date;
    }
  >();

  for (const app of applications) {
    const key = app.email.toLowerCase();
    if (!byEmail.has(key)) {
      byEmail.set(key, {
        email: app.email,
        firstName: app.firstName,
        lastName: app.lastName,
        phone: app.phone ?? null,
        applications: [],
        lastApplied: app.createdAt,
      });
    }
    byEmail.get(key)!.applications.push(app);
    if (app.createdAt > byEmail.get(key)!.lastApplied) {
      byEmail.get(key)!.lastApplied = app.createdAt;
    }
  }

  const applicants = Array.from(byEmail.values()).sort(
    (a, b) => b.lastApplied.getTime() - a.lastApplied.getTime()
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Postulantes</h1>
            <p className="text-slate-500 text-sm mt-1">
              {applicants.length} {applicants.length === 1 ? "persona" : "personas"} únicas
            </p>
          </div>
        </div>

        {/* Search */}
        <form method="GET" className="mb-6 flex gap-3">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nombre o email..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/admin/applicants"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition-colors"
            >
              Limpiar
            </Link>
          )}
        </form>

        {applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <p className="text-5xl mb-4">👤</p>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hay postulantes</h3>
            <p className="text-slate-500">Aún no se han recibido postulaciones.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => {
              const statusCounts = applicant.applications.reduce<Record<string, number>>(
                (acc, a) => {
                  acc[a.status] = (acc[a.status] || 0) + 1;
                  return acc;
                },
                {}
              );

              return (
                <Link
                  key={applicant.email}
                  href={`/admin/applicants/${encodeURIComponent(applicant.email)}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                          {applicant.firstName[0]}{applicant.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {applicant.firstName} {applicant.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>✉️ {applicant.email}</span>
                            {applicant.phone && <span>📱 {applicant.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="ml-13 flex flex-wrap gap-2 mt-2 pl-13">
                        {applicant.applications.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg"
                          >
                            <span className="font-medium">{a.job.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {STATUS_LABELS[a.status] ?? a.status}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-700">
                        {applicant.applications.length}{" "}
                        {applicant.applications.length === 1 ? "postulación" : "postulaciones"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Última: {applicant.lastApplied.toLocaleDateString("es-AR")}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-end mt-2">
                        {Object.entries(statusCounts).map(([s, count]) => (
                          <span
                            key={s}
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[s] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {count} {STATUS_LABELS[s] ?? s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
