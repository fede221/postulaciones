"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, FileText, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { cvUrl } from "@/lib/cvUrl";
import { formatDateTime } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeDot } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { Eyebrow } from "@/components/ui/page-header";

interface ParsedAiProfile {
  skills?: string[];
  previousRoles?: string[];
  previousCompanies?: string[];
  languages?: string[];
  highlights?: string[];
  suggestedDepartment?: string | null;
  departmentConfidence?: "alta" | "media" | "baja" | null;
}

interface Drop {
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
  coverLetter: string | null;
  cvPath: string | null;
  cvText: string | null;
  aiSummary: string | null;
  aiProfile: string | null;
  aiDepartment: string | null;
  reviewed: boolean;
  createdAt: Date;
}

const EDUCATION_LABELS: Record<string, string> = {
  secundario: "Secundario",
  terciario: "Terciario / Técnico",
  universitario_cursando: "Universitario (cursando)",
  universitario: "Universitario",
  posgrado: "Posgrado / Maestría",
  doctorado: "Doctorado",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  inmediata: "Inmediata",
  "2_semanas": "2 semanas",
  "1_mes": "1 mes",
  "2_meses": "2 meses",
  a_convenir: "A convenir",
};

const CONFIDENCE_DOT: Record<string, BadgeDot> = {
  alta: "success",
  media: "warning",
  baja: "neutral",
};


function parseProfile(raw: string | null): ParsedAiProfile | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedAiProfile;
  } catch {
    return null;
  }
}

function ProfileCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-background px-3 py-2", className)}>
      <p className="text-xs text-foreground-subtle">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-foreground-subtle sm:w-32">{label}</dt>
      <dd className="text-foreground-muted">{value}</dd>
    </div>
  );
}

export default function CvDropCard({ drop }: { drop: Drop }) {
  const router = useRouter();
  const cvHref = cvUrl(drop.cvPath);
  const [reviewed, setReviewed] = useState(drop.reviewed);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState(drop.aiSummary || "");
  const [aiProfile, setAiProfile] = useState<ParsedAiProfile | null>(() => parseProfile(drop.aiProfile));
  const [aiDepartment, setAiDepartment] = useState(drop.aiDepartment || "");

  async function analyzeWithAI() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/admin/cv-drops/${drop.id}/analyze`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { summary: string; profile: ParsedAiProfile };
        setAiSummary(data.summary);
        setAiProfile(data.profile);
        setAiDepartment(data.profile.suggestedDepartment ?? "");
        setExpanded(true);
        toast.success("Análisis completado");
        router.refresh();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error ?? "Error al analizar el CV");
      }
    } catch {
      toast.error("Error al analizar el CV");
    } finally {
      setAnalyzing(false);
    }
  }

  async function toggleReviewed() {
    setLoading(true);
    const next = !reviewed;
    setReviewed(next);
    try {
      const res = await fetch(`/api/admin/cv-drops/${drop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: next }),
      });
      if (!res.ok) {
        setReviewed(!next);
        toast.error("No se pudo actualizar el estado");
      } else {
        toast.success(next ? "Marcado como revisado" : "Marcado como sin revisar");
        router.refresh();
      }
    } catch {
      setReviewed(!next);
      toast.error("No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  }

  const hasProfile = drop.yearsExperience != null || drop.educationLevel || drop.workMode ||
    drop.availability || drop.salaryExpectation || drop.skills;
  // Always expandable: the "revisado" toggle lives in the panel and must stay reachable.
  const canExpand = true;
  const fullName = `${drop.firstName} ${drop.lastName}`;
  const skills = drop.skills ? drop.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Avatar name={fullName} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-foreground">{fullName}</h3>
              {reviewed ? (
                <Badge dot="success">Revisado</Badge>
              ) : (
                <Badge dot="neutral">Sin revisar</Badge>
              )}
              {aiDepartment && (
                <Badge dot={CONFIDENCE_DOT[aiProfile?.departmentConfidence ?? ""] ?? "neutral"}>
                  {aiDepartment}
                </Badge>
              )}
              <span className="font-mono text-xs text-foreground-subtle">{formatDateTime(drop.createdAt)}</span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
              <span className="inline-flex min-w-0 items-center gap-1">
                <Mail className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{drop.email}</span>
              </span>
              {drop.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  {drop.phone}
                </span>
              )}
              {drop.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  {drop.city}
                </span>
              )}
              {drop.linkedinUrl && (
                <a
                  href={drop.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground underline-offset-2 transition-colors duration-150 hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          {cvHref && (
            <ButtonLink href={cvHref} prefetch={false} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
              <FileText strokeWidth={1.75} aria-hidden />
              Ver CV
            </ButtonLink>
          )}
          {(drop.cvText || drop.coverLetter) && (
            <Button type="button" variant="secondary" size="sm" loading={analyzing} onClick={analyzeWithAI}>
              {!analyzing && <Sparkles strokeWidth={1.75} aria-hidden />}
              {aiSummary ? "Reanalizar con IA" : "Analizar con IA"}
            </Button>
          )}
          {canExpand && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              Gestionar
              <ChevronDown
                className={cn("transition-transform duration-200", expanded && "rotate-180")}
                strokeWidth={1.75}
                aria-hidden
              />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded */}
      <Collapsible open={expanded}>
        <div className="space-y-5 border-t border-border bg-background-secondary p-4">
          {/* AI analysis */}
          {aiSummary && (
            <Card className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-foreground-subtle" strokeWidth={1.5} aria-hidden />
                <Eyebrow>Análisis IA</Eyebrow>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
              {aiProfile && (
                <div className="space-y-3">
                  {aiProfile.suggestedDepartment && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-foreground-subtle">Área sugerida</span>
                      <Badge dot={CONFIDENCE_DOT[aiProfile.departmentConfidence ?? ""] ?? "neutral"}>
                        {aiProfile.suggestedDepartment}
                        {aiProfile.departmentConfidence && (
                          <span className="font-normal text-foreground-subtle">· confianza {aiProfile.departmentConfidence}</span>
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
                  {((aiProfile.previousRoles && aiProfile.previousRoles.length > 0) ||
                    (aiProfile.previousCompanies && aiProfile.previousCompanies.length > 0) ||
                    (aiProfile.languages && aiProfile.languages.length > 0)) && (
                    <dl className="space-y-1.5">
                      {aiProfile.previousRoles && aiProfile.previousRoles.length > 0 && (
                        <DefinitionRow label="Roles anteriores" value={aiProfile.previousRoles.join(" · ")} />
                      )}
                      {aiProfile.previousCompanies && aiProfile.previousCompanies.length > 0 && (
                        <DefinitionRow label="Empresas" value={aiProfile.previousCompanies.join(" · ")} />
                      )}
                      {aiProfile.languages && aiProfile.languages.length > 0 && (
                        <DefinitionRow label="Idiomas" value={aiProfile.languages.join(", ")} />
                      )}
                    </dl>
                  )}
                  {aiProfile.skills && aiProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiProfile.skills.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Professional profile */}
          {hasProfile && (
            <div className="space-y-3">
              <Eyebrow>Perfil profesional</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {drop.yearsExperience != null && (
                  <ProfileCell
                    label="Experiencia"
                    value={
                      drop.yearsExperience === 0
                        ? "Sin experiencia"
                        : `${drop.yearsExperience} año${drop.yearsExperience !== 1 ? "s" : ""}`
                    }
                  />
                )}
                {drop.educationLevel && (
                  <ProfileCell label="Estudios" value={EDUCATION_LABELS[drop.educationLevel] ?? drop.educationLevel} />
                )}
                {drop.workMode && (
                  <ProfileCell label="Modalidad" value={drop.workMode} className="capitalize" />
                )}
                {drop.availability && (
                  <ProfileCell label="Disponibilidad" value={AVAILABILITY_LABELS[drop.availability] ?? drop.availability} />
                )}
                {drop.salaryExpectation && (
                  <ProfileCell label="Pretensión salarial" value={drop.salaryExpectation} className="sm:col-span-2" />
                )}
              </div>
              {skills.length > 0 && (
                <div className="rounded-md border border-border bg-background px-3 py-2">
                  <p className="mb-1.5 text-xs text-foreground-subtle">Habilidades y tecnologías</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cover letter */}
          {drop.coverLetter && (
            <div className="space-y-2">
              <Eyebrow>Presentación</Eyebrow>
              <div className="whitespace-pre-line rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-foreground-muted">
                {drop.coverLetter}
              </div>
            </div>
          )}

          {/* CV text */}
          {drop.cvText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eyebrow>Texto extraído del CV</Eyebrow>
                <span className="font-mono text-[11px] text-foreground-subtle tabular">
                  {drop.cvText.length.toLocaleString("es-AR")} caracteres
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background p-4 scrollbar-thin">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground-muted">
                  {drop.cvText}
                </pre>
              </div>
            </div>
          )}

          {/* Reviewed toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-foreground-subtle">
              {reviewed ? "Este CV ya fue revisado." : "Este CV todavía no fue revisado."}
            </p>
            <Button
              type="button"
              variant={reviewed ? "secondary" : "primary"}
              size="sm"
              loading={loading}
              onClick={toggleReviewed}
            >
              {reviewed ? "Marcar sin revisar" : "Marcar como revisado"}
            </Button>
          </div>
        </div>
      </Collapsible>
    </Card>
  );
}
