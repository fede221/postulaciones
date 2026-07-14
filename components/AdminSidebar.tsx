"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/jobs", label: "Puestos", icon: "💼" },
  { href: "/admin/applications", label: "Postulaciones", icon: "📋" },
  { href: "/admin/applicants", label: "Postulantes", icon: "👤" },
  { href: "/admin/candidates", label: "Matching CV", icon: "🎯" },
  { href: "/admin/cv-drops", label: "CVs Espontáneos", icon: "📥" },
  { href: "/admin/search", label: "Búsqueda", icon: "🔍" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
            ME
          </div>
          <div>
            <p className="font-bold text-sm">DB Consulting</p>
            <p className="text-slate-400 text-xs">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors px-4 py-2 rounded-lg hover:bg-slate-800 mb-1"
        >
          <span>🌐</span> Ver sitio público
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <span>🚪</span> Cerrar sesión
        </button>
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs">Desarrollado por</p>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            {process.env.NEXT_PUBLIC_DEVELOPER ?? "Absolute Zero"}
          </p>
        </div>
      </div>
    </aside>
  );
}
