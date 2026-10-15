import {
  BookOpenIcon,
  BookOpenTextIcon,
  BookTextIcon,
  BoxesIcon,
  CalendarDaysIcon,
  FolderTreeIcon,
  PaperclipIcon,
  MessagesSquareIcon,
  LightbulbIcon,
  ChartColumnIcon,
  CircleUserIcon,
  DatabaseIcon,
  FileTextIcon,
  FilterIcon,
  GaugeIcon,
  HeadingIcon,
  InboxIcon,
  LayoutTemplateIcon,
  ListChecksIcon,
  MessageSquareIcon,
  MousePointerClickIcon,
  PackageIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelRightOpenIcon,
  RectangleHorizontalIcon,
  RocketIcon,
  RulerIcon,
  ScrollTextIcon,
  SearchIcon,
  ShapesIcon,
  SignpostIcon,
  SlidersHorizontalIcon,
  KanbanSquareIcon,
  SmartphoneIcon,
  SparklesIcon,
  SwatchBookIcon,
  SquareIcon,
  SquareKanbanIcon,
  Table2Icon,
  TagIcon,
  TextCursorInputIcon,
  TypeIcon,
  ZapIcon,
} from "lucide-react"
import type { Brand, CurrentUser, NavGroup, NavItem } from "@/lib/nav"

export const dsBrand: Brand = { name: "Astratic UI", tagline: "Design system", monogram: "A" }
export const dsUser: CurrentUser = { name: "Astratic Devs", role: "Documentación" }

export const componentPages: { slug: string; label: string; summary: string; icon: NavItem["icon"] }[] = [
  { slug: "shell", label: "Shell de aplicación", summary: "Sidebar, cabecera, migas, buscador ⌘K y usuario.", icon: PanelLeftIcon },
  { slug: "report-button", label: "Sugerencias y problemas", summary: "La bombilla de la cabecera: proponer un cambio o contar qué falla y señalarlo en la página.", icon: LightbulbIcon },
  { slug: "page-header", label: "Cabecera de página", summary: "Título, descripción, pestañas de subpágina y acciones de página.", icon: HeadingIcon },
  { slug: "kpi", label: "Cifras (KPI)", summary: "Fila de tarjetas de cifra con delta y alerta.", icon: GaugeIcon },
  { slug: "section", label: "Sección", summary: "El bloque con cabecera, contador y acción.", icon: SquareIcon },
  { slug: "toolbar", label: "Barra de la base", summary: "Vista, campos, filtro, grupos, orden, color, buscar y la acción principal, dentro de la base.", icon: SearchIcon },
  { slug: "data-table", label: "Tabla simple", summary: "Listas cortas y fijas que no son una base de datos.", icon: Table2Icon },
  { slug: "kanban", label: "Kanban", summary: "Columnas por fase con arrastre y fases plegables.", icon: SquareKanbanIcon },
  { slug: "base-de-datos", label: "Base de datos", summary: "Toda lista de registros, al estilo Airtable: vistas, campos, filtros, grupos, kanban, galería y calendario.", icon: DatabaseIcon },
  { slug: "insights-panel", label: "Panel de información", summary: "Columna derecha con bloques personalizables.", icon: PanelRightIcon },
  { slug: "ajustes-bloques", label: "Ajustes de bloques", summary: "Ordenar, esconder y elegir qué enseña cada bloque, donde se ve.", icon: SlidersHorizontalIcon },
  { slug: "detail-sheet", label: "Sheet de detalle", summary: "La ficha de un registro: bloques, edición en el sitio, flechas y dos columnas.", icon: PanelRightOpenIcon },
  { slug: "bulk-bar", label: "Barra de selección", summary: "Acciones en bloque sobre las filas marcadas.", icon: ListChecksIcon },
  { slug: "calendarios", label: "Agenda y calendarios", summary: "Agenda del mes, calendario pequeño, planificar con arrastre y Gantt.", icon: CalendarDaysIcon },
  { slug: "carpetas", label: "Carpetas", summary: "Carpetas dentro de carpetas que se arrastran, en un bloque o en el lateral de una base.", icon: FolderTreeIcon },
  { slug: "revision", label: "Revisión con notas", summary: "Visor de fotos y vídeo con notas en su sitio y la conversación, como en Feedback.", icon: MessagesSquareIcon },
  { slug: "archivos-y-enlaces", label: "Archivos y enlaces", summary: "Zona de subida, compartir un enlace sin cuenta y directorio de enlaces.", icon: PaperclipIcon },
  { slug: "status-badge", label: "Badges de estado", summary: "Cinco tonos con significado fijo.", icon: TagIcon },
  { slug: "buttons", label: "Botones", summary: "Variantes, tamaños, iconos y jerarquía.", icon: RectangleHorizontalIcon },
  { slug: "forms", label: "Formularios", summary: "Campos, validación, selects, switches y errores.", icon: TextCursorInputIcon },
  { slug: "feedback", label: "Feedback", summary: "Toasts, diálogos de confirmación y alertas.", icon: MessageSquareIcon },
  { slug: "states", label: "Estados", summary: "Vacío, cargando y error para cada bloque.", icon: InboxIcon },
  { slug: "avatars", label: "Avatares", summary: "Iniciales de personas y monogramas de registros.", icon: CircleUserIcon },
  { slug: "charts", label: "Gráficos", summary: "Recharts con la paleta del sistema.", icon: ChartColumnIcon },
]

export const dsNav: NavGroup[] = [
  {
    items: [
      { id: "intro", label: "Introducción", href: "/ds", icon: BookOpenIcon },
      { id: "nuevo-proyecto", label: "Nuevo proyecto", href: "/ds/nuevo-proyecto", icon: RocketIcon },
      { id: "registry", label: "Registry", href: "/ds/registry", icon: PackageIcon },
    ],
  },
  {
    label: "Fundamentos",
    items: [
      { id: "color", label: "Color", href: "/ds/fundamentos/color", icon: PaletteIcon },
      { id: "tipografia", label: "Tipografía", href: "/ds/fundamentos/tipografia", icon: TypeIcon },
      { id: "espaciado", label: "Espaciado y forma", href: "/ds/fundamentos/espaciado", icon: RulerIcon },
      { id: "iconos", label: "Iconos", href: "/ds/fundamentos/iconos", icon: ShapesIcon },
      { id: "movimiento", label: "Movimiento", href: "/ds/fundamentos/movimiento", icon: ZapIcon },
    ],
  },
  {
    label: "Patrones",
    items: [
      { id: "anatomia", label: "Anatomía de página", href: "/ds/patrones/anatomia", icon: LayoutTemplateIcon },
      { id: "convenciones", label: "Convenciones", href: "/ds/patrones/convenciones", icon: MousePointerClickIcon },
      { id: "navegacion", label: "Navegación y subpáginas", href: "/ds/patrones/navegacion", icon: SignpostIcon },
      { id: "filtros", label: "Filtros y vistas", href: "/ds/patrones/filtros", icon: FilterIcon },
      { id: "paneles", label: "Paneles personalizables", href: "/ds/patrones/paneles", icon: SlidersHorizontalIcon },
      { id: "datos", label: "Arquitectura de datos", href: "/ds/patrones/datos", icon: DatabaseIcon },
      { id: "copy", label: "Copy y formato", href: "/ds/patrones/copy", icon: SparklesIcon },
    ],
  },
  {
    label: "Componentes",
    items: [
      { id: "componentes", label: "Catálogo", href: "/ds/componentes", icon: BoxesIcon },
      ...componentPages.map((c) => ({ id: `c-${c.slug}`, label: c.label, href: `/ds/componentes/${c.slug}`, icon: c.icon })),
    ],
  },
  {
    label: "Documentos",
    items: [
      { id: "documentos", label: "Documentos y PDF", href: "/ds/documentos", icon: FileTextIcon },
      { id: "doc-elaborada", label: "Propuesta elaborada", href: "/ds/documentos/elaborada", icon: BookOpenTextIcon },
      { id: "doc-simple", label: "Propuesta simple", href: "/ds/documentos/simple", icon: ScrollTextIcon },
      { id: "doc-guia", label: "Guía", href: "/ds/documentos/guia", icon: BookTextIcon },
    ],
  },
]

/* Design system hijo «Influencer Workspace»: misma documentación, con su propia navegación. El shell
   de /ds cambia de uno a otro con el selector de la cabecera según la ruta. */
export const influencerBrand: Brand = { name: "Influencer Workspace", tagline: "Design system hijo", monogram: "IW" }

export const influencerNav: NavGroup[] = [
  {
    items: [
      { id: "iw-intro", label: "Introducción", href: "/ds/influencer", icon: BookOpenIcon },
      { id: "iw-fundamentos", label: "Fundamentos", href: "/ds/influencer/fundamentos", icon: SwatchBookIcon },
      { id: "iw-componentes", label: "Componentes", href: "/ds/influencer/componentes", icon: BoxesIcon },
      { id: "iw-patrones", label: "Página de inicio", href: "/ds/influencer/patrones", icon: SmartphoneIcon },
      { id: "iw-operar", label: "Páginas de operar", href: "/ds/influencer/operar", icon: KanbanSquareIcon },
    ],
  },
]
