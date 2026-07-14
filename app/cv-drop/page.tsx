import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CvDropForm from "./CvDropForm";

export const metadata = {
  title: "Dejá tu CV | DB Consulting",
};

export default function CvDropPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Postulación espontánea
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
              Dejá tu CV
            </h1>
            <p className="text-slate-500">
              Completá el formulario y te contactamos cuando surja una oportunidad que se adapte a tu perfil.
            </p>
          </div>

          <CvDropForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
