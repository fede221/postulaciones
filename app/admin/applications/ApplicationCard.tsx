"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En revisión" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
];

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
}

interface App {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  coverLetter: string | null;
  cvPath: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  job: { title: string; department: string };
  statusHistory: StatusHistory[];
}

export default function ApplicationCard({ app }: { app: App }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState(app.notes || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<StatusHistory[]>(app.statusHistory);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    const prevStatus = status;
    setStatus(newStatus);

    const res = await fetch(`/api/admin/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note: note.trim() || undefined }),
    });

    if (res.ok) {
      const data = await res.json();
      setHistory(data.statusHistory ?? history);
      setNote("");
      router.refresh();
    } else {
      setStatus(prevStatus);
    }
    setLoading(false);
  }

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/admin/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: internalNote }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={status} />
            <span className="text-xs text-slate-400">
              {new Date(app.createdAt).toLocaleDateString("es-AR")} ·{" "}
              {new Date(app.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-lg">
            {app.firstName} {app.lastName}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
            <span>✉️ {app.email}</span>
            {app.phone && <span>📱 {app.phone}</span>}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">
              {app.job.title}
            </span>
            <span className="text-xs text-slate-400">{app.job.department}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {app.cvPath && (
            <a
              href={app.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              📄 Ver CV
            </a>
          )}
          <Link
            href={`/admin/applicants/${encodeURIComponent(app.email)}`}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Historial
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            {expanded ? "Cerrar ▲" : "Gestionar ▼"}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50">
          {/* Cover letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Carta de presentación</p>
              <div className="bg-white rounded-xl p-4 text-sm text-slate-600 whitespace-pre-line leading-relaxed border border-slate-100">
                {app.coverLetter}
              </div>
            </div>
          )}

          {/* Change status + note */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Cambiar estado</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={loading || opt.value === status}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                    opt.value === status
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Nota opcional para este cambio de estado (visible en el historial)..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
            />
          </div>

          {/* Internal notes */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notas internas</p>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
              placeholder="Notas privadas sobre este candidato (no visibles al postulante)..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
            />
            <button
              onClick={saveNote}
              disabled={saving}
              className="mt-2 px-4 py-1.5 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar nota"}
            </button>
          </div>

          {/* Status history timeline */}
          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Historial de estados</p>
              <ol className="relative border-l-2 border-slate-200 space-y-4 pl-6">
                {history.map((h, i) => (
                  <li key={h.id} className="relative">
                    <div
                      className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white ${
                        i === history.length - 1 ? "bg-blue-500" : "bg-slate-300"
                      }`}
                    />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        {h.fromStatus && (
                          <>
                            <StatusBadge status={h.fromStatus} />
                            <span className="text-slate-400 text-xs">→</span>
                          </>
                        )}
                        <StatusBadge status={h.toStatus} />
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(h.createdAt).toLocaleDateString("es-AR")} ·{" "}
                        {new Date(h.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {h.note && (
                      <p className="text-sm text-slate-600 mt-1 bg-white rounded-lg px-3 py-2 border border-slate-100">
                        {h.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
