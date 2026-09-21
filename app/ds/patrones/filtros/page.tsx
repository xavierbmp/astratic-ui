import { DownloadIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Rules, SpecTable } from "@/components/docs/doc"
import { FilterBarDemo } from "@/components/docs/examples/filter-bar-demo"
import { CodeBlock } from "@/components/docs/code-block"
import { FiltersDemo } from "@/components/docs/examples/filters-demo"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = { title: "Filtros y vistas" }

export default function FiltrosPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Filtros y vistas"
      lead="Cómo se busca, se filtra, se ordena y se cambia de vista en cualquier página de registros. Un solo juego de controles, siempre en el mismo sitio y con el mismo comportamiento: quien aprende una página sabe usar todas."
    >
      <DocSection
        id="controles"
        title="Los controles"
        lead="El orden de la toolbar está fijado en Convenciones: buscador, filtros, espacio, vistas, acción principal. Aquí se define cómo es cada control y cuándo se usa."
      >
        <SpecTable
          columns={["Tipo de filtro", "Control", "Cuándo"]}
          rows={[
            [
              "Búsqueda de texto",
              <>
                <code>ToolbarSearch</code>, hasta 256 px, siempre el primero
              </>,
              "Siempre. Busca en los campos de texto principales del registro: nombre, código y categoría. Filtra al escribir, sin botón.",
            ],
            [
              "Dimensión con varias opciones",
              <>
                <code>FilterMenu</code> con checkboxes (<code>multiple</code>, por defecto)
              </>,
              "Fase, estado, responsable, etiqueta: el usuario quiere ver dos o tres valores a la vez.",
            ],
            [
              "Dimensión excluyente",
              <>
                <code>FilterMenu multiple={"{false}"}</code> con radios
              </>,
              "Solo tiene sentido un valor a la vez: tipo de documento, moneda, área.",
            ],
            [
              "Fecha",
              <>
                <code>FilterMenu</code> con presets y una opción «Personalizado» que abre un <code>Calendar</code> en rango
              </>,
              "El registro tiene una fecha que manda: vencimiento, fecha del evento, emisión.",
            ],
            [
              "Más de cuatro dimensiones",
              <>
                Botón «Más filtros» que abre un <code>Popover</code> con el resto de menús{" "}
                <span className="text-muted-foreground">(pendiente en el kit)</span>
              </>,
              "Solo cuando la página necesita más de cuatro menús. Antes, pregúntate si sobra alguno.",
            ],
            [
              "Subconjuntos habituales",
              <>
                <code>Tabs</code> en las acciones de página
              </>,
              "De 2 a 4 segmentos que la gente abre a diario: Míos, Sin asignar, Vencidos.",
            ],
            [
              "Orden",
              "Cabecera de columna en tabla; menú «Ordenar» en la cabecera del bloque en kanban y lista",
              "Siempre. Toda vista tiene un orden por defecto y una forma de cambiarlo.",
            ],
          ]}
        />
        <Rules
          items={[
            <>
              <strong>Buscador:</strong> ancho fijo de 256 px, lupa dentro del campo y un placeholder que dice qué campos busca («Buscar
              registro o código…»). No hay botón «Buscar» ni hay que pulsar Intro: filtra al escribir y se vacía con la X nativa del campo.
            </>,
            <>
              <strong>Menú de filtro:</strong> un botón outline de 32 px por dimensión, con el nombre de la dimensión («Fase») y un chevron.
              El desplegable lleva el nombre como cabecera, una opción por línea y el contador de cada una a la derecha. Con algo elegido,
              el botón cambia de fondo y muestra la opción (si es una) o el número de opciones (si son varias); al final del desplegable
              aparece «Quitar filtro».
            </>,
            <>
              Los contadores de las opciones cuentan sobre el <strong>total de la página</strong>, no sobre lo ya filtrado: el usuario tiene que saber
              cuánto hay en cada valor antes de elegirlo.
            </>,
            <>
              <strong>Máximo cuatro menús visibles.</strong> Del quinto en adelante van dentro de «Más filtros», que se marca igual que un menú
              activo cuando alguno de los suyos tiene valor.
            </>,
            <>
              <strong>Fecha:</strong> un menú más, con presets fijos y en este orden: Hoy, Esta semana, Este mes, Trimestre, Personalizado.
              «Personalizado» abre un <code>Calendar</code> en modo rango dentro del propio desplegable. El botón muestra el preset o el rango
              («12 sep a 30 sep») y el chip dice «Fecha: Este mes». Nunca dos campos de texto para escribir fechas a mano.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="Ejemplo"
        lead="Buscador, dos menús (uno múltiple, otro excluyente), chips y conmutador de vistas funcionando sobre doce registros inventados. El contador del bloque y la vista cambian con los filtros; la vista se recuerda al recargar."
      >
        <Example>
          <FiltersDemo />
        </Example>
        <CodeBlock
          title="Cómo se conecta"
          code={`const [query, setQuery] = React.useState("")
const [fase, setFase] = React.useState<string[]>([])
const [owner, setOwner] = React.useState<string[]>([])
const [view, setView] = useLocalStorage<ViewKind>("view:registros", "table")

const q = query.trim().toLowerCase()
const filtered = registros.filter(
  (r) =>
    (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) &&
    (fase.length === 0 || fase.includes(r.fase)) &&
    (owner.length === 0 || owner.includes(r.owner))
)

const chips = [
  ...fase.map((v) => ({ label: \`Fase: \${faseLabel(v)}\`, onRemove: () => setFase(fase.filter((x) => x !== v)) })),
  ...owner.map((v) => ({ label: \`Responsable: \${ownerLabel(v)}\`, onRemove: () => setOwner(owner.filter((x) => x !== v)) })),
]

<WorkGrid
  toolbar={
    <>
      <Toolbar>
        <ToolbarSearch placeholder="Buscar registro…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu label="Fase" options={fases.map((f) => ({ value: f.id, label: f.label, count: countBy("fase", f.id) }))} value={fase} onChange={setFase} />
        <FilterMenu label="Responsable" icon={UserIcon} multiple={false} options={owners} value={owner} onChange={setOwner} />
        <ToolbarActions>
          <ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />
          <Button><PlusIcon /> Nuevo registro</Button>
        </ToolbarActions>
      </Toolbar>
      <ActiveFilters chips={chips} onClear={() => { setFase([]); setOwner([]) }} />
    </>
  }
>
  <Section>
    <SectionHeader title="Registros" count={filtered.length} />
    …
  </Section>
</WorkGrid>`}
        />
      </DocSection>

      <DocSection
        id="segmentos"
        title="Filtros rápidos y segmentos guardados"
        lead="Cuando una página tiene dos, tres o cuatro subconjuntos que la gente abre cada día, no se esconden en un menú: se ven."
      >
        <Example
          title="Segmentos como tabs en las acciones de página"
          description="A la derecha del título, junto a las acciones secundarias. Nunca en la toolbar: la toolbar es de los filtros libres."
        >
          <PageHeader
            title="Registros"
            description="Base de datos de registros y su fase."
            actions={
              <>
                <Tabs defaultValue="todos">
                  <TabsList>
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="mios">Míos</TabsTrigger>
                    <TabsTrigger value="sin-asignar">Sin asignar</TabsTrigger>
                    <TabsTrigger value="vencidos">Vencidos</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline">
                  <DownloadIcon /> Exportar
                </Button>
              </>
            }
          />
        </Example>
        <Rules
          items={[
            <>
              Un segmento es un filtro predefinido con nombre. Se aplica <strong>antes</strong> que los filtros de la toolbar y se combina con
              ellos: «Míos» + Fase: Propuesta muestra mis propuestas.
            </>,
            <>El primero es siempre «Todos». Después, de 2 a 4 segmentos. Si hacen falta más, es que son filtros normales.</>,
            <>
              Un solo segmentado por cabecera: si la página tiene subpáginas, sus pestañas ocupan ese sitio y los segmentos pasan a un{" "}
              <code>FilterMenu</code> de selección única, el primero de la toolbar.
            </>,
            <>
              El segmento activo va en la URL como <code>?segmento=mios</code>, igual que el resto de filtros, y el contador del bloque lo refleja.
            </>,
            <>
              Los segmentos que crea el propio usuario (sus combinaciones de filtros con nombre) no están en la v1 del kit. Cuando lleguen, se
              guardarán como preferencia de usuario (ver Paneles personalizables) y aparecerán en el mismo grupo de tabs, después de los fijos.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="avanzados"
        title="Filtros avanzados, rápidos y campos visibles"
        lead="Los menús de arriba resuelven el día a día de un clic. Para lo fino —«empresas con más de tres contactos y sin responsable»— la toolbar monta un constructor de condiciones al estilo de Airtable, y un panel decide qué columnas se ven. Las tres piezas van juntas en FilterBar."
      >
        <Example
          title="FilterBar con rápidos que se recogen en «+N»"
          description="Estrecha el recuadro: los rápidos que no caben pasan a «+N» (menú con sus opciones) y «Filtros» sigue pegado detrás del último visible. En «Filtros» se montan condiciones y se eligen, ordenan o guardan los rápidos."
        >
          <FilterBarDemo />
        </Example>
        <SpecTable
          columns={["Pieza", "Componente", "Qué hace"]}
          rows={[
            [
              "Constructor",
              <>
                <code>FilterBuilder</code> (botón «Filtros»)
              </>,
              "Condiciones campo + operador + valor unidas con Y o con O. Los operadores salen del tipo del campo, así que en texto hay «contiene» y «empieza por», en número «mayor que», en fecha «antes de» y en listas «es alguno de». En todos, «está vacío» y «no está vacío».",
            ],
            [
              "Rápidos",
              <>
                <code>QuickFilters</code> + <code>useQuickFilters</code>
              </>,
              "Los atajos junto al buscador. O el desplegable de un campo de lista, o una condición guardada con nombre. El usuario elige cuáles ve, los ordena y guarda los suyos desde «Filtros rápidos», dentro del desplegable de «Filtros». Los que no caben en la fila se recogen en un botón «+N» con flecha.",
            ],
            [
              "Campos visibles",
              <>
                <code>ColumnSettings</code> + <code>useTableConfig</code>
              </>,
              "Interruptor por columna y arrastre para ordenar. La primera columna no se puede ocultar porque identifica la fila.",
            ],
            [
              "Definición de campos",
              <>
                <code>CampoFiltrable&lt;T&gt;</code> en <code>lib/filtros/</code>
              </>,
              "Cada objeto declara sus campos con id, etiqueta, tipo, grupo, opciones y una función valor(fila). Incluidos los calculados: nº de contactos, importe abierto, días en fase.",
            ],
          ]}
        />
        <CodeBlock
          lang="tsx"
          code={`// 1. Los campos del objeto, en un módulo compartido servidor/cliente.
export function camposEmpresa(ctx: ContextoCampos): CampoFiltrable<EmpresaFila>[] {
  return [
    { id: "nombre", label: "Nombre", tipo: "texto", grupo: "Datos", valor: (r) => r.nombre },
    { id: "relacion", label: "Relación", tipo: "select", grupo: "Relación",
      opciones: desdeMeta(relacionEmpresa), valor: (r) => r.relacion },
    { id: "contactos", label: "Nº de contactos", tipo: "numero", grupo: "Actividad", valor: (r) => r.contactos },
  ]
}

// 2. El servidor lee ?f= y filtra antes de mandar las filas.
const filas = filtrarFilas(lista.filas, parseGrupo(leerTexto(sp, "f")), camposEmpresa({ catalogo, opciones }))

// 3. La página monta la toolbar entera con una sola pieza.
const campos = React.useMemo(() => camposEmpresa({ catalogo, opciones }), [catalogo, opciones])
const av = useFiltrosAvanzados("crm-marcas", campos, RAPIDOS)
const cols = useTableConfig("crm-marcas", columns)

<WorkGrid
  toolbar={
    <FilterBar
      filtros={av}
      campos={campos}
      filas={filas}
      objeto="las empresas"
      buscador={{ value: q, onChange: setQ, placeholder: "Buscar empresa…" }}
      vistas={{ views, value: view, onChange: setView }}
      actions={<Button><PlusIcon /> Nueva empresa</Button>}
    />
  }
>
  <Section>
    {/* Campos visibles: en la cabecera del bloque, nunca en la toolbar. */}
    <SectionHeader title="Empresas" count={filas.length} action={<ColumnSettings config={cols} />} />
    …
  </Section>
</WorkGrid>`}
        />
        <Rules
          items={[
            <>
              <strong>Las condiciones van en la URL</strong> (<code>?f=</code>), como el resto de filtros: un filtro montado se comparte por
              enlace y el servidor lo aplica antes de mandar las filas. Los rápidos, en cambio, son preferencia de cada uno y se quedan en su
              navegador, igual que la vista y el panel de información.
            </>,
            <>
              <strong>Rápidos y constructor escriben en el mismo sitio.</strong> Un desplegable rápido no es un filtro aparte: añade una
              condición al mismo grupo. Por eso todo lo activo se ve junto en los chips y se puede afinar desde «Filtros».
            </>,
            <>
              <strong>Los rápidos nunca tapan «Filtros».</strong> La fila enseña los que caben en el sitio que deja la toolbar y recoge el
              resto en un botón «+N» con flecha, que abre un menú con esos mismos filtros y sus opciones; si alguno de ellos está activo, el
              botón lo marca. «Filtros» va siempre pegado detrás del último visible. Al estrechar la ventana se recogen más; al
              ensanchar, vuelven a la fila.
            </>,
            <>
              <strong>Filtrar en memoria sobre las filas ya cargadas</strong> (tope de 1.000) en vez de traducir cada condición a SQL. Así se
              filtra también por lo calculado, que no es una columna de la base, y el evaluador es el mismo en cliente y servidor. La búsqueda
              de texto sí va en SQL, porque mira registros relacionados.
            </>,
            <>
              <strong>Una condición a medio escribir no filtra.</strong> Sin valor, o con un campo que ya no existe, deja pasar las filas en
              vez de vaciar la tabla. Una URL manipulada tampoco rompe la página: se descarta lo que no se entiende.
            </>,
            <>
              <strong>Los campos propios son columna siempre.</strong> «Mostrar en tabla» solo decide si empiezan encendidos; quien quiera ver
              el resto los enciende en el panel. Un campo nuevo aparece sin que nadie toque su configuración guardada.
            </>,
            <>
              <strong>Crear un campo sin salir de la lista.</strong> Si quien mira es administrador, tanto el selector de campo del
              constructor como el panel de campos ofrecen «Crear campo nuevo».
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="combinacion" title="Cómo se combinan y dónde se guardan">
        <Rules
          items={[
            <>
              <strong>AND entre dimensiones, OR dentro de una dimensión.</strong> Fase: Propuesta, Negociando + Responsable: Usuario 2 devuelve
              los registros de Usuario 2 que están en propuesta o en negociación. El buscador es una dimensión más.
            </>,
            <>
              Los filtros viven en la <strong>URL</strong>: <code>?fase=propuesta,negociando&responsable=u2</code>. Así el enlace se comparte, se
              guarda en favoritos y se recupera con «atrás». Una clave por dimensión, varios valores separados por coma y siempre el{" "}
              <code>id</code> del valor, nunca su etiqueta.
            </>,
            <>
              El <strong>buscador no va a la URL</strong>: es efímero y cambia con cada tecla.
            </>,
            <>
              La <strong>vista</strong> (tabla, lista, kanban) no es un filtro: se guarda en <code>localStorage</code> con la clave{" "}
              <code>view:&lt;página&gt;</code> mediante <code>useLocalStorage</code>. Cambiar de vista no toca búsqueda, filtros ni selección.
            </>,
            <>
              Los filtros de la interfaz se traducen 1:1 a la función <code>list(filters, sort, page)</code> de la capa de datos (ver Arquitectura
              de datos). No se filtra en el componente lo que la base de datos puede filtrar.
            </>,
          ]}
        />
        <CodeBlock
          lang="ts"
          title="Filtros en la URL"
          code={`import { usePathname, useRouter, useSearchParams } from "next/navigation"

const KEYS = ["fase", "estado", "responsable", "fecha"] as const

export function fromQuery(params: URLSearchParams) {
  return Object.fromEntries(KEYS.map((key) => [key, params.get(key)?.split(",").filter(Boolean) ?? []])) as Record<(typeof KEYS)[number], string[]>
}

export function toQuery(filters: Record<string, string[]>) {
  const parts = Object.entries(filters)
    .filter(([, values]) => values.length > 0)
    .map(([key, values]) => \`\${key}=\${values.map(encodeURIComponent).join(",")}\`)
  return parts.length ? \`?\${parts.join("&")}\` : ""
}

const router = useRouter()
const pathname = usePathname()
const filters = fromQuery(useSearchParams())

const setFilter = (key: string, values: string[]) =>
  router.replace(\`\${pathname}\${toQuery({ ...filters, [key]: values })}\`, { scroll: false })`}
        />
      </DocSection>

      <DocSection
        id="cifras-y-orden"
        title="Cifras, contador y orden"
        lead="Filtrar cambia todo lo que hay debajo del título. Si algo no cambia, el usuario deja de fiarse de las cifras."
      >
        <Rules
          items={[
            <>
              Las <strong>cifras</strong> de la página (KPI) se calculan sobre lo filtrado y su línea de apoyo lo hace visible: «12 registros».
            </>,
            <>
              El <strong>contador</strong> de la cabecera del bloque cuenta lo filtrado. El total solo aparece en la paginación del pie: «1 a 10 de 12».
            </>,
            <>
              El <strong>panel de información</strong> también se calcula sobre lo filtrado, salvo los bloques que hablan de toda la página («Actividad
              reciente»).
            </>,
            <>
              Con filtros activos y sin resultados, el <code>EmptyState</code> dice «Ningún registro coincide» y ofrece «Quitar filtros». El texto
              de página vacía («Aún no hay registros») se reserva para cuando no hay filtros.
            </>,
            <>
              <strong>Orden en tabla:</strong> pulsando la cabecera de la columna (ascendente, descendente, sin orden). Solo las columnas con{" "}
              <code>sortValue</code> muestran la flecha. Un orden a la vez.
            </>,
            <>
              <strong>Orden en kanban y lista:</strong> no hay cabeceras, así que un menú «Ordenar» outline va en la cabecera del bloque, a la
              derecha, con las mismas opciones que las columnas ordenables de la tabla. En kanban ordena dentro de cada columna.
            </>,
            <>
              El orden se guarda en la URL como <code>?orden=valor:desc</code> cuando el usuario lo cambia. El orden por defecto de cada página
              (normalmente «Actualizado» descendente) no se escribe.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Buscador primero, menús después, cada opción con su contador.",
            "Chips debajo de la toolbar con «Limpiar» al final.",
            "Filtros en la URL con ids; vista en localStorage.",
            "Segmentos diarios como tabs junto al título.",
            "Cifras y contador recalculados con cada filtro.",
          ]}
          donts={[
            "Un botón «Buscar» o «Aplicar filtros»: todo filtra al instante.",
            "Cinco o más menús en fila: a partir del cuarto, «Más filtros».",
            "Dos campos de texto para escribir fechas a mano.",
            "Filtros dentro del bloque de operación o en el panel de información.",
            "Perder los filtros al cambiar de vista o al abrir un registro.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "El orden fijo de la toolbar y las interacciones." },
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "Props de ToolbarSearch, FilterMenu, ActiveFilters y ViewSwitcher." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "Orden por columna, selección y paginación." },
            { href: "/ds/patrones/datos", label: "Arquitectura de datos", text: "Cómo los filtros llegan a list(filters, sort, page)." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
