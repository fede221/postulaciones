// Mapa de sinónimos para búsqueda inteligente
const SYNONYMS: Record<string, string[]> = {
  dev: ["desarrollador", "developer", "programador", "software", "engineer", "ingeniero"],
  developer: ["dev", "desarrollador", "programador", "software", "engineer"],
  desarrollador: ["dev", "developer", "programador", "software", "engineer", "ingeniero"],
  programador: ["dev", "developer", "desarrollador", "software"],
  engineer: ["desarrollador", "dev", "developer", "ingeniero"],
  ingeniero: ["engineer", "desarrollador", "dev"],
  frontend: ["front", "ui", "react", "vue", "angular", "web"],
  backend: ["back", "api", "servidor", "server", "node", "python", "java"],
  fullstack: ["full stack", "full-stack", "fullstack", "frontend", "backend"],
  ux: ["diseño", "design", "ui", "experiencia", "usabilidad", "producto"],
  ui: ["diseño", "design", "ux", "interfaz", "frontend", "visual"],
  diseño: ["design", "ux", "ui", "creativo", "visual", "gráfico"],
  design: ["diseño", "ux", "ui", "creativo", "visual"],
  marketing: ["mkt", "digital", "comunicación", "publicidad", "brand", "branding", "contenidos"],
  mkt: ["marketing", "digital", "comunicación", "publicidad"],
  rrhh: ["recursos humanos", "hr", "people", "talento", "selección", "recruitment"],
  "recursos humanos": ["rrhh", "hr", "people", "talento", "selección"],
  hr: ["rrhh", "recursos humanos", "people", "talento", "selección"],
  people: ["rrhh", "hr", "recursos humanos", "talento"],
  ventas: ["sales", "comercial", "negocio", "account", "ejecutivo"],
  sales: ["ventas", "comercial", "negocio", "account"],
  comercial: ["ventas", "sales", "negocio"],
  admin: ["administración", "backoffice", "gestión", "asistente"],
  administración: ["admin", "backoffice", "gestión", "asistente"],
  tech: ["tecnología", "it", "sistemas", "infraestructura", "devops", "cloud"],
  tecnología: ["tech", "it", "sistemas", "infraestructura"],
  it: ["tech", "tecnología", "sistemas", "infraestructura"],
  sistemas: ["it", "tech", "tecnología", "infraestructura"],
  devops: ["infraestructura", "cloud", "aws", "azure", "docker", "kubernetes"],
  data: ["datos", "analytics", "análisis", "bi", "business intelligence", "ciencia"],
  datos: ["data", "analytics", "análisis", "bi"],
  analytics: ["data", "datos", "análisis", "bi", "métricas"],
  finanzas: ["finance", "contabilidad", "contador", "tesorería", "cfo"],
  finance: ["finanzas", "contabilidad", "contador", "tesorería"],
  contabilidad: ["finanzas", "finance", "contador", "impuestos"],
  legal: ["abogado", "jurídico", "compliance", "derecho", "asesor"],
  abogado: ["legal", "jurídico", "compliance", "derecho"],
  senior: ["sr", "sénior", "experto", "lead", "líder"],
  sr: ["senior", "sénior", "experto", "lead"],
  sénior: ["senior", "sr", "experto", "lead"],
  junior: ["jr", "entry", "trainee", "aprendiz", "pasante"],
  jr: ["junior", "entry", "trainee"],
  pasante: ["junior", "jr", "trainee", "practicante", "pasantía"],
  remoto: ["remote", "trabajo remoto", "home office", "teletrabajo", "híbrido"],
  remote: ["remoto", "trabajo remoto", "home office", "teletrabajo"],
  "home office": ["remoto", "remote", "teletrabajo"],
  proyecto: ["project", "pm", "product", "scrum", "agile"],
  product: ["producto", "pm", "project", "ux", "manager"],
  producto: ["product", "pm", "project", "ux"],
  soporte: ["support", "helpdesk", "mesa de ayuda", "técnico", "atención"],
  support: ["soporte", "helpdesk", "mesa de ayuda", "técnico"],
  qa: ["testing", "calidad", "tester", "quality", "automatización"],
  testing: ["qa", "calidad", "tester", "quality", "automatización"],
};

export function expandQuery(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const expanded = new Set<string>();

  for (const token of tokens) {
    expanded.add(token);
    const syns = SYNONYMS[token];
    if (syns) syns.forEach((s) => expanded.add(s));
  }

  // Also add the original full query
  if (query.trim().length >= 2) expanded.add(query.trim().toLowerCase());

  return Array.from(expanded);
}
