import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import JobActions from "./JobActions";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const newJobAction = (
    <ButtonLink href="/admin/jobs/new" variant="primary">
      <Plus strokeWidth={1.75} aria-hidden />
      Nuevo puesto
    </ButtonLink>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Puestos"
        description={`${jobs.length} ${jobs.length === 1 ? "puesto" : "puestos"} en total`}
        actions={newJobAction}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Todavía no hay puestos"
          description="Creá el primer puesto para que los candidatos puedan postularse."
          action={newJobAction}
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Puesto</TH>
              <TH className="hidden md:table-cell">Área</TH>
              <TH className="hidden lg:table-cell">Ubicación</TH>
              <TH>Postulaciones</TH>
              <TH>Estado</TH>
              <TH className="text-right">Acciones</TH>
            </tr>
          </THead>
          <TBody>
            {jobs.map((job) => (
              <TR key={job.id} interactive>
                <TD>
                  <p className="font-medium text-foreground">{job.title}</p>
                  <p className="mt-0.5 text-xs text-foreground-subtle font-mono">
                    {new Date(job.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </TD>
                <TD className="hidden md:table-cell text-foreground-muted">{job.department}</TD>
                <TD className="hidden lg:table-cell text-foreground-muted">{job.location}</TD>
                <TD>
                  <Link
                    href={`/admin/applications?jobId=${job.id}`}
                    className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Ver postulaciones de este puesto"
                  >
                    <Badge variant="solid" className="tabular hover:bg-muted-hover transition-colors duration-150">
                      {job._count.applications}
                    </Badge>
                  </Link>
                </TD>
                <TD>
                  {job.isActive ? (
                    <Badge dot="success">Activo</Badge>
                  ) : (
                    <Badge dot="neutral">Inactivo</Badge>
                  )}
                </TD>
                <TD className="text-right">
                  <JobActions job={job} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
