const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendiente", class: "bg-yellow-100 text-yellow-700" },
  reviewing: { label: "En revisión", class: "bg-blue-100 text-blue-700" },
  accepted: { label: "Aceptado", class: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazado", class: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, class: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${config.class}`}>
      {config.label}
    </span>
  );
}
