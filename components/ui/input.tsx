import * as React from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-md border border-transparent bg-background-secondary text-sm text-foreground placeholder:text-foreground-subtle " +
  "transition-[border-color,box-shadow,background-color] duration-200 ease-[var(--ease-out-expo)] " +
  "hover:bg-muted-hover focus:outline-none focus:bg-background focus:border-border-strong focus:ring-4 focus:ring-ring/8 " +
  "disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-10 px-3.5", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "h-10 pl-3.5 appearance-none cursor-pointer", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "px-3.5 py-2.5 resize-none leading-relaxed", className)} {...props} />;
}

export function FileInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      className={cn(
        fieldBase,
        "h-10 px-1.5 py-1.5 cursor-pointer",
        "file:mr-3 file:h-7 file:rounded-full file:border-0 file:bg-inverse file:px-3 file:text-xs file:font-medium file:text-inverse-foreground hover:file:bg-inverse-hover",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, hint, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label className={cn("block text-[13px] font-medium text-foreground mb-1.5", className)} {...props}>
      {children}
      {hint && <span className="ml-1.5 font-normal text-foreground-subtle">{hint}</span>}
    </label>
  );
}

export function Field({
  label,
  hint,
  help,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  help?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} hint={hint}>{label}</Label>
      {children}
      {help && <p className="mt-1.5 text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-md bg-pink px-3.5 py-2.5 text-sm text-pink-fg">
      {children}
    </div>
  );
}
