"use client"

import * as React from "react"
import Image from "next/image"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CircleCheckIcon, CircleIcon, EuroIcon, FlagIcon, LockIcon, MilestoneIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import type { StatusTone } from "@/lib/status"
import type { EntradaCalendario } from "@/lib/influencer/planificacion"
import { entradasPorDia } from "@/lib/influencer/planificacion"
import { diaLargo, mismoMes, periodoCalendario } from "@/lib/influencer/fechas"
import { tintClass } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { SocialIcon } from "@/components/app/social-icons"

/** Prefijos de los identificadores de arrastre: así la página sabe qué se suelta y dónde. */
export const PREFIJO_DIA = "dia:"
export const PREFIJO_ENTRADA = "entrada:"

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]
const MAX_EN_MES = 3

export const PUNTO_TONO: Record<StatusTone, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-foreground/50",
}

/** Se arrastra lo propio sin fecha pactada: sus contenidos y sus tareas. */
export const seArrastra = (e: EntradaCalendario) => !e.fija && (e.clase === "contenido" || e.clase === "tarea")

function IconoClase({ entrada }: { entrada: EntradaCalendario }) {
  if (entrada.clase === "contenido") return entrada.red ? <SocialIcon network={entrada.red} className="size-3 flex-none" /> : null
  if (entrada.clase === "tarea") return entrada.hecha ? <CircleCheckIcon className="size-3 flex-none" /> : <CircleIcon className="size-3 flex-none" />
  if (entrada.clase === "cobro") return <EuroIcon className="size-3 flex-none" />
  return <MilestoneIcon className="size-3 flex-none" />
}

/**
 * Una cosa del calendario. Lo que se publica va con el tinte de su marca o de su pilar y el punto de
 * su estado; lo pactado con la marca lleva candado y no se arrastra; los hitos, las tareas y los
 * cobros, más discretos. En la semana, lo que se publica sale con su portada.
 */
export function EntradaChip({ entrada, grande, activa, onAbrir }: { entrada: EntradaCalendario; grande?: boolean; activa?: boolean; onAbrir: () => void }) {
  const arrastrable = seArrastra(entrada)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `${PREFIJO_ENTRADA}${entrada.id}`, data: { entradaId: entrada.id }, disabled: !arrastrable })
  const contenido = entrada.clase === "contenido"
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
      title={[entrada.hora, entrada.titulo, entrada.contexto, entrada.estado?.label, entrada.fija && entrada.clase === "contenido" ? "Fecha pactada con la marca" : undefined].filter(Boolean).join(" · ")}
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded-md text-left font-medium",
        grande ? "px-1.5 py-1 text-xs" : "px-1.5 py-0.5 text-[11px]",
        contenido ? (entrada.tint ? tintClass[entrada.tint] : "bg-muted text-foreground/80") : "border border-dashed bg-card text-muted-foreground",
        entrada.hecha && "opacity-60",
        entrada.clase === "tarea" && entrada.hecha && "line-through",
        arrastrable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        activa && "ring-2 ring-brand",
        isDragging && "relative z-20 opacity-90 shadow-pop",
      )}
    >
      {grande && contenido && entrada.portadaUrl && (
        <span className="relative h-9 w-7 flex-none overflow-hidden rounded">
          <Image src={entrada.portadaUrl} alt="" fill sizes="28px" className="object-cover" />
        </span>
      )}
      <span className={cn("grid min-w-0 flex-1", grande && "gap-0.5")}>
        <span className="flex min-w-0 items-center gap-1">
          <IconoClase entrada={entrada} />
          {entrada.hora && <span className="flex-none tabular-nums opacity-70">{entrada.hora}</span>}
          <span className="truncate">{entrada.titulo}</span>
        </span>
        {grande && entrada.contexto && <span className="truncate text-[11px] font-normal opacity-70">{entrada.contexto}</span>}
      </span>
      {contenido && entrada.fija && <LockIcon className="size-3 flex-none opacity-60" aria-label="Fecha pactada con la marca" />}
      {contenido && entrada.estado && <span className={cn("size-1.5 flex-none rounded-full", PUNTO_TONO[entrada.estado.tone])} aria-label={entrada.estado.label} />}
    </button>
  )
}

function Dia({ dia, children, className }: { dia: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${PREFIJO_DIA}${dia}` })
  return (
    <div ref={setNodeRef} data-dia={dia} className={cn(className, isOver && "bg-brand-soft")}>
      {children}
    </div>
  )
}

/**
 * El calendario de lo que publica: el mes (seis semanas) o la semana, con las fechas clave en la
 * cabecera de cada día, el «+» para planificar ese día y cada cosa en su día. Lo propio se arrastra
 * a otro día; lo que se suelta en un día lo resuelve la página, que pone el `DndContext` (así se
 * puede soltar también lo que viene de fuera: una idea). Se adapta a su sitio, no a la pantalla.
 */
export function CalendarioContenidos({
  entradas,
  hoy,
  ancla,
  modo,
  finesDeSemana = true,
  activaId,
  onAbrir,
  onNuevo,
}: {
  entradas: EntradaCalendario[]
  hoy: string
  /** Un día del periodo que se ve. */
  ancla: string
  modo: "mes" | "semana"
  finesDeSemana?: boolean
  activaId?: string | null
  onAbrir: (e: EntradaCalendario) => void
  /** Planificar algo ese día. */
  onNuevo?: (dia: string) => void
}) {
  const [abiertos, setAbiertos] = React.useState<Set<string>>(new Set())
  const porDia = React.useMemo(() => entradasPorDia(entradas), [entradas])
  const { dias } = periodoCalendario(ancla, modo)
  const columnas = finesDeSemana ? 7 : 5
  const visibles = finesDeSemana ? dias : dias.filter((_, i) => i % 7 < 5)
  const semana = modo === "semana"

  return (
    <div className="@container">
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
        {DIAS.slice(0, columnas).map((d) => (
          <div key={d} className="bg-muted/60 px-2 py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {visibles.map((dia) => {
          const lista = porDia.get(dia) ?? []
          const fechas = lista.filter((e) => e.clase === "fecha-clave")
          const cosas = lista.filter((e) => e.clase !== "fecha-clave")
          const enMes = semana || mismoMes(dia, ancla)
          const abierto = semana || abiertos.has(dia)
          const vistas = abierto ? cosas : cosas.slice(0, MAX_EN_MES)
          return (
            <Dia key={dia} dia={dia} className={cn("group/dia flex min-w-0 flex-col gap-1 bg-card p-1 @2xl:p-1.5", semana ? "min-h-64 @2xl:min-h-80" : "min-h-20 @2xl:min-h-28", !enMes && "bg-muted/30")}>
              <div className="flex items-center justify-between gap-1">
                <span className={cn("grid size-6 flex-none place-items-center rounded-full text-xs tabular-nums", dia === hoy ? "bg-foreground font-semibold text-background" : enMes ? "text-foreground" : "text-muted-foreground")}>{Number(dia.slice(8))}</span>
                {onNuevo && (
                  <Button variant="ghost" size="icon-sm" aria-label={`Planificar el ${diaLargo(dia)}`} className="size-5 text-muted-foreground opacity-0 group-hover/dia:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100" onClick={() => onNuevo(dia)}>
                    <PlusIcon className="size-3.5" />
                  </Button>
                )}
              </div>
              {fechas.map((f) => (
                <span key={f.id} title={[f.titulo, f.contexto].filter(Boolean).join(" · ")} className="flex min-w-0 items-center gap-1 rounded-md bg-info-soft px-1.5 py-0.5 text-[10px] font-medium text-info">
                  <FlagIcon className="size-3 flex-none" />
                  <span className="truncate">{f.titulo}</span>
                </span>
              ))}
              {vistas.map((e) => (
                <EntradaChip key={e.id} entrada={e} grande={semana} activa={activaId === e.id} onAbrir={() => onAbrir(e)} />
              ))}
              {!abierto && cosas.length > MAX_EN_MES && (
                <button type="button" onClick={() => setAbiertos((s) => new Set(s).add(dia))} className="px-1 text-left text-[11px] text-muted-foreground hover:text-foreground">
                  +{cosas.length - MAX_EN_MES} más
                </button>
              )}
            </Dia>
          )
        })}
      </div>
    </div>
  )
}
