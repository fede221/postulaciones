"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FileInput, FormError, Input, Select, Textarea } from "@/components/ui/input";

function FormSection({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? undefined : "border-t border-border pt-8"}>
      <h2 className="mb-4 text-sm font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function CvDropForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cv-drop", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });

      let data: { success?: boolean; error?: string } = {};
      try {
        data = (await res.json()) as { success?: boolean; error?: string };
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        setDone(true);
      } else if (data.error) {
        setError(data.error);
      } else if (res.status === 429) {
        setError("Demasiados intentos. Esperá unos minutos y volvé a probar.");
      } else {
        setError("Ocurrió un error. Intentá de nuevo.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center p-8 text-center sm:p-10">
        <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-border bg-background-secondary text-success">
          <CheckCircle2 className="size-6" strokeWidth={1.5} aria-hidden />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">CV recibido</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">
          Guardamos tu información. Nos ponemos en contacto con vos cuando surja una oportunidad acorde
          a tu perfil.
        </p>
        <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <ButtonLink href="/jobs" className="w-full sm:w-auto">
            Ver puestos disponibles
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" className="w-full sm:w-auto">
            Volver al inicio
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8">
      {/* Honeypot: los humanos no lo ven; si viene completo, el servidor lo descarta */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          No completar
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* 1. Datos personales */}
      <FormSection title="Datos personales" first>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre" hint="*" htmlFor="firstName">
            <Input id="firstName" name="firstName" required placeholder="Juan" autoComplete="given-name" />
          </Field>
          <Field label="Apellido" hint="*" htmlFor="lastName">
            <Input id="lastName" name="lastName" required placeholder="Pérez" autoComplete="family-name" />
          </Field>
          <Field label="Email" hint="*" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="juan@email.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Teléfono" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" placeholder="+54 11 1234-5678" autoComplete="tel" />
          </Field>
          <Field label="Ciudad / Localidad" htmlFor="city">
            <Input id="city" name="city" placeholder="Buenos Aires" autoComplete="address-level2" />
          </Field>
          <Field label="LinkedIn" htmlFor="linkedinUrl">
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/tu-perfil"
            />
          </Field>
        </div>
      </FormSection>

      {/* 2. Perfil profesional */}
      <FormSection title="Perfil profesional">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Años de experiencia" htmlFor="yearsExperience">
            <Select id="yearsExperience" name="yearsExperience">
              <option value="">Sin experiencia previa</option>
              <option value="1">1 año</option>
              <option value="2">2 años</option>
              <option value="3">3 años</option>
              <option value="5">4–5 años</option>
              <option value="7">6–8 años</option>
              <option value="10">9–10 años</option>
              <option value="15">Más de 10 años</option>
            </Select>
          </Field>
          <Field label="Nivel de estudios" htmlFor="educationLevel">
            <Select id="educationLevel" name="educationLevel">
              <option value="">Seleccioná...</option>
              <option value="secundario">Secundario completo</option>
              <option value="terciario">Terciario / Técnico</option>
              <option value="universitario_cursando">Universitario en curso</option>
              <option value="universitario">Universitario completo</option>
              <option value="posgrado">Posgrado / Maestría</option>
              <option value="doctorado">Doctorado</option>
            </Select>
          </Field>
          <Field label="Modalidad preferida" htmlFor="workMode">
            <Select id="workMode" name="workMode">
              <option value="">Seleccioná...</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
              <option value="remoto">Remoto</option>
              <option value="indiferente">Indiferente</option>
            </Select>
          </Field>
          <Field label="Disponibilidad para ingresar" htmlFor="availability">
            <Select id="availability" name="availability">
              <option value="">Seleccioná...</option>
              <option value="inmediata">Inmediata</option>
              <option value="2_semanas">En 2 semanas</option>
              <option value="1_mes">En 1 mes</option>
              <option value="2_meses">En 2 meses</option>
              <option value="a_convenir">A convenir</option>
            </Select>
          </Field>
          <Field
            label="Pretensión salarial"
            hint="(bruta mensual, opcional)"
            htmlFor="salaryExpectation"
            className="sm:col-span-2"
          >
            <Input
              id="salaryExpectation"
              name="salaryExpectation"
              placeholder='Ej: $800.000 – $1.000.000 o "A convenir"'
            />
          </Field>
          <Field
            label="Habilidades y tecnologías"
            hint="(separá con comas)"
            help="Incluí herramientas, lenguajes, certificaciones o cualquier habilidad relevante."
            htmlFor="skills"
            className="sm:col-span-2"
          >
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              placeholder="Ej: Excel, SAP, Manipulación de alimentos, HACCP, Montacargas, Frío, Conducción, Torno, Liquidación de sueldos..."
            />
          </Field>
        </div>
      </FormSection>

      {/* 3. CV */}
      <FormSection title="Curriculum Vitae">
        <Field label="Adjuntar CV" hint="(PDF, DOC, DOCX, máx. 5 MB)" htmlFor="cv">
          <FileInput id="cv" name="cv" accept=".pdf,.doc,.docx" />
        </Field>
      </FormSection>

      {/* 4. Presentación */}
      <FormSection title="Presentación">
        <Field
          label="¿A qué área apuntás o qué tipo de trabajo buscás?"
          hint="(opcional)"
          htmlFor="coverLetter"
        >
          <Textarea
            id="coverLetter"
            name="coverLetter"
            rows={5}
            placeholder="Contanos sobre vos, qué área te interesa y qué tipo de rol estás buscando..."
          />
        </Field>
      </FormSection>

      <FormError>{error}</FormError>

      <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto sm:flex-1">
          {loading ? "Enviando..." : "Enviar CV"}
        </Button>
        <ButtonLink href="/jobs" variant="secondary" size="lg" className="w-full sm:w-auto">
          Volver a puestos
        </ButtonLink>
      </div>
    </form>
  );
}
