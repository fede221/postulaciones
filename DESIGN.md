# Sistema de diseño — Portal de Postulaciones

Estética suave y cálida, inspirada en apps móviles modernas: lienzo salvia con degradé sutil,
superficies blancas con sombra difusa, tinta carbón (no negro puro), **esquinas muy redondeadas**
(botones pastilla, cards 20px, paneles 28px) y una paleta **pastel** para etiquetas, avatares,
KPIs y gráficos. Light es el default; dark usa carbón cálido con los mismos pasteles profundizados.

## Pasteles (tokens `bg-<tono>` + `text-<tono>-fg`)

`mint` · `pink` · `lemon` · `sky` · `peach` · `lavender`. Para etiquetas de texto libre (departamentos,
tags) usar `toneFor(label)` de `components/ui/badge.tsx`, que asigna un pastel estable por nombre.
Estados de postulación: pendiente = lemon, en revisión = sky, aceptado = mint, rechazado = pink,
espontáneo = lavender (ya resuelto en `StatusBadge`). Los pasteles son decorativo-semánticos; los
colores `success/warning/danger` quedan solo para puntos de estado y mensajes de error.

## Superficies

- Lienzo de página: `bg-canvas` (lo pone `body`; **no** pintar fondos de sección con `bg-background`).
- Cards / inputs / tablas: `bg-background` (blanco) + `shadow-soft`; hover con clase `lift` (elevación de 2px).
- Bloques destacados: `bg-inverse text-inverse-foreground rounded-2xl` (carbón) o `bg-mint text-mint-fg`.
- Sidebar del admin: carbón (`bg-sidebar`), item activo con icono en círculo claro.

## Tokens (usar SIEMPRE las clases de token, nunca colores Tailwind crudos como `slate-*`, `blue-*`)

| Uso | Clase |
|---|---|
| Fondo de página | `bg-background` |
| Fondo secundario (cabeceras de tabla, footers de card, zonas suaves) | `bg-background-secondary` |
| Fondo hover / chip suave | `bg-muted`, hover `bg-muted-hover` |
| Texto principal | `text-foreground` |
| Texto secundario | `text-foreground-muted` |
| Texto terciario / placeholders / metadatos | `text-foreground-subtle` |
| Bordes | `border-border`, hover `border-border-strong` |
| Botón primario / superficie invertida | `bg-inverse text-inverse-foreground` |
| Señales de estado | `text-success` / `text-warning` / `text-danger` (y `bg-*/10` para fondos suaves) |
| Radios | `rounded-full` (botones, chips, avatares), `rounded-md` (14px: inputs), `rounded-lg` (20px: cards), `rounded-2xl`/`3xl` (28–32px: paneles, sidebar) |
| Números alineados | clase `tabular` |
| Fuente | **Manrope** (sans, cuerpo y UI) por defecto; **Fraunces** (serif variable) en `h1`/`h2` automáticamente y vía `font-display`; `font-mono` (Geist Mono) para ids, fechas técnicas, código |

## Primitivas (`components/ui/*`) — usarlas, no reinventar

- `Button` / `ButtonLink` (`variant`: primary | secondary | ghost | danger; `size`: sm | md | lg | icon; prop `loading`)
- `Badge` (`variant`: outline | solid | inverse; `dot`: neutral | foreground | success | warning | danger)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`, `Select`, `Textarea`, `FileInput`, `Label`, `Field` (label + hint + help), `FormError`
- `PageHeader` (title, description, actions), `SectionTitle`, `Eyebrow`
- `EmptyState` (icon lucide, title, description, action)
- `Stat` (KPI: label, value, icon, href, hint)
- `Table`, `THead`, `TBody`, `TR` (prop `interactive`), `TH`, `TD`
- `Segmented` (filtros por link: items `{label, href, active, count?}`)
- `Collapsible` (open) — animación de altura
- `Sheet` (drawer lateral con overlay; open, onClose, side, title, width)
- `Avatar` (name, size)
- `ThemeToggle`, `Toaster` (usar `toast` de `sonner` para feedback de acciones)
- `Logo` (`components/Logo.tsx`)
- Admin: `StatusBadge` + `STATUS_OPTIONS` en `app/admin/(panel)/applications/StatusBadge.tsx`
- CVs: `cvUrl(cvPath)` de `lib/cvStorage.ts` devuelve la URL autenticada. **Nunca** enlazar `cvPath` directo.

## Movimiento y efectos (`components/fx/*`)

- `Reveal` (entrada al scrollear: fade + subida + desenfoque; `delay` para escalonar hermanos) y `SplitWords`
  (titular palabra por palabra, `accent` marca la palabra en itálica expresiva `font-display-wonk`). Con
  `motion/react`; renderizan el mismo DOM en servidor y cliente, y con reduced-motion aparecen al instante.
- `Marquee`: ticker editorial en serif itálica, pausa al hover.
- `HeroShader`: malla de color tipo "mesh drift" en WebGL (blobs gaussianos que orbitan, warp suave, grano y
  brillo bajo el cursor). Colores desde los tokens `--shader-1..4` + `--canvas`; el campo está desplazado a la
  derecha (`offsetX`). Solo para el hero, a fondo abierto y fundido hacia abajo con máscara.
- Hover de cards (`.lift`): el brillo es un pseudo-elemento cuya **opacidad** se anima (700ms) — nunca animar
  un `background-image`, salta. El color es `--glow`, que por defecto es `currentColor`: en una card pastel
  brilla en su propio tono. En cards blancas que representan un tono, pasar
  `style={{ "--glow": "var(--<tono>-fg)" }}`.
- Botón flecha redondo: clase `arrow-btn` (disco carbón; en hover solo se ilumina; la flecha rota 45° con `group-hover:rotate-45`).
- Cuándo animar: entradas de sección, números, hero y decorativos. **Nunca** mover elementos en hover.
- Navbar pública: se convierte en píldora flotante con blur al scrollear más de 24px.

## Overrides de clases (importante)

`cn()` es `clsx` a secas: si pasás por `className` una utilidad que compite con la de una variante
(`bg-*`, `text-*`, `border-*`, `h-*`, `p-*`), **se aplican las dos y gana la que esté después en el CSS**, no la
tuya. Esto ya causó un botón invisible. Reglas: (1) para otro aspecto, agregá una **variante** al componente
(`inverted`, `outline-inverted`…); (2) para un ajuste puntual de tamaño/espaciado, usá el sufijo importante de
Tailwind 4: `h-9!`, `px-2!`, `border-0!`.

## Reglas

1. **Cero emojis** en la UI. Iconos: `lucide-react`, `strokeWidth={1.5}`–`1.75`, tamaño `size-4` (16px) en línea, `size-5` en cabeceras.
2. **Cero colores Tailwind crudos** (`blue-500`, `slate-100`…): solo tokens y pasteles. Sombras únicamente `shadow-soft` / `shadow-lift`.
3. Tipografía: títulos de página `text-2xl font-semibold tracking-tight`; títulos de sección `text-sm font-medium`;
   cuerpo `text-sm`; metadatos `text-xs text-foreground-subtle`; labels `text-[13px] font-medium`.
4. Espaciado consistente: gaps de 2/3/4/6/8; padding de cards `p-5`; secciones separadas por `space-y-8` o `gap-8`.
5. **Hover nunca mueve nada**: solo ilumina (degradé sutil), cambia color o colorea el borde. Cards clickeables usan `lift` (sombra + tinte menta); botones primarios tienen un brillo superior que se intensifica. Prohibido `translate`/`scale` en hover. Duraciones 150–250ms con `ease-out-expo`.
13. Marca: wordmark tipográfico `Wordmark` (`components/Logo.tsx`), sin emblema ni cuadrado.
14. KPIs: `Stat` con `tone` pinta toda la tarjeta en pastel — ícono en burbuja blanca arriba a la izquierda, número grande a la derecha, etiqueta abajo, `chart={<MiniBars/>}` opcional en el medio.
6. Animaciones solo donde sirven: Collapsible (expandir), Sheet (drawer), `animate-in` al montar una página. Respetar `prefers-reduced-motion` (ya global).
7. Formularios: `Field` + primitiva; errores con `FormError`; botón de envío con `loading`. Ancho máximo de formularios `max-w-2xl`.
8. Listas admin: preferir `Table` densa con fila clickeable, o cards compactas `p-4` con la información de decisión primero (nombre, estado, puesto, fecha).
9. Feedback de acciones con `toast.success("Estado actualizado")` / `toast.error(...)` en vez de `alert()`.
10. Copy: español rioplatense, voseo, verbos concretos en botones ("Guardar nota", "Publicar puesto"). Sin "→" ni "▼" en textos.
11. Estados vacíos con `EmptyState` + icono lucide + acción cuando corresponda.
12. Mobile: todo debe funcionar a 375px (grillas colapsan a 1 columna, tablas con scroll horizontal ya resuelto por `Table`).

## Layouts

- **Admin**: el layout `app/admin/(panel)/layout.tsx` ya renderiza sidebar + `<main>` con contenedor.
  Las páginas del panel devuelven directamente su contenido (PageHeader + secciones). **No** envolver en `<div className="flex min-h-screen">` ni importar sidebar.
- **Público**: `Navbar` + contenido + `Footer`. Contenedor `mx-auto max-w-6xl px-5 sm:px-8`. Secciones con `py-16 sm:py-24`.
  Hero: fondo blanco/negro, título grande `text-4xl sm:text-5xl font-semibold tracking-tight`, sin gradientes.
