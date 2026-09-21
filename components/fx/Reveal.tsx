"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance: fades and rises once the element enters the viewport.
 * Pass `delay` (seconds) to stagger siblings.
 *
 * The rendered element is identical on server and client (so hydration never
 * mismatches). Under prefers-reduced-motion the content simply appears at once.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.8,
  once = true,
  className,
  amount = 0.2,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const [forced, setForced] = React.useState(false);

  // Safety net: if the intersection observer never fires (hidden window, odd
  // embedding), anything already inside the viewport still shows up.
  React.useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setForced(true);
    };
    const t = setTimeout(check, 1500);
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", check);
    };
  }, []);

  const show = inView || forced || Boolean(reduced);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={reduced ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered word-by-word headline reveal. Same DOM in every mode; instant when motion is reduced. */
export function SplitWords({
  text,
  className,
  delay = 0,
  accent,
}: {
  text: string;
  className?: string;
  delay?: number;
  /** Word (exact match) to render in italic display style. */
  accent?: string;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => {
        const isAccent = accent && w.replace(/[.,]/g, "") === accent;
        return (
          <React.Fragment key={i}>
            {/*
              The mask only needs to hide the word while it rises from BELOW, so it clips the
              bottom edge alone. clip-path with negative insets leaves the sides and top open:
              italic overhang (the "o" of an italic word) and accents are never cut, which
              `overflow: hidden` did on some screens.
            */}
            <span className="inline-block pb-[0.14em] align-bottom [clip-path:inset(-0.4em_-0.5em_0_-0.5em)]">
              <motion.span
                className="inline-block"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.9, delay: delay + i * 0.07, ease: EASE }}
              >
                <span className={isAccent ? "font-display-wonk italic text-mint-fg" : undefined}>{w}</span>
              </motion.span>
            </span>
            {/* The space lives OUTSIDE the inline-block: a trailing space inside one is collapsed away. */}
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </span>
  );
}
