import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expandQuery } from "@/lib/synonyms";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "@/app/admin/applications/StatusBadge";

export const dynamic = "force-dynamic";

function highlight(text: string, terms: string[]): string {
  if (!text || terms.length === 0) return text;
  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return text.replace(
    new RegExp(`(${pattern})`, "gi"),
    '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>'
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { q, type = "all" } = await searchParams;
  const query = q?.trim() ?? "";
  const terms = query ? expandQuery(query) : [];

  let applications: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    city: string | null;
    skills: string | null;
    coverLetter: string | null;
    notes: string | null;
    status: string;
    createdAt: Date;
    job: { id: string; title: string; department: string };
  }[] = [];

  let jobs: {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    isActive: boolean;
    createdAt: Date;
    _count: { applications: number };
  }[] = [];

  if (terms.length > 0) {
    const orConditions = terms.flatMap((term) => [
      { firstName: { contains: term } },
      { lastName: { contains: term } },
      { email: { contains: term } },
      { city: { contains: term } },
      { skills: { contains: term } },
      { coverLetter: { contains: term } },
      { notes: { contains: term } },
      { job: { title: { contains: term } } },
      { job: { department: { contains: term } } },
    ]);

    if (type === "all" || type === "applications") {
      applications = await prisma.application.findMany({
        where: { OR: orConditions },
        select: {
          id: true, firstName: true, lastName: true, email: true,
          phone: true, city: true, skills: true, coverLetter: true,
          notes: true, status: true, createdAt: true,
          job: { select: { id: true, title: true, department: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    }

    if (type === "all" || type === "jobs") {
      const jobOrConditions = terms.flatMap((term) => [
        { title: { contains: term } },
        { department: { contains: term } },
        { location: { contains: term } },
        { description: { contains: term } },
        { requirements: { contains: term } },
      ]);
      jobs = await prisma.job.findMany({
        where: { OR: jobOrConditions },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }
  }

  const totalResults = applications.length + jobs.length;
  const expandedTerms = terms.filter((t) => t !== query.toLowerCase() && t !== query.trim());

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">Búsqueda inteligente</h1>
          <p className="text-slate-500 text-sm mt-1">
            Buscá postulantes, postulaciones y puestos. Entiende sinónimos en español e inglés.
          </p>
        </div>

        {/* Search form */}
        <form method="GET" className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
              <input
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="Ej: desarrollador, marketing, senior, rrhh..."
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>
            <select
              name="type"
              defaultValue={type}
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Todo</option>
              <option value="applications">Solo postulaciones</option>
              <option value="jobs">Solo puestos</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Synonym expansion hint */}
          {query && expandedTerms.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">También buscando:</span>
              {expandedTerms.slice(0, 12).map((t) => (
                <span key={t} className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                  {t}
                </span>
              ))}
            </div>
          )}
        </form>

        {/* Results summary */}
        {query && (
          <div className="mb-5 flex items-center gap-2">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-800">{totalResults}</span> resultados para{" "}
              <span className="font-semibold text-blue-600">&ldquo;{query}&rdquo;</span>
            </p>
            {totalResults === 0 && (
              <span className="text-xs text-slate-400">— intentá con términos más generales</span>
            )}
          </div>
        )}

        {!query && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Escribí algo para buscar</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Podés buscar por nombre, email, área, puesto, palabras en la carta de presentación o notas internas.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["gastronomia", "desposte", "calidad", "logistica", "mantenimiento", "rrhh", "sistemas", "comercial", "tesoreria", "seguridad", "controlling", "taller"].map((s) => (
                <a
                  key={s}
                  href={`/admin/search?q=${s}`}
                  className="inline-block bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Applications results */}
        {applications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {applications.length}
              </span>
              Postulaciones
            </h2>
            <div className="space-y-3">
              {applications.map((app) => {
                const nameHl = highlight(`${app.firstName} ${app.lastName}`, terms);
                const emailHl = highlight(app.email, terms);
                const jobHl = highlight(app.job.title, terms);
                const deptHl = highlight(app.job.department, terms);
                const cityHl = app.city ? highlight(app.city, terms) : null;
                const skillsHl = app.skills ? highlight(app.skills.slice(0, 120), terms) : null;
                const snippet = app.coverLetter
                  ? highlight(app.coverLetter.slice(0, 180), terms)
                  : app.notes
                  ? highlight(app.notes.slice(0, 180), terms)
                  : null;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3
                            className="font-bold text-slate-800"
                            dangerouslySetInnerHTML={{ __html: nameHl }}
                          />
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                          <span dangerouslySetInnerHTML={{ __html: `✉️ ${emailHl}` }} />
                          {app.phone && <span>📱 {app.phone}</span>}
                          {cityHl && <span dangerouslySetInnerHTML={{ __html: `📍 ${cityHl}` }} />}
                        </div>
                        {skillsHl && (
                          <p
                            className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 mb-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: `🛠 ${skillsHl}` }}
                          />
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded"
                            dangerouslySetInnerHTML={{ __html: jobHl }}
                          />
                          <span
                            className="text-xs text-slate-400"
                            dangerouslySetInnerHTML={{ __html: deptHl }}
                          />
                        </div>
                        {snippet && (
                          <p
                            className="text-xs text-slate-500 leading-relaxed line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: `${snippet}…` }}
                          />
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          href={`/admin/applicants/${encodeURIComponent(app.email)}`}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Historial
                        </Link>
                        <Link
                          href={`/admin/applications?jobId=${app.job.id}`}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(app.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Jobs results */}
        {jobs.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {jobs.length}
              </span>
              Puestos
            </h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {job.department}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${job.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {job.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <h3
                        className="font-bold text-slate-800"
                        dangerouslySetInnerHTML={{ __html: highlight(job.title, terms) }}
                      />
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {job.location} · 🕐 {job.type} · 👥 {job._count.applications} postulaciones
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/admin/applications?jobId=${job.id}`}
                        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        Postulaciones
                      </Link>
                      <Link
                        href={`/admin/jobs/${job.id}/edit`}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Editar →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && totalResults === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-5xl mb-4">🤷</p>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Sin resultados</h3>
            <p className="text-slate-500 text-sm">
              No encontramos nada para &ldquo;{query}&rdquo;. Probá con otro término.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
