"use client"

// «Sugerencias y problemas», el botón de la bombilla en la cabecera del shell.
// Quien usa el portal propone un cambio o cuenta qué falla y, si quiere, señala el elemento en la página. El reporte
// sale con su contexto (ruta, pantalla, tema, errores recientes y, si lo hay, el elemento con sus
// contenedores del kit) para que quien lo arregle lo encuentre sin tener que preguntar.
// Se abre también con ⇧⌘X, que funciona con una ficha o un diálogo abiertos (tapan la cabecera), y
// con `ReportTrigger`, la misma bombilla en pequeño en la cabecera de cada ficha.

import * as React from "react"
import { InfoIcon, LightbulbIcon, SendIcon, SquareDashedMousePointerIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AttachmentsField, imageFiles, useAttachments, type ReportAttachment } from "@/components/app/report-attachments"
import { captureErrors, readContext, recentErrorCount, type ReportContext, type ReportElement } from "@/components/app/report-context"
import { ElementPicker } from "@/components/app/report-picker"
import { SentReports, type ReportItem } from "@/components/app/report-sent"

export type { ReportAttachment, ReportAttachmentLink, ReportCanvasChange, ReportCanvasData, ReportRect } from "@/components/app/report-attachments"
export type { ReportContext, ReportElement } from "@/components/app/report-context"
export { reportStatus, type ReportItem, type ReportStatus } from "@/components/app/report-sent"

// El lienzo pesa (captura de pantalla incluida): se descarga la primera vez que se abre.
const ReportCanvas = React.lazy(() => import("@/components/app/report-canvas"))

export type ReportDraft = { description: string; element: ReportElement | null; context: ReportContext; attachments: ReportAttachment[] }

/** Nombre del botón: sirve igual para proponer un cambio que para contar un fallo. */
const LABEL = "Sugerencias y problemas"

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
 * La bombilla en pequeño para la cabecera de una ficha (`DetailHeader` ya lo lleva): abre el diálogo
 * del `ReportButton` del shell, que la ficha tapa. Sin un `ReportButton` montado no se pinta.
 */
export function ReportTrigger({ className }: { className?: string }) {
  const available = React.useSyncExternalStore(subscribe, hasOpener, () => false)
  if (!available) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={LABEL} className={cn("text-muted-foreground", className)} onClick={() => openers.values().next().value?.()}>
          <LightbulbIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {LABEL} <Kbd>⇧⌘X</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

// ---------- Botón y diálogo ----------

export function ReportButton({
  onSubmit,
  loadReports,
  description = "Cuéntanos qué cambiarías o qué falla y, si quieres, señálalo en la página. Lo revisamos y aquí verás cuándo está resuelto.",
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
  /** Lo que tapa la página con el diálogo escondido: el selector de elementos o el lienzo. */
  const [overlay, setOverlay] = React.useState<"pick" | "canvas" | null>(null)
  const [tab, setTab] = React.useState<"new" | "sent">("new")
  const [text, setText] = React.useState("")
  const [element, setElement] = React.useState<ReportElement | null>(null)
  const [sending, setSending] = React.useState(false)
  const [errorCount, setErrorCount] = React.useState(0)
  const [dropping, setDropping] = React.useState(false)
  const attachments = useAttachments()
  const textRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => captureErrors(), [])

  const show = React.useCallback(() => {
    setErrorCount(recentErrorCount())
    setOpen(true)
  }, [])

  React.useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault()
        setOverlay(null)
        setTab("new")
        setErrorCount(recentErrorCount())
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shortcut])

  React.useEffect(() => {
    if (!shortcut) return
    const open = () => {
      setOverlay(null)
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

  // El diálogo se esconde mientras se señala o se marca en el lienzo, y vuelve con el borrador intacto.
  const startPicking = () => {
    setOpen(false)
    setOverlay("pick")
  }
  const startCanvas = () => {
    setOpen(false)
    setOverlay("canvas")
  }
  const backToDialog = React.useCallback(() => {
    setOverlay(null)
    show()
  }, [show])
  const onPick = React.useCallback(
    (el: ReportElement) => {
      setElement(el)
      backToDialog()
    },
    [backToDialog],
  )
  const { push: pushAttachment } = attachments
  const onCanvasSave = React.useCallback(
    (a: ReportAttachment) => {
      pushAttachment(a)
      backToDialog()
    },
    [pushAttachment, backToDialog],
  )
  const canvasCount = attachments.items.filter((a) => a.kind === "canvas").length

  const send = async () => {
    const description = text.trim()
    if (!description || sending) return
    setSending(true)
    const error = await onSubmit({
      description,
      element,
      context: readContext(),
      attachments: attachments.drafts(),
    }).catch((e: unknown) =>
      e instanceof Error ? e.message : "No se ha podido enviar.",
    )
    setSending(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success("Enviado, ¡gracias!", {
      description: loadReports ? "En «Enviados» verás cuándo está resuelto." : undefined,
    })
    setText("")
    setElement(null)
    attachments.clear()
    setOpen(false)
  }

  const errorsNote = errorCount ? `, más ${errorCount === 1 ? "1 error" : `${errorCount} errores`} que ha dado la página` : ""

  // min-w-0 en cada nivel: la ruta larga del elemento se recorta en vez de ensanchar el diálogo.
  const form = (
    <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="report-text">Tu sugerencia o lo que falla</Label>
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
          placeholder="Qué cambiarías o añadirías y cómo. O qué estabas haciendo, qué esperabas y qué ha pasado."
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
      <AttachmentsField attachments={attachments} onCanvas={startCanvas} />
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
            aria-label={LABEL}
            aria-keyshortcuts={shortcut ? "Shift+Meta+X" : undefined}
            onClick={() => {
              setTab("new")
              show()
            }}
          >
            <LightbulbIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {LABEL} {shortcut && <Kbd>⇧⌘X</Kbd>}
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-report-ui
          className={cn("max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-[480px]", dropping && "ring-2 ring-brand")}
          onOpenAutoFocus={(e) => {
            if (tab !== "new") return
            e.preventDefault()
            textRef.current?.focus()
          }}
          // Una captura se pega (⌘V) o se arrastra sobre el diálogo.
          onPaste={(e) => {
            const files = imageFiles(e.clipboardData.files)
            if (tab !== "new" || !files.length) return
            e.preventDefault()
            void attachments.addFiles(files)
          }}
          onDragOver={(e) => {
            if (tab !== "new" || !e.dataTransfer.types.includes("Files")) return
            e.preventDefault()
            setDropping(true)
          }}
          onDragLeave={(e) => {
            if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setDropping(false)
          }}
          onDrop={(e) => {
            setDropping(false)
            const files = imageFiles(e.dataTransfer.files)
            // Lo soltado sobre la zona de las imágenes ya lo ha recogido ella.
            if (tab !== "new" || !files.length || e.isDefaultPrevented()) return
            e.preventDefault()
            void attachments.addFiles(files)
          }}
        >
          <DialogHeader>
            <DialogTitle>¿Tienes alguna sugerencia o algo no funciona bien?</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {loadReports ? (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "new" | "sent")} className="min-w-0 gap-4">
              <TabsList variant="line">
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
                <SendIcon /> {sending ? "Enviando…" : "Enviar"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {overlay === "pick" && <ElementPicker onPick={onPick} onCancel={backToDialog} />}
      {overlay === "canvas" && (
        <React.Suspense fallback={null}>
          <ReportCanvas name={`Lienzo ${canvasCount + 1}`} onSave={onCanvasSave} onCancel={backToDialog} />
        </React.Suspense>
      )}
    </>
  )
}
