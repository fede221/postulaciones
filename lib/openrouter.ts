const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-5:free";

export interface AiProfile {
  summary: string;
  skills: string[];
  yearsExperience: number | null;
  educationLevel: string | null;
  previousRoles: string[];
  previousCompanies: string[];
  languages: string[];
  highlights: string[];
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

  const prompt = `Sos un asistente de RRHH. Analizá el siguiente CV y respondé SOLO con un JSON válido, sin texto adicional ni markdown.

El candidato se postuló para el puesto: "${jobTitle}" (departamento: ${jobDepartment}).

CV:
---
${cvText.slice(0, 6000)}
---

Respondé con este JSON exacto:
{
  "summary": "Resumen ejecutivo del candidato en 2-3 oraciones en español, enfocado en su relevancia para el puesto",
  "skills": ["lista", "de", "habilidades", "técnicas", "y", "blandas", "detectadas"],
  "yearsExperience": número_total_de_años_de_experiencia_o_null,
  "educationLevel": "uno de: secundario | terciario | universitario_cursando | universitario | posgrado | doctorado | null",
  "previousRoles": ["cargo anterior 1", "cargo anterior 2"],
  "previousCompanies": ["empresa 1", "empresa 2"],
  "languages": ["Español", "Inglés"],
  "highlights": ["punto fuerte 1", "punto fuerte 2", "punto fuerte 3"]
}`;

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
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[openrouter] API error:", res.status, err);
      return null;
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Strip possible markdown code fences
    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const profile = JSON.parse(jsonStr) as AiProfile;

    return { summary: profile.summary, profile };
  } catch (e) {
    console.error("[openrouter] Failed to analyze CV:", e);
    return null;
  }
}
