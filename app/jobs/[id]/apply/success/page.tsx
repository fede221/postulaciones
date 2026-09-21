import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Postulación enviada | DB Consulting",
};

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-x flex flex-1 items-center justify-center py-16 sm:py-24">
        <Card className="flex w-full max-w-lg flex-col items-center p-8 text-center sm:p-10">
          <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-border bg-background-secondary text-success">
            <CheckCircle2 className="size-6" strokeWidth={1.5} aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Postulación enviada</h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            Gracias por tu interés en formar parte de nuestro equipo. Vamos a revisar tu postulación y
            nos ponemos en contacto con vos si tu perfil se ajusta al puesto.
          </p>
          <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <ButtonLink href="/jobs" className="w-full sm:w-auto">
              Ver más puestos
            </ButtonLink>
            <ButtonLink href="/" variant="ghost" className="w-full sm:w-auto">
              Volver al inicio
            </ButtonLink>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
