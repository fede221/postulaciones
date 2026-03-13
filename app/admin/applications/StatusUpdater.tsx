"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En revisión" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
];

export default function StatusUpdater({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await fetch(`/api/admin/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
