"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/Logo";
import { Collapsible } from "@/components/ui/collapsible";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/jobs", label: "Puestos" },
  { href: "/cv-drop", label: "Postulación espontánea" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-14 items-center justify-between rounded-full border transition-[max-width,background-color,border-color,box-shadow,padding] duration-500 ease-[var(--ease-out-expo)]",
          scrolled || open
            ? "max-w-[1240px] border-border/70 bg-background/85 px-4 shadow-soft backdrop-blur-md sm:px-6"
            : "max-w-[1680px] border-transparent bg-transparent px-[clamp(8px,3vw,64px)]"
        )}
      >
        <Wordmark href="/" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300",
                  active
                    ? "bg-foreground/[0.09] text-foreground"
                    : "text-foreground-muted hover:bg-foreground/[0.07] hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <ButtonLink href="/jobs" size="sm">Ver puestos</ButtonLink>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-foreground-muted hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
        </button>
      </div>

      <Collapsible open={open} className="mx-auto max-w-[1240px] md:hidden">
        <div className="mt-2 rounded-lg border border-border/70 bg-background/95 px-5 py-3 shadow-lift backdrop-blur-md">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm text-foreground-muted hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <ThemeToggle />
            <ButtonLink href="/jobs" size="sm" onClick={() => setOpen(false)}>Ver puestos</ButtonLink>
          </div>
        </div>
      </Collapsible>
    </header>
  );
}
