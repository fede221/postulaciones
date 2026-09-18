import { cn } from "@/lib/cn";
import { toneFor } from "@/components/ui/badge";

const toneClasses = {
  mint: "bg-mint text-mint-fg",
  pink: "bg-pink text-pink-fg",
  lemon: "bg-lemon text-lemon-fg",
  sky: "bg-sky text-sky-fg",
  peach: "bg-peach text-peach-fg",
  lavender: "bg-lavender text-lavender-fg",
} as const;

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const sizes = { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-sm" };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        toneClasses[toneFor(name)],
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
