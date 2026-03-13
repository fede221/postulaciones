"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

      router.push("/admin/jobs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1">Título del puesto *</label>
          <input name="title" required defaultValue={job?.title} className={inputClass} placeholder="Ej: Desarrollador Full Stack Senior" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Área / Departamento *</label>
          <input name="department" required defaultValue={job?.department} className={inputClass} placeholder="Ej: Tecnología" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Ubicación *</label>
          <input name="location" required defaultValue={job?.location} className={inputClass} placeholder="Ej: Buenos Aires / Remoto" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Tipo de contrato *</label>
          <select name="type" required defaultValue={job?.type || "Full-time"} className={inputClass}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Pasantía">Pasantía</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Estado</label>
          <select name="isActive" defaultValue={String(job?.isActive ?? true)} className={inputClass}>
            <option value="true">Activo (visible al público)</option>
            <option value="false">Inactivo (oculto)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1">Descripción del puesto *</label>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={job?.description}
            className={`${inputClass} resize-none`}
            placeholder="Describí las responsabilidades y el rol del candidato..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1">Requisitos *</label>
          <textarea
            name="requirements"
            required
            rows={6}
            defaultValue={job?.requirements}
            className={`${inputClass} resize-none`}
            placeholder="Listá los requisitos, habilidades y experiencia necesaria..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Guardando..." : job?.id ? "Guardar cambios" : "Crear puesto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
