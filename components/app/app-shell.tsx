"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BellIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"
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
import { ThemeToggle } from "@/components/app/theme-toggle"

type Crumb = { label: string; href?: string }

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
  user,
  nav,
  children,
  headerEnd,
  userMenu,
  notifications,
}: {
  brand: Brand
  user: CurrentUser
  nav: NavGroup[]
  children: React.ReactNode
  headerEnd?: React.ReactNode
  /** Contenido del menú desplegable del usuario (pie de la sidebar): «Ir a…», tema, cerrar sesión. */
  userMenu?: React.ReactNode
  /** Botón de notificaciones ya montado; si no se pasa, se muestra el icono sin punto. */
  notifications?: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [extra, setExtra] = React.useState<Crumb[]>([])
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const current = React.useMemo(() => {
    let best: { group: NavGroup; item: NavGroup["items"][number] } | null = null
    for (const g of nav) {
      for (const it of g.items) {
        const match = pathname === it.href || pathname.startsWith(it.href + "/")
        if (match && (!best || it.href.length > best.item.href.length)) best = { group: g, item: it }
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
  const crumbs: Crumb[] = [
    ...(current?.group.label ? [{ label: current.group.label }] : []),
    ...(current ? [{ label: current.item.label, href: current.item.href }] : []),
    ...(tab && tab.href !== current?.item.href ? [{ label: tab.label, href: tab.href }] : []),
    ...extra,
  ]

  return (
    <BreadcrumbContext.Provider value={{ extra, setExtra }}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:p-0!" asChild>
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
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {nav.map((group, gi) => (
              <SidebarGroup key={group.label ?? gi}>
                {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active = current?.item.id === item.id
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                            <Link href={item.href}>
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
            ))}
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
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

        <SidebarInset className="min-w-0">
          <header className="flex h-12 flex-none items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4!" />
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                {crumbs.map((c, i) => {
                  const last = i === crumbs.length - 1
                  return (
                    <React.Fragment key={`${c.label}-${i}`}>
                      <BreadcrumbItem className={cn(i === 0 && crumbs.length > 1 && "hidden md:inline-flex")}>
                        {last ? (
                          <BreadcrumbPage className="font-medium">{c.label}</BreadcrumbPage>
                        ) : c.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={c.href}>{c.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span>{c.label}</span>
                        )}
                      </BreadcrumbItem>
                      {!last && <BreadcrumbSeparator className={cn(i === 0 && crumbs.length > 1 && "hidden md:block")} />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden h-8 w-64 items-center gap-2 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
              >
                <SearchIcon className="size-3.5" />
                <span className="flex-1 text-left">Buscar en el portal…</span>
                <Kbd>⌘K</Kbd>
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
              {notifications ?? (
                <Button variant="ghost" size="icon" aria-label="Notificaciones">
                  <BellIcon />
                </Button>
              )}
              <ThemeToggle />
              {headerEnd}
            </div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>

        <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} title="Buscar" description="Ir a una página">
          <Command>
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
                          router.push(item.href)
                        }}
                      >
                        <item.icon />
                        {item.label}
                      </CommandItem>
                      {item.tabs
                        ?.filter((t) => t.href !== item.href)
                        .map((t) => (
                          <CommandItem
                            key={t.href}
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
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  )
}
