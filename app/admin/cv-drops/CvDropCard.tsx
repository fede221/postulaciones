"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Drop {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  linkedinUrl: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  workMode: string | null;
  availability: string | null;
  salaryExpectation: string | null;
  skills: string | null;
  coverLetter: string | null;
  cvPath: string | null;
  cvText: string | null;
  reviewed: boolean;
  createdAt: Date;
}

const EDUCATION_LABELS: Record<string, string> = {
  secundario: "Secundario",
  terciario: "Terciario / Técnico",
  universitario_cursando: "Universitario (cursando)",
  universitario: "Universitario",
  posgrado: "Posgrado / Maestría",
  doctorado: "Doctorado",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  inmediata: "Inmediata",
  "2_semanas": "2 semanas",
  "1_mes": "1 mes",
  "2_meses": "2 meses",
  a_convenir: "A convenir",
};

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

  const hasProfile = drop.yearsExperience != null || drop.educationLevel || drop.workMode ||
    drop.availability || drop.salaryExpectation || drop.skills;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      reviewed ? "border-slate-200" : "border-blue-300 shadow-sm"
    }`}>
      {/* Header */}
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
            {drop.city && <span>📍 {drop.city}</span>}
            {drop.linkedinUrl && (
              <a href={drop.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">
                LinkedIn ↗
              </a>
            )}
          </div>
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
          {(hasProfile || drop.cvText || drop.coverLetter) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              {expanded ? "Cerrar ▲" : "Ver detalle ▼"}
            </button>
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50">

          {/* Professional profile */}
          {hasProfile && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Perfil profesional</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {drop.yearsExperience != null && (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Experiencia</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {drop.yearsExperience === 0 ? "Sin experiencia" : `${drop.yearsExperience} año${drop.yearsExperience !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                )}
                {drop.educationLevel && (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Estudios</p>
                    <p className="text-sm font-semibold text-slate-700">{EDUCATION_LABELS[drop.educationLevel] ?? drop.educationLevel}</p>
                  </div>
                )}
                {drop.workMode && (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Modalidad</p>
                    <p className="text-sm font-semibold text-slate-700 capitalize">{drop.workMode}</p>
                  </div>
                )}
                {drop.availability && (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Disponibilidad</p>
                    <p className="text-sm font-semibold text-slate-700">{AVAILABILITY_LABELS[drop.availability] ?? drop.availability}</p>
                  </div>
                )}
                {drop.salaryExpectation && (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 sm:col-span-2">
                    <p className="text-xs text-slate-400 mb-0.5">Pretensión salarial</p>
                    <p className="text-sm font-semibold text-slate-700">{drop.salaryExpectation}</p>
                  </div>
                )}
              </div>
              {drop.skills && (
                <div className="mt-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1.5">Habilidades y tecnologías</p>
                  <div className="flex flex-wrap gap-1.5">
                    {drop.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                      <span key={skill} className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cover letter */}
          {drop.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Presentación</p>
              <div className="bg-white rounded-xl p-4 text-sm text-slate-600 whitespace-pre-line leading-relaxed border border-slate-100">
                {drop.coverLetter}
              </div>
            </div>
          )}

          {/* CV text */}
          {drop.cvText && (
            <div>
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
      )}
    </div>
  );
}
