import Link from "next/link";
import { Briefcase, Mail, MapPin, Phone, Search, SearchX, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { expandQuery } from "@/lib/synonyms";
import StatusBadge from "@/app/admin/(panel)/applications/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "gastronomia", "desposte", "calidad", "logistica", "mantenimiento", "rrhh",
  "sistemas", "comercial", "tesoreria", "seguridad", "controlling", "taller",
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text: string, terms: string[]): string {
  if (!text) return text;
  const safe = escapeHtml(text);
  if (terms.length === 0) return safe;
  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return safe.replace(
    new RegExp(`(${pattern})`, "gi"),
    '<mark class="bg-foreground text-background rounded-sm px-0.5">$1</mark>'
  );
}

function searchHref(q: string, type: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type && type !== "all") params.set("type", type);
  const qs = params.toString();
  return `/admin/search${qs ? `?${qs}` : ""}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
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
      { cvText: { contains: term } },
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

  const segments = [
    { label: "Todo", href: searchHref(query, "all"), active: type === "all" },
    { label: "Postulaciones", href: searchHref(query, "applications"), active: type === "applications" },
    { label: "Puestos", href: searchHref(query, "jobs"), active: type === "jobs" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Búsqueda"
        description="Buscá postulantes, postulaciones y puestos. Entiende sinónimos en español e inglés."
      />

      {/* Search form */}
      <form method="GET" className="space-y-3">
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
              strokeWidth={1.5}
              aria-hidden
            />
            <Input
              name="q"
              defaultValue={query}
              autoFocus
              aria-label="Búsqueda"
              placeholder="Ej: desarrollador, marketing, senior, rrhh..."
              className="h-10 pl-9"
            />
          </div>
          <Button type="submit" className="h-10">
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Segmented items={segments} />
          {query && expandedTerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-foreground-subtle">También buscando:</span>
              {expandedTerms.slice(0, 12).map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Results summary */}
      {query && (
        <p className="text-sm text-foreground-muted">
          <span className="font-medium text-foreground tabular">{totalResults}</span> resultado{totalResults !== 1 ? "s" : ""} para{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {!query && (
        <EmptyState
          icon={Search}
          title="Escribí algo para buscar"
          description="Podés buscar por nombre, email, área, puesto, palabras de la carta de presentación o notas internas."
          action={
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/admin/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-foreground-muted transition-colors duration-150 hover:bg-muted-hover hover:text-foreground"
                >
                  {s}
                </Link>
              ))}
            </div>
          }
        />
      )}

      {/* Applications results */}
      {applications.length > 0 && (
        <section>
          <SectionTitle>Postulaciones ({applications.length})</SectionTitle>
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
                <Card key={app.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className="font-medium text-foreground"
                          dangerouslySetInnerHTML={{ __html: nameHl }}
                        />
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Mail className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                          <span className="truncate" dangerouslySetInnerHTML={{ __html: emailHl }} />
                        </span>
                        {app.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                            {app.phone}
                          </span>
                        )}
                        {cityHl && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                            <span dangerouslySetInnerHTML={{ __html: cityHl }} />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                        <span className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: deptHl }} />
                        <span aria-hidden>·</span>
                        <span dangerouslySetInnerHTML={{ __html: jobHl }} />
                        <span className="font-mono text-foreground-subtle">
                          {new Date(app.createdAt).toLocaleDateString("es-AR")}
                        </span>
                      </div>

                      {skillsHl && (
                        <p
                          className="rounded-md bg-muted px-2 py-1 text-xs leading-relaxed text-foreground-muted"
                          dangerouslySetInnerHTML={{ __html: skillsHl }}
                        />
                      )}

                      {snippet && (
                        <p
                          className="line-clamp-2 text-xs leading-relaxed text-foreground-muted"
                          dangerouslySetInnerHTML={{ __html: `${snippet}…` }}
                        />
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <ButtonLink
                        href={`/admin/applicants/${encodeURIComponent(app.email)}`}
                        variant="secondary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        Historial
                      </ButtonLink>
                      <ButtonLink
                        href={`/admin/applications?jobId=${app.job.id}`}
                        variant="primary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        Ver
                      </ButtonLink>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Jobs results */}
      {jobs.length > 0 && (
        <section>
          <SectionTitle>Puestos ({jobs.length})</SectionTitle>
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-medium text-foreground"
                        dangerouslySetInnerHTML={{ __html: highlight(job.title, terms) }}
                      />
                      <Badge dot={job.isActive ? "success" : "neutral"}>
                        {job.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">{job.department}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                        {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular">
                        <Users className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                        {job._count.applications} postulaci{job._count.applications === 1 ? "ón" : "ones"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ButtonLink
                      href={`/admin/applications?jobId=${job.id}`}
                      variant="secondary"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Postulaciones
                    </ButtonLink>
                    <ButtonLink
                      href={`/admin/jobs/${job.id}/edit`}
                      variant="primary"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Editar
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {query && totalResults === 0 && (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description={`No encontramos nada para "${query}". Probá con un término más general.`}
          action={
            <ButtonLink href="/admin/search" variant="secondary" size="sm">
              Nueva búsqueda
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
