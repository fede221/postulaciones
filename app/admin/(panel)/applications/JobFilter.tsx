"use client";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/input";

export default function JobFilter({
  jobs,
  value,
  status,
}: {
  jobs: { id: string; title: string }[];
  value: string;
  status?: string;
}) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (e.target.value) params.set("jobId", e.target.value);
    if (status) params.set("status", status);
    const qs = params.toString();
    router.push(`/admin/applications${qs ? `?${qs}` : ""}`);
  }

  return (
    <Select value={value} onChange={onChange} aria-label="Filtrar por puesto" className="h-9! text-[13px] sm:w-64">
      <option value="">Todos los puestos</option>
      {jobs.map((j) => (
        <option key={j.id} value={j.id}>
          {j.title}
        </option>
      ))}
    </Select>
  );
}
