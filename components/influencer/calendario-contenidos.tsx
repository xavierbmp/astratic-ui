"use client"

import * as React from "react"
import Image from "next/image"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CircleCheckIcon, CircleIcon, EuroIcon, FlagIcon, LockIcon, MilestoneIcon } from "lucide-react"
import { cn } from "cn"
import type { StatusTone } from "@/lib/status"
import type { EntradaCalendario } from "@/lib/influencer/planificacion"
import { entradasPorDia } from "@/lib/influencer/planificacion"
import { diaLargo } from "@/lib/influencer/fechas"
import { tintClass } from "@/lib/influencer/tints"
import { SocialIcon } from "@/components/app/social-icons"
import { AvisoDia, CalendarioPeriodo } from "@/components/app/calendario-periodo"

/** Prefijo del id de arrastre de cada cosa: así la página sabe qué se suelta (dónde, con `PREFIJO_DIA` del kit). */
export const PREFIJO_ENTRADA = "entrada:"

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
 * cobros, más discretos. En la semana va en una línea con su portada; en el mes, la red, la hora y
 * el estado arriba y el título debajo en dos líneas, que con siete columnas en una no se lee.
 */
export function EntradaChip({ entrada, grande, activa, onAbrir }: { entrada: EntradaCalendario; grande?: boolean; activa?: boolean; onAbrir: () => void }) {
  const arrastrable = seArrastra(entrada)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `${PREFIJO_ENTRADA}${entrada.id}`, data: { entradaId: entrada.id }, disabled: !arrastrable })
  const contenido = entrada.clase === "contenido"
  const marcas = (
    <>
      {contenido && entrada.fija && <LockIcon className="size-3 flex-none opacity-60" aria-label="Fecha pactada con la marca" />}
      {contenido && entrada.estado && <span className={cn("size-1.5 flex-none rounded-full", PUNTO_TONO[entrada.estado.tone])} aria-label={entrada.estado.label} />}
    </>
  )
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
      title={[entrada.hora, entrada.titulo, entrada.contexto, entrada.estado?.label, entrada.fija && contenido ? "Fecha pactada con la marca" : undefined].filter(Boolean).join(" · ")}
      className={cn(
        "w-full min-w-0 rounded-md text-left font-medium",
        grande ? "flex items-center gap-1.5 px-1.5 py-1 text-xs" : "grid gap-0.5 px-1.5 py-1 text-[11px] leading-tight",
        contenido ? (entrada.tint ? tintClass[entrada.tint] : "bg-muted text-foreground/80") : "border border-dashed bg-card text-muted-foreground",
        entrada.hecha && "opacity-60",
        arrastrable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        activa && "ring-2 ring-brand",
        isDragging && "relative z-20 opacity-90 shadow-pop",
      )}
    >
      {grande ? (
        <>
          {contenido && entrada.portadaUrl && (
            <span className="relative h-9 w-7 flex-none overflow-hidden rounded">
              <Image src={entrada.portadaUrl} alt="" fill sizes="28px" unoptimized={!entrada.portadaUrl.startsWith("https://")} className="object-cover" />
            </span>
          )}
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="flex min-w-0 items-center gap-1">
              <IconoClase entrada={entrada} />
              {entrada.hora && <span className="flex-none tabular-nums opacity-70">{entrada.hora}</span>}
              <span className={cn("truncate", entrada.clase === "tarea" && entrada.hecha && "line-through")}>{entrada.titulo}</span>
            </span>
            {entrada.contexto && <span className="truncate text-[11px] font-normal opacity-70">{entrada.contexto}</span>}
          </span>
          {marcas}
        </>
      ) : (
        <>
          <span className="flex min-w-0 items-center gap-1">
            <IconoClase entrada={entrada} />
            {entrada.hora && <span className="tabular-nums opacity-70">{entrada.hora}</span>}
            <span className="ml-auto flex items-center gap-1">{marcas}</span>
          </span>
          <span className={cn("line-clamp-2", entrada.clase === "tarea" && entrada.hecha && "line-through")}>{entrada.titulo}</span>
        </>
      )}
    </button>
  )
}

/**
 * El calendario de lo que publica, sobre el `CalendarioPeriodo` del kit: el mes (seis semanas) o la
 * semana, con las fechas clave en la cabecera de cada día, el «+» para planificar ese día y cada cosa
 * en su día con el tinte de su marca o su pilar. Lo propio se arrastra a otro día; lo que se suelta
 * en un día lo resuelve la página, que pone el `DndContext` (así se puede soltar también una idea).
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
  const porDia = React.useMemo(() => entradasPorDia(entradas), [entradas])
  const delDia = (dia: string) => porDia.get(dia) ?? []
  return (
    <CalendarioPeriodo
      entradasDe={(dia) => delDia(dia).filter((e) => e.clase !== "fecha-clave")}
      avisosDe={(dia) => delDia(dia).filter((e) => e.clase === "fecha-clave").map((f) => <AvisoDia key={f.id} icono={FlagIcon} titulo={f.titulo} detalle={f.contexto} />)}
      pintar={(e, { grande }) => <EntradaChip entrada={e} grande={grande} activa={activaId === e.id} onAbrir={() => onAbrir(e)} />}
      hoy={hoy}
      ancla={ancla}
      modo={modo}
      finesDeSemana={finesDeSemana}
      onNuevo={onNuevo}
      etiquetaNuevo={(dia) => `Planificar el ${diaLargo(dia)}`}
    />
  )
}
