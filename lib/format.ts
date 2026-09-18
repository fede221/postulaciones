/**
 * Client-safe formatting helpers. Dates are pinned to the business timezone so a
 * server render and the browser always produce the same string (no hydration drift).
 */
const TZ = "America/Argentina/Buenos_Aires";

const dateTime = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

export function formatDateTime(date: Date | string): string {
  return dateTime.format(new Date(date));
}

export const EDUCATION_LABELS: Record<string, string> = {
  secundario: "Secundario",
  terciario: "Terciario",
  universitario_cursando: "Universitario (cursando)",
  universitario: "Universitario",
  posgrado: "Posgrado",
  doctorado: "Doctorado",
};
