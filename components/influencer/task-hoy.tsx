"use client"

import * as React from "react"
import { CalendarCheck2Icon, ChevronDownIcon, ChevronUpIcon, GripVerticalIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"
import { cn } from "cn"
import type { EtiquetaTarea, IconoTarea, Tarea } from "@/lib/influencer/modelo"
import { estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { diaLargo } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrastreFilas, GrupoArrastrable, useFilaArrastrable } from "@/components/app/arrastre-filas"
import { Block } from "@/components/influencer/block"
import { CasillaTarea, DondeChip, EsperandoDias, EtiquetasTarea, FechaTarea, HoraTarea, PrioridadIcono } from "@/components/influencer/task-cells"
import { IconoDeTarea, SelectorIconoTarea } from "@/components/influencer/task-icono"
import { BotonSubtareas, MiniSubtareas } from "@/components/influencer/task-subtareas"

/** Si lo de dentro no cabe en su caja (para el difuminado y «Ver todas»); se vuelve a medir al cambiar de tamaño. */
function useSobra(activo: boolean) {
  // Con estado y no con useRef: la lista se pinta después (dentro del arrastre) y hay que medir cuando aparece.
  const [el, ref] = React.useState<HTMLDivElement | null>(null)
  const [sobra, setSobra] = React.useState(false)
  React.useEffect(() => {
    if (!el || !activo) return
    const medir = () => setSobra(el.scrollHeight > el.clientHeight + 1)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    for (const hijo of el.children) ro.observe(hijo)
    return () => ro.disconnect()
  }, [el, activo])
  return { ref, sobra: activo && sobra }
}

function FilaHoy({
  tarea,
  hijas,
  hoy,
  ctx,
  etiquetas,
  onAbrir,
  onToggle,
  onCambiarIcono,
  arrastrable,
  vencida,
  conFecha,
}: {
  tarea: Tarea
  hijas: Tarea[]
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onCambiarIcono?: (t: Tarea, icono: IconoTarea | undefined) => void
  arrastrable: boolean
  vencida?: boolean
  /** Una de los próximos días: en vez de la hora, su día. */
  conFecha?: boolean
}) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(tarea.id, vencida ? "vencidas" : conFecha ? "siguientes" : "hoy", !arrastrable)
  const [abiertas, setAbiertas] = React.useState(false)
  const hecha = estaCerrada(tarea)
  return (
    <li ref={ref} style={style} className={cn("rounded-lg transition-colors hover:bg-muted/70", arrastrando && "bg-card opacity-80 shadow-pop")}>
      {/* Cada dato en su columna, de ancho fijo, para que se lean en vertical: qué, de dónde, etiquetas, prioridad y cuándo. */}
      <div onClick={() => onAbrir(tarea)} className="group/hoy flex min-h-10 cursor-pointer items-center gap-3 px-2 py-1">
        <span className="flex flex-none items-center gap-2">
          {arrastrable && (
            <button type="button" aria-label="Arrastrar para cambiar el orden del día" onClick={(e) => e.stopPropagation()} className="-mr-1 -ml-1 hidden cursor-grab text-muted-foreground opacity-0 group-hover/hoy:opacity-100 focus-visible:opacity-100 md:block" {...asa}>
              <GripVerticalIcon className="size-4" />
            </button>
          )}
          <CasillaTarea tarea={tarea} onToggle={() => onToggle(tarea)} />
          <span onClick={(e) => e.stopPropagation()} className="flex">
            {onCambiarIcono ? <SelectorIconoTarea tarea={tarea} onCambiar={(icono) => onCambiarIcono(tarea, icono)} /> : <IconoDeTarea tarea={tarea} />}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn("min-w-0 truncate text-sm font-medium", hecha && "text-muted-foreground line-through")}>{tarea.titulo}</span>
          <BotonSubtareas hechas={hijas.filter(estaCerrada).length} total={hijas.length} abiertas={abiertas} onAlternar={() => setAbiertas((v) => !v)} />
          <EsperandoDias tarea={tarea} hoy={hoy} />
        </span>
        <span className="hidden w-52 min-w-0 flex-none md:flex">
          <DondeChip donde={tarea.donde} ctx={ctx} />
        </span>
        <span className="hidden w-36 min-w-0 flex-none overflow-hidden xl:flex">
          <EtiquetasTarea ids={tarea.etiquetas} etiquetas={etiquetas} max={2} />
        </span>
        <span className="flex w-5 flex-none justify-center">
          <PrioridadIcono prioridad={tarea.prioridad} soloSiImporta />
        </span>
        <span className="flex w-24 flex-none justify-end">{vencida || conFecha ? <FechaTarea tarea={tarea} hoy={hoy} /> : <HoraTarea tarea={tarea} />}</span>
      </div>
      {abiertas && <MiniSubtareas hijas={hijas} onToggle={onToggle} onAbrir={onAbrir} className="pr-2 pb-1.5 pl-[72px]" />}
    </li>
  )
}

/**
 * Lo primero de la página de Tareas, en poco sitio: qué toca hoy y en qué orden. En la cabecera, el
 * día, cuántas quedan y los atajos a mañana, lo que espera y la semana. Debajo, en filas de una
 * línea, lo vencido (en rojo, con «Pasar todo a hoy») y lo de hoy por importancia (prioridad, hora y
 * lo que vence antes), que ella puede reordenar arrastrando. Cada fila con su icono y cada dato en su
 * columna. El bloque ocupa como mucho un tercio de la pantalla (Xavier, 2026-10-16): lo que no cabe se
 * desvanece abajo y «Ver todas» lo despliega. Las hechas de hoy, plegadas al final. Sin nada para hoy, «Hoy» queda
 * vacío y debajo salen las siguientes por orden, hasta el mismo alto (Xavier, 2026-10-21, reporte cmvfixkv).
 */
export function TareasHoy({
  hoy,
  vencidas,
  deHoy,
  hechasHoy,
  siguientes = [],
  ctx,
  etiquetas,
  hijasDe,
  ordenManual,
  onReordenar,
  onOrdenAutomatico,
  onAbrir,
  onToggle,
  onCambiarIcono,
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
  /** Las de los próximos días, por orden: salen cuando hoy no hay nada. */
  siguientes?: Tarea[]
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  /** Las subtareas de una tarea, en su orden: se despliegan en pequeño para marcarlas. */
  hijasDe: (t: Tarea) => Tarea[]
  /** Si ella ha cambiado el orden del día a mano. */
  ordenManual: boolean
  onReordenar: (ids: string[]) => void
  onOrdenAutomatico: () => void
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  /** Pulsar el icono de una fila deja elegir otro; sin esto, el icono solo se ve. */
  onCambiarIcono?: (t: Tarea, icono: IconoTarea | undefined) => void
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
  const total = vencidas.length + deHoy.length
  const { ref: listaRef, sobra } = useSobra(!plegado && !todas)
  const fila = (t: Tarea, extra: { vencida?: boolean; conFecha?: boolean; arrastrable: boolean }) => (
    <FilaHoy key={t.id} tarea={t} hijas={hijasDe(t)} hoy={hoy} ctx={ctx} etiquetas={etiquetas} onAbrir={onAbrir} onToggle={onToggle} onCambiarIcono={onCambiarIcono} {...extra} />
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
          {/* Como mucho un tercio de la pantalla: lo que no cabe se desvanece y «Ver todas» lo despliega. */}
          <div className="relative">
            <div ref={listaRef} className={cn("flex flex-col gap-1", !todas && "max-h-[33dvh] overflow-hidden")}>
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
                  <>
                    <p className="px-2 py-2 text-sm text-muted-foreground">{siguientes.length ? "Nada para hoy." : "Nada para hoy. Mira lo de mañana o planifica la semana."}</p>
                    {siguientes.length > 0 && (
                      <>
                        <span className="px-2 pt-1 text-xs font-semibold text-muted-foreground">Lo siguiente</span>
                        <ul className="grid grid-cols-1 gap-0.5">{siguientes.map((t) => fila(t, { conFecha: true, arrastrable: false }))}</ul>
                      </>
                    )}
                  </>
                ) : (
                  <GrupoArrastrable grupoId="hoy" ids={deHoy.map((t) => t.id)}>
                    <ul className="grid grid-cols-1 gap-0.5">{deHoy.map((t) => fila(t, { arrastrable: true }))}</ul>
                  </GrupoArrastrable>
                )}
              </div>
            </div>
            {sobra && !todas && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" aria-hidden />}
          </div>

          <div className="grid grid-cols-1 gap-0.5">
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
              {(sobra || todas) && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTodas((v) => !v)} aria-expanded={todas}>
                  {todas ? (
                    <>
                      <ChevronUpIcon /> Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon /> Ver todas ({total})
                    </>
                  )}
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
