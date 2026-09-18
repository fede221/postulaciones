import { requiredString } from "./adminApi";

/** Validates and normalizes the editable fields of a job posting. */
export function parseJobFields(body: Record<string, unknown>) {
  return {
    title: requiredString(body.title, "Título del puesto", 191),
    department: requiredString(body.department, "Área", 191),
    location: requiredString(body.location, "Ubicación", 191),
    type: requiredString(body.type, "Tipo de contrato", 191),
    description: requiredString(body.description, "Descripción", 20000),
    requirements: requiredString(body.requirements, "Requisitos", 20000),
  };
}
