"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Side sheet / drawer. Slides from the right (or left) with an overlay.
 * Mounted only while open or animating out. Esc closes. Body scroll locks.
 */
export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  children,
  className,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: string;
}) {
  const [mounted, setMounted] = React.useState(open);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const offscreen = side === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-overlay transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        className={cn(
          "absolute top-0 bottom-0 flex w-full flex-col bg-background border-border shadow-lift",
          side === "right" ? "right-0 border-l rounded-l-3xl" : "left-0 border-r rounded-r-3xl",
          width,
          "transition-transform duration-300 ease-[var(--ease-sheet)]",
          visible ? "translate-x-0" : offscreen,
          className
        )}
      >
        {(title !== undefined) && (
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
            <div className="min-w-0 text-sm font-medium text-foreground truncate">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-8 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
