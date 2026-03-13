import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3">¡Postulación enviada!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Gracias por tu interés en formar parte de nuestro equipo. Revisaremos tu postulación y nos pondremos en contacto contigo si tu perfil se ajusta al puesto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Ver más puestos
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
