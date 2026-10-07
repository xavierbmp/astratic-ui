import type { LucideIcon } from "lucide-react"

/** Subpágina de un módulo: una ruta propia que se muestra como pestaña en la cabecera (PageTabs). */
export type PageTab = {
  href: string
  label: string
  /** Pendientes de esa subpágina (pill ámbar, como los contadores de la sidebar). */
  count?: number
}

export type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  /** Subpáginas del módulo. La primera vive en `href`; el shell las usa para las migas y el buscador ⌘K. */
  tabs?: PageTab[]
}

export type NavGroup = {
  label?: string
  /** Va pegado al pie de la barra lateral, separado del resto (Ajustes, por ejemplo). */
  bottom?: boolean
  items: NavItem[]
}

export type Brand = {
  name: string
  tagline?: string
  monogram: string
}

export type CurrentUser = {
  name: string
  role: string
}

/** La subpágina activa: la pestaña con la ruta más larga que contiene a `pathname`. */
export function activeTab(tabs: PageTab[], pathname: string) {
  let best: PageTab | undefined
  for (const t of tabs) {
    const match = pathname === t.href || pathname.startsWith(t.href + "/")
    if (match && (!best || t.href.length > best.href.length)) best = t
  }
  return best
}
