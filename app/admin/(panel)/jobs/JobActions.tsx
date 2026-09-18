"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  isActive: boolean;
}

export default function JobActions({ job }: { job: Job }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(job.isActive ? "Puesto desactivado" : "Puesto activado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el puesto");
    } finally {
      setLoading(false);
    }
  }

  async function deleteJob() {
    if (!window.confirm(`¿Eliminar el puesto "${job.title}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Puesto eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el puesto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <ButtonLink href={`/admin/jobs/${job.id}/edit`} variant="secondary" size="sm">
        <Pencil strokeWidth={1.75} aria-hidden />
        Editar
      </ButtonLink>
      <Button type="button" variant="ghost" size="sm" onClick={toggleActive} disabled={loading}>
        {job.isActive ? "Desactivar" : "Activar"}
      </Button>
      <Button type="button" variant="danger" size="sm" onClick={deleteJob} disabled={loading}>
        <Trash2 strokeWidth={1.75} aria-hidden />
        Eliminar
      </Button>
    </div>
  );
}
