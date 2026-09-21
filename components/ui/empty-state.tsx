import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-border/70 bg-background/60 px-6 py-16",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-mint text-mint-fg animate-pop">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <p className="text-[15px] font-semibold tracking-tight text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-foreground-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
