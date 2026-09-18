import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import JobForm from "../../JobForm";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Editar puesto"
        description={job.title}
        actions={
          <ButtonLink href="/admin/jobs" variant="ghost" size="sm">
            <ArrowLeft strokeWidth={1.75} aria-hidden />
            Volver a puestos
          </ButtonLink>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-5">
          <JobForm job={job} />
        </CardContent>
      </Card>
    </div>
  );
}
