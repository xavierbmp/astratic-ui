import {
  BookOpenIcon,
  BookOpenTextIcon,
  BoxesIcon,
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
  SparklesIcon,
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
  { slug: "page-header", label: "Cabecera de página", summary: "Título, descripción, pestañas de subpágina y acciones de página.", icon: HeadingIcon },
  { slug: "kpi", label: "Cifras (KPI)", summary: "Fila de tarjetas de cifra con delta y alerta.", icon: GaugeIcon },
  { slug: "section", label: "Sección", summary: "El bloque con cabecera, contador y acción.", icon: SquareIcon },
  { slug: "toolbar", label: "Toolbar", summary: "Buscador, filtros, conmutador de vistas y acción principal, encima del bloque.", icon: SearchIcon },
  { slug: "data-table", label: "Tabla de datos", summary: "Columnas tipadas, orden, selección y paginación.", icon: Table2Icon },
  { slug: "kanban", label: "Kanban", summary: "Columnas por fase con arrastre y fases plegables.", icon: SquareKanbanIcon },
  { slug: "insights-panel", label: "Panel de información", summary: "Columna derecha con bloques personalizables.", icon: PanelRightIcon },
  { slug: "detail-sheet", label: "Sheet de detalle", summary: "Panel lateral de un registro con pestañas y acciones.", icon: PanelRightOpenIcon },
  { slug: "bulk-bar", label: "Barra de selección", summary: "Acciones en bloque sobre las filas marcadas.", icon: ListChecksIcon },
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
    ],
  },
]
