const SYNONYMS: Record<string, string[]> = {
  // ─── Gastronomía / Producción cocina ────────────────────────────────────────
  gastronomia: ["cocina", "chef", "cocinero", "culinario", "pastelero", "panadero", "alimentos", "cocido"],
  gastronomía: ["cocina", "chef", "cocinero", "culinario", "pastelero", "panadero", "alimentos"],
  cocina: ["gastronomia", "chef", "cocinero", "culinario", "pastelero", "panadero"],
  chef: ["cocinero", "gastronomia", "cocina", "culinario", "pastelero"],
  cocinero: ["chef", "gastronomia", "cocina", "culinario", "asador"],
  pastelero: ["pastelería", "panadero", "repostero", "cocina", "gastronomia"],
  panadero: ["pastelero", "panadería", "cocina", "gastronomia"],
  culinario: ["chef", "cocinero", "cocina", "gastronomia"],
  asador: ["parrillero", "cocinero", "chef", "cocina"],
  mozo: ["camarero", "servicio", "salón", "atención al cliente", "gastronómico"],
  camarero: ["mozo", "servicio", "salón", "gastronómico"],

  // ─── Planta de desposte ──────────────────────────────────────────────────────
  desposte: ["planta", "carnicero", "deshuesado", "corte", "frigorífico", "cárnico", "faena"],
  deshuesado: ["desposte", "carnicero", "corte", "cárnico"],
  carnicero: ["desposte", "deshuesado", "corte", "cárnico", "frigorífico"],
  frigorífico: ["desposte", "planta", "cárnico", "faena"],
  frigorifico: ["desposte", "planta", "cárnico", "faena"],
  "cárnico": ["desposte", "carnicero", "frigorífico", "planta"],
  carnico: ["desposte", "carnicero", "frigorifico", "planta"],
  "planta de desposte": ["desposte", "frigorífico", "cárnico", "producción"],
  faena: ["desposte", "frigorífico", "cárnico"],

  // ─── Operaciones ─────────────────────────────────────────────────────────────
  operaciones: ["producción", "planta", "proceso", "manufactura", "crudo", "cocido"],
  producción: ["operaciones", "planta", "proceso", "manufactura"],
  produccion: ["operaciones", "planta", "proceso", "manufactura"],
  crudo: ["operaciones crudo", "planta", "producción", "procesamiento", "desposte"],
  cocido: ["operaciones cocido", "cocina", "gastronomia", "producción"],
  manufactura: ["producción", "operaciones", "planta", "proceso"],
  proceso: ["producción", "operaciones", "planta", "manufactura"],

  // ─── Calidad ─────────────────────────────────────────────────────────────────
  calidad: ["quality", "qa", "bromatología", "inocuidad", "normas", "certificación", "haccp", "control calidad"],
  quality: ["calidad", "qa", "bromatología", "inocuidad", "normas", "haccp"],
  qa: ["calidad", "quality", "testing", "control calidad", "inocuidad"],
  bromatología: ["calidad", "inocuidad", "alimentos", "higiene alimentaria", "habilitaciones"],
  bromatologia: ["calidad", "inocuidad", "alimentos", "higiene alimentaria"],
  inocuidad: ["calidad", "bromatología", "haccp", "higiene alimentaria", "alimentos"],
  haccp: ["inocuidad", "calidad", "bromatología", "normas", "seguridad alimentaria"],
  "control de calidad": ["calidad", "qa", "quality", "inocuidad", "bromatología"],
  certificación: ["calidad", "normas", "iso", "haccp", "auditoría"],
  iso: ["calidad", "certificación", "normas", "auditoría"],

  // ─── Seguridad e Higiene ─────────────────────────────────────────────────────
  seguridad: ["higiene", "sha", "she", "hsec", "prevención", "riesgos", "sso", "epp", "seguridad laboral"],
  higiene: ["seguridad", "sha", "limpieza", "sanidad", "inocuidad", "she"],
  sha: ["seguridad", "higiene", "she", "prevención", "hsec", "seguridad e higiene"],
  she: ["seguridad", "higiene", "sha", "hsec", "prevención"],
  hsec: ["seguridad", "higiene", "sha", "she", "prevención", "medioambiente"],
  "seguridad e higiene": ["sha", "she", "hsec", "seguridad", "higiene", "prevención"],
  prevención: ["seguridad", "sha", "she", "riesgos", "accidentes", "hsec"],
  riesgos: ["seguridad", "prevención", "sha", "accidentes", "epp"],
  epp: ["seguridad", "sha", "prevención", "equipos de protección"],
  sso: ["seguridad", "sha", "she", "salud ocupacional", "prevención"],
  "salud ocupacional": ["sso", "sha", "seguridad", "medicina laboral"],

  // ─── Mantenimiento ───────────────────────────────────────────────────────────
  mantenimiento: ["técnico", "electricista", "infraestructura", "plomero", "reparaciones", "instalaciones", "servicio técnico"],
  técnico: ["mantenimiento", "electricista", "electrónico", "servicio técnico", "taller"],
  tecnico: ["mantenimiento", "electricista", "electrónico", "servicio técnico"],
  electricista: ["eléctrico", "mantenimiento", "técnico", "instalaciones"],
  plomero: ["sanitario", "mantenimiento", "técnico", "instalaciones"],
  reparaciones: ["mantenimiento", "técnico", "taller", "servicio técnico"],
  instalaciones: ["mantenimiento", "técnico", "electricista", "infraestructura"],
  infraestructura: ["mantenimiento", "técnico", "instalaciones", "sistemas", "it"],

  // ─── Logística ───────────────────────────────────────────────────────────────
  logística: ["depósito", "almacén", "distribución", "expedición", "inventario", "stock", "cadena de frío", "flete", "transporte"],
  logistica: ["depósito", "almacén", "distribución", "expedición", "inventario", "stock"],
  "depósito": ["logística", "almacén", "stock", "inventario", "expedición"],
  deposito: ["logística", "almacén", "stock", "inventario", "expedición"],
  "almacén": ["logística", "depósito", "stock", "inventario"],
  almacen: ["logística", "depósito", "stock", "inventario"],
  distribución: ["logística", "transporte", "expedición", "flete", "reparto"],
  distribucion: ["logística", "transporte", "expedición", "flete", "reparto"],
  expedición: ["logística", "distribución", "despacho", "depósito"],
  expedicion: ["logística", "distribución", "despacho", "depósito"],
  inventario: ["stock", "logística", "depósito", "almacén"],
  stock: ["inventario", "logística", "depósito", "almacén"],
  transporte: ["logística", "distribución", "flete", "chofer", "camión"],
  flete: ["transporte", "logística", "distribución", "camión"],
  chofer: ["transporte", "logística", "distribución", "camión"],
  "cadena de frio": ["logística", "refrigeración", "frigorífico", "temperatura"],
  "cadena de frío": ["logística", "refrigeración", "frigorífico", "temperatura"],
  refrigeración: ["cadena de frío", "logística", "frigorífico", "temperatura"],

  // ─── Taller Mecánico ─────────────────────────────────────────────────────────
  taller: ["mecánico", "automotor", "flota", "vehículos", "reparación", "mantenimiento vehicular"],
  "mecánico": ["taller", "automotor", "flota", "vehículos", "mantenimiento"],
  mecanico: ["taller", "automotor", "flota", "vehículos", "mantenimiento"],
  automotor: ["taller", "mecánico", "flota", "vehículos"],
  flota: ["taller", "automotor", "vehículos", "mecánico", "camiones", "transporte"],
  "vehículos": ["taller", "mecánico", "automotor", "flota"],
  vehiculos: ["taller", "mecánico", "automotor", "flota"],
  "taller mecánico": ["mecánico", "taller", "automotor", "flota", "mantenimiento vehicular"],
  "taller mecanico": ["mecánico", "taller", "automotor", "flota"],

  // ─── Sistemas / IT ───────────────────────────────────────────────────────────
  sistemas: ["it", "tech", "tecnología", "soporte", "informática", "redes", "software", "hardware", "developer"],
  it: ["sistemas", "tech", "tecnología", "soporte", "informática", "redes", "developer"],
  tech: ["tecnología", "it", "sistemas", "infraestructura", "devops", "cloud", "developer"],
  tecnología: ["tech", "it", "sistemas", "infraestructura"],
  tecnologia: ["tech", "it", "sistemas", "infraestructura"],
  "informática": ["sistemas", "it", "tech", "soporte", "redes"],
  informatica: ["sistemas", "it", "tech", "soporte", "redes"],
  soporte: ["sistemas", "it", "helpdesk", "mesa de ayuda", "técnico"],
  helpdesk: ["soporte", "sistemas", "it", "mesa de ayuda"],
  redes: ["sistemas", "it", "infraestructura", "networking", "soporte"],
  dev: ["desarrollador", "developer", "programador", "sistemas", "it", "software"],
  developer: ["dev", "desarrollador", "programador", "sistemas", "it"],
  desarrollador: ["dev", "developer", "programador", "software", "engineer", "ingeniero"],
  programador: ["dev", "developer", "desarrollador", "software"],
  engineer: ["desarrollador", "dev", "developer", "ingeniero"],
  ingeniero: ["engineer", "desarrollador", "dev"],
  software: ["sistemas", "it", "developer", "desarrollador", "programador"],
  devops: ["infraestructura", "cloud", "aws", "azure", "docker", "sistemas"],
  data: ["datos", "analytics", "análisis", "bi", "business intelligence"],
  datos: ["data", "analytics", "análisis", "bi"],
  analytics: ["data", "datos", "análisis", "bi", "métricas"],
  bi: ["business intelligence", "data", "análisis", "reportes", "kpi"],
  "business intelligence": ["bi", "data", "analytics", "reportes", "kpi"],

  // ─── Control de Gestión ──────────────────────────────────────────────────────
  "control de gestión": ["controlling", "presupuesto", "forecast", "kpi", "reportes", "tablero", "análisis"],
  "control de gestion": ["controlling", "presupuesto", "forecast", "kpi", "reportes", "tablero"],
  controlling: ["control de gestión", "presupuesto", "forecast", "kpi", "análisis"],
  presupuesto: ["controlling", "control de gestión", "forecast", "finanzas", "budget"],
  forecast: ["presupuesto", "controlling", "proyección", "planificación", "kpi"],
  kpi: ["métricas", "indicadores", "control de gestión", "controlling", "reportes"],
  "métricas": ["kpi", "indicadores", "analytics", "data", "reportes"],
  metricas: ["kpi", "indicadores", "analytics", "data", "reportes"],
  reportes: ["control de gestión", "kpi", "controlling", "análisis", "tablero", "bi"],
  tablero: ["dashboard", "kpi", "reportes", "control de gestión", "bi"],
  dashboard: ["tablero", "kpi", "reportes", "control de gestión", "bi"],
  gestión: ["control de gestión", "administración", "management", "gerencia"],
  gestion: ["control de gestión", "administración", "management", "gerencia"],

  // ─── Pago a Proveedores / Compras ────────────────────────────────────────────
  "pago a proveedores": ["cuentas a pagar", "ap", "proveedores", "facturas", "tesorería", "compras"],
  proveedores: ["pago a proveedores", "cuentas a pagar", "compras", "abastecimiento", "ap"],
  "cuentas a pagar": ["pago a proveedores", "ap", "proveedores", "facturas"],
  ap: ["cuentas a pagar", "pago a proveedores", "proveedores"],
  compras: ["proveedores", "abastecimiento", "pago a proveedores", "adquisiciones"],
  abastecimiento: ["compras", "proveedores", "logística", "stock", "adquisiciones"],
  facturas: ["facturación", "pago a proveedores", "contabilidad", "impuestos", "ap"],
  facturación: ["facturas", "contabilidad", "impuestos", "pago a proveedores"],
  facturacion: ["facturas", "contabilidad", "impuestos", "pago a proveedores"],

  // ─── Tesorería ───────────────────────────────────────────────────────────────
  "tesorería": ["finanzas", "caja", "bancos", "flujo de fondos", "pagos", "cobros", "cobranzas"],
  tesoreria: ["finanzas", "caja", "bancos", "flujo de fondos", "pagos", "cobros"],
  caja: ["tesorería", "bancos", "pagos", "cobros", "efectivo"],
  bancos: ["tesorería", "caja", "finanzas", "pagos", "transferencias"],
  cobranzas: ["tesorería", "cobros", "cuentas a cobrar", "finanzas"],
  cobros: ["cobranzas", "tesorería", "cuentas a cobrar", "finanzas"],
  "flujo de fondos": ["tesorería", "caja", "finanzas", "cashflow"],
  cashflow: ["flujo de fondos", "tesorería", "caja", "finanzas"],
  pagos: ["tesorería", "caja", "pago a proveedores", "finanzas"],

  // ─── Contabilidad / Finanzas ─────────────────────────────────────────────────
  contabilidad: ["finanzas", "finance", "contador", "impuestos", "balance", "registraciones"],
  finanzas: ["finance", "contabilidad", "contador", "tesorería", "presupuesto"],
  finance: ["finanzas", "contabilidad", "contador", "tesorería"],
  contador: ["contabilidad", "finanzas", "impuestos", "auditoría", "balance"],
  impuestos: ["contabilidad", "contador", "afip", "iva", "fiscal"],
  afip: ["impuestos", "contabilidad", "fiscal", "iva", "ganancias"],
  "auditoría": ["contador", "contabilidad", "control", "finanzas", "revisión"],
  auditoria: ["contador", "contabilidad", "control", "finanzas"],
  balance: ["contabilidad", "finanzas", "estados contables", "contador"],
  iva: ["impuestos", "contabilidad", "afip", "fiscal"],
  fiscal: ["impuestos", "contabilidad", "afip", "contador"],
  "registraciones": ["contabilidad", "balance", "contador", "asientos"],

  // ─── RRHH ────────────────────────────────────────────────────────────────────
  rrhh: ["recursos humanos", "hr", "people", "talento", "selección", "liquidación", "sueldos", "payroll"],
  "recursos humanos": ["rrhh", "hr", "people", "talento", "selección", "liquidación"],
  hr: ["rrhh", "recursos humanos", "people", "talento", "selección"],
  people: ["rrhh", "hr", "recursos humanos", "talento"],
  talento: ["rrhh", "hr", "selección", "recruitment", "people"],
  selección: ["rrhh", "hr", "recruitment", "reclutamiento", "headhunting", "entrevistas"],
  recruitment: ["selección", "rrhh", "hr", "reclutamiento", "headhunting"],
  reclutamiento: ["selección", "rrhh", "hr", "recruitment", "headhunting"],
  liquidación: ["sueldos", "payroll", "haberes", "rrhh", "recursos humanos"],
  sueldos: ["liquidación", "payroll", "haberes", "rrhh"],
  payroll: ["liquidación", "sueldos", "haberes", "rrhh", "recursos humanos"],
  haberes: ["sueldos", "liquidación", "payroll", "rrhh"],
  capacitación: ["formación", "training", "rrhh", "desarrollo organizacional"],
  training: ["capacitación", "formación", "rrhh", "desarrollo organizacional"],

  // ─── Comercial / Ventas ──────────────────────────────────────────────────────
  comercial: ["ventas", "sales", "clientes", "cuenta", "ejecutivo", "negocio", "account", "crm"],
  ventas: ["comercial", "sales", "clientes", "ejecutivo", "negocio", "account"],
  sales: ["ventas", "comercial", "clientes", "account", "negocio"],
  clientes: ["comercial", "ventas", "atención al cliente", "crm", "account"],
  account: ["comercial", "ventas", "ejecutivo de cuentas", "clientes"],
  crm: ["comercial", "ventas", "clientes", "account"],
  "atención al cliente": ["clientes", "comercial", "ventas", "soporte", "servicio al cliente"],
  marketing: ["mkt", "digital", "comunicación", "publicidad", "brand", "comercial"],
  mkt: ["marketing", "digital", "comunicación", "publicidad"],

  // ─── Administración ──────────────────────────────────────────────────────────
  administración: ["admin", "backoffice", "gestión", "asistente", "secretaria", "administrativo"],
  administracion: ["admin", "backoffice", "gestión", "asistente", "administrativo"],
  admin: ["administración", "backoffice", "gestión", "asistente"],
  administrativo: ["administración", "admin", "backoffice", "asistente"],
  asistente: ["administración", "admin", "secretaria", "recepcionista"],
  secretaria: ["asistente", "administración", "recepcionista"],
  recepcionista: ["asistente", "secretaria", "administración", "atención al cliente"],

  // ─── Legal ───────────────────────────────────────────────────────────────────
  legal: ["abogado", "jurídico", "compliance", "derecho", "asesor legal"],
  abogado: ["legal", "jurídico", "compliance", "derecho"],
  "jurídico": ["legal", "abogado", "compliance", "derecho"],
  juridico: ["legal", "abogado", "compliance", "derecho"],
  compliance: ["legal", "abogado", "normativa", "regulatorio"],

  // ─── Niveles / seniority ─────────────────────────────────────────────────────
  senior: ["sr", "sénior", "experto", "lead", "líder"],
  sr: ["senior", "sénior", "experto", "lead"],
  "sénior": ["senior", "sr", "experto", "lead"],
  junior: ["jr", "entry", "trainee", "aprendiz", "pasante", "ingresante"],
  jr: ["junior", "entry", "trainee", "ingresante"],
  pasante: ["junior", "jr", "trainee", "practicante", "pasantía"],
  trainee: ["junior", "jr", "pasante", "aprendiz", "ingresante"],
  ingresante: ["junior", "jr", "trainee", "pasante"],
  lead: ["líder", "lider", "sr", "jefe", "responsable"],
  jefe: ["supervisor", "responsable", "lead", "gerente", "encargado"],
  supervisor: ["jefe", "encargado", "responsable", "lead"],
  encargado: ["supervisor", "jefe", "responsable", "coordinador"],
  coordinador: ["encargado", "supervisor", "jefe", "gestión"],
  gerente: ["jefe", "manager", "director", "responsable"],
  manager: ["gerente", "jefe", "director", "responsable"],
  director: ["gerente", "manager", "jefe"],

  // ─── Modalidad ───────────────────────────────────────────────────────────────
  remoto: ["remote", "trabajo remoto", "home office", "teletrabajo"],
  remote: ["remoto", "trabajo remoto", "home office", "teletrabajo"],
  "home office": ["remoto", "remote", "teletrabajo"],
  "híbrido": ["hibrido", "remoto", "presencial", "mixto"],
  hibrido: ["híbrido", "remoto", "presencial", "mixto"],
  presencial: ["híbrido", "oficina", "planta"],
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

  // Also try multi-word lookups (e.g. "control de gestión", "pago a proveedores")
  const fullQuery = query.trim().toLowerCase();
  if (fullQuery.includes(" ")) {
    expanded.add(fullQuery);
    const multiSyns = SYNONYMS[fullQuery];
    if (multiSyns) multiSyns.forEach((s) => expanded.add(s));
  }

  return Array.from(expanded);
}
