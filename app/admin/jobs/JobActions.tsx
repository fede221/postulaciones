"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !job.isActive }),
    });
    router.refresh();
    setLoading(false);
  }

  async function deleteJob() {
    if (!confirm(`¿Eliminar el puesto "${job.title}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/jobs/${job.id}/edit`}
        className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
      >
        Editar
      </Link>
      <button
        onClick={toggleActive}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        {job.isActive ? "Desactivar" : "Activar"}
      </button>
      <button
        onClick={deleteJob}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
