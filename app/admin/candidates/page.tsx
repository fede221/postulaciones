import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankCandidates } from "@/lib/candidateScore";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "@/app/admin/applications/StatusBadge";
import ExtractAllButton from "./ExtractAllButton";

export const dynamic = "force-dynamic";

const EDUCATION_LABELS: Record<string, string> = {
  secundario: "Secundario",
  terciario: "Terciario",
  universitario_cursando: "Universitario (cursando)",
  universitario: "Universitario",
  posgrado: "Posgrado",
  doctorado: "Doctorado",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  inmediata: "Inmediata",
  "2_semanas": "2 semanas",
  "1_mes": "1 mes",
  "2_meses": "2 meses",
  a_convenir: "A convenir",
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; exp?: string; edu?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { q, dept, exp, edu } = await searchParams;
  const query = q?.trim() ?? "";

  const allApplications = await prisma.application.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      city: true,
      phone: true,
      linkedinUrl: true,
      yearsExperience: true,
      educationLevel: true,
      workMode: true,
      availability: true,
      salaryExpectation: true,
      skills: true,
      cvText: true,
      coverLetter: true,
      status: true,
      createdAt: true,
      job: { select: { id: true, title: true, department: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const totalWithCv = allApplications.filter((a) => a.cvText).length;
  const totalWithSkills = allApplications.filter((a) => a.skills).length;
  const totalPending = allApplications.filter((a) => a.cvText === null && (a as { cvPath?: string | null }).cvPath !== null).length;

  // Filter pipeline
  let filtered = allApplications as typeof allApplications;
  if (dept) filtered = filtered.filter((a) => a.job.department === dept);
  if (exp) filtered = filtered.filter((a) => a.yearsExperience != null && a.yearsExperience >= parseInt(exp));
  if (edu) filtered = filtered.filter((a) => a.educationLevel === edu);

  // Rank if query, else sort by recency
  const ranked = query
    ? rankCandidates(filtered, query)
    : filtered.map((c) => ({ ...c, score: 0, matchedTerms: [] as string[] }));

  const departments = [...new Set(allApplications.map((a) => a.job.department))].sort();

  // Skill frequency matrix
  const skillMap = new Map<string, number>();
  for (const app of allApplications) {
    if (!app.skills) continue;
    app.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((skill) => {
      skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
    });
  }
  const topSkills = [...skillMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Candidatos & Matching</h1>
            <p className="text-slate-500 text-sm mt-1">
              Buscá candidatos por requisitos, filtrá por perfil y visualizá la matriz de habilidades.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{totalWithCv} CVs parseados · {totalWithSkills} con habilidades</span>
            <ExtractAllButton />
          </div>
        </div>

        {/* Search & filters */}
        <form method="GET" className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🎯</span>
              <input
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="Describí el perfil que buscás: ej. 'despostador con experiencia en frío', 'contador senior SAP'..."
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
              Buscar
            </button>
            {(query || dept || exp || edu) && (
              <Link href="/admin/candidates" className="px-4 py-3 border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50">
                Limpiar
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <select name="dept" defaultValue={dept ?? ""} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Todos los departamentos</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select name="exp" defaultValue={exp ?? ""} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Experiencia mínima</option>
              <option value="1">1+ año</option>
              <option value="3">3+ años</option>
              <option value="5">5+ años</option>
              <option value="10">10+ años</option>
            </select>

            <select name="edu" defaultValue={edu ?? ""} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Cualquier nivel de estudios</option>
              {Object.entries(EDUCATION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Quick search suggestions */}
          {!query && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-slate-400">Búsquedas frecuentes:</span>
              {["despostador", "cocinero", "contador senior", "logistica frío", "mecánico flota", "liquidación sueldos", "sistemas soporte", "calidad HACCP"].map((s) => (
                <a key={s} href={`/admin/candidates?q=${encodeURIComponent(s)}`}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-2 py-1 rounded-lg transition-colors">
                  {s}
                </a>
              ))}
            </div>
          )}
        </form>

        {/* Results */}
        {(query || dept || exp || edu) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-slate-700">
                {ranked.length} candidato{ranked.length !== 1 ? "s" : ""}
              </h2>
              {query && ranked.length > 0 && (
                <span className="text-xs text-slate-400">ordenados por compatibilidad</span>
              )}
            </div>

            {ranked.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-4xl mb-3">🤷</p>
                <p className="text-slate-600 font-semibold">Sin resultados para ese perfil</p>
                <p className="text-slate-400 text-sm mt-1">Probá con términos más generales o eliminá algún filtro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ranked.map((app, i) => (
                  <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Score badge */}
                      {query && (
                        <div className="shrink-0 text-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                            i === 0 ? "bg-blue-600 text-white" :
                            i <= 2 ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            #{i + 1}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{app.score}pts</p>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800">{app.firstName} {app.lastName}</h3>
                          <StatusBadge status={app.status} />
                          {app.cvText && (
                            <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                              CV parseado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                          <span>✉️ {app.email}</span>
                          {app.phone && <span>📱 {app.phone}</span>}
                          {app.city && <span>📍 {app.city}</span>}
                          {app.yearsExperience != null && <span>⏱ {app.yearsExperience === 0 ? "Sin exp." : `${app.yearsExperience} años`}</span>}
                          {app.educationLevel && <span>🎓 {EDUCATION_LABELS[app.educationLevel] ?? app.educationLevel}</span>}
                          {app.workMode && <span>🏢 {app.workMode}</span>}
                          {app.availability && <span>📅 {AVAILABILITY_LABELS[app.availability] ?? app.availability}</span>}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">
                            {app.job.department} · {app.job.title}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString("es-AR")}</span>
                        </div>

                        {/* Skills chips */}
                        {app.skills && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {app.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => {
                              const isMatch = app.matchedTerms.some((t) => skill.toLowerCase().includes(t));
                              return (
                                <span key={skill} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                  isMatch
                                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                    : "bg-slate-50 text-slate-600 border-slate-100"
                                }`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Matched terms */}
                        {app.matchedTerms.length > 0 && (
                          <p className="text-xs text-slate-400">
                            Coincide en: <span className="text-blue-600 font-medium">{app.matchedTerms.join(", ")}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Link href={`/admin/applicants/${encodeURIComponent(app.email)}`}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                          Historial
                        </Link>
                        <Link href={`/admin/applications?jobId=${app.job.id}`}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Ver →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skills matrix */}
        {topSkills.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-700 mb-1">Matriz de habilidades</h2>
            <p className="text-xs text-slate-400 mb-5">Top 30 habilidades declaradas por los candidatos. Hacé clic para buscar.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {topSkills.map(([skill, count]) => (
                <a
                  key={skill}
                  href={`/admin/candidates?q=${encodeURIComponent(skill)}`}
                  className="group flex items-center justify-between bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl px-3 py-2.5 transition-colors"
                >
                  <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium truncate">{skill}</span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 ml-2 shrink-0">{count}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!query && !dept && !exp && !edu && allApplications.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <p className="text-5xl mb-4">👥</p>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Sin candidatos aún</h3>
            <p className="text-slate-400 text-sm">Cuando lleguen postulaciones aparecerán aquí para buscar y comparar.</p>
          </div>
        )}

      </main>
    </div>
  );
}
