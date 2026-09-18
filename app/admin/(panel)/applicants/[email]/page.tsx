import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cvUrl } from "@/lib/cvUrl";
import { EDUCATION_LABELS } from "@/lib/format";
import { PageHeader, Eyebrow } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StatusBadge from "../../applications/StatusBadge";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return `${d.toLocaleDateString("es-AR")} · ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
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
  const fullName = `${person.firstName} ${person.lastName}`;
  const linkedin = applications.find((a) => a.linkedinUrl)?.linkedinUrl ?? null;
  const city = applications.find((a) => a.city)?.city ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <Avatar name={fullName} size="lg" />
            <span className="min-w-0">
              <span className="block truncate">{fullName}</span>
              <span className="mt-1 block text-sm font-normal text-foreground-muted">
                {applications.length} {applications.length === 1 ? "postulación" : "postulaciones"}
              </span>
            </span>
          </span>
        }
        actions={
          <ButtonLink href="/admin/applicants" variant="ghost" size="sm">
            <ArrowLeft strokeWidth={1.75} aria-hidden />
            Postulantes
          </ButtonLink>
        }
      />

      {/* Contact metadata */}
      <Card>
        <CardContent className="pt-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex min-w-0 items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-foreground-subtle">Email</dt>
                <dd className="truncate text-foreground">
                  <a href={`mailto:${person.email}`} className="hover:underline underline-offset-4">
                    {person.email}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-foreground-subtle">Teléfono</dt>
                <dd className="truncate text-foreground">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="font-mono hover:underline underline-offset-4">
                      {person.phone}
                    </a>
                  ) : (
                    <span className="text-foreground-subtle">Sin datos</span>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-foreground-subtle">Ciudad</dt>
                <dd className="truncate text-foreground">
                  {city ?? <span className="text-foreground-subtle">Sin datos</span>}
                </dd>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2.5">
              <Link2 className="mt-0.5 size-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-foreground-subtle">LinkedIn</dt>
                <dd className="truncate text-foreground">
                  {linkedin ? (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      Ver perfil
                      <ExternalLink className="size-3.5 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
                    </a>
                  ) : (
                    <span className="text-foreground-subtle">Sin datos</span>
                  )}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Applications timeline */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Historial de postulaciones</h2>

        <ol className="relative space-y-4 border-l border-border pl-6">
          {applications.map((app) => {
            const cv = cvUrl(app.cvPath);
            const skills = (app.skills ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <li key={app.id} className="relative">
                <span
                  className="absolute -left-[29px] top-5 size-2 rounded-full border-2 border-background bg-foreground"
                  aria-hidden
                />
                <Card>
                  <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <Badge>{app.job.department}</Badge>
                        <Badge>{app.job.type}</Badge>
                      </div>
                      <Link
                        href={`/admin/jobs/${app.job.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-base font-medium text-foreground hover:underline underline-offset-4"
                      >
                        <Briefcase className="size-4 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
                        {app.job.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground-subtle">
                        <MapPin className="size-3.5" strokeWidth={1.75} aria-hidden />
                        {app.job.location}
                        <span aria-hidden>·</span>
                        <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
                        <span className="font-mono">{formatDateTime(app.createdAt)}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge status={app.status} />
                      {cv && (
                        <ButtonLink href={cv} prefetch={false} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                          <FileText strokeWidth={1.75} aria-hidden />
                          Ver CV
                        </ButtonLink>
                      )}
                      <ButtonLink href={`/admin/applications?jobId=${app.job.id}`} variant="ghost" size="sm">
                        Ver postulación
                        <ArrowRight strokeWidth={1.75} aria-hidden />
                      </ButtonLink>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 border-t border-border pt-4">
                    {/* Application info */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {app.yearsExperience != null && (
                        <Meta label="Experiencia">
                          {app.yearsExperience === 0 ? "Sin experiencia" : `${app.yearsExperience} años`}
                        </Meta>
                      )}
                      {app.educationLevel && <Meta label="Formación">{EDUCATION_LABELS[app.educationLevel] ?? app.educationLevel}</Meta>}
                      {app.availability && <Meta label="Disponibilidad">{app.availability.replace(/_/g, " ")}</Meta>}
                      {app.workMode && (
                        <Meta label="Modalidad">
                          <span className="capitalize">{app.workMode}</span>
                        </Meta>
                      )}
                      {app.salaryExpectation && <Meta label="Pretensión salarial">{app.salaryExpectation}</Meta>}
                      {app.city && <Meta label="Ciudad">{app.city}</Meta>}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <Eyebrow className="mb-2">Habilidades y tecnologías</Eyebrow>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <Badge key={skill} variant="solid">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI summary */}
                    {app.aiSummary && (
                      <div>
                        <Eyebrow className="mb-2">Resumen del análisis</Eyebrow>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">{app.aiSummary}</p>
                      </div>
                    )}

                    {/* CV text extracted */}
                    {app.cvText && (
                      <div>
                        <Eyebrow className="mb-2">
                          Texto extraído del CV
                          <span className="ml-2 normal-case tracking-normal text-foreground-subtle">
                            ({app.cvText.length.toLocaleString("es-AR")} caracteres)
                          </span>
                        </Eyebrow>
                        <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-background-secondary p-4 scrollbar-thin">
                          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground-muted">
                            {app.cvText}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div>
                        <Eyebrow className="mb-2">Carta de presentación</Eyebrow>
                        <div className="whitespace-pre-line rounded-md border border-border bg-background-secondary p-4 text-sm leading-relaxed text-foreground-muted">
                          {app.coverLetter}
                        </div>
                      </div>
                    )}

                    {/* Internal notes */}
                    {app.notes && (
                      <div>
                        <Eyebrow className="mb-2">Notas internas</Eyebrow>
                        <div className="whitespace-pre-line rounded-md border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed text-foreground">
                          {app.notes}
                        </div>
                      </div>
                    )}

                    {/* Status history */}
                    {app.statusHistory.length > 0 && (
                      <div>
                        <Eyebrow className="mb-3">Historial de estados</Eyebrow>
                        <ol className="space-y-3">
                          {app.statusHistory.map((h, i) => {
                            const isLast = i === app.statusHistory.length - 1;
                            return (
                              <li key={h.id} className="flex gap-3">
                                <span
                                  className={`mt-2 size-1.5 shrink-0 rounded-full ${isLast ? "bg-foreground" : "bg-foreground-subtle"}`}
                                  aria-hidden
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {h.fromStatus && (
                                      <>
                                        <StatusBadge status={h.fromStatus} />
                                        <ArrowRight className="size-3.5 text-foreground-subtle" strokeWidth={1.75} aria-hidden />
                                      </>
                                    )}
                                    <StatusBadge status={h.toStatus} />
                                    <span className="font-mono text-xs text-foreground-subtle">{formatDateTime(h.createdAt)}</span>
                                  </div>
                                  {h.note && (
                                    <p className="mt-1.5 rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted">
                                      {h.note}
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
