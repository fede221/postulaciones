import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const developer = process.env.NEXT_PUBLIC_DEVELOPER ?? "Absolute Zero";

  return (
    <footer className="mt-auto overflow-hidden border-t border-border/70">
      <div className="container-x flex flex-col gap-8 pt-12 md:flex-row md:items-start md:justify-between">
        <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">
          Portal de empleo de DB Consulting. Mirá las búsquedas abiertas o dejanos tu CV para las próximas.
        </p>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Pie de página">
          {[
            { href: "/jobs", label: "Puestos" },
            { href: "/cv-drop", label: "Postulación espontánea" },
            { href: "/admin/login", label: "Acceso RRHH" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group inline-flex items-center gap-1 text-foreground-muted transition-colors duration-300 hover:text-foreground"
            >
              {l.label}
              <ArrowUpRight
                className="size-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          ))}
        </nav>
      </div>

      {/* Oversized wordmark: the page signs off like a magazine back cover */}
      <div className="container-x pt-10" aria-hidden>
        <p className="select-none whitespace-nowrap font-display text-[clamp(64px,15.5vw,260px)] font-medium leading-[0.82] tracking-[-0.04em] text-foreground/[0.07]">
          DB <span className="font-display-wonk font-normal italic">Consulting</span>
        </p>
      </div>

      <div className="container-x flex flex-col gap-1 border-t border-border/60 py-5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground-subtle sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} DB Consulting</span>
        <span>Desarrollado por {developer}</span>
      </div>
    </footer>
  );
}
