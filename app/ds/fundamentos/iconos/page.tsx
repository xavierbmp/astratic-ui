import type { LucideIcon } from "lucide-react"
import {
  ArchiveIcon,
  BanknoteIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ClockIcon,
  Columns3Icon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  FileSignatureIcon,
  FilterIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  LinkIcon,
  ListIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  NewspaperIcon,
  PaperclipIcon,
  PenLineIcon,
  PlusIcon,
  RadarIcon,
  ReceiptTextIcon,
  SearchIcon,
  SendIcon,
  Settings2Icon,
  SquareKanbanIcon,
  Table2Icon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"
import { SocialIcon } from "@/components/app/social-icons"

type Vocab = { concept: string; name: string; Icon: LucideIcon; note?: string }

const groups: { title: string; items: Vocab[] }[] = [
  {
    title: "Áreas y entidades",
    items: [
      { concept: "Dashboard", name: "layout-dashboard", Icon: LayoutDashboardIcon, note: "Primer ítem de la sidebar." },
      { concept: "Registros y CRM", name: "square-kanban", Icon: SquareKanbanIcon, note: "Antes kanban-square; KanbanSquareIcon sigue exportado como alias." },
      { concept: "Prospección", name: "radar", Icon: RadarIcon },
      { concept: "Email y secuencias", name: "send", Icon: SendIcon },
      { concept: "Equipo", name: "users", Icon: UsersIcon },
      { concept: "Persona", name: "user", Icon: UserIcon, note: "Un contacto, un talento, un responsable." },
      { concept: "Contratos", name: "file-signature", Icon: FileSignatureIcon },
      { concept: "Facturación", name: "receipt-text", Icon: ReceiptTextIcon },
      { concept: "Dinero", name: "banknote", Icon: BanknoteIcon, note: "Importes, pipeline, cobros en cifras y cabeceras." },
      { concept: "Campañas", name: "megaphone", Icon: MegaphoneIcon },
      { concept: "Eventos", name: "calendar-days", Icon: CalendarDaysIcon },
      { concept: "PR y prensa", name: "newspaper", Icon: NewspaperIcon },
      { concept: "Configurar", name: "settings-2", Icon: Settings2Icon, note: "El engranaje de ConfigButton y de campos visibles, en la cabecera del bloque que se configura." },
    ],
  },
  {
    title: "Acciones",
    items: [
      { concept: "Filtrar", name: "filter", Icon: FilterIcon },
      { concept: "Buscar", name: "search", Icon: SearchIcon },
      { concept: "Nuevo", name: "plus", Icon: PlusIcon, note: "Siempre con el objeto: «Nuevo registro»." },
      { concept: "Exportar", name: "download", Icon: DownloadIcon },
      { concept: "Importar", name: "upload", Icon: UploadIcon },
      { concept: "Editar", name: "pen-line", Icon: PenLineIcon },
      { concept: "Eliminar", name: "trash-2", Icon: Trash2Icon, note: "Solo dentro del menú «…» y del diálogo de confirmación." },
      { concept: "Archivar", name: "archive", Icon: ArchiveIcon },
      { concept: "Duplicar", name: "copy", Icon: CopyIcon },
      { concept: "Más acciones", name: "ellipsis", Icon: EllipsisIcon, note: "Botón-icono con aria-label «Más acciones»." },
      { concept: "Cerrar", name: "x", Icon: XIcon },
      { concept: "Confirmar", name: "check", Icon: CheckIcon, note: "Opción marcada en menús y chips." },
    ],
  },
  {
    title: "Estados y avisos",
    items: [
      { concept: "Hecho", name: "circle-check", Icon: CircleCheckIcon, note: "Toast de éxito." },
      { concept: "Pendiente", name: "clock", Icon: ClockIcon },
      { concept: "Atención", name: "triangle-alert", Icon: TriangleAlertIcon, note: "ErrorState y toast de aviso." },
      { concept: "Tendencia al alza", name: "trending-up", Icon: TrendingUpIcon, note: "Delta de KPI, 12 px." },
      { concept: "Tendencia a la baja", name: "trending-down", Icon: TrendingDownIcon },
    ],
  },
  {
    title: "Vistas",
    items: [
      { concept: "Tabla", name: "table-2", Icon: Table2Icon },
      { concept: "Lista", name: "list", Icon: ListIcon },
      { concept: "Kanban", name: "columns-3", Icon: Columns3Icon, note: "La vista; el área de registros usa square-kanban." },
      { concept: "Calendario", name: "calendar-days", Icon: CalendarDaysIcon },
      { concept: "Tarjetas", name: "layout-grid", Icon: LayoutGridIcon },
    ],
  },
  {
    title: "Contenido y comunicación",
    items: [
      { concept: "Enlace", name: "link", Icon: LinkIcon },
      { concept: "Adjunto", name: "paperclip", Icon: PaperclipIcon },
      { concept: "Notas", name: "message-square", Icon: MessageSquareIcon },
      { concept: "Notificaciones", name: "bell", Icon: BellIcon, note: "Campana de la cabecera." },
      { concept: "Ayuda", name: "circle-help", Icon: CircleHelpIcon },
    ],
  },
]

const sizes = [
  { cls: "size-5", px: 20, use: "Estados vacíos y de error" },
  { cls: "size-4", px: 16, use: "Menú, cabeceras, botones default" },
  { cls: "size-3.5", px: 14, use: "Botones sm, KPIs, celdas" },
  { cls: "size-3", px: 12, use: "Deltas, chips, badges" },
]

function componentName(name: string) {
  return (
    name
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("") + "Icon"
  )
}

export const metadata = { title: "Iconos" }

export default function IconosPage() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Iconos"
      lead="lucide-react y nada más. Cuatro tamaños, trazo 2, el color del texto y un vocabulario cerrado: el mismo concepto usa el mismo icono en todos los portales."
    >
      <DocSection id="set" title="Un solo set: lucide" lead="Trazo uniforme, caja de 24 px y un componente por icono. Los componentes del kit ya esperan un icono de lucide en sus props.">
        <Example>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {[LayoutDashboardIcon, SquareKanbanIcon, RadarIcon, SendIcon, UsersIcon, ReceiptTextIcon, MegaphoneIcon, CalendarDaysIcon, Settings2Icon].map((Icon, i) => (
              <Icon key={i} className="size-4 text-foreground" aria-hidden />
            ))}
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <SquareKanbanIcon className="size-4" aria-hidden />
              <span className="text-sm font-semibold text-foreground">Registros</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium tabular-nums text-secondary-foreground">128</span>
            </span>
          </div>
        </Example>
        <Rules
          items={[
            <>Se importan con sufijo <code>Icon</code> (<code>PlusIcon</code>, nunca <code>Plus</code>): evita choques con <code>Link</code> de Next, <code>Table</code> de shadcn o un <code>Filter</code> propio.</>,
            <>Trazo 2, el de lucide por defecto. No se toca <code>strokeWidth</code> ni <code>absoluteStrokeWidth</code>: un icono más fino o más grueso se nota enseguida al lado de los demás.</>,
            <>Color <code>currentColor</code>: el icono toma el color del texto que acompaña. En cabeceras de sección y etiquetas de cifra va en <code>text-muted-foreground</code>. Solo lleva color propio cuando el color significa algo: deltas (<code>text-success</code>, <code>text-danger</code>) y el estado de error.</>,
            <>Los componentes del kit reciben el componente, no el nodo: <code>icon={"{"}BanknoteIcon{"}"}</code> en <code>KpiCard</code>, <code>SectionHeader</code>, <code>FilterMenu</code> y <code>EmptyState</code>. Ellos ponen tamaño, color y <code>aria-hidden</code>.</>,
            <>Un concepto nuevo se resuelve buscando en lucide el icono más cercano y añadiéndolo a la tabla de vocabulario. Si no existe, no hay icono: nunca otro pack, nunca un emoji.</>,
          ]}
        />
      </DocSection>

      <DocSection id="tamanos" title="Tamaños y colocación" lead="El tamaño lo marca el contexto, no el gusto: Button y Badge ya lo aplican solos y el resto se escribe con size-*. Y un icono siempre acompaña a una palabra o, si va solo, a un aria-label.">
        <Example>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end gap-8">
              {sizes.map((s) => (
                <div key={s.cls} className="flex flex-col items-center gap-2 text-center">
                  <SendIcon className={s.cls} aria-hidden />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {s.cls} · {s.px} px
                  </span>
                  <span className="text-xs text-muted-foreground">{s.use}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t pt-5">
              <Button>
                <PlusIcon /> Nuevo registro
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon /> Exportar
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Más acciones">
                <EllipsisIcon />
              </Button>
              <StatusBadge tone="success">
                <CircleCheckIcon /> Cobrada
              </StatusBadge>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <BanknoteIcon className="size-3.5" aria-hidden /> Pipeline
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-success">
                <TrendingUpIcon className="size-3" aria-hidden /> +8,4 %
              </span>
            </div>
          </div>
        </Example>
        <SpecTable
          columns={["Tamaño", "Clase", "Dónde"]}
          rows={[
            ["16 px", <code key="a">size-4</code>, "Menú lateral, cabecera de Section, botones default e icon, conmutador de vistas, toasts, chevron de fila. Es el tamaño por defecto de Button y de la sidebar."],
            ["14 px", <code key="b">size-3.5</code>, "Botones sm (automático), etiqueta de KpiCard, bloques del panel de información, buscador de la cabecera, icono junto al texto de una celda."],
            ["12 px", <code key="c">size-3</code>, "Deltas de KPI, chips de filtros activos, flechas de orden en cabeceras de columna, botones xs. Badge lo fuerza con [&>svg]:size-3!, así que el icono de un badge siempre mide 12 px."],
            ["20 px", <code key="d">size-5</code>, "Solo estados vacíos y de error, dentro de su caja de 40 px. Nunca en botones, títulos ni cifras."],
          ]}
        />
        <Rules
          items={[
            <>En botones el orden es <strong>icono + verbo + objeto</strong>: «Nuevo registro», «Exportar», «Avanzar fase». En ítems de menú, cabeceras de sección y etiquetas de cifra, icono y texto van juntos con <code>gap-1.5</code> o <code>gap-2</code>.</>,
            <>Excepción: los botones-icono (<code>size="icon"</code>, <code>icon-sm</code>, <code>icon-xs</code>) para el menú «…», cerrar, paginación y el conmutador de vistas. Llevan <code>aria-label</code> siempre; el conmutador añade además un tooltip.</>,
            <>Nunca dos iconos en el mismo botón, ni icono a la derecha del texto salvo el chevron de un desplegable.</>,
            <>En tablas el icono va en la celda principal solo si aporta tipo (archivo, enlace, red social). No se decoran todas las celdas.</>,
            <>Cuando acompaña a texto, el icono es decorativo y lleva <code>aria-hidden</code>. Los componentes del kit ya lo hacen; en texto propio se escribe a mano.</>,
          ]}
        />
        <CodeBlock
          code={`// Icono + verbo + objeto. El icono hereda tamaño (16 px) y color del botón.
<Button><PlusIcon /> Nuevo registro</Button>
<Button variant="outline" size="sm"><DownloadIcon /> Exportar</Button>

// Botón-icono: solo con aria-label.
<Button variant="ghost" size="icon-sm" aria-label="Más acciones"><EllipsisIcon /></Button>

// Los componentes del kit reciben el componente, no el nodo.
<KpiCard icon={BanknoteIcon} label="Pipeline" value={fmt.eur(799342)} />
<SectionHeader icon={SquareKanbanIcon} title="Registros" count={128} />
<EmptyState icon={RadarIcon} title="Sin prospectos" description="Importa una lista o crea el primero." />

// Texto propio: tamaño explícito y aria-hidden.
<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
  <PaperclipIcon className="size-3.5" aria-hidden /> 3 adjuntos
</span>`}
        />
      </DocSection>

      <DocSection id="vocabulario" title="Vocabulario fijo" lead="El mismo concepto, el mismo icono, en todos los portales. Si dos portales usan iconos distintos para «eliminar», uno de los dos está mal.">
        {groups.map((g) => (
          <div key={g.title} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{g.title}</p>
            <SpecTable
              columns={["Concepto", "Icono", "Componente", "Uso"]}
              rows={g.items.map((it) => [
                it.concept,
                <span key="icon" className="inline-flex items-center gap-2">
                  <it.Icon className="size-4" aria-hidden />
                  <code>{it.name}</code>
                </span>,
                <code key="component">{componentName(it.name)}</code>,
                it.note ?? "",
              ])}
            />
          </div>
        ))}
        <Rules
          items={[
            <>El nombre del componente es el nombre de lucide en PascalCase con sufijo <code>Icon</code>: <code>trash-2</code> es <code>Trash2Icon</code>, <code>square-kanban</code> es <code>SquareKanbanIcon</code>.</>,
            <>Las cinco vistas tienen su icono fijo en <code>ViewSwitcher</code>; no se pasa ninguno. Calendario comparte icono con el área de eventos: la posición (toolbar o sidebar) deja claro cuál es cuál.</>,
            <>Un icono de esta tabla no se reutiliza para otro concepto. Si «archivar» es <code>archive</code>, ninguna otra acción del portal usa <code>archive</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="redes" title="Redes sociales" lead="lucide-react 1.x ya no incluye iconos de marca. Todos los iconos de redes son SVG propios del kit.">
        <Prose>
          <p>
            En la versión instalada (1.46) no existen <code>InstagramIcon</code>, <code>LinkedinIcon</code> ni <code>YoutubeIcon</code>. Las cuatro redes
            habituales (Instagram, TikTok, YouTube y LinkedIn) están en <code>components/app/social-icons.tsx</code> como un único componente{" "}
            <code>SocialIcon</code> con la prop <code>network</code>.
          </p>
          <p>
            Cada icono se dibuja en una caja de 24 px con relleno en <code>currentColor</code>, así que hereda el color del texto como cualquier icono de
            lucide. Mide 14 px por defecto y acepta <code>className</code> para <code>size-4</code> u otro tamaño de la escala. Lleva{" "}
            <code>aria-label</code> con el nombre de la red.
          </p>
        </Prose>
        <Example
          code={`import { SocialIcon } from "@/components/app/social-icons"

<span className="inline-flex items-center gap-1.5 text-sm">
  <SocialIcon network="instagram" className="size-4 text-muted-foreground" /> @cuenta1
</span>`}
        >
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {(["instagram", "tiktok", "youtube", "linkedin"] as const).map((n, i) => (
              <span key={n} className="inline-flex items-center gap-1.5">
                <SocialIcon network={n} className="size-4 text-muted-foreground" /> @cuenta{i + 1}
              </span>
            ))}
          </div>
        </Example>
        <Rules
          items={[
            <>Se usan a 14 o 16 px, en el color del texto, con el nombre de la red o la cuenta al lado. En una columna de solo iconos, el propio SVG ya lleva la etiqueta accesible.</>,
            <>Nunca con los colores corporativos de cada red ni como imagen <code>png</code>: son iconos del sistema, no logotipos.</>,
            <>Una red nueva se añade en el mismo archivo (un <code>path</code> más en el objeto y su etiqueta en <code>socialLabel</code>), no como archivo suelto.</>,
          ]}
        />
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Un icono de lucide por concepto, el de la tabla de vocabulario.",
            "size-4 en menús y botones, size-3.5 en botones sm y KPIs, size-3 en deltas y chips, size-5 solo en estados vacíos.",
            "Icono + verbo + objeto en cada botón; aria-label en cada botón-icono.",
            "Color heredado del texto; text-muted-foreground en cabeceras y etiquetas.",
          ]}
          donts={[
            "Iconos de otros packs (heroicons, tabler, phosphor) o emojis para lo que lucide no tiene.",
            "strokeWidth distinto de 2 o iconos rellenos, salvo los de redes que lo exigen.",
            "Iconos de color (text-brand, text-blue-500) para decorar títulos o celdas.",
            "Un icono solo, sin texto ni aria-label, o dos iconos en el mismo botón.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/buttons", label: "Botones", text: "Tamaños y cómo se coloca el icono." },
            { href: "/ds/componentes/states", label: "Estados", text: "El único sitio del icono de 20 px." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Vistas con icono fijo y botones-icono." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "Icono de 14 px y delta de 12 px." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
