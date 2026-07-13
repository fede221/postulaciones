import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trabaja con Nosotros | DB Consulting",
  description: "Descubrí las oportunidades laborales disponibles en DB Consulting y postulate hoy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 text-slate-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
