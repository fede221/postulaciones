"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "system", icon: Monitor, label: "Sistema" },
  { value: "dark", icon: Moon, label: "Oscuro" },
] as const;

/** Segmented three-way theme switch (light / system / dark), Vercel-style. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={cn("inline-flex items-center rounded-full border border-border bg-background p-0.5", className)}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-foreground/10 text-foreground" : "text-foreground-subtle hover:bg-foreground/[0.06] hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
