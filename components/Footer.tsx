export default function Footer() {
  const developer = process.env.NEXT_PUBLIC_DEVELOPER ?? "Absolute Zero";

  return (
    <footer className="bg-slate-800 text-slate-300 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ME</span>
            </div>
            <span className="font-semibold text-white">DB Consulting</span>
          </div>
          <p className="text-sm text-slate-400">
            DB Consulting
          </p>
          <div className="text-right">
            <p className="text-xs text-slate-600">
              Desarrollado por{" "}
              <span className="text-slate-400 font-semibold">Federico Lopez</span>
            </p>
            <p className="text-xs text-slate-700 mt-0.5">
              © {new Date().getFullYear()} {developer} · Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
