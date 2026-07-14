"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ParsedAiProfile {
  skills?: string[];
  previousRoles?: string[];
  previousCompanies?: string[];
  languages?: string[];
  highlights?: string[];
  suggestedDepartment?: string | null;
  departmentConfidence?: "alta" | "media" | "baja" | null;
}

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
  aiSummary: string | null;
  aiProfile: string | null;
  aiDepartment: string | null;
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
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState(drop.aiSummary || "");
  const [aiProfile, setAiProfile] = useState<ParsedAiProfile | null>(
    drop.aiProfile ? (JSON.parse(drop.aiProfile) as ParsedAiProfile) : null
  );
  const [aiDepartment, setAiDepartment] = useState(drop.aiDepartment || "");

  async function analyzeWithAI() {
    setAnalyzing(true);
    const res = await fetch(`/api/admin/cv-drops/${drop.id}/analyze`, { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { summary: string; profile: ParsedAiProfile };
      setAiSummary(data.summary);
      setAiProfile(data.profile);
      setAiDepartment(data.profile.suggestedDepartment ?? "");
      setExpanded(true);
      router.refresh();
    } else {
      const err = await res.json() as { error?: string };
      alert(err.error ?? "Error al analizar");
    }
    setAnalyzing(false);
  }

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
          {aiDepartment && (
            <div className="mt-1 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                🏢 {aiDepartment}
                <span className="text-indigo-400 font-normal">· IA</span>
              </span>
            </div>
          )}
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
          {(drop.cvText || drop.coverLetter) && (
            <button
              onClick={analyzeWithAI}
              disabled={analyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
                aiSummary
                  ? "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              {analyzing ? "Analizando..." : aiSummary ? "✨ Re-analizar" : "✨ Analizar con IA"}
            </button>
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

          {/* AI analysis */}
          {aiSummary && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2">✨ Análisis IA</p>
              <p className="text-sm text-violet-900 leading-relaxed font-medium mb-3">{aiSummary}</p>
              {aiProfile && (
                <div className="space-y-2">
                  {aiProfile.suggestedDepartment && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-violet-500">Área sugerida:</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        aiProfile.departmentConfidence === "alta"
                          ? "bg-emerald-100 text-emerald-700"
                          : aiProfile.departmentConfidence === "media"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        🏢 {aiProfile.suggestedDepartment}
                        {aiProfile.departmentConfidence && (
                          <span className="font-normal opacity-70">· {aiProfile.departmentConfidence}</span>
                        )}
                      </span>
                    </div>
                  )}
                  {aiProfile.highlights && aiProfile.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiProfile.highlights.map((h) => (
                        <span key={h} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          ⭐ {h}
                        </span>
                      ))}
                    </div>
                  )}
                  {aiProfile.previousRoles && aiProfile.previousRoles.length > 0 && (
                    <p className="text-xs text-violet-600">
                      <span className="font-semibold">Roles anteriores:</span>{" "}
                      {aiProfile.previousRoles.join(" · ")}
                    </p>
                  )}
                  {aiProfile.previousCompanies && aiProfile.previousCompanies.length > 0 && (
                    <p className="text-xs text-violet-600">
                      <span className="font-semibold">Empresas:</span>{" "}
                      {aiProfile.previousCompanies.join(" · ")}
                    </p>
                  )}
                  {aiProfile.languages && aiProfile.languages.length > 0 && (
                    <p className="text-xs text-violet-600">
                      <span className="font-semibold">Idiomas:</span>{" "}
                      {aiProfile.languages.join(", ")}
                    </p>
                  )}
                  {aiProfile.skills && aiProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiProfile.skills.map((s) => (
                        <span key={s} className="text-xs bg-white text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
