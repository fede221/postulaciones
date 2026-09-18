const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export const COMPANY_DEPARTMENTS = [
  "Gastronomía",
  "Operaciones - Cocido",
  "Operaciones - Crudo",
  "Planta de Desposte",
  "Calidad",
  "Seguridad e Higiene",
  "Mantenimiento",
  "Logística",
  "Taller Mecánico",
  "Sistemas",
  "Control de Gestión",
  "Pago a Proveedores",
  "Tesorería",
  "Contabilidad",
  "RRHH",
  "Comercial",
  "Administración",
  "Legal",
  "Otro",
] as const;

export type CompanyDepartment = (typeof COMPANY_DEPARTMENTS)[number];

export interface AiProfile {
  summary: string;
  skills: string[];
  yearsExperience: number | null;
  educationLevel: string | null;
  previousRoles: string[];
  previousCompanies: string[];
  languages: string[];
  highlights: string[];
  suggestedDepartment: CompanyDepartment | null;
  departmentConfidence: "alta" | "media" | "baja" | null;
}

// Tries to parse JSON that may be truncated mid-stream
function safeParseJson(raw: string): AiProfile | null {
  // Strip markdown fences
  const str = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  // Try as-is first
  try { return JSON.parse(str) as AiProfile; } catch { /* continue */ }

  // Find the last complete key-value pair and close the object
  // Strategy: truncate at the last comma or closing bracket we can find
  // then close open arrays/objects
  const openBraces: string[] = [];
  let inString = false;
  let lastSafePos = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && str[i - 1] !== "\\") inString = !inString;
    if (inString) continue;
    if (ch === "{" || ch === "[") openBraces.push(ch === "{" ? "}" : "]");
    if (ch === "}" || ch === "]") {
      openBraces.pop();
      if (openBraces.length === 1) lastSafePos = i + 1; // inside root object
    }
  }

  if (lastSafePos > 0) {
    const repaired = str.slice(0, lastSafePos) + openBraces.reverse().join("") + "}";
    try { return JSON.parse(repaired) as AiProfile; } catch { /* continue */ }
  }

  return null;
}

export async function analyzeCvWithAI(
  cvText: string,
  jobTitle: string,
  jobDepartment: string
): Promise<{ summary: string; profile: AiProfile } | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[openrouter] OPENROUTER_API_KEY no configurada");
    return null;
  }

  const deptList = COMPANY_DEPARTMENTS.join(" | ");

  // Keep prompt concise so the response fits within token limits
  const prompt = `Sos un asistente de RRHH. Analizá el CV y respondé ÚNICAMENTE con JSON válido, sin texto extra.

Puesto postulado: "${jobTitle}" | Departamento postulado: ${jobDepartment}

Departamentos de la empresa (elegí el que MEJOR se adapte al perfil real del candidato según su experiencia, independientemente del puesto al que postuló):
${deptList}

CV:
${cvText.slice(0, 3800)}

Respondé con exactamente este JSON (sin markdown, sin explicaciones):
{"summary":"resumen en 2 oraciones","skills":["skill1","skill2"],"yearsExperience":0,"educationLevel":"secundario","previousRoles":["rol1"],"previousCompanies":["empresa1"],"languages":["Español"],"highlights":["fortaleza1","fortaleza2"],"suggestedDepartment":"Sistemas","departmentConfidence":"alta"}

IMPORTANTE: suggestedDepartment debe ser exactamente uno de los departamentos listados. Si no hay suficiente info, usá "Otro" y departmentConfidence "baja".`;

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
        "X-Title": "DB Consulting - Portal de Postulaciones",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[openrouter] API error:", res.status, err);
      return null;
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
      usage?: { completion_tokens: number };
    };

    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    console.log(`[openrouter] Response (${data.usage?.completion_tokens ?? "?"} tokens):`, content.slice(0, 200));

    const profile = safeParseJson(content);
    if (!profile) {
      console.error("[openrouter] Could not parse JSON from response:", content.slice(0, 500));
      return null;
    }

    // The model's output is untrusted: coerce every field to the shape the app relies on.
    const strings = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, 40) : [];
    profile.summary = typeof profile.summary === "string" ? profile.summary.slice(0, 1200) : "";
    profile.skills = strings(profile.skills);
    profile.previousRoles = strings(profile.previousRoles);
    profile.previousCompanies = strings(profile.previousCompanies);
    profile.languages = strings(profile.languages);
    profile.highlights = strings(profile.highlights);
    profile.yearsExperience =
      typeof profile.yearsExperience === "number" && Number.isInteger(profile.yearsExperience) &&
      profile.yearsExperience >= 0 && profile.yearsExperience <= 60
        ? profile.yearsExperience
        : null;
    profile.educationLevel = typeof profile.educationLevel === "string" ? profile.educationLevel.slice(0, 60) : null;
    if (!["alta", "media", "baja"].includes(profile.departmentConfidence as string)) profile.departmentConfidence = null;
    profile.suggestedDepartment = COMPANY_DEPARTMENTS.includes(profile.suggestedDepartment as CompanyDepartment)
      ? profile.suggestedDepartment
      : null;
    return { summary: profile.summary, profile };
  } catch (e) {
    console.error("[openrouter] Failed:", e);
    return null;
  }
}
