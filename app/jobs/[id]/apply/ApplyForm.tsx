"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";
const selectClass =
  "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
      {children}
    </h2>
  );
}

export default function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar la postulación");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/jobs/${jobId}/apply/success`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Postulación enviada!</h2>
        <p className="text-slate-500">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="jobId" value={jobId} />

      {/* 1. Datos personales */}
      <div>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre *</label>
            <input name="firstName" required className={inputClass} placeholder="Juan" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Apellido *</label>
            <input name="lastName" required className={inputClass} placeholder="Pérez" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email *</label>
            <input name="email" type="email" required className={inputClass} placeholder="juan@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Teléfono</label>
            <input name="phone" type="tel" className={inputClass} placeholder="+54 11 1234-5678" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Ciudad / Localidad</label>
            <input name="city" className={inputClass} placeholder="Buenos Aires" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">LinkedIn</label>
            <input
              name="linkedinUrl"
              type="url"
              className={inputClass}
              placeholder="https://linkedin.com/in/tu-perfil"
            />
          </div>
        </div>
      </div>

      {/* 2. Perfil profesional */}
      <div>
        <SectionTitle>Perfil profesional</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Años de experiencia
            </label>
            <select name="yearsExperience" className={selectClass}>
              <option value="">Sin experiencia previa</option>
              <option value="1">1 año</option>
              <option value="2">2 años</option>
              <option value="3">3 años</option>
              <option value="5">4–5 años</option>
              <option value="7">6–8 años</option>
              <option value="10">9–10 años</option>
              <option value="15">Más de 10 años</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Nivel de estudios
            </label>
            <select name="educationLevel" className={selectClass}>
              <option value="">Seleccioná...</option>
              <option value="secundario">Secundario completo</option>
              <option value="terciario">Terciario / Técnico</option>
              <option value="universitario_cursando">Universitario en curso</option>
              <option value="universitario">Universitario completo</option>
              <option value="posgrado">Posgrado / Maestría</option>
              <option value="doctorado">Doctorado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Modalidad preferida
            </label>
            <select name="workMode" className={selectClass}>
              <option value="">Seleccioná...</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
              <option value="remoto">Remoto</option>
              <option value="indiferente">Indiferente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Disponibilidad para ingresar
            </label>
            <select name="availability" className={selectClass}>
              <option value="">Seleccioná...</option>
              <option value="inmediata">Inmediata</option>
              <option value="2_semanas">En 2 semanas</option>
              <option value="1_mes">En 1 mes</option>
              <option value="2_meses">En 2 meses</option>
              <option value="a_convenir">A convenir</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Pretensión salarial{" "}
              <span className="text-slate-400 font-normal">(bruta mensual, opcional)</span>
            </label>
            <input
              name="salaryExpectation"
              className={inputClass}
              placeholder="Ej: $800.000 – $1.000.000 o &quot;A convenir&quot;"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Habilidades y tecnologías{" "}
              <span className="text-slate-400 font-normal">(separá con comas)</span>
            </label>
            <textarea
              name="skills"
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Ej: Excel, Power BI, Python, Gestión de proyectos, SAP, Photoshop..."
            />
            <p className="text-xs text-slate-400 mt-1">
              Incluí herramientas, lenguajes, certificaciones o cualquier habilidad relevante.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CV */}
      <div>
        <SectionTitle>Curriculum Vitae</SectionTitle>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Adjuntar CV{" "}
          <span className="text-slate-400 font-normal">(PDF, DOC, DOCX — máx. 5 MB)</span>
        </label>
        <input
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
        />
      </div>

      {/* 4. Carta de presentación */}
      <div>
        <SectionTitle>Carta de presentación</SectionTitle>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          ¿Por qué querés trabajar en DB Consulting?{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="coverLetter"
          rows={5}
          className={`${inputClass} resize-none`}
          placeholder="Contanos sobre vos y por qué este puesto te interesa..."
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar postulación →"}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          className="flex-1 sm:flex-none sm:px-6 border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Volver
        </button>
      </div>
    </form>
  );
}
