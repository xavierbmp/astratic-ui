# CLAUDE.md — astratic-ui

Design system y kit de arranque de Astratic Network Devs para portales operativos. Este repo es a la vez la documentación (`/ds`), la demo (`/demo`), la plantilla que se clona para un cliente nuevo y el registry de shadcn (`registry.json` → `public/r`).

## Lo no obvio
- Dev en puerto **3020** (`.claude/launch.json`, config `astratic-ui`). `npm run typecheck` antes de dar algo por hecho.
- shadcn v4 con preset **Nova sobre Radix** (`components.json`: style `radix-nova`, base neutral). `cn` viene del paquete `cn`, no de `lib/utils`.
- Tokens en `app/globals.css`: además de los de shadcn, `brand`, `success|info|warning|danger` (+ `-soft`) y `shadow-xs|pop`. **Nunca colores de Tailwind sueltos** (`bg-green-100`, `text-gray-500`): rompen el modo oscuro.
- Iconos de lucide **no cruzan** la frontera servidor → cliente: la nav con iconos se define en un archivo importado por un componente cliente (`app/demo/shell.tsx`, `app/ds/shell.tsx`).
- El kit vive en `components/app/`. Las páginas de la demo solo componen; si falta algo, se crea en el kit, se documenta en `/ds/componentes` y se añade a `registry.json`.
- Patrón de página (el que se copia a los portales): `page.tsx` de servidor (metadata, datos, `searchParams`) + `<modulo>-view.tsx` cliente. Vista activa con `usePageView` (en móvil quita la tabla); registro abierto en la URL `?registro=id` con `window.history.replaceState`.
- Avatares: `variant="entity"` para registros y marcas (gris claro, como el kit de Twic), por defecto persona. Nunca monogramas negros.
- La referencia visual en caso de duda son los mockups de la propuesta Twic: `../02_Propuestas Clientes/Twic/mockups/*.html` y `kit/KIT.md`.
- `public/r` es generado (`npm run registry:build`, también dentro de `npm run build`) y está en `.gitignore`.
- Docs: páginas servidor en `app/ds/**`; los ejemplos interactivos son componentes cliente en `components/docs/examples/`. `CodeBlock` es un componente servidor async (Shiki).
- La guía de arranque es `content/nuevo-proyecto.md` (una sola fuente, se renderiza en `/ds/nuevo-proyecto`).
- Documentos A4 y PDF (propuestas, presupuestos) en `components/document/`, documentados en `/ds/documentos`. Dos formatos: **elaborada** (portales y software, maqueta Twic, demo `/documentos/propuesta-elaborada`) y **simple** (servicios y trabajos cortos, maqueta Feel The Diving, demo `/documentos/propuesta-simple`). Cada hoja recorta lo que no cabe: revisar el PDF exportado hoja a hoja. El tema claro se fuerza con `.theme-light` y la impresión vive en el bloque «Documentos A4 y PDF» de `globals.css`.

## Reglas de diseño (resumen; la verdad está en `/ds/patrones/convenciones` y `.claude/rules/design-system.md`)
- Una página de operación = cabecera + cifras (3 a 5) + toolbar + **un** bloque de operación + panel de información de 320 px a la derecha. Detalle en `DetailSheet` (overlay derecho).
- Toolbar en este orden: buscador · filtros · espacio · conmutador de vistas · **acción principal negra, una por página**. Va en `WorkGrid toolbar`: mide lo que el bloque y el panel empieza a la altura del bloque.
- Subpáginas: pestañas `PageTabs` en la cabecera (prop `tabs`), una ruta por pestaña, definidas en `nav.ts`. Ejemplo en `/demo/facturacion`; reglas en `/ds/patrones/navegacion`.
- Fila clicable abre el sheet; checkbox selecciona; selección → `BulkBar` flotante abajo. Destructivo → `ConfirmDialog`. Feedback → `toast` de sonner.
- Badges de estado solo con `StatusBadge` y sus cinco tonos. Botones con icono + verbo + objeto.
- Toda página sale con filtros, orden, vistas que apliquen, selección, detalle y estados vacío/cargando/error. Sin UI muerta.

## Al clonar para un cliente
Seguir `content/nuevo-proyecto.md` de arriba abajo. Borrar `app/ds`, `app/demo`, `app/documentos`, `content`, `components/docs`, `components/document`, `registry.json`. Copiar `.claude/rules/design-system.md` tal cual.

## Workflow
- Commits en español, describiendo el porqué. Push solo con confirmación explícita.
- Ante error o integración externa nueva: skill `stack` antes de tocar código.

@AGENTS.md
