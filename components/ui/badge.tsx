import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const TONES = ["mint", "pink", "lemon", "sky", "peach", "lavender"] as const;
export type Tone = (typeof TONES)[number];

const toneClasses: Record<Tone, string> = {
  mint: "bg-mint text-mint-fg",
  pink: "bg-pink text-pink-fg",
  lemon: "bg-lemon text-lemon-fg",
  sky: "bg-sky text-sky-fg",
  peach: "bg-peach text-peach-fg",
  lavender: "bg-lavender text-lavender-fg",
};

/** Deterministic pastel for a label (departments, tags…), stable across renders. */
export function toneFor(label: string): Tone {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
  return TONES[Math.abs(h) % TONES.length];
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full text-xs font-medium leading-none h-6 px-2.5",
  {
    variants: {
      variant: {
        outline: "border border-border bg-background text-foreground-muted",
        solid: "bg-muted text-foreground",
        inverse: "bg-inverse text-inverse-foreground",
        tone: "",
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

const dotColors = {
  neutral: "bg-foreground-subtle",
  foreground: "bg-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

export type BadgeDot = keyof typeof dotColors;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: BadgeDot;
  /** Pastel fill. When set, the badge renders as a soft colored chip. */
  tone?: Tone;
}

export function Badge({ className, variant, dot, tone, children, ...props }: BadgeProps) {
  const v = tone ? "tone" : variant;
  return (
    <span className={cn(badgeVariants({ variant: v }), tone && toneClasses[tone], className)} {...props}>
      {dot && <span className={cn("size-1.5 rounded-full shrink-0", dotColors[dot])} aria-hidden />}
      {children}
    </span>
  );
}
