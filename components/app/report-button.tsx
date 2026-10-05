"use client"

// «Reportar un problema», el botón del bicho en la cabecera del shell.
// Quien usa el portal cuenta qué falla y, si quiere, señala el elemento en la página. El reporte
// sale con su contexto (ruta, pantalla, tema, errores recientes y, si lo hay, el elemento con sus
// contenedores del kit) para que quien lo arregle lo encuentre sin tener que preguntar.
// Se abre también con ⇧⌘X, que funciona con una ficha o un diálogo abiertos (tapan la cabecera), y
// con `ReportTrigger`, el mismo bicho en pequeño en la cabecera de cada ficha.

import * as React from "react"
import { createPortal } from "react-dom"
import { BugIcon, InfoIcon, SendIcon, SquareDashedMousePointerIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyState, ErrorState } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"

export type ReportElement = {
  /** Ruta CSS hasta el elemento. */
  selector: string
  /** Contenedores del kit por los que pasa, con su título: `sheet-content «Ana Ruiz» › detail-section «Contacto» › button`. */
  path: string
  tag: string
  /** Texto visible, recortado. */
  text: string
  /** `outerHTML` recortado a 2.000 caracteres. */
  html: string
  rect: { x: number; y: number; width: number; height: number }
}

export type ReportContext = {
  /** Ruta con la query: `/crm/contactos?registro=…`. */
  url: string
  title: string
  viewport: string
  theme: "light" | "dark"
  userAgent: string
  /** Últimos errores de la página (JS, promesas y `console.error`), el más reciente al final. */
  errors: string[]
}

export type ReportDraft = { description: string; element: ReportElement | null; context: ReportContext }

export type ReportStatus = "open" | "in_progress" | "resolved" | "dismissed"

export type ReportItem = {
  id: string
  description: string
  status: ReportStatus
  url: string
  createdAt: Date | string
  /** Qué se hizo o por qué se descarta. */
  resolution?: string | null
  /** Quién lo envió; solo si la lista es de todo el equipo. */
  author?: string | null
}

export const reportStatus: Record<ReportStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Pendiente", tone: "warning" },
  in_progress: { label: "En curso", tone: "info" },
  resolved: { label: "Resuelto", tone: "success" },
  dismissed: { label: "Descartado", tone: "neutral" },
}

// ---------- Errores recientes de la página ----------
// Se empiezan a guardar al montar el botón (una vez por pestaña) y viajan con el reporte.

const MAX_ERRORS = 10
const recentErrors: string[] = []
let capturing = false

function toText(v: unknown): string {
  if (v instanceof Error) return `${v.name}: ${v.message}`
  if (typeof v === "string") return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function noteError(message: string) {
  const line = `${fmt.time(new Date())} ${clean(message, 400)}`
  if (recentErrors.at(-1) === line) return
  recentErrors.push(line)
  if (recentErrors.length > MAX_ERRORS) recentErrors.shift()
}

function captureErrors() {
  if (capturing || typeof window === "undefined") return
  capturing = true
  window.addEventListener("error", (e) => noteError(e.message || toText(e.error)))
  window.addEventListener("unhandledrejection", (e) => noteError(`Promesa rechazada: ${toText(e.reason)}`))
  const original = console.error
  console.error = (...args: unknown[]) => {
    noteError(args.map(toText).join(" "))
    original.apply(console, args)
  }
}

function readContext(): ReportContext {
  return {
    url: location.pathname + location.search,
    title: document.title,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    userAgent: navigator.userAgent,
    errors: [...recentErrors],
  }
}

// ---------- Describir el elemento señalado ----------

function clean(s: string | null | undefined, max: number) {
  return (s ?? "").replace(/\s+/g, " ").trim().slice(0, max)
}

/** Ruta CSS corta: se para en el primer id estable y prefiere `data-slot` a las clases de Tailwind. */
function cssPath(el: Element): string {
  const parts: string[] = []
  for (let node: Element | null = el; node && node !== document.body && parts.length < 6; node = node.parentElement) {
    const n = node
    if (n.id && !/^(radix-|_r_)|[:«»]/.test(n.id)) {
      parts.unshift(`#${CSS.escape(n.id)}`)
      break
    }
    let sel = n.tagName.toLowerCase()
    const slot = n.getAttribute("data-slot")
    if (slot) sel += `[data-slot="${slot}"]`
    else {
      const cls = Array.from(n.classList).filter((c) => /^[a-z][\w-]*$/i.test(c)).slice(0, 2)
      if (cls.length) sel += `.${cls.join(".")}`
    }
    const same = n.parentElement ? Array.from(n.parentElement.children).filter((c) => c.tagName === n.tagName) : []
    if (same.length > 1) sel += `:nth-of-type(${same.indexOf(n) + 1})`
    parts.unshift(sel)
  }
  return parts.join(" > ")
}

/** Contenedores cuyo primer título es el suyo (en `tabs-content` sería el del primer bloque). */
const TITLED_SLOT = /^(sheet-content|dialog-content|popover-content|section|detail-section|card|insights-panel|kanban-column)$/

/** Los contenedores del kit (`data-slot`) por los que pasa, con el título de los que lo tienen. */
function kitPath(el: Element): string {
  const parts: string[] = []
  for (let n: Element | null = el; n && n !== document.body && parts.length < 8; n = n.parentElement) {
    const slot = n.getAttribute("data-slot")
    if (!slot) {
      if (n === el) parts.unshift(n.tagName.toLowerCase())
      continue
    }
    let part = slot
    if (n !== el && TITLED_SLOT.test(slot)) {
      const title = clean(n.querySelector('[data-slot$="title"], h1, h2, h3')?.textContent, 40)
      if (title) part += ` «${title}»`
    }
    parts.unshift(part)
  }
  return parts.join(" › ")
}

function describe(el: Element): ReportElement {
  const r = el.getBoundingClientRect()
  const html = el.outerHTML
  return {
    selector: cssPath(el),
    path: kitPath(el),
    tag: el.tagName.toLowerCase(),
    text: clean(
      (el as HTMLElement).innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder"),
      160,
    ),
    html: html.length > 2000 ? `${html.slice(0, 2000)}…` : html,
    rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
  }
}

function hoverLabel(el: Element) {
  const name = el.getAttribute("data-slot") ?? el.tagName.toLowerCase()
  const text = clean((el as HTMLElement).innerText || el.textContent || el.getAttribute("aria-label"), 32)
  return text ? `${name} · ${text}` : name
}

// ---------- Selector de elementos ----------

function ElementPicker({ onPick, onCancel }: { onPick: (el: ReportElement) => void; onCancel: () => void }) {
  const [hover, setHover] = React.useState<{ rect: DOMRect; label: string } | null>(null)
  const current = React.useRef<Element | null>(null)

  React.useEffect(() => {
    const ours = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-report-ui]")
    const at = (x: number, y: number) => {
      let el = document.elementFromPoint(x, y)
      if (!el || ours(el)) return null
      // Un icono dentro de un botón señala el botón, no el trazo del SVG.
      if (el instanceof SVGElement) el = el.closest("button, a, [role]") ?? el.closest("svg") ?? el
      return el
    }
    const show = (el: Element | null) => {
      current.current = el
      setHover(el ? { rect: el.getBoundingClientRect(), label: hoverLabel(el) } : null)
    }
    // Mientras se señala, la página no reacciona: ni tooltips, ni menús, ni filas, ni cerrar la ficha.
    const block = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onMove = (e: MouseEvent) => {
      e.stopPropagation()
      show(at(e.clientX, e.clientY))
    }
    const onOver = (e: Event) => e.stopPropagation()
    const onScroll = () => show(current.current)
    const onClick = (e: MouseEvent) => {
      block(e)
      if (ours(e.target)) {
        if ((e.target as Element).closest("[data-report-cancel]")) onCancel()
        return
      }
      const el = at(e.clientX, e.clientY)
      if (el) onPick(describe(el))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      block(e)
      onCancel()
    }
    const blocked = ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick", "auxclick", "contextmenu"]
    const cursor = document.createElement("style")
    cursor.textContent = "*{cursor:crosshair!important}"
    document.head.appendChild(cursor)
    window.addEventListener("pointermove", onMove, true)
    window.addEventListener("mousemove", onMove, true)
    window.addEventListener("pointerover", onOver, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("click", onClick, true)
    window.addEventListener("keydown", onKey, true)
    blocked.forEach((t) => window.addEventListener(t, block, true))
    return () => {
      cursor.remove()
      window.removeEventListener("pointermove", onMove, true)
      window.removeEventListener("mousemove", onMove, true)
      window.removeEventListener("pointerover", onOver, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("click", onClick, true)
      window.removeEventListener("keydown", onKey, true)
      blocked.forEach((t) => window.removeEventListener(t, block, true))
    }
  }, [onPick, onCancel])

  return createPortal(
    <div data-report-ui className="pointer-events-none fixed inset-0 z-[100]">
      {hover && (
        <div
          aria-hidden
          className="absolute rounded-[3px] bg-brand/10 ring-2 ring-brand transition-[top,left,width,height] duration-75"
          style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }}
        >
          <span
            className={cn(
              "absolute left-0 max-w-72 truncate rounded bg-brand px-1.5 py-0.5 font-mono text-[11px] leading-4 text-brand-foreground",
              hover.rect.top < 28 ? "top-full mt-1" : "bottom-full mb-1",
            )}
          >
            {hover.label}
          </span>
        </div>
      )}
      <div
        role="status"
        className="pointer-events-auto absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-foreground py-1 pr-1 pl-3.5 text-sm whitespace-nowrap text-background shadow-pop"
      >
        <SquareDashedMousePointerIcon className="size-4" aria-hidden />
        Haz clic en lo que falla
        <Button data-report-cancel size="xs" variant="secondary" className="rounded-full">
          Cancelar <Kbd>Esc</Kbd>
        </Button>
      </div>
    </div>,
    document.body,
  )
}

// ---------- Reportes enviados ----------

type SentState = { status: "loading" } | { status: "error" } | { status: "ready"; items: ReportItem[] }

function SentReports({ load }: { load: () => Promise<ReportItem[]> }) {
  const [state, setState] = React.useState<SentState>({ status: "loading" })
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let alive = true
    load()
      .then((items) => alive && setState({ status: "ready", items }))
      .catch(() => alive && setState({ status: "error" }))
    return () => {
      alive = false
    }
  }, [load, attempt])

  if (state.status === "loading")
    return (
      <div className="grid gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
        ))}
      </div>
    )
  if (state.status === "error")
    return (
      <ErrorState
        className="py-8"
        title="No se han podido cargar los reportes"
        onRetry={() => {
          setState({ status: "loading" })
          setAttempt((a) => a + 1)
        }}
      />
    )
  if (!state.items.length)
    return (
      <EmptyState
        className="py-8"
        icon={BugIcon}
        title="Aún no hay reportes"
        description="Cuando envíes uno, aquí verás si está pendiente, en curso o resuelto."
      />
    )
  return (
    <ul className="max-h-[min(26rem,55vh)] divide-y overflow-y-auto rounded-lg border">
      {state.items.map((r) => (
        <li key={r.id} className="grid gap-1.5 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge tone={reportStatus[r.status].tone}>{reportStatus[r.status].label}</StatusBadge>
            <span className="min-w-0 truncate font-mono">{r.url}</span>
            <span className="ml-auto shrink-0 tabular-nums">
              {r.author ? `${r.author} · ` : ""}
              {fmt.date(r.createdAt)}
            </span>
          </div>
          <p className="line-clamp-3 text-sm whitespace-pre-line">{r.description}</p>
          {r.resolution && (
            <p className="rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Respuesta · </span>
              {r.resolution}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// ---------- Abrirlo desde una ficha ----------

// El `ReportButton` principal (el que lleva el atajo) se apunta aquí al montarse, para que
// `ReportTrigger` abra su diálogo desde una ficha que tapa la cabecera.
const openers = new Set<() => void>()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
const hasOpener = () => openers.size > 0

/**
 * El bicho en pequeño para la cabecera de una ficha (`DetailHeader` ya lo lleva): abre el diálogo
 * del `ReportButton` del shell, que la ficha tapa. Sin un `ReportButton` montado no se pinta.
 */
export function ReportTrigger({ className }: { className?: string }) {
  const available = React.useSyncExternalStore(subscribe, hasOpener, () => false)
  if (!available) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Reportar un problema" className={cn("text-muted-foreground", className)} onClick={() => openers.values().next().value?.()}>
          <BugIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Reportar un problema <Kbd>⇧⌘X</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

// ---------- Botón y diálogo ----------

export function ReportButton({
  onSubmit,
  loadReports,
  description = "Cuenta qué falla y, si quieres, señálalo en la página. Lo revisamos y aquí verás cuándo está resuelto.",
  shortcut = true,
}: {
  /** Guarda el reporte. Devuelve el mensaje de error, o nada si ha ido bien. */
  onSubmit: (report: ReportDraft) => Promise<string | void>
  /** Carga los reportes enviados; sin ella no hay pestaña «Enviados». */
  loadReports?: () => Promise<ReportItem[]>
  /** Texto bajo el título del diálogo. */
  description?: React.ReactNode
  /** ⇧⌘X abre y cierra el diálogo desde cualquier sitio. Solo un botón por pantalla lo lleva. */
  shortcut?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [picking, setPicking] = React.useState(false)
  const [tab, setTab] = React.useState<"new" | "sent">("new")
  const [text, setText] = React.useState("")
  const [element, setElement] = React.useState<ReportElement | null>(null)
  const [sending, setSending] = React.useState(false)
  const [errorCount, setErrorCount] = React.useState(0)
  const textRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => captureErrors(), [])

  const show = React.useCallback(() => {
    setErrorCount(recentErrors.length)
    setOpen(true)
  }, [])

  React.useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault()
        setPicking(false)
        setTab("new")
        setErrorCount(recentErrors.length)
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shortcut])

  React.useEffect(() => {
    if (!shortcut) return
    const open = () => {
      setPicking(false)
      setTab("new")
      show()
    }
    openers.add(open)
    notify()
    return () => {
      openers.delete(open)
      notify()
    }
  }, [shortcut, show])

  // El diálogo se esconde mientras se señala y vuelve con el borrador intacto.
  const startPicking = () => {
    setOpen(false)
    setPicking(true)
  }
  const onPick = React.useCallback(
    (el: ReportElement) => {
      setElement(el)
      setPicking(false)
      show()
    },
    [show],
  )
  const onCancelPick = React.useCallback(() => {
    setPicking(false)
    show()
  }, [show])

  const send = async () => {
    const description = text.trim()
    if (!description || sending) return
    setSending(true)
    const error = await onSubmit({ description, element, context: readContext() }).catch((e: unknown) =>
      e instanceof Error ? e.message : "No se ha podido enviar el reporte.",
    )
    setSending(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success("Reporte enviado", {
      description: loadReports ? "En «Enviados» verás cuándo está resuelto." : undefined,
    })
    setText("")
    setElement(null)
    setOpen(false)
  }

  const errorsNote = errorCount ? `, más ${errorCount === 1 ? "1 error" : `${errorCount} errores`} que ha dado la página` : ""

  // min-w-0 en cada nivel: la ruta larga del elemento se recorta en vez de ensanchar el diálogo.
  const form = (
    <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="report-text">Qué pasa</Label>
        <Textarea
          ref={textRef}
          id="report-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void send()
            }
          }}
          placeholder="Qué estabas haciendo, qué esperabas y qué ha pasado."
          className="min-h-28"
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <Label>
          Elemento <span className="font-normal text-muted-foreground">· opcional</span>
        </Label>
        {element ? (
          <div className="flex min-w-0 items-center gap-2.5 rounded-lg border bg-muted/40 py-2 pr-1.5 pl-2.5">
            <SquareDashedMousePointerIcon className="size-4 shrink-0 text-brand" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{element.text ? `«${element.text}»` : `<${element.tag}>`}</p>
              <p className="truncate font-mono text-xs text-muted-foreground" title={element.selector}>
                {element.path || element.selector}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={startPicking}>
              Cambiar
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar el elemento" onClick={() => setElement(null)}>
              <XIcon />
            </Button>
          </div>
        ) : (
          <>
            <Button type="button" variant="outline" className="justify-start" onClick={startPicking}>
              <SquareDashedMousePointerIcon /> Señalar en la página
            </Button>
            <p className="text-xs text-muted-foreground">La ventana se esconde mientras eliges y vuelve con lo que hayas escrito.</p>
          </>
        )}
      </div>
      <p className="flex gap-2 text-xs text-muted-foreground">
        <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>Va con la página en la que estás, el tamaño de pantalla y el tema{errorsNote}.</span>
      </p>
    </div>
  )

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reportar un problema"
            aria-keyshortcuts={shortcut ? "Shift+Meta+X" : undefined}
            onClick={() => {
              setTab("new")
              show()
            }}
          >
            <BugIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Reportar un problema {shortcut && <Kbd>⇧⌘X</Kbd>}
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-report-ui
          className="sm:max-w-[480px]"
          onOpenAutoFocus={(e) => {
            if (tab !== "new") return
            e.preventDefault()
            textRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>Reportar un problema</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {loadReports ? (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "new" | "sent")} className="min-w-0 gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="new">Nuevo</TabsTrigger>
                <TabsTrigger value="sent">Enviados</TabsTrigger>
              </TabsList>
              <TabsContent value="new">{form}</TabsContent>
              <TabsContent value="sent">
                <SentReports load={loadReports} />
              </TabsContent>
            </Tabs>
          ) : (
            form
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {tab === "new" ? "Cancelar" : "Cerrar"}
            </Button>
            {tab === "new" && (
              <Button type="button" onClick={() => void send()} disabled={!text.trim() || sending}>
                <SendIcon /> {sending ? "Enviando…" : "Enviar reporte"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {picking && <ElementPicker onPick={onPick} onCancel={onCancelPick} />}
    </>
  )
}
