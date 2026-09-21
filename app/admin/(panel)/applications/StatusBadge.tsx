import { Badge, type Tone } from "@/components/ui/badge";

export const STATUS_CONFIG: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendiente", tone: "lemon" },
  reviewing: { label: "En revisión", tone: "sky" },
  accepted: { label: "Aceptado", tone: "mint" },
  rejected: { label: "Rechazado", tone: "pink" },
  spontaneous: { label: "Espontáneo", tone: "lavender" },
};

/** Chart/legend colors that match the badge tones. */
export const STATUS_BAR_CLASS: Record<string, string> = {
  pending: "bg-lemon-fg/70",
  reviewing: "bg-sky-fg/70",
  accepted: "bg-mint-fg/70",
  rejected: "bg-pink-fg/70",
};

export const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En revisión" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
] as const;

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <Badge className={className}>{status}</Badge>;
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  );
}
