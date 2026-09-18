"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Height-animated collapsible using the CSS grid 0fr → 1fr trick.
 * Content stays in the DOM (accessible, searchable); only the track animates.
 */
export function Collapsible({
  open,
  children,
  className,
  duration = 220,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <div
      className={cn("grid transition-[grid-template-rows,opacity] ease-[var(--ease-out-expo)]", className)}
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
      aria-hidden={!open}
      // Closed content must not be tabbable or clickable.
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
