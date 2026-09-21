"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Filters {
  q: string;
  dept: string;
  exp: string;
  edu: string;
}

/**
 * Live candidate search: the URL is the source of truth (so results stay server-ranked,
 * shareable and refresh-safe), but it updates as you type — debounced — instead of on
 * submit. Clearing the box goes back to the full candidate base.
 */
export default function CandidateFilters({
  initial,
  departments,
  educationOptions,
  quickSearches,
  statsLine,
}: {
  initial: Filters;
  departments: string[];
  educationOptions: { value: string; label: string }[];
  quickSearches: string[];
  statsLine: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();
  const [filters, setFilters] = React.useState<Filters>(initial);
  const lastPushed = React.useRef(JSON.stringify(initial));
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow external navigation (back/forward, links) without clobbering what is being typed.
  React.useEffect(() => {
    const incoming = JSON.stringify(initial);
    if (incoming !== lastPushed.current) {
      lastPushed.current = incoming;
      setFilters(initial);
    }
  }, [initial]);

  React.useEffect(() => () => {
    if (debounce.current) clearTimeout(debounce.current);
  }, []);

  const push = React.useCallback(
    (next: Filters) => {
      const normalized = { ...next, q: next.q.trim() };
      const serialized = JSON.stringify(normalized);
      if (serialized === lastPushed.current) return;
      lastPushed.current = serialized;
      const params = new URLSearchParams();
      (Object.keys(normalized) as (keyof Filters)[]).forEach((k) => {
        if (normalized[k]) params.set(k, normalized[k]);
      });
      const qs = params.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router]
  );

  const update = (patch: Partial<Filters>, immediate = false) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (debounce.current) clearTimeout(debounce.current);
    if (immediate) push(next);
    else debounce.current = setTimeout(() => push(next), 300);
  };

  const hasFilters = Boolean(filters.q || filters.dept || filters.exp || filters.edu);

  return (
    <Card>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (debounce.current) clearTimeout(debounce.current);
          push(filters);
        }}
      >
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-foreground-subtle">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Search className="size-4" strokeWidth={1.5} aria-hidden />
                )}
              </span>
              <Input
                name="q"
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
                autoFocus
                autoComplete="off"
                aria-label="Perfil buscado"
                placeholder="Escribí un perfil: 'contador', 'despostador con experiencia en frío', 'SAP'…"
                className="h-10 pl-9 pr-9"
              />
              {filters.q && (
                <button
                  type="button"
                  onClick={() => update({ q: "" }, true)}
                  aria-label="Borrar búsqueda"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground-subtle transition-colors hover:bg-muted-hover hover:text-foreground"
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                className="h-10"
                onClick={() => update({ q: "", dept: "", exp: "", edu: "" }, true)}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={filters.dept} onChange={(e) => update({ dept: e.target.value }, true)} aria-label="Departamento">
              <option value="">Todos los departamentos</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select value={filters.exp} onChange={(e) => update({ exp: e.target.value }, true)} aria-label="Experiencia mínima">
              <option value="">Experiencia mínima</option>
              <option value="1">1+ año</option>
              <option value="3">3+ años</option>
              <option value="5">5+ años</option>
              <option value="10">10+ años</option>
            </Select>

            <Select value={filters.edu} onChange={(e) => update({ edu: e.target.value }, true)} aria-label="Nivel de estudios">
              <option value="">Cualquier nivel de estudios</option>
              {educationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {!filters.q && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-xs text-foreground-subtle">Búsquedas frecuentes:</span>
              {quickSearches.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update({ q: s }, true)}
                  className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-foreground-muted transition-colors duration-150 hover:bg-muted-hover hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-foreground-subtle">{statsLine}</p>
        </CardContent>
      </form>
    </Card>
  );
}
