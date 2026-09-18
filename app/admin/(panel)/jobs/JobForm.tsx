"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/input";

const DEPARTMENTS = [
  "Gastronomía",
  "Operaciones - Cocido",
  "Operaciones - Crudo",
  "Planta de Desposte",
  "Calidad",
  "Seguridad e Higiene",
  "Mantenimiento",
  "Logística",
  "Taller Mecánico",
  "Sistemas",
  "Control de Gestión",
  "Pago a Proveedores",
  "Tesorería",
  "Contabilidad",
  "RRHH",
  "Comercial",
  "Administración",
  "Legal",
  "Otro",
];

interface JobData {
  id?: string;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  isActive?: boolean;
}

export default function JobForm({ job }: { job?: JobData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(job?.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      department: formData.get("department"),
      location: formData.get("location"),
      type: formData.get("type"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      isActive: formData.get("isActive") === "true",
    };

    try {
      const res = await fetch(job?.id ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs", {
        method: job?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }

      toast.success(isEdit ? "Cambios guardados" : "Puesto creado");
      router.push("/admin/jobs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título del puesto" htmlFor="job-title" className="sm:col-span-2">
          <Input
            id="job-title"
            name="title"
            required
            defaultValue={job?.title}
            placeholder="Ej: Desarrollador Full Stack Senior"
          />
        </Field>

        <Field label="Área / Departamento" htmlFor="job-department">
          <Select id="job-department" name="department" required defaultValue={job?.department ?? ""}>
            <option value="" disabled>
              Seleccioná un área
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Ubicación" htmlFor="job-location">
          <Input
            id="job-location"
            name="location"
            required
            defaultValue={job?.location}
            placeholder="Ej: Buenos Aires / Remoto"
          />
        </Field>

        <Field label="Tipo de contrato" htmlFor="job-type">
          <Select id="job-type" name="type" required defaultValue={job?.type || "Full-time"}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Pasantía">Pasantía</option>
            <option value="Freelance">Freelance</option>
          </Select>
        </Field>

        <Field label="Estado" htmlFor="job-isActive" help="Los puestos inactivos no se muestran en el sitio público.">
          <Select id="job-isActive" name="isActive" defaultValue={String(job?.isActive ?? true)}>
            <option value="true">Activo (visible al público)</option>
            <option value="false">Inactivo (oculto)</option>
          </Select>
        </Field>

        <Field label="Descripción del puesto" htmlFor="job-description" className="sm:col-span-2">
          <Textarea
            id="job-description"
            name="description"
            required
            rows={6}
            defaultValue={job?.description}
            placeholder="Describí las responsabilidades y el rol del candidato."
          />
        </Field>

        <Field label="Requisitos" htmlFor="job-requirements" className="sm:col-span-2">
          <Textarea
            id="job-requirements"
            name="requirements"
            required
            rows={6}
            defaultValue={job?.requirements}
            placeholder="Listá los requisitos, habilidades y experiencia necesaria."
          />
        </Field>
      </div>

      <FormError>{error}</FormError>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? "Guardar cambios" : "Publicar puesto"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/jobs")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
