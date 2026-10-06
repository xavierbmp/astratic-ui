"use client"

import * as React from "react"
import { CalendarCheck2Icon, ChevronDownIcon, GripVerticalIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"
import { cn } from "cn"
import type { EtiquetaTarea, Tarea } from "@/lib/influencer/modelo"
import { estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { diaLargo, sumarDias } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrastreFilas, GrupoArrastrable, useFilaArrastrable } from "@/components/app/arrastre-filas"
import { Block } from "@/components/influencer/block"
import { CasillaTarea, DondeChip, EsperandoDias, FechaTarea, HoraTarea, PrioridadBandera, ProgresoSubtareas } from "@/components/influencer/task-cells"

const MAX_VISIBLES = 8

type Fila = { tarea: Tarea; subtareas?: { hechas: number; total: number } }

function FilaHoy({ fila, hoy, ctx, onAbrir, onToggle, onMover, arrastrable, vencida }: { fila: Fila; hoy: string; ctx: ContextoTareas; onAbrir: () => void; onToggle: () => void; onMover?: (dia: string) => void; arrastrable: boolean; vencida?: boolean }) {
  const { tarea } = fila
  const { ref, style, asa, arrastrando } = useFilaArrastrable(tarea.id, vencida ? "vencidas" : "hoy", !arrastrable)
  const hecha = estaCerrada(tarea)
  return (
    <li
      ref={ref}
      style={style}
      onClick={onAbrir}
      className={cn("group/hoy flex cursor-pointer items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5 transition-colors hover:bg-muted", arrastrando && "opacity-80 shadow-pop")}
    >
      {arrastrable && (
        <button type="button" aria-label="Arrastrar para cambiar el orden del día" onClick={(e) => e.stopPropagation()} className="-ml-1 hidden cursor-grab text-muted-foreground opacity-0 group-hover/hoy:opacity-100 focus-visible:opacity-100 md:block" {...asa}>
          <GripVerticalIcon className="size-4" />
        </button>
      )}
      <CasillaTarea tarea={tarea} onToggle={onToggle} />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn("truncate text-sm font-medium", hecha && "text-muted-foreground line-through")}>{tarea.titulo}</span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
          <DondeChip donde={tarea.donde} ctx={ctx} />
          {fila.subtareas && <ProgresoSubtareas hechas={fila.subtareas.hechas} total={fila.subtareas.total} />}
          <EsperandoDias tarea={tarea} hoy={hoy} />
        </span>
      </span>
      <span className="flex flex-none items-center gap-2">
        <PrioridadBandera prioridad={tarea.prioridad} soloSiImporta />
        {vencida ? <FechaTarea tarea={tarea} hoy={hoy} /> : <HoraTarea tarea={tarea} />}
        {!vencida && tarea.fechaLimite && tarea.fecha && tarea.fechaLimite.slice(0, 10) > tarea.fecha.slice(0, 10) && <FechaTarea tarea={tarea} hoy={hoy} campo="fechaLimite" className="hidden font-normal sm:inline-flex" />}
        {vencida && onMover && (
          <span className="hidden items-center gap-1 sm:flex" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onMover(hoy.slice(0, 10))}>
              Hoy
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onMover(sumarDias(hoy, 1))}>
              Mañana
            </Button>
          </span>
        )}
      </span>
    </li>
  )
}

/**
 * Lo primero de la página de Tareas: qué toca hoy y en qué orden. Arriba lo vencido, en rojo, con
 * «Pasar todo a hoy»; debajo lo de hoy por importancia (prioridad, hora y lo que vence antes), que
 * ella puede reordenar arrastrando; las hechas de hoy, plegadas al final.
 */
export function TareasHoy({
  hoy,
  vencidas,
  deHoy,
  hechasHoy,
  ctx,
  subtareasDe,
  ordenManual,
  onReordenar,
  onOrdenAutomatico,
  onAbrir,
  onToggle,
  onMover,
  onPasarTodasAHoy,
  onCrear,
  resumen,
  plegado,
  onPlegar,
}: {
  hoy: string
  vencidas: Tarea[]
  /** Ya en su orden: el automático o el que ella ha puesto. */
  deHoy: Tarea[]
  hechasHoy: Tarea[]
  ctx: ContextoTareas
  etiquetas?: EtiquetaTarea[]
  subtareasDe: (t: Tarea) => { hechas: number; total: number } | undefined
  /** Si ella ha cambiado el orden del día a mano. */
  ordenManual: boolean
  onReordenar: (ids: string[]) => void
  onOrdenAutomatico: () => void
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onMover: (t: Tarea, dia: string) => void
  onPasarTodasAHoy: () => void
  onCrear: (titulo: string) => void
  /** La línea del pie: «Mañana 4 · Esperando a otros 3 · Esta semana 9», cada una con su enlace. */
  resumen: { label: string; n: number; onVer: () => void }[]
  plegado: boolean
  onPlegar: () => void
}) {
  const [todas, setTodas] = React.useState(false)
  const [hechasAbiertas, setHechasAbiertas] = React.useState(false)
  const [texto, setTexto] = React.useState("")
  const visibles = todas ? deHoy : deHoy.slice(0, MAX_VISIBLES)
  const total = vencidas.length + deHoy.length
  const fila = (t: Tarea): Fila => ({ tarea: t, subtareas: subtareasDe(t) })

  return (
    <Block className="gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button type="button" onClick={onPlegar} aria-expanded={!plegado} className="flex items-center gap-2 rounded-md text-left">
          <CalendarCheck2Icon className="size-5 text-brand" aria-hidden />
          <span className="text-base font-semibold">Hoy</span>
          <span className="text-sm text-muted-foreground first-letter:uppercase">{diaLargo(hoy)}</span>
          <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", plegado && "-rotate-90")} />
        </button>
        <span className="text-sm text-muted-foreground">
          {total === 0 ? "Nada pendiente" : `${total} ${total === 1 ? "tarea" : "tareas"}${vencidas.length ? ` · ${vencidas.length} ${vencidas.length === 1 ? "vencida" : "vencidas"}` : ""}`}
        </span>
        {ordenManual && !plegado && (
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs text-muted-foreground" onClick={onOrdenAutomatico}>
            <RotateCcwIcon /> Volver al orden automático
          </Button>
        )}
      </div>

      {!plegado && (
        <ArrastreFilas
          onSoltar={(s) => {
            if (s.hacia !== "hoy" || s.desde !== "hoy" || !s.sobre) return
            const ids = deHoy.map((t) => t.id)
            onReordenar(arrayMove(ids, ids.indexOf(s.id), ids.indexOf(s.sobre)))
          }}
        >
          {vencidas.length > 0 && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-danger">Vencidas</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onPasarTodasAHoy}>
                  Pasar todo a hoy
                </Button>
              </div>
              <GrupoArrastrable grupoId="vencidas" ids={vencidas.map((t) => t.id)}>
                <ul className="grid gap-1.5">
                  {vencidas.map((t) => (
                    <FilaHoy key={t.id} fila={fila(t)} hoy={hoy} ctx={ctx} vencida arrastrable={false} onAbrir={() => onAbrir(t)} onToggle={() => onToggle(t)} onMover={(dia) => onMover(t, dia)} />
                  ))}
                </ul>
              </GrupoArrastrable>
            </div>
          )}

          <div className="grid gap-2">
            {vencidas.length > 0 && deHoy.length > 0 && <span className="text-xs font-semibold text-muted-foreground">Para hoy, por importancia</span>}
            {deHoy.length === 0 && vencidas.length === 0 ? (
              <div className="flex flex-col items-start gap-1 rounded-xl bg-background/70 px-4 py-5">
                <span className="text-sm font-medium">Nada para hoy</span>
                <span className="text-sm text-muted-foreground">Mira lo de mañana o planifica la semana.</span>
              </div>
            ) : (
              <GrupoArrastrable grupoId="hoy" ids={visibles.map((t) => t.id)}>
                <ul className="grid gap-1.5">
                  {visibles.map((t) => (
                    <FilaHoy key={t.id} fila={fila(t)} hoy={hoy} ctx={ctx} arrastrable onAbrir={() => onAbrir(t)} onToggle={() => onToggle(t)} />
                  ))}
                </ul>
              </GrupoArrastrable>
            )}
            {deHoy.length > MAX_VISIBLES && (
              <Button variant="ghost" size="sm" className="justify-self-start text-xs" onClick={() => setTodas((v) => !v)}>
                {todas ? "Ver menos" : `Ver las ${deHoy.length} de hoy`}
              </Button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!texto.trim()) return
                onCrear(texto.trim())
                setTexto("")
              }}
              className="flex items-center gap-2 rounded-xl px-3"
            >
              <PlusIcon className="size-4 flex-none text-muted-foreground" />
              <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Añadir para hoy… (Enter)" className="h-9 border-transparent bg-transparent shadow-none focus-visible:border-input" />
            </form>
          </div>

          {hechasHoy.length > 0 && (
            <div className="grid gap-1.5">
              <button type="button" onClick={() => setHechasAbiertas((v) => !v)} aria-expanded={hechasAbiertas} className="flex items-center gap-1.5 justify-self-start text-xs font-medium text-muted-foreground hover:text-foreground">
                <ChevronDownIcon className={cn("size-3.5 transition-transform", !hechasAbiertas && "-rotate-90")} />
                Hechas hoy ({hechasHoy.length})
              </button>
              {hechasAbiertas && (
                <ul className="grid gap-1.5">
                  {hechasHoy.map((t) => (
                    <FilaHoy key={t.id} fila={fila(t)} hoy={hoy} ctx={ctx} arrastrable={false} onAbrir={() => onAbrir(t)} onToggle={() => onToggle(t)} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </ArrastreFilas>
      )}

      {!plegado && resumen.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-sm">
          {resumen.map((r) => (
            <button key={r.label} type="button" onClick={r.onVer} className="text-muted-foreground hover:text-foreground hover:underline">
              {r.label} <span className="font-semibold text-foreground tabular-nums">{r.n}</span>
            </button>
          ))}
        </div>
      )}
    </Block>
  )
}
