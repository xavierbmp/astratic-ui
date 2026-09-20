# Reglas — Design system Astratic UI

> Se copia tal cual a cada portal nuevo. La documentación completa vive en el repo `astratic-ui` (`/ds`). Estas reglas mandan sobre cualquier preferencia estética puntual.

## Stack fijo
- Next.js App Router · Tailwind v4 · shadcn/ui (preset Nova sobre Radix, base neutral) · lucide-react · Geist · Recharts · dnd-kit · react-hook-form + zod · next-themes · sonner.
- `cn` se importa de `"cn"`. Tokens en `app/globals.css`. Kit en `components/app/`.
- Nunca colores de Tailwind sueltos ni valores hex en JSX: solo tokens (`bg-card`, `text-muted-foreground`, `border`, `bg-brand-soft`, `text-success`…).

## Anatomía de una página de operación (orden fijo)
1. `PageBody` → `PageHeader` (título 27 px, descripción; a la derecha, `tabs` con las pestañas de subpágina si las hay y `actions` con botones outline).
2. `WorkGrid`, que reparte el resto de la página en dos columnas:
   - `stats={<KpiRow>}` con 3 a 5 `KpiCard`. Van **dentro** de la columna izquierda, no a ancho completo: `KpiRow` es `auto-fit minmax(180px,1fr)` y se reordena solo al estrecharse.
   - `toolbar`: **siempre `FilterBar`**, que monta buscador · filtros rápidos · botón «Filtros» · `ToolbarActions` (`ViewSwitcher` + botón principal negro y único) y los chips debajo. «Filtros» es uno más de la fila de rápidos y va **pegado al último**, moviéndose según cuántos haya; solo las acciones se anclan a la derecha. **Todo en una sola línea**: los rápidos son la parte elástica y se desplazan en horizontal si no caben; «Filtros» y las acciones no saltan nunca de línea. La toolbar mide lo que el bloque: nunca queda encima del panel de información.
   - **un** `Section` (bloque de operación) como hijo.
   - `aside={<InsightsPanel storageKey=… blocks=… />}`: ocupa la columna derecha **entera**, desde las cifras hasta el pie del bloque. El panel habla de toda la página, igual que las cifras, así que empiezan a la misma altura; empezar a la altura del bloque lo hacía parecer un apéndice de la tabla.
   - Por debajo de 1280 px todo se apila en una columna y el panel va el último.
3. `DetailSheet` para el registro abierto, con todos sus datos editables en el sitio. Nunca un modal para ver un registro.

Dashboards: cifras + grid de secciones de resumen + panel «Hoy». Ajustes: navegación vertical + un bloque con campos y pie de guardado.

## Subpáginas
- Un módulo con partes distintas que comparten título (Facturas y Cobros en Facturación) usa subpáginas: una ruta por parte (`/facturacion`, `/facturacion/cobros`) y `PageTabs` en la prop `tabs` de `PageHeader`.
- Las pestañas se definen una vez en `nav.ts` (campo `tabs` del ítem): la sidebar marca el módulo y las migas y ⌘K incluyen la subpágina.
- Mismo título en todas las subpáginas; cada una con su descripción, cifras, toolbar, bloque y panel. De 2 a 6; sin anidar.
- No son subpáginas: otra forma de ver los mismos datos (vista, `ViewSwitcher`) ni un recorte de la lista (filtro o segmento). Un solo segmentado por cabecera.

## Filtrar, ordenar y elegir campos (estilo Airtable)
Toda lista lleva las tres piezas, y siempre del kit: nunca se escriben filtros a mano en la página.

- **Campos filtrables**: cada objeto declara los suyos en `lib/filtros/crm.ts` con `{ id, label, tipo, grupo, opciones?, valor(fila) }`. El `tipo` (`texto` · `numero` · `fecha` · `select` · `multiselect` · `booleano`) decide qué operadores se ofrecen. Se declaran también los campos calculados (nº de contactos, valor abierto): por eso se filtra en memoria sobre las filas ya cargadas, no en SQL.
- **Constructor** (`FilterBuilder`, botón «Filtros»): condiciones `campo + operador + valor` unidas con Y o con O. Viven en la URL (`?f=`) para poder compartir un filtro por enlace, y el servidor las aplica con `filtrarFilas` antes de mandar las filas. Operadores fijos: texto `contiene`/`es`/`empieza por`/`termina en`; número `mayor`/`menor`/`igual`; fecha `antes`/`después`/`el día`; listas `es alguno de`/`incluye todos`/`no incluye`; y `está vacío`/`no está vacío` en todos.
- **Filtros rápidos** (`QuickFilters`): los atajos de un clic junto al buscador. Dos clases: desplegable de un campo de lista, o condición guardada con nombre («Sin contactos»). Cuáles se ven, en qué orden y cuáles se borran se decide desde «Filtros rápidos», **dentro del desplegable de Filtros**: nunca un engranaje suelto en la toolbar. Se recuerdan por página en su navegador. Escriben en el mismo grupo de condiciones que el constructor, así que lo activo siempre se ve junto en los chips.
- **Campos visibles** (`ColumnSettings`): un botoncito de engranaje **en la cabecera del bloque** (prop `action` de `SectionHeader`, a la derecha del título y el contador), nunca en la toolbar. Interruptor por columna y arrastre para ordenar, como «Ocultar campos» de Airtable. La primera columna no se puede ocultar. Se recuerda por página con `useTableConfig`. Todos los campos propios son columna; `mostrarEnTabla` solo decide si empiezan encendidos. Solo se enseña con la tabla delante.
- Si el usuario es administrador, tanto el selector de campo como el panel ofrecen **crear un campo nuevo** sin salir de la lista (`CampoFormDialog`).
- La página junta todo con `useFiltrosAvanzados(clave, campos, rapidos)` y lo pinta con `FilterBar`. `FilterMenu` suelto solo dentro de `QuickFilters`.

## Fichas editables
- En el `DetailSheet` **todo dato se edita donde se lee**, con `InlineField`: se pulsa el valor y se convierte en campo. Enter guarda, Escape cancela, el blur guarda. Listas y sí/no llevan su control directamente.
- Un campo vacío **no se esconde**: muestra «Añadir …» en `text-muted-foreground` e invita a rellenarlo.
- `onSave` devuelve el mensaje de error o nada; mientras guarda el campo se atenúa y, si falla, un `toast` lo dice y el valor vuelve atrás. Lo calculado (fechas de alta, contadores) va con `readOnly`.
- El botón «Editar» del `Dialog` se queda solo para crear y para las altas rápidas, no para retocar un dato suelto.

## Estructura de archivos de una página
- `page.tsx` de servidor: `metadata`, carga de datos desde `lib/db/`, lectura de `searchParams` (incluido `?f=` con `parseGrupo` + `filtrarFilas`). Pasa los datos por props.
- `<modulo>-view.tsx` cliente: estado de filtros (`useFiltrosAvanzados`), columnas (`useTableConfig`), selección y vista (`usePageView(clave, vistas)`), registro abierto sincronizado con `?registro=id`.

## Interacción
- Fila o tarjeta entera clicable → abre el `DetailSheet`. Checkbox → selecciona. Selección → `BulkBar` flotante, fija al pie de la ventana y centrada (nunca acciones en bloque arriba).
- Vistas: `table` · `list` · `kanban` · `calendar` · `grid` con sus iconos fijos, en un `ViewSwitcher` segmentado; la vista se recuerda por página y en móvil la tabla cede el sitio a la lista (`RecordList`) o las tarjetas; búsqueda, filtros y selección se comparten entre vistas.
- Kanban: columnas grises con la cabecera dentro, fases de los extremos plegadas con `defaultCollapsed` cuando no caben; tarjeta con monograma, valor, etiqueta y pie de estado.
- Filtros: ver «Filtrar, ordenar y elegir campos». Todo filtro activo se marca en su botón y aparece como chip bajo la toolbar.
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
Una página no está terminada sin: `FilterBar` con rápidos y constructor, panel de campos visibles, orden, las vistas que apliquen, selección en bloque, detalle editable en el sitio, estados vacío/cargando/error, toasts y responsive básico (el panel baja debajo del bloque en < 1280 px).
