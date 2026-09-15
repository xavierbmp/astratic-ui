import { KanbanSquareIcon, LayoutDashboardIcon, ListTodoIcon, SettingsIcon, UsersIcon } from "lucide-react"
import type { Brand, CurrentUser, NavGroup } from "@/lib/nav"

export const demoBrand: Brand = { name: "Portal Demo", tagline: "Astratic UI", monogram: "PD" }
export const demoUser: CurrentUser = { name: "Usuario 1", role: "Administración" }

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
      { id: "equipo", label: "Equipo", href: "/demo/equipo", icon: UsersIcon },
      { id: "ajustes", label: "Ajustes", href: "/demo/ajustes", icon: SettingsIcon },
    ],
  },
]
