export default function Footer() {
  const developer = process.env.NEXT_PUBLIC_DEVELOPER ?? "Tu Desarrolladora";

  return (
    <footer className="bg-slate-800 text-slate-300 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ME</span>
            </div>
            <span className="font-semibold text-white">Mi Empresa</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Mi Empresa. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-600">
            Desarrollado con ♥ por{" "}
            <span className="text-slate-400 font-semibold">{developer}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
