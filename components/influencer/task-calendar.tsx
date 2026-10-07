"use client"

import * as React from "react"
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import type { Tarea } from "@/lib/influencer/modelo"
import { tintClass } from "@/lib/influencer/tints"
import { collabDe, estaCerrada, horaDeTarea, type ContextoTareas } from "@/lib/influencer/tareas"
import { casillasDelMes, diaLargo, lunesDe, mismoMes, nombreMes, soloFecha, sumarDias, sumarMeses } from "@/lib/influencer/fechas"
import { diasEntre } from "@/lib/filtros/fechas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]
const MAX_EN_MES = 3
const SIN_FECHA = "__sin-fecha"

/** Los días en que sale una tarea: su día o, si dura varios, todos los de su rango. */
function diasDe(t: Tarea, campo: "fecha" | "fechaLimite"): string[] {
  const valor = campo === "fecha" ? t.fecha : t.fechaLimite
  if (!valor) return []
  const inicio = soloFecha(valor)
  if (campo !== "fecha" || !t.fechaFin) return [inicio]
  const n = Math.min(Math.max(diasEntre(inicio, t.fechaFin), 0), 31)
  return Array.from({ length: n + 1 }, (_, i) => sumarDias(inicio, i))
}

function Chip({ tarea, dia, ctx, activa, onAbrir }: { tarea: Tarea; dia: string; ctx: ContextoTareas; activa: boolean; onAbrir: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `${dia}::${tarea.id}`, data: { id: tarea.id } })
  const tint = collabDe(tarea.donde, ctx)?.tint
  const hora = horaDeTarea(tarea)
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium",
        tint ? tintClass[tint] : "bg-muted text-foreground/80",
        estaCerrada(tarea) && "line-through opacity-50",
        activa && "ring-2 ring-brand",
        isDragging && "z-10 opacity-80 shadow-pop",
      )}
    >
      {hora && <span className="flex-none tabular-nums opacity-70">{hora}</span>}
      <span className="truncate">{tarea.titulo}</span>
    </button>
  )
}

function Dia({ dia, children, className }: { dia: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: dia })
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "bg-brand-soft")}>
      {children}
    </div>
  )
}

function NuevaEnDia({ dia, onCrear }: { dia: string; onCrear: (titulo: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [texto, setTexto] = React.useState("")
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Nueva tarea el ${diaLargo(dia)}`} className="size-5 text-muted-foreground opacity-0 group-hover/dia:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100">
          <PlusIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!texto.trim()) return
            onCrear(texto.trim())
            setTexto("")
            setOpen(false)
          }}
          className="grid gap-1.5"
        >
          <span className="text-xs text-muted-foreground first-letter:uppercase">{diaLargo(dia)}</span>
          <Input autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Qué hay que hacer… (Enter)" className="h-8 text-sm" />
        </form>
      </PopoverContent>
    </Popover>
  )
}

/**
 * El calendario de tareas: mes o semana, por su fecha o por su fecha límite. Se arrastra una tarea
 * a otro día para moverla (también desde «Sin fecha»), el «+» de un día crea una con esa fecha y
 * pulsar una abre su ficha. Cada tarea lleva el tinte de su campaña.
 */
export function CalendarioTareas({
  tareas,
  hoy,
  ctx,
  campo = "fecha",
  modo = "mes",
  finesDeSemana = true,
  activaId,
  onAbrir,
  onMover,
  onCrear,
}: {
  tareas: Tarea[]
  hoy: string
  ctx: ContextoTareas
  campo?: "fecha" | "fechaLimite"
  modo?: "mes" | "semana"
  finesDeSemana?: boolean
  activaId?: string | null
  onAbrir: (t: Tarea) => void
  /** La tarea pasa a ese día (o se queda sin fecha, con `null`). */
  onMover: (t: Tarea, dia: string | null) => void
  onCrear?: (dia: string, titulo: string) => void
}) {
  const dia = soloFecha(hoy)
  const [ancla, setAncla] = React.useState(dia)
  const [abiertos, setAbiertos] = React.useState<Set<string>>(new Set())
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dndId = React.useId()

  const porDia = React.useMemo(() => {
    const m = new Map<string, Tarea[]>()
    for (const t of tareas) for (const d of diasDe(t, campo)) m.set(d, [...(m.get(d) ?? []), t])
    return m
  }, [tareas, campo])
  const sinFecha = tareas.filter((t) => diasDe(t, campo).length === 0)

  const casillas = modo === "mes" ? casillasDelMes(ancla) : Array.from({ length: 7 }, (_, i) => sumarDias(lunesDe(ancla), i))
  const columnas = finesDeSemana ? 7 : 5
  const visibles = finesDeSemana ? casillas : casillas.filter((_, i) => i % 7 < 5)
  const titulo = modo === "mes" ? nombreMes(ancla) : `Semana del ${diaLargo(lunesDe(ancla)).replace(/^\w+, /, "")}`
  const mover = (n: number) => setAncla((a) => (modo === "mes" ? sumarMeses(a, n) : sumarDias(a, 7 * n)))

  const alSoltar = (e: DragEndEvent) => {
    const id = e.active.data.current?.id
    const t = typeof id === "string" ? tareas.find((x) => x.id === id) : undefined
    if (!t || !e.over) return
    const destino = String(e.over.id)
    onMover(t, destino === SIN_FECHA ? null : destino)
  }

  return (
    <DndContext id={dndId} sensors={sensors} onDragEnd={alSoltar}>
      {/* Se adapta a su sitio, no a la pantalla: cabe igual en el bloque de al lado que a todo lo ancho. */}
      <div className="@container">
        <div className="flex flex-col gap-3 p-3 @3xl:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Button variant="outline" size="icon-sm" aria-label="Anterior" onClick={() => mover(-1)}>
                <ChevronLeftIcon />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAncla(dia)}>
                Hoy
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Siguiente" onClick={() => mover(1)}>
                <ChevronRightIcon />
              </Button>
              <span className="text-sm font-semibold first-letter:uppercase">{titulo}</span>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border bg-border" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
              {DIAS.slice(0, columnas).map((d) => (
                <div key={d} className="bg-muted/60 px-2 py-1 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {visibles.map((d) => {
                const lista = porDia.get(d) ?? []
                const enMes = modo === "semana" || mismoMes(d, ancla)
                const abierto = abiertos.has(d) || modo === "semana"
                const vistas = abierto ? lista : lista.slice(0, MAX_EN_MES)
                return (
                  <Dia key={d} dia={d} className={cn("group/dia flex min-w-0 flex-col gap-1 bg-card p-1 @2xl:p-1.5", modo === "mes" ? "min-h-16 @2xl:min-h-24" : "min-h-40 @2xl:min-h-56", !enMes && "bg-muted/30")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("grid size-6 place-items-center rounded-full text-xs tabular-nums", d === dia ? "bg-foreground font-semibold text-background" : enMes ? "text-foreground" : "text-muted-foreground")}>{Number(d.slice(8))}</span>
                      {onCrear && <NuevaEnDia dia={d} onCrear={(t) => onCrear(d, t)} />}
                    </div>
                    {vistas.map((t) => (
                      <Chip key={`${d}-${t.id}`} tarea={t} dia={d} ctx={ctx} activa={activaId === t.id} onAbrir={() => onAbrir(t)} />
                    ))}
                    {!abierto && lista.length > MAX_EN_MES && (
                      <button type="button" onClick={() => setAbiertos((s) => new Set(s).add(d))} className="px-1 text-left text-[11px] text-muted-foreground hover:text-foreground">
                        +{lista.length - MAX_EN_MES} más
                      </button>
                    )}
                  </Dia>
                )
              })}
            </div>
          </div>
          <Dia dia={SIN_FECHA} className="flex w-full flex-none flex-col gap-1.5 rounded-lg border bg-muted/30 p-2 @3xl:w-56">
            <span className="text-xs font-semibold text-muted-foreground">Sin {campo === "fecha" ? "fecha" : "fecha límite"} · {sinFecha.length}</span>
            <span className="text-[11px] text-muted-foreground">Arrástralas a un día para darles fecha.</span>
            {sinFecha.map((t) => (
              <Chip key={`sin-${t.id}`} tarea={t} dia={SIN_FECHA} ctx={ctx} activa={activaId === t.id} onAbrir={() => onAbrir(t)} />
            ))}
          </Dia>
        </div>
      </div>
    </DndContext>
  )
}
