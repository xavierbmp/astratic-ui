# Reglas — Design system Astratic UI

> Se copia tal cual a cada portal nuevo. La documentación completa vive en el repo `astratic-ui` (`/ds`). Estas reglas mandan sobre cualquier preferencia estética puntual.

## Stack fijo
- Next.js App Router · Tailwind v4 · shadcn/ui (preset Nova sobre Radix, base neutral) · lucide-react · Geist · Recharts · dnd-kit · react-hook-form + zod · next-themes · sonner.
- `cn` se importa de `"cn"`. Tokens en `app/globals.css`. Kit en `components/app/`.
- Nunca colores de Tailwind sueltos ni valores hex en JSX: solo tokens (`bg-card`, `text-muted-foreground`, `border`, `bg-brand-soft`, `text-success`…).
- Contraste en claro: `border` separa bloques, `input` bordea campos y botones outline, `control` bordea lo que se marca (casillas, radios): tiene que verse sin buscarlo. Lo seleccionado (filas, tarjetas, elementos de lista) va en `bg-brand-soft` con un filo `brand` a la izquierda; el hover, en `bg-muted`.

## Anatomía de una página de operación (orden fijo)
1. `PageBody` → `PageHeader` (título 27 px, descripción; a la derecha, `tabs` con las pestañas de subpágina si las hay y `actions` con botones outline).
2. `WorkGrid`, que reparte el resto de la página en dos columnas:
   - `stats={<KpiRow>}` con 3 a 5 `KpiCard`. Van **dentro** de la columna izquierda, no a ancho completo: `KpiRow` es `auto-fit minmax(180px,1fr)` y se reordena solo al estrecharse. Cuando las cifras son los tramos de un mismo recorrido (el estado de una base: sin normalizar, listas, en campaña…), van en el orden del trabajo y **cada una filtra la lista** al pulsarla (`KpiCard onClick` + `active`): es una condición más, que se ve en los chips. Cuentan toda la base, no solo las filas cargadas.
   - `toolbar`: **siempre `FilterBar`**, que monta buscador · filtros rápidos · botón «Filtros» · `ToolbarActions` (`ViewSwitcher` + botón principal negro y único) y los chips debajo. «Filtros» es uno más de la fila de rápidos y va **pegado al último visible**; solo las acciones se anclan a la derecha. **Todo en una línea**: los rápidos son la parte elástica y **los que no caben se recogen en un botón «+N» con flecha**, que abre un menú con esos mismos filtros y sus opciones (marcado si alguno está activo). Nunca se tapan ni esconden «Filtros». En móvil el buscador va en su propia línea y, si «+N» y «Filtros» no caben junto a las acciones, estas bajan a la siguiente. La toolbar mide lo que el bloque: nunca queda encima del panel de información.
   - **un** `Section` (bloque de operación) como hijo.
   - `aside={<InsightsPanel storageKey=… blocks=… />}`: ocupa la columna derecha **entera**, desde las cifras hasta el pie del bloque. El panel habla de toda la página, igual que las cifras, así que empiezan a la misma altura; empezar a la altura del bloque lo hacía parecer un apéndice de la tabla.
   - **Ficha en el panel**: en los ajustes del panel, cada persona puede elegir que la columna derecha sea la ficha del registro abierto en vez de «Información» (`usePanelFicha(clave)`, pasado a `WorkGrid ficha`, `InsightsPanel ficha` y `DetailSheet ficha`). Al pulsar una fila, la ficha se pone ahí sin abrirse encima; sin ninguna abierta, el panel dice cómo elegirla. Se ensancha o estrecha arrastrando su borde izquierdo (380 a 960 px, doble clic vuelve a 480) y la lista se ajusta sola. Solo con dos columnas (1280 px o más): por debajo, la ficha se abre encima como siempre.
   - Por debajo de 1280 px todo se apila en una columna y el panel va el último.
3. `DetailSheet` para el registro abierto, ordenado por bloques y con todos sus datos editables en el sitio (ver «Fichas»). Nunca un modal para ver un registro. Se abre al lado de la lista sin difuminarla (solo un velo muy suave): la lista sigue a la vista.

Dashboards: cifras + grid de secciones de resumen + panel «Hoy». No hay página de Ajustes: ver «Configuración in situ».

Página propia de un registro (un evento, una cuenta, una campaña que se trabaja durante semanas): la misma anatomía. `PageHeader` con el nombre del registro como título y `PageTabs` con sus partes (Producción · Invitados · Proveedores…), cifras de ese registro, un bloque de trabajo e `InsightsPanel` con sus datos. **Nunca la lista de registros junto al detalle**: ya estás dentro; se cambia de registro con las migas o ⌘K.

Una página de operación trabaja, no resume: **un solo bloque de trabajo** y un panel de 2 o 3 bloques cortos. Gráficos, rankings y clipping van al dashboard; el resto de partes, a subpáginas. Si al mirarla no se sabe dónde poner los ojos, sobra información.

## Subpáginas
- Un módulo con partes distintas que comparten título (Facturas y Cobros en Facturación) usa subpáginas: una ruta por parte (`/facturacion`, `/facturacion/cobros`) y `PageTabs` en la prop `tabs` de `PageHeader`.
- Las pestañas se definen una vez en `nav.ts` (campo `tabs` del ítem): la sidebar marca el módulo y las migas y ⌘K incluyen la subpágina.
- Mismo título en todas las subpáginas; cada una con su descripción, cifras, toolbar, bloque y panel. De 2 a 6; sin anidar.
- No son subpáginas: otra forma de ver los mismos datos (vista, `ViewSwitcher`) ni un recorte de la lista (filtro o segmento). Un solo segmentado por cabecera.

## Filtrar, ordenar y elegir campos (estilo Airtable)
Toda lista lleva las tres piezas, y siempre del kit: nunca se escriben filtros a mano en la página.

- **Campos filtrables**: cada objeto declara los suyos en `lib/filtros/crm.ts` con `{ id, label, tipo, grupo, opciones?, valor(fila) }`. El `tipo` (`texto` · `numero` · `fecha` · `select` · `multiselect` · `booleano`) decide qué operadores se ofrecen. Se declaran también los campos calculados (nº de contactos, valor abierto): por eso se filtra en memoria sobre las filas ya cargadas, no en SQL.
- **Constructor** (`FilterBuilder`, botón «Filtros»): condiciones `campo + operador + valor` unidas con Y o con O, y grupos dentro de grupos (hasta tres niveles) para mezclar Y con O. Viven en la URL (`?f=`) para poder compartir un filtro por enlace, y el servidor las aplica con `filtrarFilas` antes de mandar las filas. Operadores fijos: texto `contiene`/`es`/`empieza por`/`termina en`; número `mayor`/`menor`/`igual`; fecha `antes`/`después`/`el día` y relativas a hoy (`es hoy`, `es esta semana`, `en los próximos N días`, `ya pasó`… con `{ hoy }` en `filtrarFilas`); listas `es alguno de`/`incluye todos`/`no incluye`; y `está vacío`/`no está vacío` en todos.
- **Filtros rápidos** (`QuickFilters`): los atajos de un clic junto al buscador. Dos clases: desplegable de un campo de lista, o condición guardada con nombre («Sin contactos»). Cuáles se ven, en qué orden, cómo se llaman y qué condiciones aplican se decide desde «Filtros rápidos», **dentro del desplegable de Filtros**: nunca un engranaje suelto en la toolbar. Cada uno se edita con su lápiz en el mismo diálogo (si está puesto, la lista se filtra ya con lo nuevo) y los guardados se borran uno a uno, con confirmación: no hay «Restablecer» que borre de golpe lo que el usuario ha guardado. Se recuerdan por página en su navegador. Escriben en el mismo grupo de condiciones que el constructor, así que lo activo siempre se ve junto en los chips.
- **Campos visibles** (`ColumnSettings`): un botoncito de engranaje **en la cabecera del bloque** (prop `action` de `SectionHeader`, a la derecha del título y el contador), nunca en la toolbar. Interruptor por columna y arrastre para ordenar, como «Ocultar campos» de Airtable. La primera columna no se puede ocultar. Se recuerda por página con `useTableConfig`. Todos los campos propios son columna; `mostrarEnTabla` solo decide si empiezan encendidos. Solo se enseña con la tabla delante.
- Si el usuario es administrador, tanto el selector de campo como el panel ofrecen **crear un campo nuevo** sin salir de la lista (`CampoFormDialog`).
- La página junta todo con `useFiltrosAvanzados(clave, campos, rapidos)` y lo pinta con `FilterBar`. `FilterMenu` suelto solo dentro de `QuickFilters`.
- **Bases con vistas al estilo de Notion** (`/ds/componentes/base-de-datos`): cuando la persona necesita varias formas de ver lo mismo y quedárselas. Vistas guardadas en pestañas (`useVistas` + `VistasTabs`) en la cabecera del bloque, cada una con su filtro y su orden (sin guardar hasta «Guardar en la vista»), su agrupación (`AgruparMenu`), sus propiedades (`ColumnSettings` con `usePropiedadesDeVista`) y sus ajustes (`AjustesVistaMenu`); la tabla es `TablaAgrupada`. Los filtros de la toolbar se suman a los de la vista. Se ordena, agrupa y calcula con los mismos `CampoFiltrable` (`lib/vistas/core.ts`).

## Fichas (el `DetailSheet` de un registro)
Se leen de un vistazo y se editan donde se leen. Orden fijo:

- **Cabecera** (`DetailHeader`): avatar, **nombre editable en el sitio** (`InlineTitle`; nombre y apellidos se editan juntos), subtítulo corto («cargo · empresa»), insignia de estado y, arriba a la derecha, `RecordPager` (‹ 3 de 42 ›) para pasar al anterior o al siguiente de la lista filtrada sin cerrar. Debajo, acciones secundarias outline `sm` y el menú «…» (copiar enlace, eliminar al final en rojo). **No hay botón «Editar»**: el `Dialog` de formulario queda solo para crear. Tras las acciones secundarias, los **botones de acción propios** (`RecordActions`): cada persona se crea los suyos desde su engranaje y cada uno hace varias cosas seguidas de un clic (poner un campo a un valor, añadir una etiqueta, meter en una campaña preguntando a qué contactos si hay varios). La página declara las operaciones y las ejecuta; se guardan por persona y tipo de registro, y se editan o borran (con confirmación) desde el mismo engranaje.
- **Registro abierto**: su fila (`DataTable activeId`), su elemento de lista o su tarjeta (`Kanban openId`) se marcan como lo seleccionado mientras la ficha está abierta, esté encima o en el panel.
- **Cuerpo sin bloques de más** (regla de Xavier, 2026-10-05): los datos del registro van en **una sola lista** (`DetailFields`), sin bloques por tema («Contacto», «Empresa», «Gestión», «Campos propios»): primero los que se miran, después los campos propios en la misma lista, y las notas internas como un campo más. Para quien configura, debajo, «+ Nuevo campo» y el engranaje de ordenar. Solo llevan bloque (`DetailSection`) las listas relacionadas que tienen algo («Contactos», «Campañas», «Oportunidades»), con su contador y «Añadir»; vacías, no se pintan (como mucho, un botón «+ Añadir a…»). Al final, `DetailMeta`. Las pestañas de notas, tareas o actividad no repiten su título en un bloque.
- **Campos** en `DetailFields`: etiqueta a la izquierda con ancho fijo en toda la ficha, valor a la derecha. **En reposo ningún valor lleva caja**: texto, insignias o enlaces; el control aparece al pulsar (`InlineField`, y los selectores de relación con `variant="inline"`). Enter o salir guarda, Escape cancela ese campo sin cerrar la ficha. Listas obligatorias con `required` (sin «Sin valor»). Sí/no con su interruptor.
- **Campos vacíos**: no ocupan fila. Van al pie de su bloque como botones «+ Campo» (`DetailField empty`); al pulsar uno, el campo aparece ya editándose. La ficha enseña lo que se sabe y sigue invitando a completar lo que falta.
- `onSave` devuelve el mensaje de error o nada; mientras guarda el campo se atenúa y, si falla, un `toast` lo dice y el valor vuelve atrás. Lo calculado (contadores, fechas de alta) va en `DetailMeta` o con `readOnly`.
- **Pie** (`DetailFooter`): «Cerrar» ghost y la acción principal del registro.

### Fichas de trabajo diario (prospección, seguimiento)
Una ficha que se abre decenas de veces al día no puede repartir lo que se mira siempre en bloques que hay que recorrer:

- **Acciones del flujo arriba**, en la cabecera: las dos o tres que mueven el registro («Normalizada», «Añadir a campaña», «Nuevo contacto»). La que ya no aplica no se enseña; el resto, en «…».
- **Resumen fijo** (`DetailSummary`, justo bajo la cabecera y antes de las pestañas): los enlaces como iconos en una fila (`DetailLinks`: un clic abre, el lápiz edita, los vacíos van atenuados; LinkedIn e Instagram con `SocialIcon`), los datos clave en dos columnas (`DetailFields columns={2}`) y una fila de gestión con lo que son acciones, no datos: responsable y etiquetas como botones («+ Etiqueta»), nunca en un bloque «Gestión».
- **Debajo, el trabajo**: los contactos con cargo, email (se copia con un clic) y su LinkedIn; o el seguimiento. Una lista relacionada vacía no ocupa bloque.
- **El perfil completo y los campos propios, en la pestaña «Datos»**, en la misma lista sin bloques. Pestañas: «Resumen» o «Seguimiento» primero, luego «Datos», y después notas, tareas e historial.
- **Seguimiento** (`InteractionLog`): cada botón («Follow-up», «Status») **crea la entrada al pulsarlo**, con la fecha de hoy; la nota es opcional y se escribe después en la tarjeta (en un status arranca ya editándose). Sin formulario previo. Los follow-ups se numeran solos. Cada entrada la cambia o la borra quien la apuntó o un administrador, y borrar pide confirmación.

### Fichas de dos columnas
Para un registro que recorre una secuencia (un contacto dentro de una campaña, un pedido por sus fases): `DetailSheet` ancho (960-1040) con `DetailSplit`. A la izquierda el recorrido (`StepTimeline`: hecho, lo que toca ahora, lo que vendrá, lo que no pasará, cada uno con su fecha) y los datos de ese registro en la secuencia; a la derecha, en grande, el paso elegido. Se abre en lo que toca ahora. En móvil las columnas se apilan.

### Contenido que se edita para un solo registro
Cuando un contenido sale de una plantilla (un email de campaña), se ve **exactamente como le llega** a cada registro y se puede reescribir solo para él: se lee tal cual y, al pulsarlo, pasa a editor; «Guardar para Ana» lo deja solo para esa persona, con la marca «Editado a mano» y «Volver a la plantilla» (con «Deshacer» en el toast). Lo que ya salió se ve pero no se edita. Las flechas recorren los registros empezando por los que lo tienen pendiente.

### Cambios sin guardar
Si hay un editor con cambios sin guardar y se va a cambiar de registro, de paso o cerrar, `ConfirmDialog` «¿Descartar los cambios?» con «Seguir editando» y «Descartar cambios» (destructivo). ⌘+Enter guarda; Escape solo sale si no hay cambios.

### HTML que no escribe el portal
Emails, firmas o documentos importados se pintan siempre en `HtmlFrame` (marco aislado, sin scripts, que crece con su contenido). Nunca `dangerouslySetInnerHTML` con HTML de fuera.

## Configuración in situ (sin página de Ajustes)
Nada se configura en una página de ajustes aparte: cada cosa se configura **donde se usa**. Solo tiene página propia lo que no pertenece a ninguna pantalla (el equipo y sus permisos).

- **Engranaje** (`ConfigButton`, mismo icono que el de campos visibles): en la cabecera del bloque o del panel que enseña lo configurable (líneas en «Por línea», remitentes en su bloque) y junto a la etiqueta de un `Select` simple de formulario (pipeline, remitente).
- **En la ficha, pulsar el nombre de un campo abre su configuración** (`DetailField onConfig`): el valor se edita donde se lee y el campo se configura donde se nombra.
- **Opciones de un selector**: `MultiSelect` e `InlineField` con `onCreate` (escribir algo que no existe ofrece «Crear «…»») y `onManage` (pie «Gestionar …» que abre su gestor).
- **Kanban**: el título de la columna se pulsa para configurarla, sus opciones van en el menú «…» (editar, añadir a la derecha, mover, eliminar) y al final hay una columna «Añadir» (`columnMenu`, `onColumnTitleClick`, `onAddColumn`).
- **Campos propios en la tabla**: lápiz y papelera en el panel de campos visibles (`ColumnSettings camposPropios`).
- Los gestores son `Dialog` que cargan sus datos al abrirse (nunca de serie con la página) y cuelgan de un proveedor común. Solo los ve quien puede configurar: sin permiso no hay engranaje.
- Las listas largas que no son configuración (supresión, archivos) son páginas hijas del módulo que las usa, con flecha de volver y un botón outline en la cabecera del módulo (como Plantillas en Outreach).

## Estructura de archivos de una página
- `page.tsx` de servidor: `metadata`, carga de datos desde `lib/db/`, lectura de `searchParams` (incluido `?f=` con `parseGrupo` + `filtrarFilas`). Pasa los datos por props.
- `<modulo>-view.tsx` cliente: estado de filtros (`useFiltrosAvanzados`), columnas (`useTableConfig`), selección y vista (`usePageView(clave, vistas)`), registro abierto sincronizado con `?registro=id`.

## Interacción
- Fila o tarjeta entera clicable → abre el `DetailSheet`. Checkbox → selecciona. Selección → `BulkBar` flotante, fija al pie de la ventana y centrada (nunca acciones en bloque arriba). Lo seleccionado se ve siempre: fondo `bg-brand-soft` y filo `brand`.
- Vistas: `table` · `list` · `kanban` · `calendar` · `grid` con sus iconos fijos, en un `ViewSwitcher` segmentado; la vista se recuerda por página y en móvil la tabla cede el sitio a la lista (`RecordList`) o las tarjetas; búsqueda, filtros y selección se comparten entre vistas.
- Kanban: columnas grises con la cabecera dentro, fases de los extremos plegadas con `defaultCollapsed` cuando no caben; tarjeta con monograma, valor, etiqueta y pie de estado. Con muchas tarjetas por fase, `density="compact"`: tarjeta de dos o tres líneas sin monograma (nombre y fecha de la última interacción; contacto y valor; principio de lo último apuntado), ordenadas por esa fecha.
- Filtros: ver «Filtrar, ordenar y elegir campos». Todo filtro activo se marca en su botón y aparece como chip bajo la toolbar.
- Destructivo → `ConfirmDialog` con nombre de lo que se borra. Reversible → se ejecuta y el `toast` ofrece «Deshacer».
- Feedback siempre con `toast` (sonner). Prohibido `alert`, `confirm`, avisos de texto en la toolbar.
- Formularios: label encima, ayuda debajo, error debajo. `Dialog` de 480 px para crear/editar registros sencillos. Botones del pie: «Cancelar» ghost + acción principal.

## Reportar un problema
- Todo portal monta `ReportButton` una vez en el shell (prop `report` de `AppShell`): el bicho va en la cabecera, **entre el buscador y la campana**. Nunca un botón flotante ni un enlace de «feedback» por página.
- La ficha tapa la cabecera, así que `DetailHeader` lleva el bicho en pequeño junto a las flechas (`ReportTrigger`): abre el mismo diálogo del shell. No se añade a mano.
- `Dialog` de 480 px con dos pestañas: «Nuevo» (qué pasa + «Señalar en la página», opcional) y «Enviados» (cada reporte con su `StatusBadge`, Pendiente · En curso · Resuelto · Descartado, y la respuesta de quien lo cerró).
- Señalar esconde el diálogo, resalta en `brand` lo que hay bajo el ratón con su nombre del kit y un clic lo elige; Esc cancela y la página no reacciona mientras tanto. ⇧⌘X lo abre desde cualquier sitio, también con una ficha o un diálogo abiertos.
- El contexto va solo (ruta con la query, pantalla, tema, navegador, últimos errores y los contenedores del kit del elemento): no se pide nada que la página ya sabe.
- Se guarda en la BD del proyecto con quien lo envía. Un reporte no se borra: se resuelve o se descarta, siempre con una respuesta de una frase. «Resuelto» es arreglado **y publicado**; antes es «En curso».

## Componentes y copy
- Botones: icono lucide + verbo + objeto («Nuevo registro»). `default` en toolbars y pies; `sm` en tablas y barras.
- Estados solo con `StatusBadge` (`success` hecho/activo · `info` en curso · `warning` pendiente · `danger` vencido/error · `neutral` borrador).
- Avatares: `AvatarInitials` con `variant="entity"` para registros y marcas, por defecto para personas. Nunca negros ni de colores.
- Tablas: `DataTable` con `CellPrimary` en la primera columna, números a la derecha con `tabular-nums`, columnas secundarias con `hideBelow`.
- Vacío: `EmptyState` que dice cómo poblarlo. Cargando: `TableSkeleton`/`KanbanSkeleton`/`KpiSkeleton`. Error: `ErrorState` con reintento.
- Textos en español, sin guiones largos, sin anglicismos innecesarios. Euros `1.234 €`, porcentajes `32 %`, fechas `24 sep` (usar `lib/format.ts`).

## Estándar de completitud
Una página no está terminada sin: `FilterBar` con rápidos y constructor, panel de campos visibles, orden, las vistas que apliquen, selección en bloque, ficha por bloques editable en el sitio y con flechas, estados vacío/cargando/error, toasts y responsive básico (el panel baja debajo del bloque en < 1280 px). Se revisa también en modo claro: bordes, casillas y selección tienen que verse.
