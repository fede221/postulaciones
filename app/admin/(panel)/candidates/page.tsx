import Link from "next/link";
import {
  Building2,
  CalendarClock,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  SearchX,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { rankCandidates } from "@/lib/candidateScore";
import { cn } from "@/lib/cn";
import StatusBadge from "@/app/admin/(panel)/applications/StatusBadge";
import { Badge, type BadgeDot } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import ExtractAllButton from "./ExtractAllButton";
import CandidateFilters from "./CandidateFilters";

const MAX_VISIBLE = 60;

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

const QUICK_SEARCHES = [
  "despostador",
  "cocinero",
  "contador senior",
  "logistica frío",
  "mecánico flota",
  "liquidación sueldos",
  "sistemas soporte",
  "calidad HACCP",
];

const CONFIDENCE_DOT: Record<string, BadgeDot> = {
  alta: "success",
  media: "warning",
  baja: "neutral",
};

function formatDate(date: Date) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function parseSuggestedDepartment(aiProfile: string | null) {
  if (!aiProfile) return null;
  try {
    const p = JSON.parse(aiProfile) as { suggestedDepartment?: string; departmentConfidence?: string };
    if (!p.suggestedDepartment) return null;
    return { department: p.suggestedDepartment, confidence: p.departmentConfidence ?? "" };
  } catch {
    return null;
  }
}

function Meta({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      <span className="truncate">{children}</span>
    </span>
  );
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; exp?: string; edu?: string; show?: string }>;
}) {
  const { q, dept, exp, edu, show } = await searchParams;
  const visibleCount = Math.min(Math.max(parseInt(show ?? "", 10) || MAX_VISIBLE, MAX_VISIBLE), 3000);
  const query = q?.trim() ?? "";

  const [rawApplications, rawDrops] = await Promise.all([
    prisma.application.findMany({
      select: {
        id: true, firstName: true, lastName: true, email: true,
        city: true, phone: true, linkedinUrl: true,
        yearsExperience: true, educationLevel: true, workMode: true,
        availability: true, salaryExpectation: true,
        skills: true, aiProfile: true, cvText: true, coverLetter: true,
        status: true, createdAt: true,
        job: { select: { id: true, title: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cvDrop.findMany({
      select: {
        id: true, firstName: true, lastName: true, email: true,
        city: true, phone: true, linkedinUrl: true,
        yearsExperience: true, educationLevel: true, workMode: true,
        availability: true, salaryExpectation: true,
        skills: true, aiProfile: true, aiDepartment: true, cvText: true, coverLetter: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Normalize drops to the same shape as applications
  const normalizedDrops = rawDrops.map((d) => ({
    ...d,
    status: "spontaneous" as const,
    job: {
      id: "",
      title: "Postulación espontánea",
      department: d.aiDepartment ?? "Espontáneo",
    },
    source: "drop" as const,
  }));

  const normalizedApplications = rawApplications.map((a) => ({
    ...a,
    source: "application" as const,
  }));

  const allApplications = [
    ...normalizedApplications,
    ...normalizedDrops,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const totalWithCv = allApplications.filter((a) => a.cvText).length;
  const totalWithSkills = allApplications.filter((a) => a.skills).length;

  // Filter pipeline — for drops, match against aiDepartment if set
  let filtered = allApplications as typeof allApplications;
  if (dept) filtered = filtered.filter((a) =>
    a.source === "application"
      ? a.job.department === dept
      : ("aiDepartment" in a && a.aiDepartment === dept)
  );
  if (exp) filtered = filtered.filter((a) => a.yearsExperience != null && a.yearsExperience >= parseInt(exp));
  if (edu) filtered = filtered.filter((a) => a.educationLevel === edu);

  // Rank if query, else sort by recency
  const ranked = query
    ? rankCandidates(filtered, query)
    : filtered.map((c) => ({ ...c, score: 0, matchedTerms: [] as string[] }));

  const departments = [...new Set(rawApplications.map((a) => a.job.department))].sort();

  // Skill frequency matrix — merge manual skills + AI-extracted skills
  const skillMap = new Map<string, number>();
  for (const app of allApplications) {
    const manualSkills = app.skills
      ? app.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];
    let aiSkills: string[] = [];
    if (app.aiProfile) {
      try {
        const parsed = JSON.parse(app.aiProfile) as { skills?: string[] };
        aiSkills = (parsed.skills ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
      } catch { /* ignore malformed JSON */ }
    }
    const combined = [...new Set([...manualSkills, ...aiSkills])];
    combined.forEach((skill) => {
      skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
    });
  }
  const topSkills = [...skillMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);

  const hasFilters = Boolean(query || dept || exp || edu);

  const statsLine = [
    `${totalWithCv} CVs parseados`,
    `${totalWithSkills} con habilidades`,
    rawDrops.length > 0 ? `${rawDrops.length} espontáneo${rawDrops.length !== 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Candidatos"
        description="Buscá por perfil, filtrá y compará habilidades."
        actions={<ExtractAllButton />}
      />

      {/* Search & filters — live, debounced, URL-driven */}
      <CandidateFilters
        initial={{ q: query, dept: dept ?? "", exp: exp ?? "", edu: edu ?? "" }}
        departments={departments}
        educationOptions={Object.entries(EDUCATION_LABELS).map(([value, label]) => ({ value, label }))}
        quickSearches={QUICK_SEARCHES}
        statsLine={statsLine}
      />

      {/* Results: the full base when nothing is filtered, ranked matches otherwise */}
      {allApplications.length > 0 && (
        <section>
          <SectionTitle
            action={
              ranked.length > 0 ? (
                <span className="text-xs text-foreground-subtle">
                  {query ? "ordenados por compatibilidad" : "más recientes primero"}
                  {ranked.length > visibleCount ? ` · mostrando ${visibleCount} de ${ranked.length}` : ""}
                </span>
              ) : undefined
            }
          >
            {ranked.length} candidato{ranked.length !== 1 ? "s" : ""}
          </SectionTitle>

          {ranked.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados para ese perfil"
              description="Probá con términos más generales o sacá algún filtro."
              action={
                <ButtonLink href="/admin/candidates" variant="secondary" size="sm">
                  Limpiar filtros
                </ButtonLink>
              }
            />
          ) : (
            <div className="space-y-3">
              {ranked.slice(0, visibleCount).map((app, i) => {
                const suggested = parseSuggestedDepartment(app.aiProfile);
                const skills = app.skills
                  ? app.skills.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                const dropDepartment: string | null =
                  app.source === "drop" && "aiDepartment" in app && typeof app.aiDepartment === "string" && app.aiDepartment
                    ? app.aiDepartment
                    : null;
                const historyHref = `/admin/applicants/${encodeURIComponent(app.email)}`;
                const viewHref = app.source === "drop" ? "/admin/cv-drops" : `/admin/applications?jobId=${app.job.id}`;

                return (
                  <Card key={app.id} className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {/* Rank */}
                      {query && (
                        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-1">
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-md text-sm font-semibold tabular",
                              i === 0 ? "bg-inverse text-inverse-foreground" : "bg-muted text-foreground"
                            )}
                            aria-label={`Puesto ${i + 1}`}
                          >
                            {i + 1}
                          </div>
                          <span className="font-mono text-xs text-foreground-subtle tabular">{app.score} pts</span>
                        </div>
                      )}

                      {/* Body */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">
                            {app.firstName} {app.lastName}
                          </h3>
                          {app.source === "drop" ? (
                            <Badge dot="neutral">Espontáneo</Badge>
                          ) : (
                            <StatusBadge status={app.status} />
                          )}
                          {app.cvText && (
                            <Badge variant="outline">
                              <FileText className="size-3" strokeWidth={1.75} aria-hidden />
                              CV parseado
                            </Badge>
                          )}
                          {suggested && (
                            <Badge dot={CONFIDENCE_DOT[suggested.confidence] ?? "neutral"}>
                              {suggested.department}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
                          <Meta icon={Mail}>{app.email}</Meta>
                          {app.phone && <Meta icon={Phone}>{app.phone}</Meta>}
                          {app.city && <Meta icon={MapPin}>{app.city}</Meta>}
                          {app.yearsExperience != null && (
                            <Meta icon={Clock}>
                              {app.yearsExperience === 0 ? "Sin experiencia" : `${app.yearsExperience} años`}
                            </Meta>
                          )}
                          {app.educationLevel && (
                            <Meta icon={GraduationCap}>{EDUCATION_LABELS[app.educationLevel] ?? app.educationLevel}</Meta>
                          )}
                          {app.workMode && <Meta icon={Building2}>{app.workMode}</Meta>}
                          {app.availability && (
                            <Meta icon={CalendarClock}>{AVAILABILITY_LABELS[app.availability] ?? app.availability}</Meta>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {app.source === "application" ? (
                            <span className="text-foreground-muted">
                              <span className="font-medium text-foreground">{app.job.department}</span> · {app.job.title}
                            </span>
                          ) : dropDepartment ? (
                            <span className="text-foreground-muted">
                              <span className="font-medium text-foreground">{dropDepartment}</span> · sugerido por IA
                            </span>
                          ) : null}
                          <span className="font-mono text-foreground-subtle">{formatDate(app.createdAt)}</span>
                        </div>

                        {/* Skills chips */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {skills.map((skill) => {
                              const isMatch = app.matchedTerms.some((t) => skill.toLowerCase().includes(t));
                              return (
                                <Badge key={skill} variant={isMatch ? "inverse" : "outline"}>
                                  {skill}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {/* Matched terms */}
                        {app.matchedTerms.length > 0 && (
                          <p className="text-xs text-foreground-subtle">
                            Coincide en: <span className="font-medium text-foreground">{app.matchedTerms.join(", ")}</span>
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                        {app.source === "application" && (
                          <ButtonLink href={historyHref} variant="secondary" size="sm" className="flex-1 sm:flex-none">
                            Historial
                          </ButtonLink>
                        )}
                        <ButtonLink href={viewHref} variant="primary" size="sm" className="flex-1 sm:flex-none">
                          Ver
                        </ButtonLink>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {ranked.length > visibleCount && (
                <div className="flex justify-center pt-3">
                  <ButtonLink
                    href={`/admin/candidates?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(dept ? { dept } : {}),
                      ...(exp ? { exp } : {}),
                      ...(edu ? { edu } : {}),
                      show: String(visibleCount + MAX_VISIBLE),
                    }).toString()}`}
                    variant="secondary"
                    size="sm"
                    scroll={false}
                  >
                    Mostrar {Math.min(MAX_VISIBLE, ranked.length - visibleCount)} más
                  </ButtonLink>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Skills matrix */}
      {topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Matriz de habilidades</CardTitle>
              <CardDescription>
                Las 30 habilidades más frecuentes (declaradas y extraídas por IA). Hacé clic para buscar.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {topSkills.map(([skill, count]) => (
                <Link
                  key={skill}
                  href={`/admin/candidates?q=${encodeURIComponent(skill)}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 transition-colors duration-150 hover:border-border-strong hover:bg-muted"
                >
                  <span className="truncate text-[13px] font-medium text-foreground">{skill}</span>
                  <span className="shrink-0 font-mono text-xs text-foreground-subtle tabular">{count}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasFilters && allApplications.length === 0 && (
        <EmptyState
          icon={Users}
          title="Sin candidatos todavía"
          description="Cuando lleguen postulaciones van a aparecer acá para buscar y comparar."
        />
      )}
    </div>
  );
}
