import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "../../applications/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  const applications = await prisma.application.findMany({
    where: { email },
    include: {
      job: { select: { id: true, title: true, department: true, location: true, type: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (applications.length === 0) notFound();

  const person = applications[0];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/admin/applicants" className="hover:text-blue-600">Postulantes</Link>
          <span>/</span>
          <span className="text-slate-700">{person.firstName} {person.lastName}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
              {person.firstName[0]}{person.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-slate-800">
                {person.firstName} {person.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                <span>✉️ {person.email}</span>
                {person.phone && <span>📱 {person.phone}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-blue-600">{applications.length}</p>
              <p className="text-xs text-slate-500">{applications.length === 1 ? "postulación" : "postulaciones"}</p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Job header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {app.job.department}
                    </span>
                    <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {app.job.type}
                    </span>
                  </div>
                  <Link
                    href={`/admin/jobs/${app.job.id}/edit`}
                    className="font-bold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {app.job.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {app.job.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    href={`/admin/applications?jobId=${app.job.id}`}
                    className="text-xs text-slate-500 hover:text-blue-600"
                  >
                    Ver postulación →
                  </Link>
                </div>
              </div>

              <div className="px-6 py-4 space-y-5">
                {/* Application info */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Fecha</p>
                    <p className="text-slate-700">{app.createdAt.toLocaleDateString("es-AR")} · {app.createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {(app as { city?: string | null }).city && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ciudad</p>
                      <p className="text-slate-700">📍 {(app as { city?: string | null }).city}</p>
                    </div>
                  )}
                  {(app as { yearsExperience?: number | null }).yearsExperience != null && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Experiencia</p>
                      <p className="text-slate-700">{(app as { yearsExperience?: number | null }).yearsExperience === 0 ? "Sin experiencia" : `${(app as { yearsExperience?: number | null }).yearsExperience} años`}</p>
                    </div>
                  )}
                  {(app as { availability?: string | null }).availability && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Disponibilidad</p>
                      <p className="text-slate-700">{((app as { availability?: string | null }).availability ?? "").replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {(app as { workMode?: string | null }).workMode && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Modalidad</p>
                      <p className="text-slate-700 capitalize">{(app as { workMode?: string | null }).workMode}</p>
                    </div>
                  )}
                  {(app as { salaryExpectation?: string | null }).salaryExpectation && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Pretensión salarial</p>
                      <p className="text-slate-700">{(app as { salaryExpectation?: string | null }).salaryExpectation}</p>
                    </div>
                  )}
                  {app.cvPath && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">CV adjunto</p>
                      <a href={app.cvPath} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                        📄 Descargar CV
                      </a>
                    </div>
                  )}
                  {(app as { linkedinUrl?: string | null }).linkedinUrl && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">LinkedIn</p>
                      <a href={(app as { linkedinUrl?: string | null }).linkedinUrl!} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm">
                        Ver perfil ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {(app as { skills?: string | null }).skills && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Habilidades y tecnologías</p>
                    <div className="flex flex-wrap gap-1.5">
                      {((app as { skills?: string | null }).skills ?? "").split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                        <span key={skill} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV text extracted */}
                {(app as { cvText?: string | null }).cvText && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Texto extraído del CV
                      <span className="ml-2 font-normal normal-case text-slate-300">
                        ({((app as { cvText?: string | null }).cvText ?? "").length.toLocaleString()} caracteres)
                      </span>
                    </p>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                        {(app as { cvText?: string | null }).cvText}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Cover letter */}
                {app.coverLetter && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Carta de presentación</p>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-line leading-relaxed border border-slate-100">
                      {app.coverLetter}
                    </div>
                  </div>
                )}

                {/* Internal notes */}
                {app.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notas internas</p>
                    <div className="bg-yellow-50 rounded-xl p-4 text-sm text-slate-700 border border-yellow-100 whitespace-pre-line">
                      {app.notes}
                    </div>
                  </div>
                )}

                {/* Status history timeline */}
                {app.statusHistory.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Historial de estados</p>
                    <ol className="relative border-l-2 border-slate-200 space-y-4 pl-6">
                      {app.statusHistory.map((h, i) => (
                        <li key={h.id} className="relative">
                          <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white ${i === app.statusHistory.length - 1 ? "bg-blue-500" : "bg-slate-300"}`} />
                          <div className="flex flex-wrap items-baseline gap-2">
                            <div className="flex items-center gap-1.5 text-sm">
                              {h.fromStatus && (
                                <>
                                  <StatusBadge status={h.fromStatus} />
                                  <span className="text-slate-400 text-xs">→</span>
                                </>
                              )}
                              <StatusBadge status={h.toStatus} />
                            </div>
                            <span className="text-xs text-slate-400">
                              {h.createdAt.toLocaleDateString("es-AR")} · {h.createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {h.note && (
                            <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                              {h.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
