"use client"

import * as React from "react"
import { BotMessageSquareIcon, FileTextIcon, MinusIcon, PencilIcon, SendHorizontalIcon, SquareDashedMousePointerIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { EmptyState, ErrorState } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { ElementPicker } from "@/components/app/report-picker"
import type { ReportElement } from "@/components/app/report-context"

/** Lo que se manda: el texto, la página en la que se está y, si se señaló, el elemento. */
export type NotaNueva = { texto: string; ruta: string; pagina: string; elemento: ReportElement | null }

/** Una nota con la respuesta de Claude. Las fechas, en ISO. */
export type NotaItem = {
  id: string
  texto: string
  autor: string | null
  creada: string
  hecha: boolean
  /** Lo que ha hecho Claude con ella, en una o dos frases. */
  respuesta: string | null
  respondida: string | null
  /** Dónde se escribió: la ruta con su query y el título de la página. */
  ruta: string | null
  pagina: string | null
  /** El nombre del elemento señalado («Roster», «Cabecera del hilo»…). */
  elemento: string | null
}

const TITULO = "Notas para Claude"

/** El nombre corto de un elemento señalado (su texto o su pieza del kit): se guarda con la nota. */
export const nombreDeElemento = (el: ReportElement) => el.text.trim().slice(0, 80) || el.path.split(" › ").at(-1) || el.tag

/** El nombre de la página sin la app detrás («Correo · Admin de la red» → «Correo»). */
const nombrePagina = (titulo: string) => titulo.split(" · ")[0]?.trim() || titulo

/** ⌘+Enter envía; Enter solo es salto de línea, que aquí lo normal es pegar textos largos. */
function conAtajo(e: React.KeyboardEvent, hacer: () => void) {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    hacer()
  }
}

/** Una etiqueta pequeña de contexto: la página o el elemento señalado. */
function Contexto({ icono: Icono, children, onQuitar, href, className }: { icono: React.ElementType; children: React.ReactNode; onQuitar?: () => void; href?: string | null; className?: string }) {
  const clase = cn("inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-1.5 py-px text-[11px] text-muted-foreground", className)
  const dentro = (
    <>
      <Icono className="size-3 flex-none" aria-hidden />
      <span className="truncate">{children}</span>
    </>
  )
  if (href)
    return (
      <a href={href} className={cn(clase, "hover:text-foreground hover:underline")}>
        {dentro}
      </a>
    )
  return (
    <span className={clase}>
      {dentro}
      {onQuitar && (
        <button type="button" onClick={onQuitar} aria-label="Quitar lo señalado" className="-mr-0.5 rounded-sm hover:text-foreground">
          <XIcon className="size-3" />
        </button>
      )}
    </span>
  )
}

/**
 * «Notas para Claude» (Xavier, 2026-11-10, reporte cmwb13p3): un chat de la cabecera, solo para administradores, para
 * dejar cualquier dato operativo que no es una sugerencia (las tarifas de una creadora, un email, un contacto). No es en
 * directo: Claude las recoge en su repaso y contesta en el mismo chat. Se abre como el chat de atención al cliente, en
 * una ventana abajo a la derecha que deja seguir usando la página; cada nota se guarda con la página en la que se
 * escribió y, si se quiere, un elemento señalado como en la bombilla (el chat se esconde mientras se señala).
 */
export function NotasClaude({
  cargar,
  enviar,
  editar,
  borrar,
  pendientes = 0,
}: {
  /** Las notas, de la más antigua a la más nueva. */
  cargar: () => Promise<NotaItem[]>
  /** Guarda una nota. Devuelve el error como texto, o nada si ha ido bien. */
  enviar: (nota: NotaNueva) => Promise<string | void>
  /** Cambia el texto (vuelve a quedar pendiente). Devuelve el error o nada. */
  editar: (id: string, texto: string) => Promise<string | void>
  /** La borra. Devuelve el error o nada. */
  borrar: (id: string) => Promise<string | void>
  /** Las que esperan a Claude, en el botón de la cabecera. */
  pendientes?: number
}) {
  const [abierto, setAbierto] = React.useState(false)
  const [senalando, setSenalando] = React.useState(false)
  const [notas, setNotas] = React.useState<NotaItem[] | null>(null)
  const [error, setError] = React.useState(false)
  const [texto, setTexto] = React.useState("")
  const [elemento, setElemento] = React.useState<ReportElement | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const [pagina, setPagina] = React.useState("")
  const fin = React.useRef<HTMLDivElement>(null)

  const recargar = React.useCallback(async () => {
    setError(false)
    try {
      setNotas(await cargar())
    } catch {
      setError(true)
    }
  }, [cargar])


  React.useEffect(() => {
    fin.current?.scrollIntoView({ block: "end" })
  }, [notas])

  // La página en la que se está, al abrir y al volver de señalar (se puede navegar sin cerrar el chat).
  const volver = React.useCallback(() => {
    setPagina(document.title)
    setSenalando(false)
    void recargar()
  }, [recargar])
  const alSenalar = React.useCallback(
    (el: ReportElement) => {
      setElemento(el)
      volver()
    },
    [volver],
  )

  async function mandar() {
    const t = texto.trim()
    if (!t || enviando) return
    setEnviando(true)
    const fallo = await enviar({ texto: t, ruta: `${location.pathname}${location.search}`, pagina: document.title, elemento })
    setEnviando(false)
    if (fallo) return void toast.error(fallo)
    setTexto("")
    setElemento(null)
    await recargar()
  }

  const conPendientes = pendientes > 0

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={conPendientes ? `${TITULO}: ${pendientes} sin hacer` : TITULO} aria-expanded={abierto} onClick={() => (abierto ? setAbierto(false) : (setAbierto(true), volver()))} className="relative">
            <BotMessageSquareIcon />
            {conPendientes && <span aria-hidden className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{TITULO}</TooltipContent>
      </Tooltip>

      {abierto && !senalando && (
        <section
          data-report-ui
          data-slot="notas-claude"
          aria-label={TITULO}
          onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setAbierto(false))}
          className="fixed right-4 bottom-4 z-50 flex h-[min(620px,calc(100dvh-5rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-pop duration-200 animate-in fade-in-0 slide-in-from-bottom-4"
        >
          <header className="flex flex-none items-start gap-3 border-b px-4 py-3">
            <span className="grid size-9 flex-none place-items-center rounded-xl bg-brand-soft text-brand">
              <BotMessageSquareIcon className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm leading-snug font-semibold">{TITULO}</h2>
              <p className="text-xs text-muted-foreground">Tarifas, emails o cualquier dato. Claude lo recoge en su repaso y te contesta aquí.</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Minimizar" onClick={() => setAbierto(false)} className="-mr-1.5">
              <MinusIcon />
            </Button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background/60 px-4 py-4">
            {error ? (
              <ErrorState title="No se han podido cargar las notas" onRetry={recargar} />
            ) : notas === null ? (
              <div className="space-y-3" aria-busy="true" aria-label="Cargando las notas">
                <Skeleton className="ml-auto h-14 w-3/4 rounded-2xl" />
                <Skeleton className="h-10 w-2/3 rounded-2xl" />
              </div>
            ) : notas.length === 0 ? (
              <EmptyState icon={BotMessageSquareIcon} title="Sin notas" description="Lo que dejes aquí, con la página en la que estás, lo recoge Claude y te dice dónde lo ha puesto." />
            ) : (
              <ul className="space-y-4">
                {notas.map((n) => (
                  <Nota key={n.id} nota={n} editar={editar} borrar={borrar} onCambio={recargar} />
                ))}
              </ul>
            )}
            <div ref={fin} />
          </div>

          <div className="flex flex-none flex-col gap-2 border-t p-3">
            <Textarea
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => conAtajo(e, () => void mandar())}
              placeholder="Escribe o pega lo que quieras que Claude apunte…"
              className="max-h-48 min-h-20 resize-none text-sm"
              aria-label="Nueva nota"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {pagina && <Contexto icono={FileTextIcon}>{nombrePagina(pagina)}</Contexto>}
              {elemento && (
                <Contexto icono={SquareDashedMousePointerIcon} onQuitar={() => setElemento(null)} className="bg-brand-soft text-brand">
                  {nombreDeElemento(elemento)}
                </Contexto>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSenalando(true)} title="Esconde el chat y eliges algo de la página">
                <SquareDashedMousePointerIcon /> {elemento ? "Señalar otro" : "Señalar"}
              </Button>
              <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                <Kbd>⌘</Kbd> <Kbd>Enter</Kbd>
              </span>
              <Button size="sm" onClick={() => void mandar()} disabled={!texto.trim() || enviando}>
                <SendHorizontalIcon /> Enviar
              </Button>
            </div>
          </div>
        </section>
      )}

      {abierto && senalando && <ElementPicker onPick={alSenalar} onCancel={volver} aviso="Haz clic en lo que quieres señalar" />}
    </>
  )
}

function Nota({ nota, editar, borrar, onCambio }: { nota: NotaItem; editar: (id: string, texto: string) => Promise<string | void>; borrar: (id: string) => Promise<string | void>; onCambio: () => Promise<void> }) {
  const [editando, setEditando] = React.useState(false)
  const [borrador, setBorrador] = React.useState(nota.texto)
  const [quitar, setQuitar] = React.useState(false)

  async function guardar() {
    const fallo = await editar(nota.id, borrador.trim())
    if (fallo) return void toast.error(fallo)
    setEditando(false)
    await onCambio()
  }

  async function eliminar() {
    const fallo = await borrar(nota.id)
    if (fallo) return void toast.error(fallo)
    toast.success("Nota eliminada")
    await onCambio()
  }

  return (
    <li className="space-y-2">
      <div className="group flex flex-col items-end">
        <p className="mb-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" aria-label="Editar nota" onClick={() => setEditando(true)}>
              <PencilIcon />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="Eliminar nota" onClick={() => setQuitar(true)}>
              <Trash2Icon />
            </Button>
          </span>
          {nota.autor && `${nota.autor} · `}
          {fmt.date(nota.creada)}, {fmt.time(nota.creada)}
          <StatusBadge tone={nota.hecha ? "success" : "warning"}>{nota.hecha ? "Hecho" : "Pendiente"}</StatusBadge>
        </p>
        {editando ? (
          <div className="w-full">
            <Textarea value={borrador} onChange={(e) => setBorrador(e.target.value)} onKeyDown={(e) => conAtajo(e, () => void guardar())} className="min-h-24 text-sm" autoFocus aria-label="Texto de la nota" />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => (setEditando(false), setBorrador(nota.texto))}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => void guardar()} disabled={!borrador.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex max-w-[90%] flex-col items-end gap-1">
            <p className="rounded-2xl rounded-br-md bg-brand-soft px-3 py-2 text-sm break-words whitespace-pre-wrap">{nota.texto}</p>
            {(nota.pagina || nota.elemento) && (
              <div className="flex max-w-full flex-wrap justify-end gap-1">
                {nota.pagina && (
                  <Contexto icono={FileTextIcon} href={nota.ruta}>
                    {nombrePagina(nota.pagina)}
                  </Contexto>
                )}
                {nota.elemento && <Contexto icono={SquareDashedMousePointerIcon}>{nota.elemento}</Contexto>}
              </div>
            )}
          </div>
        )}
      </div>

      {nota.respuesta && (
        <div className="flex flex-col items-start">
          <p className="mb-0.5 text-[11px] text-muted-foreground">
            Claude{nota.respondida && ` · ${fmt.date(nota.respondida)}, ${fmt.time(nota.respondida)}`}
          </p>
          <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm break-words whitespace-pre-wrap">{nota.respuesta}</p>
        </div>
      )}

      <ConfirmDialog open={quitar} onOpenChange={setQuitar} title="¿Eliminar esta nota?" confirmLabel="Eliminar" destructive onConfirm={eliminar} />
    </li>
  )
}
