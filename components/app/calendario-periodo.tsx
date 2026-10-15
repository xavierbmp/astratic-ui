"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { PlusIcon } from "lucide-react"
import { cn } from "cn"
import { INICIALES_SEMANA, diaLargo, mismoMes, periodoCalendario, type ModoPeriodo } from "@/lib/base/calendario"
import { Button } from "@/components/ui/button"
import { NumeroDia } from "@/components/app/agenda"

/** Prefijo del id de cada día como sitio donde soltar: `dia:2026-10-06`. Así la página sabe dónde cae lo que se arrastra. */
export const PREFIJO_DIA = "dia:"

/** Lo que cabe en un día del mes antes del «+N más». */
const MAX_EN_MES = 3

function Dia({ dia, children, className }: { dia: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${PREFIJO_DIA}${dia}` })
  return (
    <div ref={setNodeRef} data-dia={dia} className={cn(className, isOver && "bg-brand-soft")}>
      {children}
    </div>
  )
}

/**
 * Un calendario para planificar: el mes (seis semanas) o la semana, cada cosa en su día, los avisos
 * del día (fechas clave, festivos) en su cabecera y el «+» para añadir algo ese día. Cada día es un
 * sitio donde soltar (`PREFIJO_DIA`); el `DndContext` lo pone la página, que así también recibe lo
 * que viene de fuera (una idea, algo sin fecha). Quien lo usa pinta cada cosa (`pintar`): grande en
 * la semana, en dos líneas en el mes. Se adapta a su sitio, no a la pantalla.
 */
export function CalendarioPeriodo<E extends { id: string }>({
  entradasDe,
  avisosDe,
  pintar,
  hoy,
  ancla,
  modo,
  finesDeSemana = true,
  onNuevo,
  etiquetaNuevo = (dia) => `Añadir el ${diaLargo(dia)}`,
}: {
  /** Lo de un día, en su orden. */
  entradasDe: (dia: string) => E[]
  /** Lo que va en la cabecera del día, encima de todo (no se arrastra ni cuenta para el «+N más»). */
  avisosDe?: (dia: string) => React.ReactNode
  pintar: (entrada: E, como: { grande: boolean }) => React.ReactNode
  hoy: string
  /** Un día del periodo que se ve. */
  ancla: string
  modo: ModoPeriodo
  finesDeSemana?: boolean
  onNuevo?: (dia: string) => void
  etiquetaNuevo?: (dia: string) => string
}) {
  const [abiertos, setAbiertos] = React.useState<Set<string>>(new Set())
  const { dias } = periodoCalendario(ancla, modo)
  const columnas = finesDeSemana ? 7 : 5
  const visibles = finesDeSemana ? dias : dias.filter((_, i) => i % 7 < 5)
  const semana = modo === "semana"

  return (
    <div data-slot="calendario-periodo" className="@container">
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
        {INICIALES_SEMANA.slice(0, columnas).map((d) => (
          <div key={d} className="bg-muted/60 px-2 py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {visibles.map((dia) => {
          const cosas = entradasDe(dia)
          const enMes = semana || mismoMes(dia, ancla)
          const abierto = semana || abiertos.has(dia)
          const vistas = abierto ? cosas : cosas.slice(0, MAX_EN_MES)
          return (
            <Dia key={dia} dia={dia} className={cn("group/dia flex min-w-0 flex-col gap-1 bg-card p-1 @2xl:p-1.5", semana ? "min-h-64 @2xl:min-h-80" : "min-h-20 @2xl:min-h-28", !enMes && "bg-muted/30")}>
              <div className="flex items-center justify-between gap-1">
                <NumeroDia dia={dia} hoy={dia === hoy} fuera={!enMes} />
                {onNuevo && (
                  <Button variant="ghost" size="icon-sm" aria-label={etiquetaNuevo(dia)} className="size-5 text-muted-foreground opacity-0 group-hover/dia:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100" onClick={() => onNuevo(dia)}>
                    <PlusIcon className="size-3.5" />
                  </Button>
                )}
              </div>
              {avisosDe?.(dia)}
              {vistas.map((e) => (
                <React.Fragment key={e.id}>{pintar(e, { grande: semana })}</React.Fragment>
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

/** Un aviso en la cabecera de un día (una fecha clave, un festivo): pequeño, en azul y con su icono. */
export function AvisoDia({ icono: Icono, titulo, detalle }: { icono: React.ComponentType<{ className?: string }>; titulo: string; detalle?: string }) {
  return (
    <span title={[titulo, detalle].filter(Boolean).join(" · ")} className="flex min-w-0 items-center gap-1 rounded-md bg-info-soft px-1.5 py-0.5 text-[10px] font-medium text-info">
      <Icono className="size-3 flex-none" />
      <span className="line-clamp-2">{titulo}</span>
    </span>
  )
}
