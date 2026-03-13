"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ME</span>
            </div>
            <span className="font-bold text-xl text-slate-800">Mi Empresa</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
              Inicio
            </Link>
            <Link href="/jobs" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium">
              Puestos disponibles
            </Link>
          </div>

          <Link
            href="/jobs"
            className="hidden md:inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ver oportunidades
          </Link>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          <Link href="/" className="block text-slate-600 hover:text-blue-600 text-sm font-medium" onClick={() => setOpen(false)}>
            Inicio
          </Link>
          <Link href="/jobs" className="block text-slate-600 hover:text-blue-600 text-sm font-medium" onClick={() => setOpen(false)}>
            Puestos disponibles
          </Link>
        </div>
      )}
    </nav>
  );
}
