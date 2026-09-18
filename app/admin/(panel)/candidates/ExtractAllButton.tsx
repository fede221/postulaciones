"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ExtractAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleExtract() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications/extract-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = (await res.json()) as { processed?: number; total?: number; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "No se pudieron procesar los CVs");
        return;
      }
      toast.success(`${data.processed ?? 0}/${data.total ?? 0} CVs procesados`);
      router.refresh();
    } catch {
      toast.error("No se pudieron procesar los CVs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" loading={loading} onClick={handleExtract}>
      {!loading && <RefreshCw strokeWidth={1.75} aria-hidden />}
      Parsear CVs pendientes
    </Button>
  );
}
