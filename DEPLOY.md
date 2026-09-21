# Despliegue — notas para esta versión

Stack sin cambios: Next.js 16 + Prisma (MariaDB/MySQL) + NextAuth. Requiere Node 20+.

## Pasos

```bash
npm ci
npx prisma generate
npx prisma migrate deploy   # aplica 20260911142201_add_indexes (solo índices, sin cambios de datos)
npm run build
npm run start
```

> La migración de índices **ya está aplicada** en la base compartida de desarrollo
> (`postulaciones`). Si producción usa esa misma base, `migrate deploy` no hace nada.

## Cambios que afectan al servidor

1. **Los CVs ya no viven en `public/`.** Se guardan en `storage/cvs/` (en la raíz del proyecto,
   ignorado por git) y solo se sirven por `/api/admin/cvs/<archivo>` con sesión de admin.
   - `storage/` tiene que ser **persistente** entre despliegues (mismo criterio que antes tenía
     `public/uploads/`). En un hosting de disco efímero hay que montar un volumen ahí.
   - Para mover los CVs que ya estén en `public/uploads/cvs/` del servidor, una sola vez:
     `npx tsx scripts/migrate-cvs.ts`. Las filas de la base no cambian (se resuelven por nombre de archivo).
2. **Variables de entorno:** las mismas de siempre (ver `.env.example`). `ADMIN_PASSWORD` ahora es
   obligatoria para `npm run db:seed` — ya no hay contraseña por defecto.
3. **Usuarios del panel:** `npx tsx scripts/create-admin.ts <email> <contraseña> [nombre]` crea o
   actualiza un usuario (contraseña hasheada con bcrypt).
4. **Proxy inverso:** el límite de envíos de los formularios públicos identifica al visitante por
   `x-real-ip` o, si no está, por el último salto de `x-forwarded-for`. Con nginx, asegurate de
   pasar `proxy_set_header X-Real-IP $remote_addr;`.
5. **Fuentes:** Fraunces y Manrope se descargan de Google Fonts **en el build** (`next/font`), así
   que la máquina que compila necesita salida a internet. En runtime no hay llamadas externas.

## Pendiente conocido (no bloquea el despliegue)

- Hay un CV real versionado en git (`public/uploads/cvs/1783984569940-gq51frolsfd.pdf`, commit
  `178616b`). **Esta versión no lo toca a propósito**: borrarlo del repo haría que un `git pull`
  lo elimine del disco del servidor. Orden correcto para resolverlo más adelante:
  1. en el servidor, `npx tsx scripts/migrate-cvs.ts` (lo mueve a `storage/cvs/`, privado);
  2. recién ahí, un commit que lo quite del repo;
  3. opcional: purgar el historial (requiere reescribir la rama por defecto y push forzado).
  Mientras tanto ese archivo puntual sigue siendo accesible por URL directa, igual que antes;
  todos los CVs **nuevos** ya se guardan en privado.
