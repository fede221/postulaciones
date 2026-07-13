import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { seedAdmin } from "@/lib/seed";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: "🚀", title: "Crecimiento profesional", desc: "Planes de carrera y capacitaciones continuas para que sigas creciendo." },
  { icon: "🤝", title: "Equipo colaborativo", desc: "Un ambiente de trabajo donde la colaboración y el respeto son el centro." },
  { icon: "⚖️", title: "Equilibrio vida-trabajo", desc: "Flexibilidad horaria y modalidades híbridas para que cuides tu bienestar." },
  { icon: "💡", title: "Innovación constante", desc: "Trabajamos con tecnología de punta y desafiamos el status quo cada día." },
];

export default async function Home() {
  await seedAdmin();

  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full mb-6 backdrop-blur-sm">
            Estamos contratando
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Construí tu carrera<br />con nosotros
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            En DB Consulting creemos que las personas son lo más importante. Buscamos talentos apasionados que quieran hacer la diferencia.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Ver puestos disponibles →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "+500", label: "Empleados" },
            { value: "+10", label: "Años de trayectoria" },
            { value: "4.8/5", label: "Satisfacción del equipo" },
            { value: "+20", label: "Países con presencia" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">¿Por qué trabajar con nosotros?</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Ofrecemos un entorno donde podés desarrollarte, crecer y sentirte parte de algo más grande.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{b.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      {jobs.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Últimas oportunidades</h2>
                <p className="text-slate-500 mt-1">Puestos publicados recientemente</p>
              </div>
              <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold text-sm hidden sm:block">
                Ver todos →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {job.department}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(job.createdAt).toLocaleDateString("es-AR")}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors mb-2">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="text-xs text-slate-500">📍 {job.location}</span>
                    <span className="text-xs text-slate-500">🕐 {job.type}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para dar el próximo paso?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Explorá nuestras vacantes y postulate hoy. Estamos buscando personas como vos.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Ver puestos disponibles
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
