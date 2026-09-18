import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/ui/page-header";
import CvDropForm from "./CvDropForm";

export const metadata = {
  title: "Dejá tu CV | DB Consulting",
};

export default function CvDropPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-x flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <header className="mb-8 border-b border-border pb-8">
            <Eyebrow className="mb-3">Postulación espontánea</Eyebrow>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Dejá tu CV
            </h1>
            <p className="mt-2 text-sm text-foreground-muted sm:text-base">
              Completá el formulario y te contactamos cuando surja una oportunidad que se adapte a tu
              perfil. No hace falta que te postules a un puesto específico.
            </p>
          </header>

          <CvDropForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
