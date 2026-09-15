"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { activeTab, type PageTab } from "@/lib/nav"

/**
 * Pestañas de subpágina. Van en la cabecera de página (prop `tabs` de PageHeader) y cada pestaña es una ruta,
 * así que se pueden enlazar, recargar y volver atrás. Mismas medidas que las Tabs segmentadas (`TabsList` por defecto).
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
      nav.scrollLeft = el.offsetLeft - 3
    }
  }, [active?.href])

  return (
    <nav
      ref={ref}
      aria-label="Subpáginas"
      data-slot="page-tabs"
      className={cn(
        "relative inline-flex h-8 w-fit max-w-full flex-none items-center overflow-x-auto rounded-lg bg-muted p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    >
      {items.map((it) => {
        const isActive = it.href === active?.href
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-[calc(100%-1px)] flex-none items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-muted-foreground dark:hover:text-foreground",
              isActive && "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground"
            )}
          >
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
