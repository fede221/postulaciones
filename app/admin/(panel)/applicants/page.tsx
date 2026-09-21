import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import StatusBadge from "../applications/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
    <div className="space-y-8">
      <PageHeader
        title="Postulantes"
        description={`${applicants.length} ${applicants.length === 1 ? "persona única" : "personas únicas"}${q ? ` para "${q}"` : ""}`}
      />

      <form method="GET" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
            strokeWidth={1.75}
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nombre o email"
            aria-label="Buscar postulantes"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
          {q && (
            <ButtonLink href="/admin/applicants" variant="ghost">
              Limpiar
            </ButtonLink>
          )}
        </div>
      </form>

      {applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "No encontramos postulantes" : "Todavía no hay postulantes"}
          description={
            q
              ? "Probá con otro nombre o email."
              : "Cuando alguien se postule a un puesto, va a aparecer acá."
          }
          action={
            q ? (
              <ButtonLink href="/admin/applicants" variant="secondary" size="sm">
                Ver todos
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Postulante</TH>
              <TH className="hidden md:table-cell">Teléfono</TH>
              <TH>Postulaciones</TH>
              <TH className="hidden sm:table-cell">Último estado</TH>
              <TH className="hidden lg:table-cell">Última postulación</TH>
              <TH className="w-12">
                <span className="sr-only">Ver detalle</span>
              </TH>
            </tr>
          </THead>
          <TBody>
            {applicants.map((applicant) => {
              const fullName = `${applicant.firstName} ${applicant.lastName}`;
              const detailHref = `/admin/applicants/${encodeURIComponent(applicant.email)}`;
              // applications come ordered by createdAt desc, so the first one is the latest
              const latest = applicant.applications[0];
              return (
                <TR key={applicant.email} interactive>
                  <TD>
                    <Link href={detailHref} className="flex min-w-0 items-center gap-3 focus-visible:outline-none">
                      <Avatar name={fullName} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{fullName}</span>
                        <span className="block truncate text-xs text-foreground-subtle">{applicant.email}</span>
                      </span>
                    </Link>
                  </TD>
                  <TD className="hidden md:table-cell text-foreground-muted font-mono text-xs">
                    {applicant.phone ?? <span className="text-foreground-subtle">Sin teléfono</span>}
                  </TD>
                  <TD>
                    <Badge variant="solid" className="tabular">
                      {applicant.applications.length}
                    </Badge>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusBadge status={latest.status} />
                      <span className="hidden truncate text-xs text-foreground-subtle xl:inline">
                        {latest.job.title}
                      </span>
                    </div>
                  </TD>
                  <TD className="hidden lg:table-cell text-xs text-foreground-subtle font-mono">
                    {applicant.lastApplied.toLocaleDateString("es-AR")}
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={detailHref}
                      aria-label={`Ver historial de ${fullName}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-foreground-subtle transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
