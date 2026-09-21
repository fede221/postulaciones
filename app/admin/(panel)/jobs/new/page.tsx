import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import JobForm from "../JobForm";

export default function NewJobPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nuevo puesto"
        description="Completá los datos del puesto. Podés dejarlo inactivo hasta que esté listo para publicar."
        actions={
          <ButtonLink href="/admin/jobs" variant="ghost" size="sm">
            <ArrowLeft strokeWidth={1.75} aria-hidden />
            Volver a puestos
          </ButtonLink>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-5">
          <JobForm />
        </CardContent>
      </Card>
    </div>
  );
}
