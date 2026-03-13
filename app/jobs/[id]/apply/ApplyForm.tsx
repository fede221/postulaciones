"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="jobId" value={jobId} />

      {/* Personal info */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          Datos personales
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre *</label>
            <input
              name="firstName"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Juan"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Apellido *</label>
            <input
              name="lastName"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Pérez"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Email *</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="juan@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Teléfono</label>
          <input
            name="phone"
            type="tel"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="+54 11 1234-5678"
          />
        </div>
      </div>

      {/* CV Upload */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          Curriculum Vitae
        </h2>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Adjuntar CV <span className="text-slate-400 font-normal">(PDF, DOC, DOCX — máx. 5 MB)</span>
          </label>
          <input
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
        </div>
      </div>

      {/* Cover letter */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          Carta de presentación
        </h2>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            ¿Por qué querés trabajar en Mi Empresa? <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            name="coverLetter"
            rows={5}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            placeholder="Contanos sobre vos y por qué este puesto te interesa..."
          />
        </div>
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
