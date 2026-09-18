# Portal de Postulaciones — DB Consulting

Portal de selección de personal: sitio público de vacantes + panel admin para RRHH.
Stack: Next.js 16 (App Router), React 19, Tailwind 4, Prisma 7 + MariaDB, NextAuth (credenciales), OpenRouter para análisis de CV.

## Reglas de diseño y UI

Las dos skills de diseño son de un tercero y no se versionan. Para tenerlas en tu copia, copiá las
carpetas `apple-design` y `pick-ui-library` de https://github.com/emilkowalski/skills (en `skills/`)
a `.claude/skills/` de este proyecto.

- **Antes de agregar cualquier dependencia de UI**, consultar la skill `pick-ui-library`
  (`.claude/skills/pick-ui-library/SKILL.md`). No salirse de su lista salvo que la tarea
  genuinamente no esté cubierta.
- **La skill `apple-design`** (`.claude/skills/apple-design/SKILL.md`) se aplica así:
  - Completa (springs, interruptibilidad, velocity handoff, rubber-banding) en superficies
    gestuales: Kanban de candidatos, drawer lateral, sheets en mobile.
  - Solo sus fundamentos, tipografía, feedback y reduced-motion en el resto del panel:
    es una herramienta de productividad, la moderación manda.
- Idioma de toda la UI: español rioplatense (voseo).
- Tokens, primitivas y reglas visuales (paleta pastel, radios, sombras, animaciones): ver `DESIGN.md`.

## Convenciones

- Los CVs subidos son datos personales sensibles: **nunca** deben quedar accesibles sin
  sesión de admin (nada dentro de `public/`).
- Las rutas API bajo `/api/admin/*` siempre validan sesión con `getServerSession(authOptions)`.
- Migraciones con `npm run db:migrate`; seed explícito con `npm run db:seed` (nunca en runtime).
