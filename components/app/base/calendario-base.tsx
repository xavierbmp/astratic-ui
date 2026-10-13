"use client"

import * as React from "react"
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EmptyState } from "@/components/app/states"
import { textoDeValor, type ColorOpcion, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { DIAS_SEMANA, mesDe, nombreMes, semanasDelMes, sumarMeses } from "@/lib/base/calendario"
import { CLASE_FUERTE } from "@/components/app/base/apariencia"

/** Los registros que caben en un día antes del «+N más». */
const EN_EL_DIA = 3

type PropsCalendario<T> = {
  /** El campo de fecha que pone cada registro en su día. Sin él, se explica cómo elegir uno. */
  campo: DefCampo<T> | undefined
  /** Lo que se lee de cada registro: el campo principal. */
  principal: DefCampo<T> | undefined
  registros: T[]
  getId: (fila: T) => string
  hoy: string
  colorDe: (fila: T) => ColorOpcion | undefined
  abiertoId?: string | null
  onAbrir: (id: string) => void
  onEscribir?: (fila: T, campo: DefCampo<T>, valor: ValorCampo) => void
}

/**
 * El calendario de la base: el mes de lunes a domingo con cada registro en el día de su campo de
 * fecha. Se pasa de mes con las flechas («Hoy» vuelve); pulsar un registro abre su ficha y, si la
 * fecha se puede escribir, arrastrarlo a otro día se la cambia. Los que no tienen fecha se cuentan arriba.
 */
export function CalendarioBase<T>({ campo, principal, registros, getId, hoy, colorDe, abiertoId, onAbrir, onEscribir }: PropsCalendario<T>) {
  const [mes, setMes] = React.useState(mesDe(hoy))
  const [arrastrado, setArrastrado] = React.useState<T | null>(null)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const idDnd = React.useId()

  const { porDia, sinFecha } = React.useMemo(() => {
    const mapa = new Map<string, T[]>()
    let sin = 0
    for (const fila of registros) {
      const v = campo?.valor(fila)
      const dia = typeof v === "string" ? v.slice(0, 10) : ""
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
        sin += 1
        continue
      }
      mapa.set(dia, [...(mapa.get(dia) ?? []), fila])
    }
    return { porDia: mapa, sinFecha: sin }
  }, [campo, registros])

  if (!campo)
    return (
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-background pt-10">
        <EmptyState icon={CalendarDaysIcon} title="Elige el campo de fecha" description="El calendario pone cada registro en el día de un campo de fecha." />
      </div>
    )

  const editable = !!onEscribir && !campo.soloLectura
  const semanas = semanasDelMes(mes)
  const titulo = (fila: T) => (principal ? textoDeValor(principal, principal.valor(fila)) : "") || "Sin nombre"
  const alSoltar = (e: DragEndEvent) => {
    setArrastrado(null)
    const fila = registros.find((f) => getId(f) === e.active.id)
    if (!fila || !e.over || String(campo.valor(fila)).slice(0, 10) === e.over.id) return
    onEscribir?.(fila, campo, String(e.over.id))
  }
  const ficha = (fila: T) => <EventoDia key={getId(fila)} id={getId(fila)} titulo={titulo(fila)} color={colorDe(fila)} abierto={abiertoId === getId(fila)} arrastrable={editable} onAbrir={() => onAbrir(getId(fila))} />
  // En la lista del «+N más» no se arrastra (ya está en su día): solo se abre.
  const enLista = (fila: T) => (
    <button key={getId(fila)} type="button" className="min-w-0 text-left" onClick={() => onAbrir(getId(fila))}>
      <ChipEvento titulo={titulo(fila)} color={colorDe(fila)} abierto={abiertoId === getId(fila)} className="hover:border-foreground/20" />
    </button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex h-11 flex-none items-center gap-1 border-b bg-card px-3 text-[13px]">
        <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => setMes(sumarMeses(mes, -1))}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => setMes(sumarMeses(mes, 1))}>
          <ChevronRightIcon />
        </Button>
        <Button variant="outline" size="sm" className="h-7" onClick={() => setMes(mesDe(hoy))}>
          Hoy
        </Button>
        <span className="ml-2 font-semibold first-letter:uppercase">{nombreMes(mes)}</span>
        {sinFecha > 0 && <span className="ml-auto text-xs text-muted-foreground">{sinFecha.toLocaleString("es-ES")} sin {campo.nombre.toLowerCase()}</span>}
      </div>
      <DndContext id={idDnd} sensors={sensores} onDragStart={(e) => setArrastrado(registros.find((f) => getId(f) === e.active.id) ?? null)} onDragEnd={alSoltar} onDragCancel={() => setArrastrado(null)}>
        <div className="grid min-h-0 flex-1 overflow-auto" style={{ gridTemplateRows: `auto repeat(${semanas.length}, minmax(104px, 1fr))` }}>
          <div className="sticky top-0 z-10 grid grid-cols-7 border-b bg-card text-[11px] font-medium text-muted-foreground uppercase">
            {DIAS_SEMANA.map((d) => (
              <span key={d} className="px-2 py-1.5">{d}</span>
            ))}
          </div>
          {semanas.map((semana) => (
            <div key={semana[0]} className="grid grid-cols-7">
              {semana.map((dia) => {
                const filas = porDia.get(dia) ?? []
                return (
                  <Dia key={dia} dia={dia} fuera={mesDe(dia) !== mes} hoy={dia === hoy.slice(0, 10)}>
                    {filas.slice(0, EN_EL_DIA).map((f) => ficha(f))}
                    {filas.length > EN_EL_DIA && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="rounded-md px-1.5 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                            +{filas.length - EN_EL_DIA} más
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="flex w-60 flex-col gap-1 p-2">
                          {filas.map(enLista)}
                        </PopoverContent>
                      </Popover>
                    )}
                  </Dia>
                )
              })}
            </div>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>{arrastrado ? <ChipEvento titulo={titulo(arrastrado)} color={colorDe(arrastrado)} className="shadow-pop" /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}

const formatoDia = (dia: string) => Number(dia.slice(8, 10))

function Dia({ dia, fuera, hoy, children }: { dia: string; fuera: boolean; hoy: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: dia })
  return (
    <div ref={setNodeRef} className={cn("flex min-w-0 flex-col gap-1 border-r border-b p-1.5 last:border-r-0", fuera && "bg-muted/40", isOver && "bg-brand-soft")}>
      <span className={cn("flex size-6 flex-none items-center justify-center rounded-full text-xs tabular-nums", fuera ? "text-muted-foreground" : "text-foreground", hoy && "bg-brand font-semibold text-brand-foreground")}>{formatoDia(dia)}</span>
      {children}
    </div>
  )
}

function ChipEvento({ titulo, color, abierto, className }: { titulo: string; color?: ColorOpcion; abierto?: boolean; className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 text-xs", abierto && "border-brand bg-brand-soft", className)}>
      <span aria-hidden className={cn("size-2 flex-none rounded-full", color ? CLASE_FUERTE[color] : "bg-muted-foreground/40")} />
      <span className="truncate">{titulo}</span>
    </span>
  )
}

function EventoDia({ id, titulo, color, abierto, arrastrable, onAbrir }: { id: string; titulo: string; color?: ColorOpcion; abierto: boolean; arrastrable: boolean; onAbrir: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled: !arrastrable })
  return (
    <button ref={setNodeRef} type="button" title={titulo} onClick={onAbrir} className={cn("min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50", arrastrable && "cursor-grab", isDragging && "opacity-40")} {...attributes} {...listeners}>
      <ChipEvento titulo={titulo} color={color} abierto={abierto} className="hover:border-foreground/20" />
    </button>
  )
}
