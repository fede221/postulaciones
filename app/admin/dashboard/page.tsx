export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import StatusBadge from "@/app/admin/applications/StatusBadge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function KpiCard({
  label,
  value,
  colorClass,
  bgClass,
  icon,
}: {
  label: string;
  value: number | string;
  colorClass: string;
  bgClass: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
      <div
        className={`w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className={`text-3xl font-extrabold ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallel data fetching
  const [
    totalApplications,
    byStatusRaw,
    activeJobs,
    uniqueApplicantsRaw,
    jobsWithCounts,
    recentApplications,
    last30daysRaw,
  ] = await Promise.all([
    // Total postulaciones
    prisma.application.count(),

    // By status
    prisma.application.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Active jobs
    prisma.job.count({ where: { isActive: true } }),

    // Unique applicants by email
    prisma.application.findMany({
      distinct: ["email"],
      select: { email: true },
    }),

    // Jobs with their application counts (for dept breakdown + top jobs)
    prisma.job.findMany({
      include: { _count: { select: { applications: true } } },
    }),

    // 5 most recent applications
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        job: { select: { title: true, department: true } },
      },
    }),

    // Applications in the last 30 days (for trend data)
    prisma.application.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // ---------------------------------------------------------------------------
  // Process status counts
  // ---------------------------------------------------------------------------
  const statusCounts = { pending: 0, reviewing: 0, accepted: 0, rejected: 0 };
  byStatusRaw.forEach((item) => {
    const s = item.status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s] = item._count.id;
  });

  // ---------------------------------------------------------------------------
  // Unique applicants
  // ---------------------------------------------------------------------------
  const uniqueApplicants = uniqueApplicantsRaw.length;

  // ---------------------------------------------------------------------------
  // Department breakdown — group jobs by department, sum application counts
  // ---------------------------------------------------------------------------
  const deptMap: Record<string, number> = {};
  jobsWithCounts.forEach((job) => {
    deptMap[job.department] =
      (deptMap[job.department] || 0) + job._count.applications;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxDeptCount = deptData.length > 0 ? deptData[0].count : 1;

  // ---------------------------------------------------------------------------
  // Top jobs by application count
  // ---------------------------------------------------------------------------
  const topJobs = [...jobsWithCounts]
    .sort((a, b) => b._count.applications - a._count.applications)
    .slice(0, 5);
  const maxTopJobCount =
    topJobs.length > 0 ? topJobs[0]._count.applications : 1;

  // ---------------------------------------------------------------------------
  // Acceptance rate
  // ---------------------------------------------------------------------------
  const acceptanceRate =
    totalApplications > 0
      ? ((statusCounts.accepted / totalApplications) * 100).toFixed(1)
      : "0.0";

  // ---------------------------------------------------------------------------
  // Last-30-days trend grouped by calendar day (available for future use)
  // ---------------------------------------------------------------------------
  const dayTrend: Record<string, number> = {};
  last30daysRaw.forEach((app) => {
    const key = app.createdAt.toISOString().split("T")[0];
    dayTrend[key] = (dayTrend[key] || 0) + 1;
  });
  const trendEntries = Object.entries(dayTrend).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const maxTrend = trendEntries.reduce(
    (acc, [, v]) => Math.max(acc, v),
    1
  );

  // ---------------------------------------------------------------------------
  // Donut chart conic-gradient
  // ---------------------------------------------------------------------------
  const total = totalApplications || 1;
  const pendingDeg = (statusCounts.pending / total) * 360;
  const reviewingDeg = (statusCounts.reviewing / total) * 360;
  const acceptedDeg = (statusCounts.accepted / total) * 360;

  const p1 = pendingDeg;
  const p2 = p1 + reviewingDeg;
  const p3 = p2 + acceptedDeg;

  const conicGradient =
    totalApplications === 0
      ? "conic-gradient(#e2e8f0 0deg 360deg)"
      : `conic-gradient(#fbbf24 0deg ${p1}deg, #60a5fa ${p1}deg ${p2}deg, #34d399 ${p2}deg ${p3}deg, #f87171 ${p3}deg 360deg)`;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Resumen general del portal de postulaciones
          </p>
        </div>

        {/* ── KPI Row 1 — 4 cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Total postulaciones"
            value={totalApplications}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            icon="📋"
          />
          <KpiCard
            label="Pendientes"
            value={statusCounts.pending}
            colorClass="text-yellow-600"
            bgClass="bg-yellow-50"
            icon="⏳"
          />
          <KpiCard
            label="En revisión"
            value={statusCounts.reviewing}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            icon="🔍"
          />
          <KpiCard
            label="Aceptados"
            value={statusCounts.accepted}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
            icon="✅"
          />
        </div>

        {/* ── KPI Row 2 — 3 cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <KpiCard
            label="Puestos activos"
            value={activeJobs}
            colorClass="text-violet-600"
            bgClass="bg-violet-50"
            icon="💼"
          />
          <KpiCard
            label="Postulantes únicos"
            value={uniqueApplicants}
            colorClass="text-indigo-600"
            bgClass="bg-indigo-50"
            icon="👤"
          />
          {/* Acceptance rate — manual card to show the % sign */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              📈
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Tasa de aceptación
              </p>
              <p className="text-3xl font-extrabold text-teal-600">
                {acceptanceRate}%
              </p>
            </div>
          </div>
        </div>

        {/* ── Charts row ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Postulaciones por área — horizontal bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">
              Postulaciones por área
            </h2>
            {deptData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">📊</span>
                <p className="text-sm">Sin datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deptData.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 truncate max-w-[72%] font-medium">
                        {dept.name}
                      </span>
                      <span className="font-bold text-slate-800">
                        {dept.count}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(dept.count / maxDeptCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado de postulaciones — conic-gradient donut */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">
              Estado de postulaciones
            </h2>
            <div className="flex items-center gap-8">
              {/* Donut */}
              <div
                className="relative w-36 h-36 rounded-full flex-shrink-0"
                style={{ background: conicGradient }}
              >
                <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <p className="text-center leading-tight">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {totalApplications}
                    </span>
                    <br />
                    <span className="text-xs text-slate-400">total</span>
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2.5 flex-1">
                {[
                  {
                    label: "Pendiente",
                    count: statusCounts.pending,
                    color: "bg-yellow-400",
                  },
                  {
                    label: "En revisión",
                    count: statusCounts.reviewing,
                    color: "bg-blue-400",
                  },
                  {
                    label: "Aceptado",
                    count: statusCounts.accepted,
                    color: "bg-emerald-400",
                  },
                  {
                    label: "Rechazado",
                    count: statusCounts.rejected,
                    color: "bg-red-400",
                  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`}
                    />
                    <span className="text-slate-600">{s.label}</span>
                    <span className="ml-auto font-bold text-slate-800">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Trend sparkline (last 30 days) ─────────────────────────────── */}
        {trendEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Actividad — últimos 30 días
              </h2>
              <span className="text-sm text-slate-400">
                {last30daysRaw.length} postulaciones
              </span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {trendEntries.map(([day, count]) => (
                <div
                  key={day}
                  title={`${day}: ${count}`}
                  className="flex-1 bg-blue-400 rounded-sm opacity-80 hover:opacity-100 transition-opacity min-w-0"
                  style={{ height: `${(count / maxTrend) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>
                {trendEntries[0]?.[0]
                  ? new Date(trendEntries[0][0] + "T12:00:00").toLocaleDateString(
                      "es-CL",
                      { day: "2-digit", month: "short" }
                    )
                  : ""}
              </span>
              <span>Hoy</span>
            </div>
          </div>
        )}

        {/* ── Bottom row ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Puestos más solicitados */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Puestos más solicitados
              </h2>
              <Link
                href="/admin/jobs"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Ver puestos →
              </Link>
            </div>
            {topJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">💼</span>
                <p className="text-sm">Sin datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topJobs.map((job, idx) => (
                  <div key={job.id} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-700 font-medium truncate max-w-[70%]">
                          {job.title}
                        </span>
                        <span className="font-bold text-slate-800">
                          {job._count.applications}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (job._count.applications / maxTopJobCount) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {job.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimas postulaciones */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Últimas postulaciones
              </h2>
              <Link
                href="/admin/applications"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-sm">Sin postulaciones aún</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href="/admin/applications"
                    className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-2 -mx-2 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {app.firstName[0].toUpperCase()}
                      {app.lastName[0].toUpperCase()}
                    </div>

                    {/* Name + job */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {app.job.title}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {app.job.department}
                      </p>
                    </div>

                    {/* Status + date */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-slate-400">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
