import Link from "next/link";
import { cn } from "@/lib/cn";

/** Editorial wordmark. Serif display face, no emblem. */
export function Wordmark({
  className,
  size = "md",
  href,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const sizes = { sm: "text-[17px]", md: "text-[19px]", lg: "text-[26px]" };
  const cls = cn(
    "font-display font-medium tracking-[-0.01em] text-foreground select-none whitespace-nowrap",
    sizes[size],
    className
  );
  const text = (
    <>
      DB <span className="font-normal italic">Consulting</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} aria-label="DB Consulting — inicio">
        {text}
      </Link>
    );
  }
  return <span className={cls}>{text}</span>;
}
