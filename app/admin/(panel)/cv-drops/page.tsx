export const dynamic = "force-dynamic";

import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import CvDropCard from "./CvDropCard";

export default async function CvDropsPage() {
  const drops = await prisma.cvDrop.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, city: true, linkedinUrl: true,
      yearsExperience: true, educationLevel: true, workMode: true,
      availability: true, salaryExpectation: true,
      skills: true, coverLetter: true, cvPath: true, cvText: true,
      aiSummary: true, aiProfile: true, aiDepartment: true, reviewed: true, createdAt: true,
    },
  });

  const unreviewed = drops.filter((d) => !d.reviewed).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="CVs espontáneos"
        description="Personas que dejaron su CV sin postularse a un puesto específico."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-muted tabular">
              {drops.length} recibido{drops.length !== 1 ? "s" : ""}
            </span>
            {unreviewed > 0 && (
              <Badge variant="inverse">
                {unreviewed} nuevo{unreviewed !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        }
      />

      {drops.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin CVs espontáneos todavía"
          description="Van a aparecer acá cuando alguien deje su CV desde la página pública."
        />
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => (
            <CvDropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  );
}
