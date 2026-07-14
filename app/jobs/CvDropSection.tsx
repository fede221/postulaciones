import Link from "next/link";

export default function CvDropSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
          Postulación espontánea
        </span>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">
          ¿No encontrás el puesto ideal?
        </h2>
        <p className="text-slate-500 text-base mb-7">
          Dejá tu CV y te contactamos cuando surja una oportunidad que se adapte a tu perfil.
          No necesitás postularte a un puesto específico.
        </p>
        <Link
          href="/cv-drop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-sm"
        >
          📄 Dejar mi CV
        </Link>
      </div>
    </section>
  );
}
