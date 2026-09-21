export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Inbox,
  Percent,
  Search,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { MiniBars, Stat } from "@/components/ui/stat";
import { Reveal } from "@/components/fx/Reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import StatusBadge, { STATUS_BAR_CLASS, STATUS_CONFIG } from "@/app/admin/(panel)/applications/StatusBadge";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(date);
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-mint-fg/70 transition-[width] duration-500 ease-[var(--ease-out-expo)]"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  );
}

/** Rounded column chart, one bar per day. Today is emphasized in charcoal. */
function ActivityBars({ points, labels }: { points: number[]; labels: string[] }) {
  const max = Math.max(1, ...points);
  return (
    <div className="flex h-28 items-end gap-1.5 sm:gap-2" role="img" aria-label="Postulaciones por día">
      {points.map((v, i) => {
        const today = i === points.length - 1;
        const label = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(labels[i] + "T12:00:00"));
        return (
          <div
            key={labels[i]}
            title={`${label}: ${v}`}
            className={`group relative flex-1 rounded-full transition-colors duration-200 ${
              today ? "bg-inverse" : "bg-sky-fg/30 hover:bg-sky-fg/60"
            }`}
            style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
          >
            {v > 0 && (
              <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-inverse px-1.5 py-0.5 text-[10px] font-semibold tabular text-inverse-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {v}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [totalApplications, byStatusRaw, activeJobs, uniqueApplicantsRaw, jobsWithCounts, recentApplications, last30daysRaw, cvDrops, unreviewedDrops] =
    await Promise.all([
      prisma.application.count(),
      prisma.application.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.job.count({ where: { isActive: true } }),
      prisma.application.findMany({ distinct: ["email"], select: { email: true } }),
      prisma.job.findMany({ include: { _count: { select: { applications: true } } } }),
      prisma.application.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, firstName: true, lastName: true, status: true, createdAt: true, job: { select: { title: true, department: true } } },
      }),
      prisma.application.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.cvDrop.count(),
      prisma.cvDrop.count({ where: { reviewed: false } }),
    ]);

  const statusCounts = { pending: 0, reviewing: 0, accepted: 0, rejected: 0 };
  byStatusRaw.forEach((item) => {
    const s = item.status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s] = item._count.id;
  });

  const deptMap: Record<string, number> = {};
  jobsWithCounts.forEach((job) => {
    deptMap[job.department] = (deptMap[job.department] || 0) + job._count.applications;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxDept = deptData[0]?.count ?? 0;

  const topJobs = [...jobsWithCounts].sort((a, b) => b._count.applications - a._count.applications).slice(0, 5);
  const maxTopJob = topJobs[0]?._count.applications ?? 0;

  const acceptanceRate = totalApplications > 0 ? ((statusCounts.accepted / totalApplications) * 100).toFixed(1) : "0.0";

  // Daily series for the last 30 days, zero-filled.
  const series: number[] = [];
  const labels: string[] = [];
  const byDay: Record<string, number> = {};
  last30daysRaw.forEach((a) => {
    const key = a.createdAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + 1;
  });
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push(byDay[key] ?? 0);
    labels.push(key);
  }

  const statusRows = (Object.keys(statusCounts) as (keyof typeof statusCounts)[]).map((k) => ({
    key: k,
    label: STATUS_CONFIG[k].label,
    barClass: STATUS_BAR_CLASS[k],
    count: statusCounts[k],
    pct: totalApplications > 0 ? (statusCounts[k] / totalApplications) * 100 : 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Un vistazo a la selección" description="Estado general de búsquedas, postulaciones y candidatos." />

      <Reveal y={16} amount={0.1}>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Postulaciones" value={totalApplications} icon={Inbox} href="/admin/applications" tone="sky" />
        <Stat label="Pendientes" value={statusCounts.pending} icon={Clock} href="/admin/applications?status=pending" hint="Sin revisar" tone="lemon" />
        <Stat label="En revisión" value={statusCounts.reviewing} icon={Search} href="/admin/applications?status=reviewing" tone="lavender" />
        <Stat label="Aceptados" value={statusCounts.accepted} icon={CheckCircle2} href="/admin/applications?status=accepted" hint={`${acceptanceRate}% del total`} tone="mint" />
        <Stat label="Puestos activos" value={activeJobs} icon={Briefcase} href="/admin/jobs" tone="peach" />
        <Stat label="Postulantes únicos" value={uniqueApplicantsRaw.length} icon={Users} href="/admin/applicants" tone="pink" />
        <Stat
          label="CVs espontáneos"
          value={cvDrops}
          icon={Inbox}
          href="/admin/cv-drops"
          hint={unreviewedDrops > 0 ? `${unreviewedDrops} sin revisar` : "Todo revisado"}
          tone="mint"
        />
        <Stat
          label="Últimos 7 días"
          value={series.slice(-7).reduce((a, b) => a + b, 0)}
          icon={Percent}
          hint={`${last30daysRaw.length} en 30 días`}
          tone="sky"
          chart={<MiniBars values={series.slice(-7)} />}
        />
      </section>
      </Reveal>

      <Reveal y={16} delay={0.08} amount={0.1}>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Actividad</CardTitle>
            <CardDescription>Postulaciones por día, últimos 30 días.</CardDescription>
          </div>
          <span className="text-sm font-medium tabular">{last30daysRaw.length}</span>
        </CardHeader>
        <CardContent>
          <ActivityBars points={series} labels={labels} />
          <div className="mt-3 flex justify-between text-[11px] text-foreground-subtle font-mono">
            <span>{formatDate(new Date(labels[0] + "T12:00:00"))}</span>
            <span>Hoy</span>
          </div>
        </CardContent>
      </Card>
      </Reveal>

      <Reveal y={16} delay={0.12} amount={0.1}>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Por área</CardTitle>
              <CardDescription>Postulaciones recibidas por departamento.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {deptData.length === 0 ? (
              <p className="text-sm text-foreground-subtle">Sin datos todavía.</p>
            ) : (
              <ul className="space-y-3.5">
                {deptData.map((d) => (
                  <li key={d.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="truncate text-foreground-muted">{d.name}</span>
                      <span className="tabular font-medium">{d.count}</span>
                    </div>
                    <Bar value={d.count} max={maxDept} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Por estado</CardTitle>
              <CardDescription>Distribución de las {totalApplications} postulaciones.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
              {statusRows.map((s) => (
                <div key={s.key} style={{ width: `${s.pct}%` }} className={s.barClass} title={`${s.label}: ${s.count}`} />
              ))}
            </div>
            <ul className="divide-y divide-border">
              {statusRows.map((s) => (
                <li key={s.key} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/admin/applications?status=${s.key}`} className="flex items-center gap-2 hover:text-foreground text-foreground-muted transition-colors">
                    <StatusBadge status={s.key} />
                  </Link>
                  <span className="flex items-baseline gap-2">
                    <span className="tabular font-medium">{s.count}</span>
                    <span className="tabular text-xs text-foreground-subtle w-11 text-right">{s.pct.toFixed(0)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
      </Reveal>

      <Reveal y={16} delay={0.16} amount={0.1}>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Puestos más solicitados</CardTitle>
            </div>
            <Link href="/admin/jobs" className="flex items-center gap-1 text-[13px] text-foreground-muted hover:text-foreground transition-colors">
              Ver puestos <ArrowUpRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {topJobs.length === 0 ? (
              <p className="text-sm text-foreground-subtle">Sin puestos todavía.</p>
            ) : (
              <ol className="space-y-3.5">
                {topJobs.map((job, i) => (
                  <li key={job.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-medium tabular text-foreground-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <Link href={`/admin/applications?jobId=${job.id}`} className="truncate font-medium hover:underline underline-offset-4">
                          {job.title}
                        </Link>
                        <span className="tabular font-medium">{job._count.applications}</span>
                      </div>
                      <Bar value={job._count.applications} max={maxTopJob} />
                      <p className="mt-1 text-xs text-foreground-subtle">{job.department}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Últimas postulaciones</CardTitle>
            </div>
            <Link href="/admin/applications" className="flex items-center gap-1 text-[13px] text-foreground-muted hover:text-foreground transition-colors">
              Ver todas <ArrowUpRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-2! pb-2!">
            {recentApplications.length === 0 ? (
              <EmptyState icon={Inbox} title="Sin postulaciones aún" className="border-0! py-10!" />
            ) : (
              <ul className="divide-y divide-border">
                {recentApplications.map((app) => (
                  <li key={app.id}>
                    <Link
                      href={`/admin/applications?open=${app.id}`}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                    >
                      <Avatar name={`${app.firstName} ${app.lastName}`} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {app.firstName} {app.lastName}
                        </p>
                        <p className="truncate text-xs text-foreground-subtle">
                          {app.job.title} · {app.job.department}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={app.status} />
                        <span className="text-[11px] font-mono text-foreground-subtle">{formatDate(app.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
      </Reveal>
    </div>
  );
}
