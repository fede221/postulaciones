"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Briefcase, ChevronDown, FileText, History, ExternalLink, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { cvUrl } from "@/lib/cvUrl";
import { EDUCATION_LABELS, formatDateTime } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, type BadgeDot } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Collapsible } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/page-header";
import StatusBadge, { STATUS_OPTIONS } from "./StatusBadge";

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
}

interface App {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  linkedinUrl: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  workMode: string | null;
  availability: string | null;
  salaryExpectation: string | null;
  skills: string | null;
  cvText: string | null;
  aiSummary: string | null;
  aiProfile: string | null;
  coverLetter: string | null;
  cvPath: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  job: { title: string; department: string };
  statusHistory: StatusHistory[];
}

interface ParsedAiProfile {
  skills?: string[];
  previousRoles?: string[];
  previousCompanies?: string[];
  languages?: string[];
  highlights?: string[];
  suggestedDepartment?: string | null;
  departmentConfidence?: "alta" | "media" | "baja" | null;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  inmediata: "Inmediata",
  "2_semanas": "2 semanas",
  "1_mes": "1 mes",
  "2_meses": "2 meses",
  a_convenir: "A convenir",
};

const CONFIDENCE_DOT: Record<string, BadgeDot> = { alta: "success", media: "warning", baja: "neutral" };


function safeParse(raw: string | null): ParsedAiProfile | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedAiProfile;
  } catch {
    return null;
  }
}

function Meta({ icon: Icon, children, href }: { icon: React.ElementType; children: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <Icon className="size-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.5} aria-hidden />
      <span className="truncate">{children}</span>
    </>
  );
  const cls = "inline-flex min-w-0 items-center gap-1.5 text-xs text-foreground-muted";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(cls, "hover:text-foreground transition-colors")}>
        {inner}
      </a>
    );
  }
  return <span className={cls}>{inner}</span>;
}

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <p className="text-[11px] text-foreground-subtle">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function ApplicationCard({ app, defaultOpen = false }: { app: App; defaultOpen?: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultOpen);
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState(app.notes || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState(app.aiSummary || "");
  const [aiProfile, setAiProfile] = useState<ParsedAiProfile | null>(safeParse(app.aiProfile));
  const [history, setHistory] = useState<StatusHistory[]>(app.statusHistory);

  const fullName = `${app.firstName} ${app.lastName}`;
  const cvHref = cvUrl(app.cvPath);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    const prevStatus = status;
    setStatus(newStatus);

    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: note.trim() || undefined }),
      });
      if (!res.ok) throw new Error(String(res.status));

      const data = await res.json();
      setHistory(data.statusHistory ?? history);
      setNote("");
      toast.success(`${fullName}: ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label ?? newStatus}`);
      router.refresh();
    } catch {
      setStatus(prevStatus);
      toast.error("No se pudo cambiar el estado. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: internalNote }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success("Nota guardada");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la nota. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function analyzeWithAI() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/analyze`, { method: "POST" });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error ?? "No se pudo analizar el CV");
        return;
      }
      const data = (await res.json()) as { summary: string; profile: ParsedAiProfile };
      setAiSummary(data.summary);
      setAiProfile(data.profile);
      setExpanded(true);
      toast.success("Análisis listo");
      router.refresh();
    } catch {
      toast.error("No se pudo analizar el CV. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  }

  const hasProfile =
    app.yearsExperience != null || app.educationLevel || app.workMode || app.availability || app.salaryExpectation || app.skills;

  return (
    <article className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-soft transition-shadow duration-200 hover:shadow-lift">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Avatar name={fullName} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">{fullName}</h3>
              <StatusBadge status={status} />
              <span className="font-mono text-[11px] text-foreground-subtle">{formatDateTime(app.createdAt)}</span>
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-foreground-muted">
              <Briefcase className="size-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.5} aria-hidden />
              <span className="truncate">
                {app.job.title} <span className="text-foreground-subtle">· {app.job.department}</span>
              </span>
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Meta icon={Mail} href={`mailto:${app.email}`}>{app.email}</Meta>
              {app.phone && <Meta icon={Phone}>{app.phone}</Meta>}
              {app.city && <Meta icon={MapPin}>{app.city}</Meta>}
              {app.linkedinUrl && <Meta icon={ExternalLink} href={app.linkedinUrl}>LinkedIn</Meta>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          {cvHref && (
            <ButtonLink href={cvHref} prefetch={false} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
              <FileText strokeWidth={1.5} /> Ver CV
            </ButtonLink>
          )}
          {(app.cvText || app.coverLetter) && (
            <Button onClick={analyzeWithAI} loading={analyzing} variant="secondary" size="sm">
              {!analyzing && <Sparkles strokeWidth={1.5} />}
              {analyzing ? "Analizando" : aiSummary ? "Re-analizar" : "Analizar con IA"}
            </Button>
          )}
          <ButtonLink href={`/admin/applicants/${encodeURIComponent(app.email)}`} variant="ghost" size="sm">
            <History strokeWidth={1.5} /> Historial
          </ButtonLink>
          <Button onClick={() => setExpanded((e) => !e)} variant="ghost" size="sm" aria-expanded={expanded}>
            Gestionar
            <ChevronDown className={cn("transition-transform duration-200", expanded && "rotate-180")} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <Collapsible open={expanded}>
        <div className="space-y-6 border-t border-border bg-background-secondary p-4 sm:p-5">
          {aiSummary && (
            <section className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-foreground-subtle" strokeWidth={1.5} aria-hidden />
                <Eyebrow>Análisis IA</Eyebrow>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{aiSummary}</p>
              {aiProfile && (
                <div className="mt-3 space-y-3">
                  {aiProfile.suggestedDepartment && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                      <span>Área sugerida</span>
                      <Badge dot={CONFIDENCE_DOT[aiProfile.departmentConfidence ?? "baja"] ?? "neutral"}>
                        {aiProfile.suggestedDepartment}
                        {aiProfile.departmentConfidence && (
                          <span className="text-foreground-subtle">· confianza {aiProfile.departmentConfidence}</span>
                        )}
                      </Badge>
                    </div>
                  )}
                  {aiProfile.highlights && aiProfile.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiProfile.highlights.map((h) => (
                        <Badge key={h} variant="solid">{h}</Badge>
                      ))}
                    </div>
                  )}
                  <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
                    {aiProfile.previousRoles && aiProfile.previousRoles.length > 0 && (
                      <>
                        <dt className="text-foreground-subtle">Roles anteriores</dt>
                        <dd className="text-foreground-muted">{aiProfile.previousRoles.join(" · ")}</dd>
                      </>
                    )}
                    {aiProfile.previousCompanies && aiProfile.previousCompanies.length > 0 && (
                      <>
                        <dt className="text-foreground-subtle">Empresas</dt>
                        <dd className="text-foreground-muted">{aiProfile.previousCompanies.join(" · ")}</dd>
                      </>
                    )}
                    {aiProfile.languages && aiProfile.languages.length > 0 && (
                      <>
                        <dt className="text-foreground-subtle">Idiomas</dt>
                        <dd className="text-foreground-muted">{aiProfile.languages.join(", ")}</dd>
                      </>
                    )}
                  </dl>
                  {aiProfile.skills && aiProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiProfile.skills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {hasProfile && (
            <section>
              <Eyebrow className="mb-3">Perfil profesional</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {app.yearsExperience != null && (
                  <Cell label="Experiencia" value={app.yearsExperience === 0 ? "Sin experiencia" : `${app.yearsExperience} ${app.yearsExperience === 1 ? "año" : "años"}`} />
                )}
                {app.educationLevel && <Cell label="Estudios" value={EDUCATION_LABELS[app.educationLevel] ?? app.educationLevel} />}
                {app.workMode && <Cell label="Modalidad" value={<span className="capitalize">{app.workMode}</span>} />}
                {app.availability && <Cell label="Disponibilidad" value={AVAILABILITY_LABELS[app.availability] ?? app.availability} />}
                {app.salaryExpectation && <Cell label="Pretensión salarial" value={app.salaryExpectation} />}
              </div>
              {app.skills && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {app.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              )}
            </section>
          )}

          {app.cvText && (
            <section>
              <Eyebrow className="mb-2">
                Texto del CV <span className="normal-case tracking-normal text-foreground-subtle">· {app.cvText.length.toLocaleString("es-AR")} caracteres</span>
              </Eyebrow>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground-muted scrollbar-thin">
                {app.cvText}
              </pre>
            </section>
          )}

          {app.coverLetter && (
            <section>
              <Eyebrow className="mb-2">Carta de presentación</Eyebrow>
              <div className="whitespace-pre-line rounded-md border border-border bg-background p-3 text-sm leading-relaxed text-foreground-muted">
                {app.coverLetter}
              </div>
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <Eyebrow className="mb-3">Cambiar estado</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={loading || opt.value === status}
                    variant={opt.value === status ? "primary" : "secondary"}
                    size="sm"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                aria-label="Nota para el cambio de estado"
                placeholder="Nota opcional para este cambio (queda en el historial)"
                className="mt-3"
              />
            </div>

            <div>
              <Eyebrow className="mb-3">Notas internas</Eyebrow>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={3}
                aria-label="Notas internas"
                placeholder="Notas privadas sobre el candidato (no las ve el postulante)"
              />
              <Button onClick={saveNote} loading={saving} variant="secondary" size="sm" className="mt-2">
                Guardar nota
              </Button>
            </div>
          </section>

          {history.length > 0 && (
            <section>
              <Eyebrow className="mb-3">Historial de estados</Eyebrow>
              <ol className="relative space-y-4 border-l border-border pl-5">
                {history.map((h, i) => (
                  <li key={h.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-background-secondary",
                        i === history.length - 1 ? "bg-foreground" : "bg-border-strong"
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {h.fromStatus && (
                        <>
                          <StatusBadge status={h.fromStatus} />
                          <ArrowRight className="size-3 text-foreground-subtle" aria-hidden />
                        </>
                      )}
                      <StatusBadge status={h.toStatus} />
                      <span className="font-mono text-[11px] text-foreground-subtle">{formatDateTime(h.createdAt)}</span>
                    </div>
                    {h.note && (
                      <p className="mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground-muted">{h.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

        </div>
      </Collapsible>
    </article>
  );
}
