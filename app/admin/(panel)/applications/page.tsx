import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import ApplicationCard from "./ApplicationCard";
import JobFilter from "./JobFilter";
import { STATUS_OPTIONS } from "./StatusBadge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) if (v) params.set(k, v);
  const qs = params.toString();
  return `/admin/applications${qs ? `?${qs}` : ""}`;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; status?: string; page?: string; open?: string }>;
}) {
  const { jobId, status, page: pageRaw, open } = await searchParams;
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  const where = {
    ...(jobId ? { jobId } : {}),
    ...(status ? { status } : {}),
  };

  const [applications, total, byStatus, jobs] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        job: { select: { title: true, department: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where }),
    prisma.application.groupBy({
      by: ["status"],
      where: jobId ? { jobId } : {},
      _count: { id: true },
    }),
    prisma.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const counts: Record<string, number> = {};
  let all = 0;
  for (const row of byStatus) {
    counts[row.status] = row._count.id;
    all += row._count.id;
  }

  const base = { jobId, status };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const segments = [
    { label: "Todas", href: buildHref(base, { status: undefined, page: undefined }), active: !status, count: all },
    ...STATUS_OPTIONS.map((s) => ({
      label: s.label,
      href: buildHref(base, { status: s.value, page: undefined }),
      active: status === s.value,
      count: counts[s.value] ?? 0,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postulaciones"
        description={`${total} ${total === 1 ? "postulación" : "postulaciones"}${jobId || status ? " con los filtros aplicados" : ""}.`}
        actions={<ButtonLink href="/admin/applicants" variant="secondary" size="sm">Ver por postulante</ButtonLink>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
          <Segmented items={segments} />
        </div>
        <JobFilter jobs={jobs} value={jobId ?? ""} status={status} />
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No hay postulaciones"
          description={
            jobId || status
              ? "No hay resultados para los filtros seleccionados."
              : "Cuando alguien se postule a un puesto, va a aparecer acá."
          }
          action={jobId || status ? <ButtonLink href="/admin/applications" variant="secondary" size="sm">Limpiar filtros</ButtonLink> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} defaultOpen={open === app.id} />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-foreground-muted">
          <span className="tabular">
            {from}–{to} de {total}
          </span>
          <div className="flex items-center gap-1">
            <PageLink href={buildHref(base, { page: String(page - 1) })} disabled={page <= 1} label="Anterior">
              <ChevronLeft className="size-4" />
            </PageLink>
            <span className="px-2 tabular text-foreground">
              {page} / {totalPages}
            </span>
            <PageLink href={buildHref(base, { page: String(page + 1) })} disabled={page >= totalPages} label="Siguiente">
              <ChevronRight className="size-4" />
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  const cls =
    "flex size-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors " +
    (disabled ? "opacity-40 pointer-events-none" : "hover:bg-muted text-foreground");
  if (disabled) return <span className={cls} aria-disabled>{children}</span>;
  return (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  );
}
