import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { Badge, toneFor } from "@/components/ui/badge";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id, isActive: true } });
  if (!job) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-x flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-2xl">
          {/* Breadcrumb */}
          <nav aria-label="Migas de pan" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-subtle">
              <li>
                <Link href="/jobs" className="transition-colors duration-150 hover:text-foreground">
                  Puestos
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" strokeWidth={1.5} />
              </li>
              <li>
                <Link
                  href={`/jobs/${job.id}`}
                  className="truncate transition-colors duration-150 hover:text-foreground"
                >
                  {job.title}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" strokeWidth={1.5} />
              </li>
              <li className="text-foreground" aria-current="page">
                Postulación
              </li>
            </ol>
          </nav>

          <header className="mb-8 border-b border-border pb-8">
            <Badge tone={toneFor(job.department)}>{job.department}</Badge>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Postulación: {job.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground-subtle">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
                {job.type}
              </span>
            </div>
          </header>

          <ApplyForm jobId={job.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
