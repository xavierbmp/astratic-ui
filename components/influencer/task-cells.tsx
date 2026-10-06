"use client"

import Link from "next/link"
import { CheckIcon, FlagIcon, KanbanSquareIcon, ListChecksIcon, RepeatIcon, UserRoundIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { tintClass } from "@/lib/influencer/tints"
import { ESTADOS_TAREA, PRIORIDADES_TAREA, type DondeTarea, type EtiquetaTarea, type PrioridadTarea, type Repeticion, type Tarea } from "@/lib/influencer/modelo"
import { collabDe, describirRepeticion, estaCerrada, estaVencida, hrefDonde, horaDeTarea, marcaIdDe, textoDonde, type ContextoTareas } from "@/lib/influencer/tareas"
import { fechaCercana } from "@/lib/influencer/cifras-collabs"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"
import { StatusBadge } from "@/components/app/status-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BrandMark } from "@/components/influencer/brand-mark"

// Las piezas pequeñas de una tarea, iguales en Hoy, la lista, la tabla, el tablero y la ficha.

/** El círculo para hacerla: se rellena al hacerla y lleva una equis si se canceló. */
export function CasillaTarea({ tarea, onToggle, size = "md" }: { tarea: Pick<Tarea, "titulo" | "estado">; onToggle: () => void; size?: "sm" | "md" }) {
  const hecha = tarea.estado === "hecha"
  const cancelada = tarea.estado === "cancelada"
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={hecha}
      aria-label={hecha ? `Reabrir «${tarea.titulo}»` : `Marcar «${tarea.titulo}» como hecha`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        "grid flex-none place-items-center rounded-full border-[1.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        size === "sm" ? "size-4" : "size-[18px]",
        hecha ? "border-success bg-success text-background" : cancelada ? "border-dashed border-muted-foreground text-muted-foreground" : "border-control hover:border-foreground",
      )}
    >
      {hecha && <CheckIcon className={size === "sm" ? "size-2.5" : "size-3"} strokeWidth={3} aria-hidden />}
      {cancelada && <XIcon className="size-2.5" strokeWidth={3} aria-hidden />}
    </button>
  )
}

const TONO_PRIORIDAD: Record<PrioridadTarea, string> = {
  urgente: "fill-danger text-danger",
  alta: "fill-warning text-warning",
  normal: "text-muted-foreground",
  baja: "text-muted-foreground/50",
}

/** La bandera de la prioridad. En las listas solo se enseña si es urgente o alta: lo normal no hace ruido. */
export function PrioridadBandera({ prioridad, conTexto, soloSiImporta }: { prioridad: PrioridadTarea; conTexto?: boolean; soloSiImporta?: boolean }) {
  if (soloSiImporta && (prioridad === "normal" || prioridad === "baja")) return null
  const label = PRIORIDADES_TAREA.find((p) => p.id === prioridad)?.label ?? prioridad
  return (
    <span className="inline-flex items-center gap-1 text-xs" title={conTexto ? undefined : `Prioridad ${label.toLowerCase()}`}>
      <FlagIcon className={cn("size-3.5 flex-none", TONO_PRIORIDAD[prioridad])} aria-hidden />
      {conTexto ? <span>{label}</span> : <span className="sr-only">Prioridad {label.toLowerCase()}</span>}
    </span>
  )
}

export function EstadoTareaBadge({ tarea, hoy }: { tarea: Pick<Tarea, "estado" | "esperandoDesde">; hoy?: string }) {
  const e = ESTADOS_TAREA.find((x) => x.id === tarea.estado) ?? ESTADOS_TAREA[0]
  const dias = tarea.estado === "esperando" && tarea.esperandoDesde && hoy ? diasEntre(tarea.esperandoDesde, hoy) : null
  return (
    <StatusBadge tone={e.tone}>
      {e.label}
      {dias !== null && dias > 0 ? ` · ${dias} d` : ""}
    </StatusBadge>
  )
}

/**
 * Dónde vive la tarea, en un chip: el logo de la marca y «Lumea Skin · Cobros». Con `enlace`, lleva
 * a su página (la pestaña de la campaña o la ficha del CRM).
 */
export function DondeChip({ donde, ctx, enlace, className }: { donde: DondeTarea; ctx: ContextoTareas; enlace?: boolean; className?: string }) {
  const marcaId = marcaIdDe(donde, ctx)
  const marca = marcaId ? ctx.marcas.find((m) => m.id === marcaId) : undefined
  const texto = textoDonde(donde, ctx)
  const href = enlace ? hrefDonde(donde) : undefined
  const Icono = donde.pagina === "personal" ? UserRoundIcon : KanbanSquareIcon
  const contenido = (
    <>
      {marca ? <BrandMark name={marca.nombre} tint={collabDe(donde, ctx)?.tint ?? marca.tint} size="xs" className="size-4 rounded text-[8px]" /> : <Icono className="size-3.5 flex-none text-muted-foreground" aria-hidden />}
      <span className="truncate">{texto}</span>
    </>
  )
  const clases = cn("inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs text-muted-foreground", href && "hover:text-foreground hover:underline", className)
  return href ? (
    <Link href={href} className={clases} onClick={(e) => e.stopPropagation()}>
      {contenido}
    </Link>
  ) : (
    <span className={clases}>{contenido}</span>
  )
}

/**
 * Cuándo toca, como se dice en una lista: «Hoy 10:00», «Mañana», «jue 8», «3 oct». En rojo si
 * venció y en naranja si es hoy. Si además tiene fecha límite más tarde, «vence el vie 9».
 */
export function FechaTarea({ tarea, hoy, campo = "auto", className }: { tarea: Tarea; hoy: string; campo?: "auto" | "fecha" | "fechaLimite"; className?: string }) {
  const cerrada = estaCerrada(tarea)
  const valor = campo === "fechaLimite" ? tarea.fechaLimite : campo === "fecha" ? tarea.fecha : (tarea.fecha ?? tarea.fechaLimite)
  if (!valor) return campo === "auto" ? null : <span className={cn("text-xs text-muted-foreground", className)}>—</span>
  const dia = soloFecha(valor)
  const faltan = diasEntre(soloFecha(hoy), dia)
  const vencida = campo === "auto" ? estaVencida(tarea, hoy) : faltan < 0 && !cerrada
  const tono = cerrada ? "text-muted-foreground" : vencida ? "text-danger" : faltan === 0 ? "text-warning" : "text-muted-foreground"
  const hora = campo !== "fechaLimite" && valor.length > 10 ? valor.slice(11, 16) : undefined
  const limiteDespues = campo === "auto" && tarea.fecha && tarea.fechaLimite && soloFecha(tarea.fechaLimite) > soloFecha(tarea.fecha)
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap tabular-nums", tono, className)}>
      {fechaCercana(dia, hoy)}
      {hora && <span>{hora}</span>}
      {campo === "auto" && !tarea.fecha && tarea.fechaLimite && <span className="font-normal">(límite)</span>}
      {limiteDespues && tarea.fechaLimite && <span className="font-normal text-muted-foreground">· vence {fechaCercana(soloFecha(tarea.fechaLimite), hoy).toLowerCase()}</span>}
    </span>
  )
}

/** Sus etiquetas, cada una con su tinte. Con `max`, las que no caben se cuentan: «+2». */
export function EtiquetasTarea({ ids, etiquetas, max }: { ids: string[]; etiquetas: EtiquetaTarea[]; max?: number }) {
  const lista = ids.map((id) => etiquetas.find((e) => e.id === id)).filter((e): e is EtiquetaTarea => !!e)
  if (lista.length === 0) return null
  const vistas = max ? lista.slice(0, max) : lista
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1">
      {vistas.map((e) => (
        <span key={e.id} className={cn("rounded-full px-1.5 py-px text-[11px] font-medium", tintClass[e.tint])}>
          {e.nombre}
        </span>
      ))}
      {lista.length > vistas.length && <span className="text-[11px] text-muted-foreground">+{lista.length - vistas.length}</span>}
    </span>
  )
}

/** «1/3» con el icono de lista: cuántas subtareas están hechas. */
export function ProgresoSubtareas({ hechas, total }: { hechas: number; total: number }) {
  if (total === 0) return null
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", hechas === total ? "text-success" : "text-muted-foreground")} title={`${hechas} de ${total} subtareas hechas`}>
      <ListChecksIcon className="size-3.5" aria-hidden />
      {hechas}/{total}
    </span>
  )
}

/** «Esperando 3 d»: lo que lleva esperando a la marca u otra persona. */
export function EsperandoDias({ tarea, hoy }: { tarea: Pick<Tarea, "estado" | "esperandoDesde">; hoy: string }) {
  if (tarea.estado !== "esperando") return null
  const dias = tarea.esperandoDesde ? diasEntre(tarea.esperandoDesde, hoy) : 0
  return <span className="text-xs whitespace-nowrap text-warning">Esperando{dias > 0 ? ` ${dias} d` : ""}</span>
}

export function RepiteIcono({ repetir }: { repetir?: Repeticion }) {
  if (!repetir) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex text-muted-foreground" aria-label={describirRepeticion(repetir)}>
          <RepeatIcon className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{describirRepeticion(repetir)}</TooltipContent>
    </Tooltip>
  )
}

/** «10:00» si tiene hora: para el orden del día en Hoy. */
export function HoraTarea({ tarea }: { tarea: Pick<Tarea, "fecha"> }) {
  const hora = horaDeTarea(tarea)
  return hora ? <span className="text-xs font-medium tabular-nums text-muted-foreground">{hora}</span> : null
}

/**
 * El nombre de un grupo de tareas como se ve en su cabecera: el estado con su insignia, la
 * prioridad con su bandera, una campaña o un registro con el logo de su marca, una etiqueta con su
 * tinte y «Vencidas» en rojo.
 */
export function NombreGrupoTarea({ campo, grupo, ctx, etiquetas }: { campo?: string; grupo: { id: string; label: string }; ctx: ContextoTareas; etiquetas: EtiquetaTarea[] }) {
  switch (campo) {
    case "estado": {
      const e = ESTADOS_TAREA.find((x) => x.id === grupo.id)
      return e ? <StatusBadge tone={e.tone}>{e.label}</StatusBadge> : <span>{grupo.label}</span>
    }
    case "prioridad":
      return PRIORIDADES_TAREA.some((p) => p.id === grupo.id) ? <PrioridadBandera prioridad={grupo.id as PrioridadTarea} conTexto /> : <span>{grupo.label}</span> // id de PRIORIDADES_TAREA
    case "etiquetas": {
      const e = etiquetas.find((x) => x.id === grupo.id)
      return e ? <span className={cn("rounded-full px-2 py-px text-xs font-medium", tintClass[e.tint])}>{e.nombre}</span> : <span>{grupo.label}</span>
    }
    case "campana":
    case "proyecto": {
      const collabId = campo === "campana" ? grupo.id : grupo.id.startsWith("collab:") ? grupo.id.slice(7) : undefined
      const collab = collabId ? ctx.collabs.find((c) => c.id === collabId) : undefined
      const marcaId = collab?.marcaId ?? (grupo.id.startsWith("marca:") ? grupo.id.slice(6) : ctx.propuestas.find((p) => `propuesta:${p.id}` === grupo.id)?.marcaId ?? ctx.contactos.find((c) => `contacto:${c.id}` === grupo.id)?.marcaId)
      const marca = marcaId ? ctx.marcas.find((m) => m.id === marcaId) : undefined
      return (
        <span className="inline-flex items-center gap-1.5">
          {marca && <BrandMark name={marca.nombre} tint={collab?.tint ?? marca.tint} size="xs" className="size-5 rounded-md text-[8px]" />}
          {grupo.label}
        </span>
      )
    }
    case "cuando":
      return <span className={cn(grupo.id === "vencidas" && "text-danger", grupo.id === "hoy" && "text-warning")}>{grupo.label}</span>
    default:
      return <span>{grupo.label}</span>
  }
}
