"use client"

import * as React from "react"
import { CalendarCheck2Icon, ChevronDownIcon, GripVerticalIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"
import { cn } from "cn"
import type { Tarea } from "@/lib/influencer/modelo"
import { estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { diaLargo, sumarDias } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrastreFilas, GrupoArrastrable, useFilaArrastrable } from "@/components/app/arrastre-filas"
import { Block } from "@/components/influencer/block"
import { CasillaTarea, DondeChip, EsperandoDias, FechaTarea, HoraTarea, PrioridadBandera } from "@/components/influencer/task-cells"
import { BotonSubtareas, MiniSubtareas } from "@/components/influencer/task-subtareas"

/** Lo que se ve de Hoy sin desplegar: lo justo para que el bloque de todas las tareas quepa debajo. */
const MAX_VISIBLES = 6

function FilaHoy({
  tarea,
  hijas,
  hoy,
  ctx,
  onAbrir,
  onToggle,
  onMover,
  arrastrable,
  vencida,
}: {
  tarea: Tarea
  hijas: Tarea[]
  hoy: string
  ctx: ContextoTareas
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onMover?: (dia: string) => void
  arrastrable: boolean
  vencida?: boolean
}) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(tarea.id, vencida ? "vencidas" : "hoy", !arrastrable)
  const [abiertas, setAbiertas] = React.useState(false)
  const hecha = estaCerrada(tarea)
  return (
    <li ref={ref} style={style} className={cn("rounded-lg transition-colors hover:bg-muted/70", arrastrando && "bg-card opacity-80 shadow-pop")}>
      <div onClick={() => onAbrir(tarea)} className="group/hoy flex min-h-9 cursor-pointer items-center gap-2.5 px-2 py-1">
        {arrastrable && (
          <button type="button" aria-label="Arrastrar para cambiar el orden del día" onClick={(e) => e.stopPropagation()} className="-ml-1 hidden cursor-grab text-muted-foreground opacity-0 group-hover/hoy:opacity-100 focus-visible:opacity-100 md:block" {...asa}>
            <GripVerticalIcon className="size-4" />
          </button>
        )}
        <CasillaTarea tarea={tarea} onToggle={() => onToggle(tarea)} />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn("min-w-0 truncate text-sm font-medium", hecha && "text-muted-foreground line-through")}>{tarea.titulo}</span>
          <BotonSubtareas hechas={hijas.filter(estaCerrada).length} total={hijas.length} abiertas={abiertas} onAlternar={() => setAbiertas((v) => !v)} />
          <DondeChip donde={tarea.donde} ctx={ctx} className="hidden max-w-48 sm:inline-flex" />
          <EsperandoDias tarea={tarea} hoy={hoy} />
        </span>
        <span className="flex flex-none items-center gap-2">
          <PrioridadBandera prioridad={tarea.prioridad} soloSiImporta />
          {vencida ? <FechaTarea tarea={tarea} hoy={hoy} /> : <HoraTarea tarea={tarea} />}
          {vencida && onMover && (
            <span className="hidden items-center sm:flex" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => onMover(hoy.slice(0, 10))}>
                Hoy
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => onMover(sumarDias(hoy, 1))}>
                Mañana
              </Button>
            </span>
          )}
        </span>
      </div>
      {abiertas && <MiniSubtareas hijas={hijas} onToggle={onToggle} onAbrir={onAbrir} className="pr-2 pb-1.5 pl-9" />}
    </li>
  )
}

/**
 * Lo primero de la página de Tareas, en poco sitio: qué toca hoy y en qué orden. En la cabecera, el
 * día, cuántas quedan y los atajos a mañana, lo que espera y la semana. Debajo, en filas de una
 * línea, lo vencido (en rojo, con «Pasar todo a hoy») y lo de hoy por importancia (prioridad, hora y
 * lo que vence antes), que ella puede reordenar arrastrando. Se ven seis; el resto, al desplegar. Las
 * hechas de hoy, plegadas al final.
 */
export function TareasHoy({
  hoy,
  vencidas,
  deHoy,
  hechasHoy,
  ctx,
  hijasDe,
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
  /** Las subtareas de una tarea, en su orden: se despliegan en pequeño para marcarlas. */
  hijasDe: (t: Tarea) => Tarea[]
  /** Si ella ha cambiado el orden del día a mano. */
  ordenManual: boolean
  onReordenar: (ids: string[]) => void
  onOrdenAutomatico: () => void
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onMover: (t: Tarea, dia: string) => void
  onPasarTodasAHoy: () => void
  onCrear: (titulo: string) => void
  /** Los atajos de la cabecera: «Mañana 4 · Esperando a otros 3 · Esta semana 9», cada uno con su enlace. */
  resumen: { label: string; n: number; onVer: () => void }[]
  plegado: boolean
  onPlegar: () => void
}) {
  const [todas, setTodas] = React.useState(false)
  const [hechasAbiertas, setHechasAbiertas] = React.useState(false)
  const [texto, setTexto] = React.useState("")
  // Las vencidas se ven siempre; lo de hoy, hasta completar las seis.
  const hueco = Math.max(MAX_VISIBLES - vencidas.length, 2)
  const visibles = todas ? deHoy : deHoy.slice(0, hueco)
  const ocultas = deHoy.length - visibles.length
  const total = vencidas.length + deHoy.length
  const fila = (t: Tarea, extra: { vencida?: boolean; arrastrable: boolean }) => (
    <FilaHoy key={t.id} tarea={t} hijas={hijasDe(t)} hoy={hoy} ctx={ctx} onAbrir={onAbrir} onToggle={onToggle} onMover={extra.vencida ? (dia) => onMover(t, dia) : undefined} {...extra} />
  )

  return (
    <Block className="gap-2 p-4">
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
        <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {ordenManual && !plegado && (
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-muted-foreground" onClick={onOrdenAutomatico}>
              <RotateCcwIcon /> Orden automático
            </Button>
          )}
          {resumen.map((r) => (
            <button key={r.label} type="button" onClick={r.onVer} className="text-muted-foreground hover:text-foreground hover:underline">
              {r.label} <span className="font-semibold text-foreground tabular-nums">{r.n}</span>
            </button>
          ))}
        </span>
      </div>

      {!plegado && (
        <ArrastreFilas
          onSoltar={(s) => {
            if (s.hacia !== "hoy" || s.desde !== "hoy" || !s.sobre) return
            const ids = deHoy.map((t) => t.id)
            onReordenar(arrayMove(ids, ids.indexOf(s.id), ids.indexOf(s.sobre)))
          }}
        >
          {/* Rejillas de una columna que puede encoger: si no, un título largo ensancha el bloque en el móvil. */}
          {vencidas.length > 0 && (
            <div className="grid grid-cols-1 gap-0.5">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-danger">Vencidas</span>
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={onPasarTodasAHoy}>
                  Pasar todo a hoy
                </Button>
              </div>
              <GrupoArrastrable grupoId="vencidas" ids={vencidas.map((t) => t.id)}>
                <ul className="grid grid-cols-1 gap-0.5">{vencidas.map((t) => fila(t, { vencida: true, arrastrable: false }))}</ul>
              </GrupoArrastrable>
            </div>
          )}

          <div className="grid grid-cols-1 gap-0.5">
            {vencidas.length > 0 && deHoy.length > 0 && <span className="px-2 pt-1 text-xs font-semibold text-muted-foreground">Para hoy, por importancia</span>}
            {deHoy.length === 0 && vencidas.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">Nada para hoy. Mira lo de mañana o planifica la semana.</p>
            ) : (
              <GrupoArrastrable grupoId="hoy" ids={visibles.map((t) => t.id)}>
                <ul className="grid grid-cols-1 gap-0.5">{visibles.map((t) => fila(t, { arrastrable: true }))}</ul>
              </GrupoArrastrable>
            )}
            <div className="flex flex-wrap items-center gap-x-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!texto.trim()) return
                  onCrear(texto.trim())
                  setTexto("")
                }}
                className="flex min-w-48 flex-1 items-center gap-2 px-2"
              >
                <PlusIcon className="size-4 flex-none text-muted-foreground" />
                <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Añadir para hoy… (Enter)" className="h-8 border-transparent bg-transparent px-1 shadow-none focus-visible:border-input" />
              </form>
              {(ocultas > 0 || todas) && deHoy.length > hueco && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTodas((v) => !v)}>
                  {todas ? "Ver menos" : `Ver ${ocultas} más`}
                </Button>
              )}
              {hechasHoy.length > 0 && (
                <button type="button" onClick={() => setHechasAbiertas((v) => !v)} aria-expanded={hechasAbiertas} className="flex h-7 items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <ChevronDownIcon className={cn("size-3.5 transition-transform", !hechasAbiertas && "-rotate-90")} />
                  Hechas hoy ({hechasHoy.length})
                </button>
              )}
            </div>
            {hechasAbiertas && hechasHoy.length > 0 && <ul className="grid grid-cols-1 gap-0.5">{hechasHoy.map((t) => fila(t, { arrastrable: false }))}</ul>}
          </div>
        </ArrastreFilas>
      )}
    </Block>
  )
}
