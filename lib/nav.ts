import type { LucideIcon } from "lucide-react"

/** Subpágina de un módulo o pestaña de una subpágina: una ruta propia. */
export type PageTab = {
  href: string
  label: string
  /** Va delante del texto, como en la sidebar. Por eso las pestañas se definen en un archivo que importa un componente cliente. */
  icon: LucideIcon
  /** Pendientes de esa subpágina (pill ámbar, como los contadores de la sidebar). */
  count?: number
  /** Las pestañas de esta subpágina (`PageTabs`, bajo su título). La primera vive en `href`. */
  tabs?: PageTab[]
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

/**
 * La subpágina activa: la pestaña con la ruta más larga que contiene a `pathname`, contando también las rutas de sus
 * propias pestañas (Collabs está activa en Contenidos, que es una de sus pestañas con otra ruta).
 */
export function activeTab(tabs: PageTab[], pathname: string) {
  let best: PageTab | undefined
  let largo = -1
  for (const t of tabs) {
    for (const href of [t.href, ...(t.tabs ?? []).map((s) => s.href)]) {
      const match = pathname === href || pathname.startsWith(href + "/")
      if (match && href.length > largo) {
        best = t
        largo = href.length
      }
    }
  }
  return best
}
