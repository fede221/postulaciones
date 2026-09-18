"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-background !text-foreground !border !border-border/70 !shadow-lift !rounded-lg !font-sans",
          description: "!text-foreground-muted",
          closeButton: "!bg-background !border-border !text-foreground-muted hover:!text-foreground",
        },
      }}
    />
  );
}
