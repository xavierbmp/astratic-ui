"use client"

import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import type { NavItem } from "@/lib/nav"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar"

function Contador({ valor, className }: { valor: number; className?: string }) {
  return <span className={cn("flex h-5 min-w-5 flex-none items-center justify-center rounded-md bg-warning-soft px-1 text-xs font-medium text-warning tabular-nums", className)}>{valor}</span>
}

/**
 * Un módulo del menú con sus subpáginas: al pulsarlo se despliega y entra en la primera, y solo está desplegado el
 * que se usa. Plegado muestra la suma de sus pendientes; desplegado, cada subpágina el suyo. Con la sidebar plegada a
 * iconos, las subpáginas salen en un menú al pasar el ratón.
 */
export function ModuloMenu({ item, abierto, subActiva, onIr }: { item: NavItem; abierto: boolean; subActiva?: string; onIr: (id: string, href: string) => void }) {
  const { state, isMobile } = useSidebar()
  const aIconos = state === "collapsed" && !isMobile
  const subpaginas = item.tabs ?? []
  const primera = subpaginas[0]?.href ?? item.href
  const boton = (
    <SidebarMenuButton asChild isActive={abierto && aIconos} className={cn(abierto && "font-medium text-sidebar-accent-foreground")}>
      <Link href={primera} onClick={() => onIr(item.id, primera)}>
        <item.icon />
        <span>{item.label}</span>
        <ChevronRightIcon className={cn("ml-auto size-3.5! text-muted-foreground transition-transform duration-200", abierto && "rotate-90")} aria-hidden />
      </Link>
    </SidebarMenuButton>
  )
  return (
    <SidebarMenuItem>
      {aIconos ? (
        <HoverCard openDelay={80} closeDelay={120}>
          <HoverCardTrigger asChild>{boton}</HoverCardTrigger>
          <HoverCardContent side="right" align="start" sideOffset={10} className="w-56 p-1">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{item.label}</p>
            <ul className="flex flex-col gap-0.5">
              {subpaginas.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} onClick={() => onIr(item.id, s.href)} aria-current={s.href === subActiva ? "page" : undefined} className={cn("flex h-8 items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50", s.href === subActiva && "bg-muted font-medium")}>
                    <span className="truncate">{s.label}</span>
                    {s.count !== undefined && s.count > 0 && <Contador valor={s.count} />}
                  </Link>
                </li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      ) : (
        boton
      )}
      {!abierto && item.badge !== undefined && item.badge > 0 && <SidebarMenuBadge className="right-7 rounded-md bg-warning-soft text-warning">{item.badge}</SidebarMenuBadge>}
      <div inert={!abierto} className={cn("grid transition-[grid-template-rows] duration-200 ease-out group-data-[collapsible=icon]:hidden", abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="min-h-0 overflow-hidden">
          <SidebarMenuSub className="mt-0.5">
            {subpaginas.map((s) => (
              <SidebarMenuSubItem key={s.href}>
                <SidebarMenuSubButton asChild isActive={s.href === subActiva} className={cn(s.href === subActiva && "font-medium")}>
                  <Link href={s.href} onClick={() => onIr(item.id, s.href)} aria-current={s.href === subActiva ? "page" : undefined}>
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    {s.count !== undefined && s.count > 0 && <Contador valor={s.count} />}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  )
}
