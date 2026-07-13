"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExtractAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ processed: number; total: number } | null>(null);

  async function handleExtract() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/applications/extract-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      setResult(data);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className="text-xs text-green-600 font-semibold">
          ✓ {result.processed}/{result.total} CVs procesados
        </span>
      )}
      <button
        onClick={handleExtract}
        disabled={loading}
        className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
      >
        {loading ? "Procesando CVs..." : "Parsear CVs pendientes"}
      </button>
    </div>
  );
}
