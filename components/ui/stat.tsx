import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/components/ui/badge";

const toneCard: Record<Tone, string> = {
  mint: "bg-mint text-mint-fg",
  pink: "bg-pink text-pink-fg",
  lemon: "bg-lemon text-lemon-fg",
  sky: "bg-sky text-sky-fg",
  peach: "bg-peach text-peach-fg",
  lavender: "bg-lavender text-lavender-fg",
};

/**
 * KPI tile in the style of the health-app references: the whole card is a pastel
 * surface; icon in a white bubble top-left, big number top-right, label at the
 * bottom, and an optional mini chart in between.
 */
export function Stat({
  label,
  value,
  icon: Icon,
  href,
  hint,
  tone,
  chart,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  href?: string;
  hint?: string;
  tone?: Tone;
  chart?: React.ReactNode;
  className?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background/70 shadow-sm">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : (
          <span />
        )}
        <p className="text-[30px] font-semibold leading-none tracking-tight tabular">{value}</p>
      </div>
      {chart && <div className="mt-4">{chart}</div>}
      <div className={cn("flex items-end justify-between gap-2", chart ? "mt-3" : "mt-6")}>
        <p className="text-[13px] font-medium opacity-80">{label}</p>
        {hint && <p className="text-[11px] opacity-60 text-right">{hint}</p>}
      </div>
    </>
  );

  const base = cn(
    "block rounded-lg p-5 shadow-soft border border-transparent",
    tone ? toneCard[tone] : "bg-background text-foreground border-border/70"
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, "lift", className)}>
        {inner}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{inner}</div>;
}

/** Tiny rounded-bar chart for KPI tiles. Last bar is emphasized. */
export function MiniBars({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className={cn("flex h-10 items-end gap-1", className)} aria-hidden>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <span
            key={i}
            className={cn("flex-1 rounded-full", last ? "bg-current" : "bg-current/25")}
            style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
          />
        );
      })}
    </div>
  );
}
