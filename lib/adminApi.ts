import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Thrown by handlers/validators to answer 400 with a user-facing message. */
export class BadRequest extends Error {}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<NextResponse>;

/**
 * Wraps an admin route handler: validates the session, and turns failures into clean
 * JSON answers (400 for bad input, 404 for a missing record, 500 without internals).
 */
export function adminRoute<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof BadRequest) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2025") {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      console.error(`[admin-api] ${req.method} ${req.nextUrl.pathname}`, e);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  };
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequest("El cuerpo de la solicitud no es JSON válido.");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new BadRequest("El cuerpo de la solicitud no es válido.");
  }
  return body as Record<string, unknown>;
}

/** Required trimmed string within `max` characters. */
export function requiredString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || !value.trim()) throw new BadRequest(`Falta completar: ${label}.`);
  const v = value.trim();
  if (v.length > max) throw new BadRequest(`${label} es demasiado largo (máx. ${max} caracteres).`);
  return v;
}

export function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new BadRequest("Valor booleano inválido.");
}
