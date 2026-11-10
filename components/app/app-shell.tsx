"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BellIcon, ChevronLeftIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"
import { BotonPantallaCompleta, PantallaCompletaProvider, RanuraPantallaCompleta } from "@/components/app/pantalla-completa"
import { activeTab, type Brand, type CurrentUser, type NavGroup } from "@/lib/nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { ModuloMenu } from "@/components/app/modulo-menu"
import { ThemeToggle } from "@/components/app/theme-toggle"

type Crumb = { label: string; href?: string }

const sinTildes = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

/** ⌘K encuentra igual «revision» que «Revisión»: todas las palabras escritas tienen que estar. */
function filtroSinTildes(valor: string, busqueda: string) {
  const texto = sinTildes(valor)
  return sinTildes(busqueda).split(/\s+/).every((palabra) => texto.includes(palabra)) ? 1 : 0
}

const BreadcrumbContext = React.createContext<{
  extra: Crumb[]
  setExtra: (c: Crumb[]) => void
} | null>(null)

export function useBreadcrumb(extra: Crumb[]) {
  const ctx = React.useContext(BreadcrumbContext)
  const key = JSON.stringify(extra)
  React.useEffect(() => {
    ctx?.setExtra(JSON.parse(key))
    return () => ctx?.setExtra([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

export function AppShell({
  brand,
  logo,
  user,
  nav,
  children,
  headerEnd,
  volver,
  userMenu,
  report,
  notas,
  notifications,
  sidebarExtra,
  subpaginasEnMenu = false,
}: {
  brand: Brand
  /** Logotipo de la marca: con la sidebar abierta sustituye al monograma y el nombre; plegada, sigue el monograma. */
  logo?: React.ReactNode
  user: CurrentUser
  nav: NavGroup[]
  children: React.ReactNode
  headerEnd?: React.ReactNode
  /** A dónde vuelve la página abierta: va al principio de la barra, con su nombre, y la pantalla completa lo conserva. */
  volver?: { href: string; titulo: string } | null
  /** Contenido del menú desplegable del usuario (pie de la sidebar): «Ir a…», tema, cerrar sesión. */
  userMenu?: React.ReactNode
  /** Botón «Sugerencias y problemas» (`ReportButton`) ya montado; va entre el buscador y la campana. */
  report?: React.ReactNode
  /** El chat «Notas para Claude» (`NotasClaude`) ya montado, solo para administradores; va justo antes de la bombilla. */
  notas?: React.ReactNode
  /** Botón de notificaciones ya montado; si no se pasa, se muestra el icono sin punto. */
  notifications?: React.ReactNode
  /**
   * Un bloque fijo al pie de la sidebar, encima del usuario: lo que la persona tiene que tener a mano en todas las
   * páginas (los pasos para completar su perfil). Se encarga él de verse bien con la sidebar plegada.
   */
  sidebarExtra?: React.ReactNode
  /** Las subpáginas de cada módulo van desplegadas en la sidebar y las pestañas quedan para dentro de cada subpágina. */
  subpaginasEnMenu?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [extra, setExtra] = React.useState<Crumb[]>([])
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  // A dónde se acaba de pulsar: el menú responde al momento, sin esperar a que cargue la página de destino.
  const [destino, setDestino] = React.useState<{ id: string; href: string; desde: string } | null>(null)
  const enCurso = destino?.desde === pathname ? destino : null
  const irA = (id: string, href: string) => setDestino({ id, href, desde: pathname })
  // Lo que hacía la ventana cuando era ella la que se desplazaba: al ir a otra página, el contenido vuelve arriba (o a su
  // #ancla); con Atrás o Adelante, a donde se estaba en esa página.
  const contenido = React.useRef<HTMLDivElement>(null)
  const posiciones = React.useRef(new Map<string, number>())
  const anterior = React.useRef(pathname)
  const historial = React.useRef(false)
  React.useEffect(() => {
    const alVolver = () => {
      historial.current = true
    }
    window.addEventListener("popstate", alVolver)
    return () => window.removeEventListener("popstate", alVolver)
  }, [])
  React.useEffect(() => {
    const caja = contenido.current
    if (!caja || anterior.current === pathname) return
    posiciones.current.set(anterior.current, caja.scrollTop)
    anterior.current = pathname
    const volviendo = historial.current
    historial.current = false
    if (volviendo) return void caja.scrollTo({ top: posiciones.current.get(pathname) ?? 0 })
    if (window.location.hash) return
    caja.scrollTo({ top: 0 })
  }, [pathname])

  // El módulo activo: el de la ruta más larga que contiene a `pathname`, contando también sus subpáginas, que
  // pueden vivir en otra ruta (una página que agrupa módulos que ya existían, como el IRM del admin de la red).
  const current = React.useMemo(() => {
    let best: { group: NavGroup; item: NavGroup["items"][number]; largo: number } | null = null
    const contiene = (href: string) => pathname === href || pathname.startsWith(href + "/")
    for (const g of nav) {
      for (const it of g.items) {
        const largo = Math.max(...[it.href, ...(it.tabs ?? []).map((t) => t.href)].map((h) => (contiene(h) ? h.length : -1)))
        if (largo >= 0 && (!best || largo > best.largo)) best = { group: g, item: it, largo }
      }
    }
    return best
  }, [nav, pathname])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // La primera subpágina vive en la ruta del módulo; las demás añaden su miga: «Grupo › Página › Subpágina».
  const tab = current?.item.tabs ? activeTab(current.item.tabs, pathname) : undefined
  const pestana = tab?.tabs ? activeTab(tab.tabs, pathname) : undefined
  const crumbs: Crumb[] = [
    ...(current?.group.label ? [{ label: current.group.label }] : []),
    ...(current ? [{ label: current.item.label, href: subpaginasEnMenu ? (current.item.tabs?.[0]?.href ?? current.item.href) : current.item.href }] : []),
    ...(tab && (subpaginasEnMenu || tab.href !== current?.item.href) ? [{ label: tab.label, href: tab.href }] : []),
    ...(pestana && pestana.href !== tab?.href ? [{ label: pestana.label, href: pestana.href }] : []),
    ...extra,
  ]
  const activoId = enCurso?.id ?? current?.item.id

  const grupo = (group: NavGroup, key: string, className?: string) => (
    <SidebarGroup key={key} className={className}>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const active = activoId === item.id
            if (subpaginasEnMenu && item.tabs?.length) {
              const subActiva = enCurso?.id === item.id ? enCurso.href : activeTab(item.tabs, pathname)?.href
              return <ModuloMenu key={item.id} item={item} abierto={active} subActiva={subActiva} onIr={irA} />
            }
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                  <Link href={item.href} onClick={() => irA(item.id, item.href)}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge !== undefined && item.badge > 0 && (
                  <SidebarMenuBadge className="rounded-md bg-warning-soft text-warning">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
  const arriba = nav.filter((g) => !g.bottom)
  const alPie = nav.filter((g) => g.bottom)

  return (
    <BreadcrumbContext.Provider value={{ extra, setExtra }}>
      <SidebarProvider>
        <PantallaCompletaProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:p-0!" asChild>
                  {logo ? (
                    <Link href={nav[0]?.items[0]?.href ?? "/"} aria-label={brand.name}>
                      <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-foreground text-sm font-semibold text-background group-data-[collapsible=icon]:grid">
                        {brand.monogram}
                      </span>
                      <span className="flex min-w-0 flex-1 items-center px-1 group-data-[collapsible=icon]:hidden">{logo}</span>
                    </Link>
                  ) : (
                    <Link href={nav[0]?.items[0]?.href ?? "/"}>
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-sm font-semibold text-background">
                        {brand.monogram}
                      </span>
                      <span className="grid flex-1 leading-tight">
                        <span className="truncate text-sm font-semibold">{brand.name}</span>
                        {brand.tagline && (
                          <span className="truncate text-xs text-muted-foreground">{brand.tagline}</span>
                        )}
                      </span>
                      <ChevronsUpDownIcon className="text-muted-foreground" />
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {arriba.map((g, i) => grupo(g, g.label ?? `grupo-${i}`))}
            {/* Los grupos del pie (Ajustes) se separan del resto y quedan abajo del todo. */}
            {alPie.map((g, i) => grupo(g, g.label ?? `pie-${i}`, i === 0 ? "mt-auto" : undefined))}
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
            {sidebarExtra}
            <SidebarMenu>
              <SidebarMenuItem>
                {userMenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent">
                        <AvatarInitials name={user.name} size="md" />
                        <span className="grid flex-1 leading-tight">
                          <span className="truncate text-sm font-semibold">{user.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                        </span>
                        <ChevronsUpDownIcon className="text-muted-foreground" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-64">
                      {userMenu}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:p-0!">
                    <AvatarInitials name={user.name} size="md" />
                    <span className="grid flex-1 leading-tight">
                      <span className="truncate text-sm font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                    </span>
                    <ChevronsUpDownIcon className="text-muted-foreground" />
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/*
          La cabecera siempre a la vista, como la sidebar (Xavier, 2026-11-10, reporte cmwb13p3): el shell ocupa la
          pantalla y lo que se desplaza es el contenido de debajo, así lo que va pegado al hacer scroll (barras de
          editores, laterales) se queda justo bajo la cabecera. Al imprimir, todo vuelve a fluir.
        */}
        <SidebarInset className="h-svh min-w-0 overflow-hidden print:h-auto print:overflow-visible">
          {/* En pantalla completa, las pestañas de una subpágina ya dicen dónde se está: la miga no lo repite. */}
          <header className="flex h-12 flex-none items-center gap-2 border-b px-4 completa:[&:has([data-subpagina])_[data-slot=breadcrumb]]:hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4!" />
            {volver && (
              <>
                <Button variant="outline" size="sm" asChild className="h-7 flex-none gap-1 pr-2.5 pl-1.5 text-[13px] completa:px-1">
                  <Link href={volver.href} aria-label={`Volver a ${volver.titulo}`} title={`Volver a ${volver.titulo}`}>
                    <ChevronLeftIcon aria-hidden />
                    <span className="completa:hidden">{volver.titulo}</span>
                  </Link>
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4!" />
              </>
            )}
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap text-sm whitespace-nowrap">
                {crumbs.map((c, i) => {
                  const last = i === crumbs.length - 1
                  return (
                    <React.Fragment key={`${c.label}-${i}`}>
                      <BreadcrumbItem className={cn(!last && "hidden md:inline-flex", last ? "min-w-0" : "completa:hidden")}>
                        {last ? (
                          <BreadcrumbPage className="truncate font-medium">{c.label}</BreadcrumbPage>
                        ) : c.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={c.href}>{c.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span>{c.label}</span>
                        )}
                      </BreadcrumbItem>
                      {!last && <BreadcrumbSeparator className="hidden md:block completa:hidden" />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <RanuraPantallaCompleta />
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Buscar en el portal"
                className="hidden h-8 w-64 items-center gap-2 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex completa:w-8 completa:justify-center completa:px-0"
              >
                <SearchIcon className="size-3.5" />
                <span className="flex-1 text-left completa:hidden">Buscar en el portal…</span>
                <Kbd className="completa:hidden">⌘K</Kbd>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buscar"
                className="md:hidden"
                onClick={() => setPaletteOpen(true)}
              >
                <SearchIcon />
              </Button>
              <BotonPantallaCompleta />
              {notas}
              {report}
              {notifications ?? (
                <Button variant="ghost" size="icon" aria-label="Notificaciones">
                  <BellIcon />
                </Button>
              )}
              <ThemeToggle />
              {headerEnd}
            </div>
          </header>
          <div ref={contenido} data-slot="contenido-shell" className="flex min-h-0 flex-1 flex-col overflow-y-auto print:overflow-visible">
            {children}
          </div>
        </SidebarInset>

        <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} title="Buscar" description="Ir a una página">
          <Command filter={filtroSinTildes}>
            <CommandInput placeholder="Buscar páginas…" />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              {nav.map((group, gi) => (
                <CommandGroup key={group.label ?? gi} heading={group.label}>
                  {group.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <CommandItem
                        value={`${group.label ?? ""} ${item.label}`}
                        onSelect={() => {
                          setPaletteOpen(false)
                          router.push(subpaginasEnMenu ? (item.tabs?.[0]?.href ?? item.href) : item.href)
                        }}
                      >
                        <item.icon />
                        {item.label}
                      </CommandItem>
                      {item.tabs
                        ?.flatMap((t) => [t, ...(t.tabs ?? [])])
                        .filter((t) => subpaginasEnMenu || t.href !== item.href)
                        .map((t) => (
                          <CommandItem
                            key={`${t.href}-${t.label}`}
                            value={`${group.label ?? ""} ${item.label} ${t.label}`}
                            onSelect={() => {
                              setPaletteOpen(false)
                              router.push(t.href)
                            }}
                          >
                            <item.icon />
                            {t.label}
                            <CommandShortcut className="tracking-normal">{item.label}</CommandShortcut>
                          </CommandItem>
                        ))}
                    </React.Fragment>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </CommandDialog>
        </PantallaCompletaProvider>
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  )
}
