import { cn } from "@/lib/cn";

const DOTS = ["bg-mint-fg", "bg-pink-fg", "bg-lemon-fg", "bg-sky-fg", "bg-peach-fg", "bg-lavender-fg"];

/** Infinite horizontal ticker. Pure CSS; pauses on hover and under reduced motion. */
export function Marquee({
  items,
  className,
  speed = 60,
}: {
  items: string[];
  className?: string;
  /** seconds per loop */
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn(
        // py gives descenders (g, p, y) room: overflow-hidden would otherwise clip them.
        "group overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className
      )}
      aria-label={items.join(", ")}
    >
      <div
        className="marquee flex w-max items-center gap-8 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap" aria-hidden={i >= items.length}>
            <span className="font-display text-[28px] italic leading-[1.35] text-foreground/85 sm:text-[34px]">{item}</span>
            <span className={cn("size-2 rounded-full opacity-70", DOTS[i % DOTS.length])} />
          </span>
        ))}
      </div>
    </div>
  );
}
