# Reglas — Design system hijo «Influencer Workspace»

> Se aplica a todo lo que vive dentro de `.theme-influencer` (en este repo, `app/workspace`, `app/revisar` y `app/propuesta`; en el Portal Astratic, el workspace de las influencers). En lo que no diga, manda `design-system.md`: botones, formularios, diálogos, estados, fichas, filtros y configuración in situ son los de Astratic UI, sin cambios. Documentación en `/ds/influencer`.

## Qué es
- Un design system **hijo** de Astratic UI: hereda tokens, kit (`components/app`) y convenciones, y añade una capa de estilo (`.theme-influencer` en `globals.css`) y componentes propios (`components/influencer`). No se duplican piezas del madre: si algo existe en `components/app`, se usa tal cual.
- Se activa con la clase `theme-influencer` en el shell del workspace (un `div` con `contents` alrededor de `AppShell`) **y** con `ThemeBody`, que la pone también en `<body>`: fichas, diálogos, menús y toasts se pintan en un portal fuera del shell y sin eso salen con los tokens del madre y sin tintes. El oscuro va con `.dark .theme-influencer`.
- **No es una demo.** Las páginas son las definitivas y se llevarán al Portal Astratic copiando `app/workspace`, `app/revisar`, `app/propuesta`, `components/influencer` y `lib/influencer`. Solo cambia `lib/influencer/consultas.ts`, que hoy devuelve `demo-data.ts` y allí leerá de Prisma.

## Datos y lógica
- Modelo en español en `lib/influencer/modelo.ts` (`Propuesta`, `Collab`, `Pieza`, `Version`, `Nota`, `Material`, `Tarea`, `Marca`…), con sus estados como listas `{ id, label, tone }` (`ESTADOS_PROPUESTA`, `ESTADOS_COLLAB`, `ESTADOS_PIEZA`…) y `estadoDe()` para pintarlos con `StatusBadge`. Un concepto, una palabra: en pantalla se dice lo que dice el modelo.
- Lógica pura y sin React en `lib/influencer/*.ts`: hitos y progreso de una collab (`collabs.ts`), grupos y orden de tareas (`tareas.ts`), presupuesto con tarifas, extras y mínimo (`presupuesto.ts`), eventos de la agenda (`agenda.ts`) y fechas por día (`fechas.ts`). Las vistas no calculan: llaman.
- Las páginas (`page.tsx`, servidor) piden a `consultas.ts` y pasan por props a `<x>-view.tsx` (cliente). Las vistas guardan en estado local; en el portal, las mismas llamadas irán a server actions.
- Fechas de la demo: viven alrededor de `HOY` (6 de octubre de 2026); las vistas reciben `hoy` por props y nunca usan `new Date()` para decidir algo que se pinta (hidratación).

## Estilo
- Página gris (`bg-background`), bloques blancos (`Block`: `rounded-2xl bg-card p-5 shadow-card`) **sin borde**. Dentro de un bloque, filas y tarjetas pequeñas en `bg-background/70` y `bg-muted` al pasar el ratón. Nunca una tarjeta con sombra dentro de otra.
- Radio base 16 px: bloques `rounded-2xl`, elementos `rounded-xl`, chips e iconos de cifra `rounded-full`.
- **Tintes** (`lib/influencer/tints.ts`, clases `bg-tint-* text-tint-*-foreground`): colorean por marca (`BrandMark`, tarjetas, agenda) o por tipo de cosa, nunca por estado. Los estados siguen siendo los cinco de `StatusBadge` y los colores `success|info|warning|danger`. Un tinte siempre con su `-foreground`.
- Imágenes con `next/image`: portada de campaña en la tarjeta de collab y en el resumen, miniatura de pieza, foto de perfil, logo de marca (iniciales si no hay). Hosts permitidos en `next.config.ts`.
- Espacio: `gap-6` entre bloques, `p-5` dentro, margen de página `px-4 md:px-[34px]`, `pb-28 md:pb-10` por la barra inferior.
- Tipografía heredada: título de página 27 px, título de bloque 16 px semibold con el contador en gris, cifra 24 px `tabular-nums`, texto 14 px y secundario 12 px.

## Dos registros: mostrar y operar (Xavier, 2026-10-06)
- **Bloques de mostrar** (el Inicio entero, resúmenes, perfil, avisos, tarjetas de collab, el resumen de una collab): el estilo visual de este hijo, grande, con aire e imágenes.
- **Páginas de operar** (Propuestas, la lista de Collabs, el brief, los contenidos, la pieza, los materiales, las tareas): sin miedo a ser detalladas y funcionales, al estilo de Astratic UI o de Notion: tablas, filtros, edición en el sitio, atajos. Ahí se usa el kit madre (`Toolbar`, `FilterMenu`, `ViewSwitcher`, `Kanban`, `DataTable`, `DetailSheet`, `DetailFields`, `InlineField`, `BulkBar`) dentro de un `Block className="p-0"`, **sin cifras arriba y sin panel de información**: la descripción de la cabecera ya resume. Un «Ver todo» del Inicio lleva siempre a una página de operar.
- Registro abierto: lo que se mira un momento (una propuesta) va en `DetailSheet` con su id en la URL; lo que se trabaja semanas (una collab) es una página propia con `PageTabs` (`collabTabs` en `app/workspace/nav.ts`) y una ruta por pestaña.

## Layout
- **Móvil primero**: una columna, `MobileTabBar` fija abajo con las cinco páginas principales (las mismas entradas que la sidebar, en `nav.ts`), filas de tarjetas que se deslizan (`CollabCardRow`). En las páginas de operar la tabla cede el sitio a la lista o a las tarjetas (`usePageView`).
- Desde `md`, la sidebar heredada. Desde `xl`, dos columnas: principal y una derecha de 372 px de bloques normales (no es el `InsightsPanel` del madre).
- **Cifras (`StatRow` + `StatTile`) solo en las páginas de inicio.** Las demás páginas empiezan por su contenido. Cada cifra lleva a su página (`href`).
- Una cosa principal por bloque y el detalle a un toque. Más de siete bloques en una página es señal de que sobra alguno.
- Cabecera de bloque (`BlockHeader`): título, contador, lo interactivo (pestañas) después del título y «Ver todo» o la acción a la derecha; en móvil, lo interactivo baja a su propia línea.

## Tareas, en cualquier página (Xavier, 2026-10-06)
- Desde cualquier página se crea una tarea con el mismo `TaskDialog`; si se abre desde una collab o una propuesta llega ya atada a ella (`relacionFija`) y aparece en su ficha **y** en la lista general. La lista de operar es siempre `TaskTable` (grupos por fecha, edición en el sitio, alta rápida con Enter, selección y barra de acciones).
- Las tareas automáticas (`origen: "auto"`) salen de las fechas de publicación de cada pieza según `HITOS` (guion 10 días antes, grabación 7, V1 5, publicación, resultados 7 después). La página general de Tareas (tipo Notion, con calendario) está por construir: `/workspace/tareas`.

## Revisión y documentos fuera del shell
- `/revisar/[token]`: lo que ve la marca sin cuenta. Un enlace por versión (`Version.enlace`), con caducidad; enseña siempre la última versión y guarda quién aprobó qué y cuándo. Usa `GuionViewer`, `VideoViewer` y `NotesPanel` en `modo="marca"`. Página sin sidebar, con `theme-influencer` y `ThemeBody`.
- `/propuesta/[id]`: el media kit y el presupuesto en A4 (`DocInfluencerSheet`, con su nombre arriba y el sello de Astratic abajo), con `DocViewer` + `DocToolbar` del madre para exportar a PDF. En el portal la ruta llevará un token, no el id.

## Componentes propios (`components/influencer`)
Mostrar: `Block`/`BlockHeader` · `StatRow`/`StatTile` · `CollabCardRow`/`CollabCard` · `TaskCard` · `ProfilePanel` · `NoticeHighlight`/`NoticeItem` · `LinkGrid` · `MobileTabBar` · `BrandMark`. Operar: `TaskTable` · `TaskDialog` · `Agenda` · `PiezaCard` · `GuionViewer` · `VideoViewer` · `NotesPanel` · `DocInfluencerSheet` · `ThemeBody`. Uno nuevo nace aquí, se documenta en `/ds/influencer/componentes` y entra en `registry.json` (ítem `influencer-workspace`).

## Datos de la demo
`lib/influencer/demo-data.ts`: una creadora inventada, marcas y campañas inventadas, fotos de Unsplash. El repo es público: nunca personas, marcas ni cifras reales. Los porcentajes de los extras (`EXTRAS` en `modelo.ts`) son de ejemplo hasta que Astratic fije el modelo de tarifas.
