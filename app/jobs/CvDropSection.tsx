"use client";
import { useRef, useState } from "react";

export default function CvDropSection() {
  const [step, setStep] = useState<"idle" | "open" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("sending");
    setError("");

    const data = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/cv-drop", { method: "POST", body: data });
      const json = await res.json() as { success?: boolean; error?: string };
      if (res.ok && json.success) {
        setStep("done");
        formRef.current?.reset();
      } else {
        setError(json.error ?? "Ocurrió un error. Intentá de nuevo.");
        setStep("error");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
      setStep("error");
    }
  }

  if (step === "done") {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">¡CV recibido!</h2>
          <p className="text-slate-500">Guardamos tu información. Nos pondremos en contacto si surge una oportunidad acorde a tu perfil.</p>
          <button
            onClick={() => setStep("idle")}
            className="mt-6 text-sm text-blue-600 hover:underline"
          >
            Enviar otro CV
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            Postulación espontánea
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
            ¿No encontrás el puesto ideal?
          </h2>
          <p className="text-slate-500 text-base">
            Dejá tu CV y te contactamos cuando surja una oportunidad que se adapte a tu perfil.
          </p>
        </div>

        {step === "idle" ? (
          <div className="text-center">
            <button
              onClick={() => setStep("open")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
            >
              📄 Dejar mi CV
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  required
                  placeholder="Juan"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  required
                  placeholder="García"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="juan@gmail.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="11 1234-5678"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ¿A qué área apuntás? <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                name="message"
                rows={2}
                placeholder="Ej: Busco trabajo en el área de sistemas o contabilidad..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                CV <span className="text-slate-400 font-normal">(PDF, DOC o DOCX · máx. 5 MB)</span>
              </label>
              <input
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-lg p-1"
              />
            </div>

            {step === "error" && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={step === "sending"}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {step === "sending" ? "Enviando..." : "Enviar CV"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("idle"); setError(""); }}
                className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
