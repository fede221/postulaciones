import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileUp,
  Lightbulb,
  MapPin,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { COMPANY_DEPARTMENTS } from "@/lib/openrouter";
import { ButtonLink } from "@/components/ui/button";
import { toneFor } from "@/components/ui/badge";
import { HeroShader } from "@/components/fx/HeroShader";
import { Reveal, SplitWords } from "@/components/fx/Reveal";
import { Marquee } from "@/components/fx/Marquee";

export const dynamic = "force-dynamic";

const TONE_CLASS = {
  mint: "bg-mint text-mint-fg",
  pink: "bg-pink text-pink-fg",
  lemon: "bg-lemon text-lemon-fg",
  sky: "bg-sky text-sky-fg",
  peach: "bg-peach text-peach-fg",
  lavender: "bg-lavender text-lavender-fg",
} as const;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(d);
}

export default async function Home() {
  const jobs = await prisma.job.findMany({ where: { isActive: true }, take: 3, orderBy: { createdAt: "desc" } });

  const areas = COMPANY_DEPARTMENTS.filter((d) => d !== "Otro");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-[68px] overflow-hidden pt-[68px]">
        <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,black_60%,transparent_100%)]">
          <HeroShader className="h-full w-full" />
        </div>

        <div className="container-x relative flex min-h-[min(86vh,900px)] flex-col justify-center pb-[clamp(3rem,9vh,7rem)] pt-[clamp(2rem,7vh,6rem)]">
          <Reveal y={12} duration={0.6}>
            <p className="mb-[clamp(1.25rem,3.5vh,2rem)] inline-flex items-center gap-2.5 rounded-full border border-foreground/10 bg-background/60 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint-fg/60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-mint-fg" />
              </span>
              Estamos contratando
            </p>
          </Reveal>

          {/* Fluid size bounded by BOTH axes: width so words never outgrow the line, height so the
              buttons stay above the fold on short laptop screens. */}
          <h1 className="max-w-[15ch] text-[clamp(2.75rem,min(8.4vw,13.5vh),8.5rem)] leading-[1.02] tracking-[-0.035em] text-foreground">
            <SplitWords text="Tu próximo capítulo empieza acá." accent="capítulo" />
          </h1>

          <div className="mt-[clamp(1.5rem,5vh,3.5rem)]">
              <Reveal delay={0.45} y={16}>
                <p className="max-w-xl text-[17px] leading-relaxed text-foreground-muted sm:text-xl">
                  En DB Consulting buscamos personas que quieran crecer con nosotros. Mirá los puestos
                  abiertos o dejanos tu CV para futuras búsquedas.
                </p>
              </Reveal>
              <Reveal delay={0.6} y={16}>
                <div className="mt-[clamp(1.5rem,4vh,2.25rem)] flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonLink href="/jobs" size="xl">
                    Ver puestos disponibles
                    <ArrowRight strokeWidth={1.75} aria-hidden />
                  </ButtonLink>
                  <ButtonLink href="/cv-drop" variant="secondary" size="xl">
                    <FileUp strokeWidth={1.75} aria-hidden />
                    Dejar mi CV
                  </ButtonLink>
                </div>
              </Reveal>
          </div>
        </div>
      </section>

      {/* ── Marquee de áreas ─────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <Reveal y={10}>
          <Marquee items={areas} speed={70} />
        </Reveal>
      </section>

      {/* ── Bento: por qué DB ────────────────────────────────────────────── */}
      <section className="container-x pb-20 pt-6 sm:pb-28 sm:pt-10">
        <Reveal>
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-subtle">Por qué DB Consulting</p>
            <h2 className="text-[34px] leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[48px]">
              Un lugar para <span className="font-display-wonk italic text-sky-fg">desarrollarte</span>, no solo para trabajar.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6 xl:mt-14">
          <Reveal className="md:col-span-4" delay={0.05}>
            <div className="lift flex h-full flex-col justify-between rounded-2xl bg-mint p-7 text-mint-fg shadow-soft sm:p-9">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-full bg-background/70">
                  <TrendingUp className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex h-14 items-end gap-1.5" aria-hidden>
                  {[30, 45, 40, 60, 55, 75, 100].map((h, i) => (
                    <span key={i} className={`w-3 rounded-full ${i === 6 ? "bg-current" : "bg-current/25"}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <h3 className="font-display text-[30px] leading-tight sm:text-[36px]">Crecimiento profesional</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-80 sm:text-[15px]">
                  Planes de carrera y capacitaciones continuas para que sigas creciendo, sea cual sea el área en la que entrás.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.12}>
            <div className="lift flex h-full flex-col justify-between rounded-2xl bg-lemon p-7 text-lemon-fg shadow-soft">
              <span className="flex size-11 items-center justify-center rounded-full bg-background/70">
                <Users className="size-5" strokeWidth={1.75} />
              </span>
              <div className="mt-10">
                <h3 className="font-display text-[26px] leading-tight">Equipo colaborativo</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-80">Colaboración y respeto en el centro de todo.</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.18}>
            <div className="lift flex h-full flex-col justify-between rounded-2xl bg-sky p-7 text-sky-fg shadow-soft">
              <span className="flex size-11 items-center justify-center rounded-full bg-background/70">
                <Scale className="size-5" strokeWidth={1.75} />
              </span>
              <div className="mt-10">
                <h3 className="font-display text-[26px] leading-tight">Equilibrio vida-trabajo</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-80">Flexibilidad y modalidades híbridas para cuidar tu bienestar.</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-4" delay={0.24}>
            <div className="lift flex h-full flex-col justify-between rounded-2xl bg-inverse p-7 text-inverse-foreground shadow-lift sm:flex-row sm:items-end sm:gap-8 sm:p-9">
              <div>
                <span className="flex size-11 items-center justify-center rounded-full bg-inverse-foreground/10">
                  <Lightbulb className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-10 font-display text-[30px] leading-tight sm:text-[36px]">Innovación constante</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70 sm:text-[15px]">
                  Trabajamos con tecnología de punta y desafiamos el status quo cada día.
                </p>
              </div>
              <ButtonLink href="/jobs" variant="inverted" className="mt-6 shrink-0 sm:mt-0">
                Sumate
                <ArrowUpRight strokeWidth={1.75} aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Últimas oportunidades ────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <section className="container-x pb-20 sm:pb-28">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-subtle">Recién publicados</p>
                <h2 className="text-[34px] leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[48px]">
                  Últimas <span className="font-display-wonk italic text-pink-fg">oportunidades</span>
                </h2>
              </div>
              <Link
                href="/jobs"
                className="hidden items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground sm:inline-flex"
              >
                Ver todos
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {jobs.map((job, i) => {
              const tone = toneFor(job.department);
              return (
                <Reveal key={job.id} delay={0.08 * i}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-soft"
                    style={{ "--glow": `var(--${tone}-fg)` } as React.CSSProperties}
                  >
                    <div className={`flex items-center justify-between px-5 py-4 ${TONE_CLASS[tone]}`}>
                      <span className="inline-flex h-6 items-center rounded-full bg-background/60 px-2.5 text-xs font-medium">
                        {job.department}
                      </span>
                      <span className="font-mono text-[11px] opacity-70">{formatDate(job.createdAt)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-[24px] leading-tight text-foreground">{job.title}</h3>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
                        <div className="flex flex-col gap-1.5 text-xs text-foreground-subtle">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
                            {job.type}
                          </span>
                        </div>
                        <span className="arrow-btn">
                          <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:rotate-45" strokeWidth={1.75} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden">
            <ButtonLink href="/jobs" variant="secondary" className="w-full">
              Ver todos los puestos
            </ButtonLink>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="container-x pb-16 sm:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-inverse px-6 py-14 text-inverse-foreground shadow-lift sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-mint/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-sky/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-[34px] leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
                ¿Listo para dar el <span className="font-display-wonk italic">próximo paso</span>?
              </h2>
              <p className="mt-4 max-w-lg text-sm opacity-75 sm:text-base">
                Explorá nuestras vacantes y postulate hoy. Si no encontrás el puesto ideal, dejanos tu CV
                y te contactamos cuando surja una oportunidad.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/jobs" variant="inverted" size="lg">
                  Ver puestos disponibles
                </ButtonLink>
                <ButtonLink href="/cv-drop" variant="outline-inverted" size="lg">
                  Dejar mi CV
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
