"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Briefcase,
  ExternalLink,
  FileInput,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/Logo";

const NAV = [
  { href: "/admin/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Puestos", icon: Briefcase },
  { href: "/admin/applications", label: "Postulaciones", icon: Inbox },
  { href: "/admin/applicants", label: "Postulantes", icon: Users },
  { href: "/admin/candidates", label: "Candidatos", icon: Sparkles },
  { href: "/admin/cv-drops", label: "CVs espontáneos", icon: FileInput },
  { href: "/admin/search", label: "Búsqueda", icon: Search },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-full pl-1.5 pr-4 text-[14px] transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]",
                active
                  ? "text-sidebar-foreground font-semibold"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                  active ? "bg-sidebar-foreground text-sidebar" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "RRHH";
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-6 text-center">
        <Avatar name={name} size="lg" className="size-16! text-lg! ring-4 ring-sidebar-hover" />
        <div className="leading-tight">
          <p className="font-display text-[19px]">Hola, {name.split(" ")[0]}</p>
          <p className="mt-1 text-xs text-sidebar-muted">Tu selección te está esperando</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 scrollbar-thin" aria-label="Principal">
        <NavList onNavigate={onNavigate} />
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-3 rounded-full px-3 text-[13.5px] text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
          Ver sitio público
        </a>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex h-10 w-full items-center gap-3 rounded-full px-3 text-[13.5px] text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          Cerrar sesión
        </button>
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <p className="min-w-0 truncate text-[11px] text-sidebar-muted" title={session?.user?.email ?? undefined}>
            {session?.user?.email ?? ""}
          </p>
          <ThemeToggle className="border-sidebar-border bg-transparent [&_button]:text-sidebar-muted [&_button:hover]:text-sidebar-foreground [&_[aria-checked=true]]:bg-sidebar-hover [&_[aria-checked=true]]:text-sidebar-foreground" />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden rounded-r-3xl bg-sidebar shadow-lift lg:block">
      <SidebarBody />
    </aside>
  );
}

export function AdminMobileBar() {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex size-10 items-center justify-center rounded-full bg-inverse text-inverse-foreground shadow-soft"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
        <Wordmark size="sm" />
      </header>
      <Sheet open={open} onClose={close} side="left" width="max-w-[280px]" className="rounded-r-3xl border-0! bg-sidebar!">
        <SidebarBody onNavigate={close} />
      </Sheet>
    </>
  );
}
