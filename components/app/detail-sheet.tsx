"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import type { LucideIcon } from "lucide-react"
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, PlusIcon, Settings2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InlineAutoEdit } from "@/components/app/inline-field"
import { ReportTrigger } from "@/components/app/report-button"
import type { PanelFicha } from "@/components/app/detail-panel"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Dónde se está pintando la ficha: encima de la lista (Sheet) o en la columna derecha (panel). La
// cabecera no puede usar los títulos del Sheet fuera de él.
const ModoFicha = React.createContext<"sheet" | "panel">("sheet")

/** Escape dentro de un campo cancela la edición de ese campo, no cierra la ficha. */
function escapeDentroDeCampo(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (t?.closest("input, textarea, select, [contenteditable='true']")) e.preventDefault()
}

/**
 * La ficha de un registro. Se abre encima de la lista, por la derecha; con `ficha` activa (la
 * persona ha elegido «Ficha en el panel»), se pinta en la columna derecha de `WorkGrid` y la lista
 * sigue entera a la vista y se puede usar.
 */
export function DetailSheet({
  open,
  onOpenChange,
  width = 480,
  ficha,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 480 para una ficha; 960-1040 para las de dos columnas (`DetailSplit`). */
  width?: number
  /** Panel de ficha de la página (`usePanelFicha`). */
  ficha?: PanelFicha
  children: React.ReactNode
  className?: string
}) {
  if (ficha?.activa && ficha.nodo) {
    if (!open) return null
    return createPortal(
      <ModoFicha.Provider value="panel">
        <div data-slot="detail-panel-content" className="flex min-h-0 flex-1 flex-col">
          {children}
          <Button variant="ghost" size="icon-sm" aria-label="Cerrar ficha" title="Cerrar ficha" className="absolute top-3 right-3" onClick={() => onOpenChange(false)}>
            <XIcon />
          </Button>
        </div>
      </ModoFicha.Provider>,
      ficha.nodo,
    )
  }
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
  // En el panel no hay Sheet: mismas piezas en HTML normal, y sitio a la derecha para «Cerrar» y
  // los ajustes del panel (en el Sheet, solo para «Cerrar»).
  const enPanel = React.useContext(ModoFicha) === "panel"
  const Cabecera = enPanel ? "div" : SheetHeader
  const Titulo = enPanel ? "h2" : SheetTitle
  const Descripcion = enPanel ? "p" : SheetDescription
  return (
    <Cabecera className={cn("flex flex-none flex-col gap-3 border-b p-4", enPanel ? "pr-20" : "pr-12", className)}>
      <div className="flex items-start gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Titulo className="min-w-0 font-heading text-[15px] leading-tight font-semibold text-foreground">{title}</Titulo>
            {status}
          </div>
          {subtitle ? (
            <Descripcion className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</Descripcion>
          ) : (
            <Descripcion className="sr-only">Detalle</Descripcion>
          )}
        </div>
        {/* El bicho de la cabecera del shell queda tapado por la ficha: aquí, a mano para reportar algo de ella. */}
        <div className="flex flex-none items-center gap-0.5">
          {nav}
          <ReportTrigger />
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </Cabecera>
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
 * sigue invitando a completar lo que falta. Con `columns={2}` van en dos columnas (datos cortos:
 * fase, valor, fechas) y vuelven a una sola cuando la ficha se estrecha.
 */
export function DetailFields({ children, columns = 1, className }: { children: React.ReactNode; columns?: 1 | 2; className?: string }) {
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
    <div className={cn("flex flex-col gap-2", columns === 2 && "@container", className)}>
      {filas.length > 0 && (
        <dl
          className={cn(
            "grid items-start gap-x-3 gap-y-0.5 text-sm",
            columns === 2 ? "grid-cols-[5.25rem_minmax(0,1fr)] @sm:grid-cols-[5.25rem_minmax(0,1fr)_5.25rem_minmax(0,1fr)]" : "grid-cols-[7.5rem_minmax(0,1fr)]"
          )}
        >
          {filas}
        </dl>
      )}
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

/**
 * Lo esencial del registro, arriba y sin plegar: estado, enlaces y los cuatro datos que se miran
 * siempre. Va justo debajo de la cabecera, antes de las pestañas o de los bloques. Todo lo demás
 * (el perfil completo, los campos propios) queda en su pestaña o en sus bloques.
 */
export function DetailSummary({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="detail-summary" className={cn("flex flex-none flex-col gap-2.5 border-b px-4 py-3", className)} {...props} />
}

export type DetailLink = {
  key: string
  /** Nombre del enlace («LinkedIn», «Web»): es su `aria-label` y el texto de «Añadir …». */
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Sin `href` el enlace está vacío: se pinta atenuado y, si hay `editor`, al pulsarlo se abre para rellenarlo. */
  href?: string | null
  /** Lo que enseña al pasar el ratón (el dominio, el usuario). Por defecto, `label`. */
  title?: string
}

/**
 * Los enlaces de un registro (web, LinkedIn, Instagram, teléfono) como iconos en una fila, para
 * que no ocupen una línea cada uno. Un clic abre el enlace; el lápiz abre `editor` (los mismos
 * campos con `InlineField`) para cambiarlos o rellenar los que faltan.
 */
export function DetailLinks({
  links,
  editor,
  editLabel = "Editar enlaces",
  children,
  className,
}: {
  links: DetailLink[]
  editor?: React.ReactNode
  editLabel?: string
  /** Algo más en la misma fila, a la derecha (una cifra, una insignia). */
  children?: React.ReactNode
  className?: string
}) {
  const [editando, setEditando] = React.useState(false)
  const caja = "inline-flex size-7 flex-none items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3.5"
  return (
    <div data-slot="detail-links" className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map((l) =>
        l.href ? (
          <Tooltip key={l.key}>
            <TooltipTrigger asChild>
              <a href={l.href} target={/^(tel|mailto):/.test(l.href) ? undefined : "_blank"} rel="noreferrer" aria-label={l.label} className={cn(caja, "border border-input bg-background text-foreground hover:bg-muted")}>
                <l.icon />
              </a>
            </TooltipTrigger>
            <TooltipContent>{l.title ?? l.label}</TooltipContent>
          </Tooltip>
        ) : editor ? (
          <Tooltip key={l.key}>
            <TooltipTrigger asChild>
              <button type="button" aria-label={`Añadir ${l.label}`} onClick={() => setEditando(true)} className={cn(caja, "border border-dashed border-control/60 text-muted-foreground/60 hover:border-solid hover:bg-muted hover:text-foreground")}>
                <l.icon />
              </button>
            </TooltipTrigger>
            <TooltipContent>Añadir {l.label}</TooltipContent>
          </Tooltip>
        ) : null
      )}
      {editor && (
        <Popover open={editando} onOpenChange={setEditando}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={editLabel} title={editLabel} className={cn(caja, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <PencilIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-3">
            {editor}
          </PopoverContent>
        </Popover>
      )}
      {children && <div className="ml-auto flex min-w-0 items-center gap-2 text-xs text-muted-foreground">{children}</div>}
    </div>
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
