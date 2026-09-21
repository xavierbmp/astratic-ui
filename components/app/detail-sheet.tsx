"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Settings2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InlineAutoEdit } from "@/components/app/inline-field"
import { useLocalStorage } from "@/hooks/use-local-storage"

/** Escape dentro de un campo cancela la edición de ese campo, no cierra la ficha. */
function escapeDentroDeCampo(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (t?.closest("input, textarea, select, [contenteditable='true']")) e.preventDefault()
}

export function DetailSheet({
  open,
  onOpenChange,
  width = 480,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 480 para una ficha; 960-1040 para las de dos columnas (`DetailSplit`). */
  width?: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onEscapeKeyDown={escapeDentroDeCampo}
        style={{ "--detail-w": `${width}px` } as React.CSSProperties}
        // Mismo variante que las clases de SheetContent (`data-[side=right]:sm:max-w-sm`): si no, esas
        // ganan por especificidad y la ficha se queda en 384 px pida el ancho que pida.
        className={cn("gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-(--detail-w)", className)}
      >
        {children}
      </SheetContent>
    </Sheet>
  )
}

export function DetailHeader({
  leading,
  title,
  subtitle,
  status,
  actions,
  nav,
  className,
}: {
  leading?: React.ReactNode
  /** Un texto, o un `InlineTitle` para que el nombre se edite donde se lee. */
  title: React.ReactNode
  subtitle?: React.ReactNode
  status?: React.ReactNode
  actions?: React.ReactNode
  /** `RecordPager` para pasar al registro anterior o siguiente de la lista sin cerrar la ficha. */
  nav?: React.ReactNode
  className?: string
}) {
  return (
    <SheetHeader className={cn("flex-none gap-3 border-b p-4 pr-12", className)}>
      <div className="flex items-start gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="min-w-0 text-[15px] leading-tight font-semibold">{title}</SheetTitle>
            {status}
          </div>
          {subtitle ? (
            <SheetDescription className="mt-0.5 truncate text-xs">{subtitle}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">Detalle</SheetDescription>
          )}
        </div>
        {nav && <div className="flex-none">{nav}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </SheetHeader>
  )
}

export function DetailBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto", className)} {...props} />
}

/**
 * Un bloque de la ficha: los campos de un mismo tema («Contacto», «Empresa», «Gestión») o una
 * lista relacionada («Campañas», «Oportunidades»). Con `collapsible` se pliega desde su título y,
 * con `storageKey`, cada persona lo encuentra como lo dejó. Plegado enseña `summary`, una línea
 * con lo esencial, para no tener que abrirlo.
 */
export function DetailSection({
  title,
  icon: Icon,
  count,
  action,
  collapsible = false,
  defaultOpen = true,
  storageKey,
  summary,
  className,
  children,
}: {
  title: React.ReactNode
  icon?: LucideIcon
  /** Nº de elementos de una lista relacionada; va junto al título. */
  count?: number
  action?: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  /** Recuerda si está plegado (por persona y navegador). Una clave por tipo de ficha y bloque: `contacto.gestion`. */
  storageKey?: string
  /** Lo que se lee con el bloque plegado. */
  summary?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const [recordado, setRecordado] = useLocalStorage<boolean | null>(`ficha:${storageKey ?? "_"}`, null)
  const [local, setLocal] = React.useState(defaultOpen)
  const open = !collapsible || (storageKey ? (recordado ?? defaultOpen) : local)
  const setOpen = (o: boolean) => (storageKey ? setRecordado(o) : setLocal(o))

  const cabecera = (
    <>
      {collapsible && (
        <ChevronRightIcon className={cn("size-3.5 flex-none text-muted-foreground transition-transform", open && "rotate-90")} aria-hidden />
      )}
      {Icon && <Icon className="size-3.5 flex-none text-muted-foreground" aria-hidden />}
      <span className="flex-none">{title}</span>
      {count !== undefined && <span className="flex-none text-xs font-normal tabular-nums text-muted-foreground">{count}</span>}
      {!open && summary && <span className="min-w-0 truncate text-xs font-normal text-muted-foreground">· {summary}</span>}
    </>
  )

  return (
    <section data-slot="detail-section" className={cn("border-b px-4 py-3 last:border-b-0", className)}>
      <div className="flex min-h-6 items-center gap-2">
        <h3 className="flex min-w-0 flex-1 text-[13px] font-semibold">
          {collapsible ? (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {cabecera}
            </button>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5">{cabecera}</span>
          )}
        </h3>
        {action && <div className="ml-auto flex flex-none items-center gap-1 text-xs">{action}</div>}
      </div>
      {open && <div className="mt-2">{children}</div>}
    </section>
  )
}

/** Botón de texto de la cabecera de un bloque («Añadir», «Nuevo campo»). */
export function DetailSectionAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn("rounded-md px-1.5 py-0.5 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50", className)}
      {...props}
    />
  )
}

type PropsCampo = React.ComponentProps<typeof DetailField>

/**
 * Los campos de un bloque, en filas «etiqueta · valor» con la columna de etiquetas del mismo ancho
 * en toda la ficha. Los campos vacíos (`empty`) no ocupan fila: se recogen al pie del bloque como
 * «+ Campo» y, al pulsarlo, el campo aparece ya editándose. Así la ficha enseña lo que se sabe y
 * sigue invitando a completar lo que falta.
 */
export function DetailFields({ children, className }: { children: React.ReactNode; className?: string }) {
  const [abiertos, setAbiertos] = React.useState<Set<string>>(() => new Set())
  const filas: React.ReactNode[] = []
  const vacios: { key: string; label: React.ReactNode }[] = []

  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement<PropsCampo>(child)) return void filas.push(child)
    const key = String(child.key)
    if (child.props.empty && !abiertos.has(key)) return void vacios.push({ key, label: child.props.label })
    filas.push(abiertos.has(key) ? React.cloneElement(child, { autoEdit: true }) : child)
  })

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {filas.length > 0 && <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 text-sm">{filas}</dl>}
      {vacios.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {vacios.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setAbiertos((s) => new Set(s).add(v.key))}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-dashed border-control/60 px-2 text-xs text-muted-foreground outline-none transition-colors hover:border-solid hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PlusIcon className="size-3" aria-hidden />
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Una fila de la ficha. Con `onConfig`, la etiqueta se puede pulsar para configurar el campo
 * (sus opciones, su tipo…) sin salir de la ficha: el valor se edita donde se lee y el campo se
 * configura donde se nombra. Con `empty`, `DetailFields` la recoge como «+ Campo».
 */
export function DetailField({
  label,
  onConfig,
  configLabel,
  autoEdit,
  children,
}: {
  label: React.ReactNode
  onConfig?: () => void
  configLabel?: string
  /** El campo no tiene valor: se ofrece como «+ Campo» al pie del bloque en vez de ocupar una fila. */
  empty?: boolean
  /** Lo pone `DetailFields` al pulsar «+ Campo»: el valor arranca editándose. */
  autoEdit?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <dt className="flex min-h-7 items-center text-xs text-muted-foreground">
        {onConfig ? (
          <button
            type="button"
            onClick={onConfig}
            title={configLabel ?? "Configurar el campo"}
            className="group/cfg inline-flex min-w-0 items-center gap-1 rounded-sm text-left outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="truncate">{label}</span>
            <Settings2Icon className="size-3 flex-none opacity-0 transition-opacity group-hover/cfg:opacity-100 group-focus-visible/cfg:opacity-100" />
          </button>
        ) : (
          <span className="truncate">{label}</span>
        )}
      </dt>
      <dd className="flex min-h-7 min-w-0 items-center">
        <div className="min-w-0 flex-1">{autoEdit ? <InlineAutoEdit.Provider value>{children}</InlineAutoEdit.Provider> : children}</div>
      </dd>
    </>
  )
}

/** Línea final de la ficha con los datos de sistema: cuándo se creó, de dónde salió. */
export function DetailMeta({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("px-4 py-3 text-xs text-muted-foreground", className)} {...props} />
}

/**
 * Ficha de dos columnas para registros que se recorren (el paso a paso de un contacto en una
 * campaña): a la izquierda la lista o el recorrido, a la derecha lo elegido en grande. Cada
 * columna tiene su scroll; en móvil se apilan.
 */
export function DetailSplit({
  aside,
  asideWidth = 300,
  className,
  children,
}: {
  aside: React.ReactNode
  asideWidth?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{ "--split-w": `${asideWidth}px` } as React.CSSProperties}
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[var(--split-w)_minmax(0,1fr)] md:overflow-hidden", className)}
    >
      <aside className="flex-none border-b md:min-h-0 md:overflow-y-auto md:border-r md:border-b-0">{aside}</aside>
      <div className="min-w-0 md:min-h-0 md:overflow-y-auto">{children}</div>
    </div>
  )
}

/**
 * Anterior y siguiente dentro de la lista de la que salió el registro, con su posición («3 de 42»).
 * Va en `DetailHeader nav` y en cualquier vista que recorra registros uno a uno.
 */
export function RecordPager({
  index,
  total,
  onPrev,
  onNext,
  label = "registro",
  className,
}: {
  /** Posición del registro actual, desde 0. */
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  /** Qué se recorre, para los textos de ayuda: «contacto», «marca». */
  label?: string
  className?: string
}) {
  if (total <= 1 || index < 0) return null
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`${label} anterior`} disabled={index <= 0} onClick={onPrev}>
            <ChevronLeftIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{`${label[0].toUpperCase()}${label.slice(1)} anterior`}</TooltipContent>
      </Tooltip>
      <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
        {index + 1} de {total}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Siguiente ${label}`} disabled={index >= total - 1} onClick={onNext}>
            <ChevronRightIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{`Siguiente ${label}`}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function DetailFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-none items-center justify-end gap-2 border-t bg-background p-3", className)}
      {...props}
    />
  )
}
