import { KanbanSquareIcon, LayoutDashboardIcon, ListTodoIcon, ReceiptTextIcon, SettingsIcon, UsersIcon } from "lucide-react"
import type { Brand, CurrentUser, NavGroup, PageTab } from "@/lib/nav"
import { demoInvoices } from "@/lib/demo-data"

export const demoBrand: Brand = { name: "Portal Demo", tagline: "Astratic UI", monogram: "PD" }
export const demoUser: CurrentUser = { name: "Usuario 1", role: "Administración" }

const overdueInvoices = demoInvoices.filter((f) => f.status === "vencida").length

/** Página de ejemplo con subpáginas: se pintan con PageTabs en la cabecera y el shell las usa en migas y ⌘K. */
export const facturacionTabs: PageTab[] = [
  { href: "/demo/facturacion", label: "Facturas", count: overdueInvoices },
  { href: "/demo/facturacion/cobros", label: "Cobros" },
]

export const demoNav: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/demo", icon: LayoutDashboardIcon },
      { id: "registros", label: "Registros", href: "/demo/registros", icon: KanbanSquareIcon, badge: 4 },
      { id: "tareas", label: "Tareas", href: "/demo/tareas", icon: ListTodoIcon, badge: 2 },
    ],
  },
  {
    label: "Administración",
    items: [
      { id: "facturacion", label: "Facturación", href: "/demo/facturacion", icon: ReceiptTextIcon, badge: overdueInvoices, tabs: facturacionTabs },
      { id: "equipo", label: "Equipo", href: "/demo/equipo", icon: UsersIcon },
      { id: "ajustes", label: "Ajustes", href: "/demo/ajustes", icon: SettingsIcon },
    ],
  },
]
