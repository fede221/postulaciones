import { FileUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/page-header";

export default function CvDropSection() {
  return (
    <section className="container-x pb-16 sm:pb-24">
      <div className="flex flex-col gap-8 rounded-2xl bg-mint px-6 py-12 text-mint-fg shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <div className="max-w-2xl">
          <Eyebrow className="mb-3 text-mint-fg/70">Postulación espontánea</Eyebrow>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">¿No encontrás el puesto ideal?</h2>
          <p className="mt-3 text-sm opacity-80 sm:text-base">
            Dejá tu CV y te contactamos cuando surja una oportunidad que se adapte a tu perfil. No
            necesitás postularte a un puesto específico.
          </p>
        </div>
        <ButtonLink href="/cv-drop" size="lg" className="w-full shrink-0 sm:w-auto">
          <FileUp strokeWidth={1.75} aria-hidden />
          Dejar mi CV
        </ButtonLink>
      </div>
    </section>
  );
}
