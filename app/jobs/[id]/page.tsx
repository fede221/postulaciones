import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Calendar, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Badge, toneFor } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { _count: { select: { applications: true } } },
  });

  if (!job || !job.isActive) notFound();

  const publishedAt = new Date(job.createdAt).toLocaleDateString("es-AR");

  const details = [
    { icon: MapPin, label: "Ubicación", value: job.location },
    { icon: Building2, label: "Área", value: job.department },
    { icon: Clock, label: "Modalidad", value: job.type },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-x flex-1 py-12 sm:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Migas de pan" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-subtle">
            <li>
              <Link href="/" className="transition-colors duration-150 hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" strokeWidth={1.5} />
            </li>
            <li>
              <Link href="/jobs" className="transition-colors duration-150 hover:text-foreground">
                Puestos
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" strokeWidth={1.5} />
            </li>
            <li className="truncate text-foreground" aria-current="page">
              {job.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Main content */}
          <article className="min-w-0 lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Badge tone={toneFor(job.department)}>{job.department}</Badge>
              <Badge variant="outline">{job.type}</Badge>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-border pb-6 text-xs text-foreground-subtle">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" strokeWidth={1.5} aria-hidden />
                Publicado el <span className="font-mono">{publishedAt}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" strokeWidth={1.5} aria-hidden />
                <span className="tabular">{job._count.applications}</span>{" "}
                {job._count.applications === 1 ? "postulación" : "postulaciones"}
              </span>
            </div>

            <div className="mt-8 space-y-8">
              <section>
                <h2 className="mb-3 text-sm font-medium text-foreground">Descripción del puesto</h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                  {job.description}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-medium text-foreground">Requisitos</h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                  {job.requirements}
                </div>
              </section>
            </div>

            {/* Mobile-only CTA so the action is reachable without scrolling to the aside */}
            <div className="mt-10 flex flex-col gap-2 lg:hidden">
              <ButtonLink href={`/jobs/${job.id}/apply`} size="lg" className="w-full">
                Postularme
              </ButtonLink>
              <ButtonLink href="/jobs" variant="ghost" className="w-full">
                Volver a puestos
              </ButtonLink>
            </div>
          </article>

          {/* Aside */}
          <aside className="lg:col-span-1">
            <Card className="p-5 lg:sticky lg:top-20">
              <h2 className="text-sm font-medium text-foreground">¿Te interesa este puesto?</h2>
              <p className="mt-1 text-[13px] text-foreground-muted">
                Completá el formulario y adjuntá tu CV. Te contactamos si tu perfil se ajusta.
              </p>

              <dl className="mt-5 divide-y divide-border border-y border-border">
                {details.map((d, i) => (
                  <div key={d.label} className="flex items-center gap-3 py-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${["bg-mint text-mint-fg", "bg-lemon text-lemon-fg", "bg-sky text-sky-fg", "bg-pink text-pink-fg"][i % 4]}`}>
                      <d.icon className="size-4" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-foreground-subtle">{d.label}</dt>
                      <dd className="truncate text-sm text-foreground">{d.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-col gap-2">
                <ButtonLink href={`/jobs/${job.id}/apply`} className="w-full">
                  Postularme
                </ButtonLink>
                <ButtonLink href="/jobs" variant="ghost" className="w-full">
                  Volver a puestos
                </ButtonLink>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
