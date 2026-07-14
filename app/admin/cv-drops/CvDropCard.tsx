"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Drop {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string | null;
  cvPath: string | null;
  cvText: string | null;
  reviewed: boolean;
  createdAt: Date;
}

function formatDateTime(date: Date | string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}

export default function CvDropCard({ drop }: { drop: Drop }) {
  const router = useRouter();
  const [reviewed, setReviewed] = useState(drop.reviewed);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleReviewed() {
    setLoading(true);
    const next = !reviewed;
    setReviewed(next);
    await fetch(`/api/admin/cv-drops/${drop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      reviewed ? "border-slate-200" : "border-blue-300 shadow-sm"
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {!reviewed && (
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Nuevo</span>
            )}
            <span className="text-xs text-slate-400">{formatDateTime(drop.createdAt)}</span>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">
            {drop.firstName} {drop.lastName}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
            <span>✉️ {drop.email}</span>
            {drop.phone && <span>📱 {drop.phone}</span>}
          </div>
          {drop.message && (
            <p className="mt-2 text-sm text-slate-600 italic">"{drop.message}"</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {drop.cvPath && (
            <a
              href={drop.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              📄 Ver CV
            </a>
          )}
          <button
            onClick={toggleReviewed}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              reviewed
                ? "border border-slate-200 text-slate-500 hover:bg-slate-50"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {reviewed ? "Marcar como nuevo" : "Marcar revisado"}
          </button>
          {drop.cvText && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              {expanded ? "Cerrar ▲" : "Ver texto ▼"}
            </button>
          )}
        </div>
      </div>

      {expanded && drop.cvText && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Texto extraído del CV
            <span className="ml-2 font-normal normal-case text-slate-300">
              ({drop.cvText.length.toLocaleString()} caracteres)
            </span>
          </p>
          <div className="bg-white rounded-xl border border-slate-100 p-4 max-h-48 overflow-y-auto">
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
              {drop.cvText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
