# Reglas — Design system Astratic UI

> Se copia tal cual a cada portal nuevo. La documentación completa vive en el repo `astratic-ui` (`/ds`). Estas reglas mandan sobre cualquier preferencia estética puntual.

## Stack fijo
- Next.js App Router · Tailwind v4 · shadcn/ui (preset Nova sobre Radix, base neutral) · lucide-react · Geist · Recharts · dnd-kit · react-hook-form + zod · next-themes · sonner.
- `cn` se importa de `"cn"`. Tokens en `app/globals.css`. Kit en `components/app/`.
- Nunca colores de Tailwind sueltos ni valores hex en JSX: solo tokens (`bg-card`, `text-muted-foreground`, `border`, `bg-brand-soft`, `text-success`…).

## Anatomía de una página de operación (orden fijo)
1. `PageBody` → `PageHeader` (título 27 px, descripción, acciones de página a la derecha: tabs o botones outline).
2. `KpiRow` con 3 a 5 `KpiCard`.
3. `Toolbar`: `ToolbarSearch` · `FilterMenu`(s) · `ToolbarSpacer` · `ViewSwitcher` · botón principal (negro, único).
4. `ActiveFilters` (chips) si hay filtros aplicados.
5. `WorkGrid` con **un** `Section` (bloque de operación) y `aside={<InsightsPanel storageKey=… blocks=… />}`.
6. `DetailSheet` para el registro abierto. Nunca un modal para ver un registro.

Dashboards: cifras + grid de secciones de resumen + panel «Hoy». Ajustes: navegación vertical + un bloque con campos y pie de guardado.

## Estructura de archivos de una página
- `page.tsx` de servidor: `metadata`, carga de datos desde `lib/db/`, lectura de `searchParams`. Pasa los datos por props.
- `<modulo>-view.tsx` cliente: estado de filtros, selección y vista (`usePageView(clave, vistas)`), registro abierto sincronizado con `?registro=id`.

## Interacción
- Fila o tarjeta entera clicable → abre el `DetailSheet`. Checkbox → selecciona. Selección → `BulkBar` flotante, fija al pie de la ventana y centrada (nunca acciones en bloque arriba).
- Vistas: `table` · `list` · `kanban` · `calendar` · `grid` con sus iconos fijos, en un `ViewSwitcher` segmentado; la vista se recuerda por página y en móvil la tabla cede el sitio a la lista (`RecordList`) o las tarjetas; búsqueda, filtros y selección se comparten entre vistas.
- Kanban: columnas grises con la cabecera dentro, fases de los extremos plegadas con `defaultCollapsed` cuando no caben; tarjeta con monograma, valor, etiqueta y pie de estado.
- Filtros = `FilterMenu` (desplegable con checkboxes y contadores). Filtro activo se marca en el botón y aparece como chip.
- Destructivo → `ConfirmDialog` con nombre de lo que se borra. Reversible → se ejecuta y el `toast` ofrece «Deshacer».
- Feedback siempre con `toast` (sonner). Prohibido `alert`, `confirm`, avisos de texto en la toolbar.
- Formularios: label encima, ayuda debajo, error debajo. `Dialog` de 480 px para crear/editar registros sencillos. Botones del pie: «Cancelar» ghost + acción principal.

## Componentes y copy
- Botones: icono lucide + verbo + objeto («Nuevo registro»). `default` en toolbars y pies; `sm` en tablas y barras.
- Estados solo con `StatusBadge` (`success` hecho/activo · `info` en curso · `warning` pendiente · `danger` vencido/error · `neutral` borrador).
- Avatares: `AvatarInitials` con `variant="entity"` para registros y marcas, por defecto para personas. Nunca negros ni de colores.
- Tablas: `DataTable` con `CellPrimary` en la primera columna, números a la derecha con `tabular-nums`, columnas secundarias con `hideBelow`.
- Vacío: `EmptyState` que dice cómo poblarlo. Cargando: `TableSkeleton`/`KanbanSkeleton`/`KpiSkeleton`. Error: `ErrorState` con reintento.
- Textos en español, sin guiones largos, sin anglicismos innecesarios. Euros `1.234 €`, porcentajes `32 %`, fechas `24 sep` (usar `lib/format.ts`).

## Estándar de completitud
Una página no está terminada sin: filtros, orden, las vistas que apliquen, selección en bloque, detalle, estados vacío/cargando/error, toasts y responsive básico (el panel baja debajo del bloque en < 1280 px).
