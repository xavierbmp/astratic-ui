Esta es la lista de pasos para arrancar un portal nuevo sobre Astratic UI. Está pensada para que Claude la siga de arriba abajo en la primera sesión del proyecto y pregunte solo lo que aparece marcado como **decisión del cliente**. Cada paso dice qué se hace, quién lo hace y cuándo se da por cerrado.

> Referencia: es el «Setup» de la propuesta a Twic (0.1 a 0.8), generalizado. Los precios y plazos de ese setup asumen que se sigue esta lista tal cual.

## 0. Antes de empezar: decisiones del cliente

Estas respuestas las da Xavier al inicio. Sin ellas no se crea nada.

- [ ] **Nombre del portal** y monograma de dos letras (sidebar).
- [ ] **Dónde vive el repo**: GitHub de Astratic (`xavierbmp`), organización del cliente, o compartido. Si es del cliente, quién invita a quién.
- [ ] **Cuenta de Vercel**: team de Astratic (`astraticnetwork-6190`) o cuenta del cliente. La propuesta dice *ownership del cliente*: por defecto, cuenta del cliente con Astratic como miembro.
- [ ] **Base de datos**: proyecto de Neon nuevo, en la cuenta del cliente si tiene, si no en la de Astratic con transferencia al final.
- [ ] **Dominio**: subdominio del cliente (`portal.cliente.com`) o de Astratic mientras no haya dominio. Quién gestiona su DNS.
- [ ] **Acceso**: login con Google Workspace del cliente (por defecto), o email y contraseña. Dominio o dominios permitidos.
- [ ] **Roles**: lista de áreas o bloques del portal y quién ve cada uno. Mínimo: administrador y usuario.
- [ ] **Color de marca**: hex del acento si el cliente lo tiene y contrasta; si no, se queda el índigo.
- [ ] **Idioma y formato**: español por defecto; moneda y zona horaria.
- [ ] **Módulos de la primera fase**: qué páginas se construyen primero, en orden.

## 1. Repositorio

- [ ] Clonar `astratic-ui` en la carpeta del cliente: `02_Devs/03_Clientes/<cliente>/portal/` (o la ruta acordada).
- [ ] Borrar el origen remoto y crear el repo nuevo con el nombre `<cliente>-portal`, **privado**, en la cuenta decidida en el paso 0.
- [ ] Renombrar en `package.json` (`name`), `app/layout.tsx` (`metadata.title`) y `README.md`.
- [ ] Eliminar `app/ds`, `app/demo`, `app/documentos`, `content/`, `components/docs/`, `components/document/`, `lib/demo-data.ts`, `registry.json` y `public/r`. Se quedan `components/ui`, `components/app`, `lib`, `hooks`, `app/globals.css`, `CLAUDE.md` y `.claude/rules/`.
- [ ] En `package.json`, el script `build` pasa a ser `next build` y se borra `registry:build` (sin `registry.json`, `shadcn build` falla). En `eslint.config.mjs` se quita la excepción de las páginas de documentación.
- [ ] Sustituir la página de inicio (`app/page.tsx`) por una redirección al primer módulo o al login.
- [ ] Crear la rama `main` con el primer commit: «chore: arranque del portal sobre astratic-ui vX».
- [ ] Añadir `.github/CODEOWNERS` si el repo es compartido con el cliente.

Cerrado cuando: `npm run dev` arranca en blanco con el shell y el login pendiente, y el repo está en GitHub con `main` protegida.

## 2. Base de datos (Neon + Prisma)

- [ ] Crear el proyecto en Neon con dos ramas: `main` (producción) y `dev`. Región EU (Frankfurt).
- [ ] Instalar Prisma 7 con el adapter de Postgres: `npm i @prisma/client @prisma/adapter-pg && npm i -D prisma`.
- [ ] `prisma/schema.prisma` con el modelo base de [Arquitectura de datos](/ds/patrones/datos): `User`, `Role`, y las tablas de auditoría (`createdAt`, `updatedAt`, `createdById`, `archivedAt` en todo).
- [ ] `.env` local apunta a la rama `dev`. Nunca a `main` desde local.
- [ ] Migraciones **a mano e idempotentes** (`prisma migrate dev` solo en `dev`; en `main` se aplica el SQL revisado). Regla heredada del portal de Influencers.
- [ ] Script `scripts/seed.ts` con el usuario administrador de Astratic y los datos de ejemplo mínimos.

Cerrado cuando: `npm run db:migrate` aplica en `dev` y el seed crea el admin.

## 3. Acceso y roles (Better Auth)

- [ ] Instalar Better Auth con el adapter de Prisma. Proveedor Google con restricción de dominio (`hd`) a los dominios del paso 0.
- [ ] Modelo `User.role` interno (área) separado del rol de Better Auth (`admin` / `user`).
- [ ] `proxy.ts` (middleware) que protege todo salvo `/(publico)`. Sesión en servidor con `lib/auth-session.ts`; nunca `auth.api` desde componentes cliente.
- [ ] Pantallas públicas: login, espera de aprobación (si el alta es por solicitud), legal. Usan el mismo `globals.css` y la tipografía del sistema.
- [ ] Alta de usuarios: por invitación desde Equipo (la única página de configuración: el resto se configura donde se usa). Cada persona ve solo su bloque; el administrador ve todo.

Cerrado cuando: un usuario del dominio del cliente entra con Google, uno de fuera no, y el admin ve la página de Equipo.

## 4. Secretos y configuración

- [ ] `.env.example` con **todos** los nombres de variable y sin valores. Cada variable nueva se añade aquí en el mismo commit.
- [ ] Valores solo en `.env` local (ignorado) y en Vercel (Environment Variables, con `Production` y `Preview` separados).
- [ ] Claves de terceros (Apify, Apollo, Metricool, Resend…) a nombre del cliente. Astratic no guarda claves de clientes en su propio gestor.
- [ ] Guardia de secretos: el hook PreToolUse de Claude que bloquea `gh_`, `sk-`, `npg_`, `AIza`… en Edit/Write (está en la configuración del workspace de Astratic; si el repo se abre desde otro sitio, copiarlo a `.claude/settings.json`).

## 5. Despliegue (Vercel)

- [ ] Crear el proyecto de Vercel desde el repo (auto-deploy de `main` a producción, previews por PR). Si la cuenta es del cliente, Astratic entra como miembro.
- [ ] Variables de entorno de producción apuntando a la rama `main` de Neon.
- [ ] `vercel.json` con las tareas programadas (cron) que necesite el portal; el plan Pro las permite cada minuto, el gratuito una vez al día.
- [ ] Dominio: en Vercel → Settings → Domains añadir el subdominio; pegar el CNAME (`cname.vercel-dns.com`) en el DNS del cliente. HTTPS automático.
- [ ] Comprobar el primer deploy con la checklist de `engineering:deploy-checklist`.

Cerrado cuando: `https://<dominio>` muestra el login y un usuario real entra.

## 6. Diseño del cliente

- [ ] `--brand` y `--brand-soft` en `globals.css` si hay color de marca. Nada más cambia.
- [ ] Monograma y nombre en el `Brand` del `AppShell`. Logo SVG del cliente en `public/` si lo hay; si no, monograma.
- [ ] Favicon y `metadata` (título, descripción, `lang`).
- [ ] Confirmar con el cliente en una captura del shell vacío **antes** de construir la primera página.

## 7. Estructura del portal

- [ ] Un route group por zona de acceso: `app/(portal)` para el portal autenticado, `app/(publico)` para login y legal. Si hay dos tipos de usuario con shells distintos (agencia y cliente), dos grupos.
- [ ] `app/(portal)/nav.ts` con los grupos y páginas de la sidebar, en el orden de los bloques de la propuesta, importado desde un `shell.tsx` cliente (los iconos no pueden pasar de servidor a cliente). Contadores conectados a datos reales desde el primer día (aunque sean 0). Si un módulo tiene subpáginas, sus pestañas van en el campo `tabs` del ítem ([Navegación y subpáginas](/ds/patrones/navegacion)).
- [ ] Reportar un problema desde el primer día: tabla `Reporte` (descripción, ruta, elemento y contexto en Json, estado, respuesta, autor), dos server actions (enviar y listar) y `ReportButton` en la prop `report` del shell, en lugar del `DemoReportButton` de la demo ([Reportar un problema](/ds/componentes/report-button)).
- [ ] Cada página son dos archivos, como en la demo: `page.tsx` de servidor (exporta `metadata`, carga los datos desde `lib/db/` y lee `searchParams`) y `<modulo>-view.tsx` cliente, que recibe los datos por props.
- [ ] Cada vista sigue la [anatomía](/ds/patrones/anatomia): `PageBody` → `PageHeader` → `KpiRow` → `WorkGrid` (con `toolbar`, un `Section` e `InsightsPanel`) → `DetailSheet`. La vista activa con `usePageView`; el registro abierto en la URL (`?registro=id`).
- [ ] Los datos del portal pasan por un único módulo `lib/db/` con funciones por entidad. Los componentes cliente no importan Prisma.
- [ ] Estándar de completitud por página: filtros, orden, vistas que apliquen, selección en bloque, sheet de detalle, estados vacío/cargando/error, y toasts. Una página sin esto no está terminada.

## 8. Calidad y entrega

- [ ] `npm run typecheck`, `npm run lint` y `npm test` (Vitest: variables de entorno y aislamiento por rol) en CI (GitHub Actions) en cada PR.
- [ ] Playwright con un flujo por página: entrar, filtrar, abrir un detalle, crear un registro.
- [ ] Cada página se valida en el entorno de preview con el responsable del bloque antes de pasar a producción (kickoff de la propuesta).
- [ ] Vault de Obsidian del proyecto (`new-project`) con: decisiones, integraciones, errores aprendidos y estado por fase.
- [ ] Al cerrar: transferir ownership de Vercel, Neon, dominio y repo al cliente si aún no lo tiene; dejar a Astratic como miembro para el mantenimiento.

---

## Comandos habituales

```bash
npm run dev            # localhost:3000 (o el puerto de .claude/launch.json)
npm run typecheck      # tsc --noEmit
npm run lint
npm run build
npx prisma migrate dev # solo con .env apuntando a la rama dev de Neon
npx vercel --prod      # si el proyecto no tiene auto-deploy
```

## Qué pregunta Claude y qué no

Pregunta: todo lo del paso 0, el nombre exacto de cada módulo y sus campos, y cualquier integración externa antes de conectarla (skill `errores`).

No pregunta: si usar el design system, si hacer responsive, si añadir estados vacíos, si confirmar borrados, si usar toasts. Eso ya está decidido aquí.
