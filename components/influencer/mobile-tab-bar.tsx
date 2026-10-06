"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

export type MobileTab = { id: string; label: string; href: string; icon: LucideIcon; badge?: number }

/** Barra inferior del móvil con las cinco páginas principales; en pantallas medianas y grandes manda la sidebar. */
export function MobileTabBar({ tabs, className }: { tabs: MobileTab[]; className?: string }) {
  const pathname = usePathname()
  const activeId = tabs
    .filter((t) => pathname === t.href || pathname.startsWith(t.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.id
  return (
    <nav
      data-slot="ws-tab-bar"
      aria-label="Secciones"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 grid border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const active = t.id === activeId
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-1 pt-2 pb-2 text-[11px] font-medium",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && "bg-brand-soft text-brand")}>
              <t.icon className="size-5" aria-hidden />
            </span>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="absolute top-1.5 left-1/2 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                {t.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
