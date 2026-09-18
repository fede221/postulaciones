import Link from "next/link";
import { cn } from "@/lib/cn";

export interface SegmentedItem {
  label: string;
  href: string;
  active: boolean;
  count?: number;
}

/** Link-driven pill switcher for filters (server-friendly, URL is the state). */
export function Segmented({ items, className }: { items: SegmentedItem[]; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full bg-background p-1 shadow-sm border border-border/70", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]",
            item.active
              ? "bg-inverse text-inverse-foreground shadow-sm"
              : "text-foreground-muted hover:bg-muted hover:text-foreground"
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={cn("tabular text-[11px]", item.active ? "text-inverse-foreground/70" : "text-foreground-subtle")}>
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
