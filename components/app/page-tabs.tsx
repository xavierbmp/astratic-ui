"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { navTabClass, navTabsListClass } from "@/components/ui/tabs"
import { activeTab, type PageTab } from "@/lib/nav"

/**
 * Pestañas de subpágina. Van debajo del título (prop `tabs` de PageHeader) y cada pestaña es una ruta, así que se
 * pueden enlazar, recargar y volver atrás. Mismo estilo que las Tabs de navegación (`TabsList variant="line"`).
 */
export function PageTabs({
  items,
  current,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items: PageTab[]
  /** Ruta que se da por activa. Por defecto, la de la página; útil en documentación y pruebas. */
  current?: string
}) {
  const pathname = usePathname()
  const active = activeTab(items, current ?? pathname)
  const ref = React.useRef<HTMLElement>(null)

  // En móvil las pestañas se desplazan en horizontal: la activa siempre queda a la vista.
  React.useEffect(() => {
    const nav = ref.current
    const el = nav?.querySelector<HTMLElement>("[aria-current=page]")
    if (!nav || !el) return
    if (el.offsetLeft < nav.scrollLeft || el.offsetLeft + el.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollLeft = el.offsetLeft
    }
  }, [active?.href])

  return (
    <nav ref={ref} aria-label="Subpáginas" data-slot="page-tabs" className={cn(navTabsListClass, className)} {...props}>
      {items.map((it) => {
        const isActive = it.href === active?.href
        const Icon = it.icon
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive ? "page" : undefined}
            data-active={isActive || undefined}
            className={navTabClass}
          >
            <Icon aria-hidden />
            {it.label}
            {it.count !== undefined && it.count > 0 && (
              <span className="rounded-full bg-warning-soft px-1.5 text-[11px] leading-4 font-medium tabular-nums text-warning">
                {it.count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * El segundo nivel de una subpágina (Campañas › Roster › Influencers · Temáticas · Etiquetas): pestañas de
 * carpeta pegadas encima del bloque de trabajo (`WorkGrid pestanas`), la activa del color del bloque y
 * unida a él (Xavier, 2026-10-23, reporte cmvjvjpp del workspace). Van al principio del bloque y no se
 * mueven al cambiar de una a otra, aunque cada una tenga otros botones. Cada una es una ruta, como las
 * pestañas de arriba.
 */
export function SubPaginas({ items, className }: { items: PageTab[]; className?: string }) {
  const pathname = usePathname()
  const active = activeTab(items, pathname)
  return (
    <nav aria-label="Secciones" data-slot="sub-paginas" className={cn("relative z-[1] -mb-px flex min-w-0 flex-none items-end gap-1 overflow-x-auto", className)}>
      {items.map((it) => {
        const Icon = it.icon
        const isActive = it.href === active?.href
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive ? "page" : undefined}
            data-active={isActive || undefined}
            className={cn(
              "flex h-9 flex-none items-center gap-1.5 rounded-t-xl border border-b-0 px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:flex-none",
              isActive ? "border-border bg-card text-foreground" : "border-transparent bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <Icon aria-hidden className={isActive ? "text-brand" : undefined} />
            {it.label}
            {it.count !== undefined && it.count > 0 && <span className="rounded-full bg-warning-soft px-1.5 text-[11px] leading-4 font-medium tabular-nums text-warning">{it.count}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
