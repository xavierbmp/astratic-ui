# CLAUDE.md — astratic-ui

> **Conocimiento:** todo vive en la bóveda `../../00_Brain/` (reglas de uso en `../../CLAUDE.md`). Sección de
> este proyecto: `04-Devs/Design-System/Devs-Design-System-Contexto.md`. Este archivo solo añade lo propio del código.

Design system y kit de arranque de Astratic Network Devs para portales operativos. Este repo es a la vez la documentación (`/ds`), la demo (`/demo`), la plantilla que se clona para un cliente nuevo y el registry de shadcn (`registry.json` → `public/r`).

## Lo no obvio
- Dev en puerto **3020** (`.claude/launch.json`, config `astratic-ui`). `npm run typecheck` y `npm test` (Vitest, la lógica pura de `lib/` en `tests/unit`) antes de dar algo por hecho.
- shadcn v4 con preset **Nova sobre Radix** (`components.json`: style `radix-nova`, base neutral). `cn` viene del paquete `cn`, no de `lib/utils`.
- Tokens en `app/globals.css`: además de los de shadcn, `brand`, `success|info|warning|danger` (+ `-soft`) y `shadow-xs|pop`. **Nunca colores de Tailwind sueltos** (`bg-green-100`, `text-gray-500`): rompen el modo oscuro.
- Iconos de lucide **no cruzan** la frontera servidor → cliente: la nav con iconos se define en un archivo importado por un componente cliente (`app/demo/shell.tsx`, `app/ds/shell.tsx`).
- El kit vive en `components/app/`. Las páginas de la demo solo componen; si falta algo, se crea en el kit, se documenta en `/ds/componentes` y se añade a `registry.json`.
- Patrón de página (el que se copia a los portales): `page.tsx` de servidor (metadata, datos, `searchParams`) + `<modulo>-view.tsx` cliente. La lista es una `BaseDatos` (en móvil, tarjetas); registro abierto en la URL `?registro=id` con `window.history.replaceState`.
- Avatares: `variant="entity"` para registros y marcas (gris claro, como el kit de Twic), por defecto persona. Nunca monogramas negros.
- La referencia visual en caso de duda son los mockups de la propuesta Twic: `../02_Propuestas Clientes/Twic/mockups/*.html` y `kit/KIT.md`.
- `public/r` es generado (`npm run registry:build`, también dentro de `npm run build`) y está en `.gitignore`.
- Docs: páginas servidor en `app/ds/**`; los ejemplos interactivos son componentes cliente en `components/docs/examples/`. `CodeBlock` es un componente servidor async (Shiki).
- La guía de arranque es `content/nuevo-proyecto.md` (una sola fuente, se renderiza en `/ds/nuevo-proyecto`).
- **Design systems hijos.** Astratic UI es el madre; un hijo hereda todo y añade una capa de tokens en `globals.css` (clase de subárbol, como `.theme-influencer`), sus componentes en carpeta propia (`components/influencer`), sus reglas en `.claude/rules/<hijo>.md` y su documentación bajo `/ds/<hijo>`. Se da de alta uno nuevo en `app/ds/design-systems.ts` (alimenta la portada `/`, que es donde se elige, y las pestañas de la cabecera de `/ds`), su marca y nav en `SHELLS` de `app/ds/shell.tsx` y `app/ds/nav.ts`. Las clases `tint-*` solo tienen valor dentro de `.theme-influencer`; como fichas, diálogos y menús se pintan en un portal fuera del shell, `ThemeBody` pone la clase también en `<body>`.
- **Las páginas del workspace de influencers no viven aquí**: están en su propio repo (`../../03_Influencers/02_Workspace Influencers`, puerto 3050), que copia de este el design system hijo: `components/influencer`, `lib/influencer` (modelo en español, lógica y datos de ejemplo), el tema `.theme-influencer` de `globals.css` y las reglas de `.claude/rules/influencer-workspace.md`, además de las piezas del madre que usa (`components/app`, `lib/filtros`, `lib/vistas`, `lib/base`, `lib/bloques.ts`, `lib/carpetas.ts`, `lib/revision-notas.ts`, `hooks`). Lo que se corrige del hijo se corrige aquí y se vuelve a copiar allí. Lo que nace en el workspace y sirve a cualquier portal (ajustes de bloques, calendarios, Gantt, revisión con notas, carpetas, subidas, enlaces) vive en el madre y el hijo lo envuelve con sus tintes y sus textos, con las mismas props.
- **Toda lista de registros es una base de datos al estilo Airtable** (`BaseDatos`, en `components/app/base/`; lógica pura en `lib/base/`, con tests): barra, lateral de vistas, cuadrícula, kanban, galería, calendario, campos propios, formulario y ficha encima o integrada. Filtros con `lib/filtros/core.ts` (un solo juego de operadores, los de Airtable) y orden, grupos y totales con `lib/vistas/core.ts`. Las vistas de cada persona con `useBase` (en un portal se guardan en su base de datos; en la documentación y la demo, en el navegador con `useBaseLocal`). Las bases del workspace de influencers declaran sus campos en `lib/influencer/base-*.ts`. Documentado en `/ds/componentes/base-de-datos`. Ya no existen `FilterBar`, `QuickFilters`, `ViewSwitcher`, `RecordList`, `ColumnSettings` ni las vistas al estilo de Notion: no se recuperan. `DataTable` queda para tablas cortas y fijas.
- Documentos A4 y PDF (propuestas, presupuestos) en `components/document/`, documentados en `/ds/documentos`. Dos formatos: **elaborada** (portales y software, maqueta Twic, demo `/documentos/propuesta-elaborada`) y **simple** (servicios y trabajos cortos, maqueta Feel The Diving, demo `/documentos/propuesta-simple`). Cada hoja recorta lo que no cabe: revisar el PDF exportado hoja a hoja. El tema claro se fuerza con `.theme-light` y la impresión vive en el bloque «Documentos A4 y PDF» de `globals.css`.

## Reglas de diseño (resumen; la verdad está en `/ds/patrones/convenciones` y `.claude/rules/design-system.md`)
- Una página de operación = cabecera + cifras (3 a 5) + **una** base de datos + panel de información de 320 px a la derecha. Detalle en `DetailSheet` (overlay derecho): ficha por bloques plegables, cada dato editable donde se lee (sin botón «Editar»), vacíos como «+ Campo» y flechas al anterior/siguiente. Registros con secuencia: ficha de dos columnas (`DetailSplit` + `StepTimeline`).
- Sin página de Ajustes: cada cosa se configura donde se usa (engranaje en su bloque, nombre del campo pulsable en la ficha, «Crear»/«Gestionar» en los selectores).
- Contraste en claro: `border` < `input` < `control` (casillas); lo seleccionado en `bg-brand-soft` con filo `brand`. HTML de fuera siempre en `HtmlFrame`.
- Los controles de una lista van en la barra de su base (`BarraBase`): vista, campos, filtro, grupos, orden, color, buscar y **la acción principal negra, una por página**. Sin toolbar suelta encima.
- Subpáginas: pestañas `PageTabs` en la cabecera (prop `tabs`, debajo del título), una ruta por pestaña con su icono, definidas en `nav.ts`. Ejemplo en `/demo/facturacion`; reglas en `/ds/patrones/navegacion`. Toda navegación por pestañas (fichas, diálogos, bloques) usa el mismo estilo con `TabsList variant="line"`; el segmentado gris queda para elegir un valor o filtrar.
- Fila clicable abre el sheet; checkbox selecciona; selección → `BulkBar` flotante abajo. Destructivo → `ConfirmDialog`. Feedback → `toast` de sonner.
- Badges de estado solo con `StatusBadge` y sus cinco tonos. Botones con icono + verbo + objeto.
- Reportar un problema: `ReportButton` en la prop `report` del shell (bicho entre el buscador y la campana, ⇧⌘X con una ficha abierta). Cada proyecto guarda los reportes en su BD; se cierran con respuesta, nunca se borran.
- Toda página sale con filtros, orden, vistas que apliquen, selección, detalle y estados vacío/cargando/error. Sin UI muerta.

## Al clonar para un cliente
Seguir `content/nuevo-proyecto.md` de arriba abajo. Borrar `app/ds`, `app/demo`, `app/documentos`, `content`, `components/docs`, `components/document`, `registry.json`. Copiar `.claude/rules/design-system.md` tal cual.

## Workflow
- Commits en español, describiendo el porqué. Push solo con confirmación explícita.
- Ante error o integración externa nueva: skill `stack` antes de tocar código.

@AGENTS.md
