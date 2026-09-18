import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Hover never moves the element: it only brightens, tints or colors the border.
 * Primary buttons carry a faint top-light gradient that intensifies on hover.
 */
export const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none " +
    "transition-[background-color,border-color,color,opacity,box-shadow,filter] duration-500 ease-[var(--ease-out-expo)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-inverse text-inverse-foreground border border-transparent shadow-soft " +
          "bg-[linear-gradient(180deg,rgb(255_255_255/0.10),rgb(255_255_255/0)_60%)] " +
          "hover:bg-inverse-hover hover:shadow-lift",
        inverted:
          "bg-inverse-foreground text-inverse border border-transparent shadow-soft " +
          "hover:bg-[color-mix(in_oklab,var(--inverse-foreground)_92%,var(--inverse))]",
        /* Outline for dark (inverse) surfaces: stays readable on hover in both themes. */
        "outline-inverted":
          "bg-transparent text-inverse-foreground border border-inverse-foreground/30 " +
          "hover:bg-inverse-foreground/12 hover:border-inverse-foreground/60",
        secondary:
          "bg-background text-foreground border border-border shadow-sm " +
          "hover:border-border-strong hover:bg-background-secondary hover:shadow-soft",
        ghost: "text-foreground-muted hover:text-foreground hover:bg-muted border border-transparent",
        soft: "bg-muted text-foreground border border-transparent hover:bg-muted-hover",
        danger: "bg-background text-danger border border-border hover:border-danger/50 hover:bg-danger/5",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] [&_svg]:size-3.5",
        md: "h-10 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-[15px] [&_svg]:size-4",
        xl: "h-14 px-8 text-base [&_svg]:size-[18px]",
        icon: "h-10 w-10 [&_svg]:size-4",
        "icon-sm": "h-8 w-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & { loading?: boolean };

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

export function Button({ className, variant, size, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export type ButtonLinkProps = React.ComponentProps<typeof Link> & ButtonBaseProps;

export function ButtonLink({ className, variant, size, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  );
}
