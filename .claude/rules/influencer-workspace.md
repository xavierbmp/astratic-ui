# Reglas — Design system hijo «Influencer Workspace»

> Se aplica a todo lo que vive dentro de `.theme-influencer` (en este repo, `app/workspace`; en el Portal Astratic, el workspace de las influencers). En lo que no diga, manda `design-system.md`: botones, formularios, diálogos, estados, fichas, filtros y configuración in situ son los de Astratic UI, sin cambios. Documentación en `/ds/influencer`.

## Qué es
- Un design system **hijo** de Astratic UI: hereda tokens, kit (`components/app`) y convenciones, y añade una capa de estilo (`.theme-influencer` en `globals.css`) y componentes propios (`components/influencer`). No se duplican piezas del madre: si algo existe en `components/app`, se usa tal cual.
- Se activa con la clase `theme-influencer` en el shell del workspace (un `div` con `contents` alrededor de `AppShell`). El oscuro va con `.dark .theme-influencer`.

## Estilo
- Página gris (`bg-background`), bloques blancos (`Block`: `rounded-2xl bg-card p-5 shadow-card`) **sin borde**. Dentro de un bloque, filas y tarjetas pequeñas en `bg-background/70` y `bg-muted` al pasar el ratón. Nunca una tarjeta con sombra dentro de otra.
- Radio base 16 px: bloques `rounded-2xl`, elementos `rounded-xl`, chips e iconos de cifra `rounded-full`.
- **Tintes** (`lib/influencer/tints.ts`, clases `bg-tint-* text-tint-*-foreground`): colorean por marca (`tintFor(nombre)`) o por tipo de cosa, nunca por estado. Los estados siguen siendo los cinco de `StatusBadge` y los colores `success|info|warning|danger`. Un tinte siempre con su `-foreground`.
- Imágenes con `next/image`: portada de campaña en la tarjeta de collab (degradado oscuro y texto blanco), foto de perfil, logo de marca (iniciales si no hay). Hosts permitidos en `next.config.ts`.
- Espacio: `gap-6` entre bloques, `p-5` dentro, margen de página `px-4 md:px-[34px]`, `pb-28 md:pb-10` por la barra inferior.
- Tipografía heredada: título de página 27 px, título de bloque 16 px semibold con el contador en gris, cifra 24 px `tabular-nums`, texto 14 px y secundario 12 px.

## Layout
- **Móvil primero**: una columna, `MobileTabBar` fija abajo con las cinco páginas principales (las mismas entradas que la sidebar, en `nav.ts`), filas de tarjetas que se deslizan (`CollabCardRow`).
- Desde `md`, la sidebar heredada. Desde `xl`, dos columnas: principal y una derecha de 372 px de bloques normales (no es el `InsightsPanel` del madre).
- **Cifras (`StatRow` + `StatTile`) solo en las páginas de inicio.** Las demás páginas empiezan por su contenido. Cada cifra lleva a su página (`href`).
- Una cosa principal por bloque y el detalle a un toque. Más de siete bloques en una página es señal de que sobra alguno.
- Cabecera de bloque (`BlockHeader`): título, contador, lo interactivo (pestañas) después del título y «Ver todo» o la acción a la derecha; en móvil, lo interactivo baja a su propia línea.

## Componentes propios (`components/influencer`)
`Block`/`BlockHeader` · `StatRow`/`StatTile` · `CollabCardRow`/`CollabCard` · `TaskCard` · `ProfilePanel` · `NoticeHighlight`/`NoticeItem` · `LinkGrid` · `MobileTabBar`. Uno nuevo nace aquí, se documenta en `/ds/influencer/componentes` y entra en `registry.json` (ítem `influencer-workspace`).

## Datos de la demo
`lib/influencer/demo-data.ts`: una creadora inventada, marcas y campañas inventadas, fotos de Unsplash. El repo es público: nunca personas, marcas ni cifras reales.
