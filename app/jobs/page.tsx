import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin, SearchX, Users } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, toneFor } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import CvDropSection from "./CvDropSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Puestos disponibles | DB Consulting",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; location?: string }>;
}) {
  const params = await searchParams;
  const { department, location } = params;

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(department ? { department } : {}),
      ...(location ? { location } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const departments = await prisma.job.findMany({
    where: { isActive: true },
    distinct: ["department"],
    select: { department: true },
  });

  const locations = await prisma.job.findMany({
    where: { isActive: true },
    distinct: ["location"],
    select: { location: true },
  });

  const hasFilters = Boolean(department || location);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-x flex-1 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[36px] leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[52px]">
            Puestos <span className="font-display-wonk italic text-mint-fg">disponibles</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            <span className="tabular">{jobs.length}</span>{" "}
            {jobs.length === 1 ? "vacante abierta" : "vacantes abiertas"}
            {hasFilters && " con los filtros aplicados"}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters */}
          <aside className="w-full shrink-0 lg:w-64">
            <Card className="p-5 lg:sticky lg:top-20">
              <h2 className="text-sm font-medium text-foreground">Filtros</h2>

              <form method="GET" className="mt-4 space-y-4">
                <Field label="Área" htmlFor="department">
                  <Select id="department" name="department" defaultValue={department || ""}>
                    <option value="">Todas las áreas</option>
                    {departments.map((d) => (
                      <option key={d.department} value={d.department}>
                        {d.department}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Ubicación" htmlFor="location">
                  <Select id="location" name="location" defaultValue={location || ""}>
                    <option value="">Todas las ubicaciones</option>
                    {locations.map((l) => (
                      <option key={l.location} value={l.location}>
                        {l.location}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="flex flex-col gap-2 pt-1">
                  <Button type="submit" variant="secondary" className="w-full">
                    Aplicar filtros
                  </Button>
                  {hasFilters && (
                    <ButtonLink href="/jobs" variant="ghost" size="sm" className="w-full">
                      Limpiar
                    </ButtonLink>
                  )}
                </div>
              </form>
            </Card>
          </aside>

          {/* Job list */}
          <div className="min-w-0 flex-1">
            {jobs.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No hay vacantes disponibles"
                description="Probá cambiar los filtros o volvé más tarde. También podés dejarnos tu CV."
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {hasFilters && (
                      <ButtonLink href="/jobs" variant="secondary">
                        Limpiar filtros
                      </ButtonLink>
                    )}
                    <ButtonLink href="/cv-drop">Dejar mi CV</ButtonLink>
                  </div>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {jobs.map((job, i) => (
                  <Reveal key={job.id} delay={Math.min(i, 6) * 0.06} y={20}>
                  <Card
                    className="lift h-full p-5"
                    style={{ "--glow": `var(--${toneFor(job.department)}-fg)` } as React.CSSProperties}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={toneFor(job.department)}>{job.department}</Badge>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <h2 className="mt-3 text-[22px] leading-tight text-foreground">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="transition-colors duration-150 hover:text-foreground-muted"
                          >
                            {job.title}
                          </Link>
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground-subtle">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-3.5" strokeWidth={1.5} aria-hidden />
                            <span className="font-mono">
                              {new Date(job.createdAt).toLocaleDateString("es-AR")}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5" strokeWidth={1.5} aria-hidden />
                            <span className="tabular">{job._count.applications}</span>{" "}
                            {job._count.applications === 1 ? "postulación" : "postulaciones"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Link href={`/jobs/${job.id}`} className="arrow-btn group" aria-label={`Ver ${job.title}`}>
                          <ArrowUpRight
                            className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:rotate-45"
                            strokeWidth={1.75}
                          />
                        </Link>
                      </div>
                    </div>
                  </Card>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CvDropSection />
      <Footer />
    </div>
  );
}
