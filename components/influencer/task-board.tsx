"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import type { EtiquetaTarea, Tarea } from "@/lib/influencer/modelo"
import { estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import type { GrupoFilas } from "@/lib/vistas/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrastreFilas, FinDeGrupo, GrupoArrastrable, useFilaArrastrable, type Soltar } from "@/components/app/arrastre-filas"
import { CasillaTarea, DondeChip, EsperandoDias, EstadoTareaBadge, EtiquetasTarea, FechaTarea, PrioridadBandera, ProgresoSubtareas } from "@/components/influencer/task-cells"
import type { AccionesTarea } from "@/components/influencer/task-list"

/** Separa la fila y la columna en el id de un grupo del tablero con filas: «collab:lumea|en-curso». */
export const SEP_TABLERO = "|"

function Tarjeta({
  tarea,
  grupoId,
  hoy,
  ctx,
  etiquetas,
  propiedades,
  subtareas,
  activa,
  acciones,
}: {
  tarea: Tarea
  grupoId: string
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  propiedades: string[]
  subtareas?: { hechas: number; total: number }
  activa: boolean
  acciones: AccionesTarea
}) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(tarea.id, grupoId)
  const ver = (p: string) => propiedades.includes(p)
  return (
    <li
      ref={ref}
      style={style}
      {...asa}
      onClick={() => acciones.onAbrir(tarea)}
      className={cn(
        "grid cursor-pointer gap-2 rounded-lg border bg-card p-2.5 text-left shadow-xs transition-colors hover:border-foreground/20",
        activa && "border-brand bg-brand-soft",
        arrastrando && "opacity-80 shadow-pop",
      )}
    >
      <span className="flex items-start gap-2">
        <span className="pt-0.5">
          <CasillaTarea tarea={tarea} onToggle={() => acciones.onToggle(tarea)} size="sm" />
        </span>
        <span className={cn("min-w-0 flex-1 text-sm leading-snug font-medium", estaCerrada(tarea) && "text-muted-foreground line-through")}>{tarea.titulo}</span>
        {ver("prioridad") && <PrioridadBandera prioridad={tarea.prioridad} soloSiImporta />}
      </span>
      {ver("donde") && <DondeChip donde={tarea.donde} ctx={ctx} />}
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {ver("fecha") && <FechaTarea tarea={tarea} hoy={hoy} />}
        {ver("fechaLimite") && tarea.fechaLimite && <FechaTarea tarea={tarea} hoy={hoy} campo="fechaLimite" />}
        {ver("estado") ? <EstadoTareaBadge tarea={tarea} hoy={hoy} /> : <EsperandoDias tarea={tarea} hoy={hoy} />}
        {ver("subtareas") && subtareas && <ProgresoSubtareas hechas={subtareas.hechas} total={subtareas.total} />}
        {ver("etiquetas") && <EtiquetasTarea ids={tarea.etiquetas} etiquetas={etiquetas} max={2} />}
      </span>
    </li>
  )
}

function Columna({
  grupo,
  grupoId,
  cabecera,
  hoy,
  ctx,
  etiquetas,
  propiedades,
  subtareasDe,
  activaId,
  acciones,
  onCrear,
}: {
  grupo: GrupoFilas<Tarea>
  grupoId: string
  cabecera: React.ReactNode
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  propiedades: string[]
  subtareasDe: (t: Tarea) => { hechas: number; total: number } | undefined
  activaId?: string | null
  acciones: AccionesTarea
  onCrear?: (titulo: string) => void
}) {
  const [creando, setCreando] = React.useState(false)
  const [texto, setTexto] = React.useState("")
  return (
    <section className="flex w-72 flex-none flex-col gap-2 rounded-xl bg-muted/50 p-2">
      <header className="flex items-center gap-2 px-1 pt-0.5">
        <span className="min-w-0 truncate text-sm font-medium">{cabecera}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{grupo.filas.length}</span>
        {onCrear && (
          <Button variant="ghost" size="icon-sm" aria-label="Nueva en esta columna" className="ml-auto size-6 text-muted-foreground" onClick={() => setCreando(true)}>
            <PlusIcon />
          </Button>
        )}
      </header>
      <GrupoArrastrable grupoId={grupoId} ids={grupo.filas.map((t) => t.id)}>
        <ul className="grid gap-2">
          {grupo.filas.map((t) => (
            <Tarjeta key={t.id} tarea={t} grupoId={grupoId} hoy={hoy} ctx={ctx} etiquetas={etiquetas} propiedades={propiedades} subtareas={subtareasDe(t)} activa={activaId === t.id} acciones={acciones} />
          ))}
        </ul>
      </GrupoArrastrable>
      <FinDeGrupo grupoId={grupoId} className={cn("min-h-6 rounded-lg data-[over]:bg-brand/15", grupo.filas.length === 0 && "min-h-16 border border-dashed")}>
        {creando && onCrear && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!texto.trim()) return
              onCrear(texto.trim())
              setTexto("")
            }}
          >
            <Input autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={() => !texto.trim() && setCreando(false)} onKeyDown={(e) => e.key === "Escape" && setCreando(false)} placeholder="Título… (Enter)" className="h-8 bg-card text-sm" />
          </form>
        )}
      </FinDeGrupo>
    </section>
  )
}

/**
 * El tablero de una base de tareas: una columna por grupo (el estado, por defecto) y, si la vista
 * tiene filas, una fila por cada valor del segundo campo (una por campaña, por ejemplo). Arrastrar
 * una tarjeta a otra columna le cambia el valor; dentro de la columna, la coloca a mano.
 */
export function TableroTareas({
  filas,
  hoy,
  ctx,
  etiquetas,
  propiedades,
  subtareasDe,
  cabeceraGrupo,
  activaId,
  acciones,
  onSoltar,
  onCrearEnGrupo,
}: {
  /** Las filas del tablero, cada una con sus columnas. Sin filas, una sola con id «todas». */
  filas: { id: string; label: React.ReactNode; columnas: GrupoFilas<Tarea>[] }[]
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  propiedades: string[]
  subtareasDe: (t: Tarea) => { hechas: number; total: number } | undefined
  cabeceraGrupo: (g: GrupoFilas<Tarea>) => React.ReactNode
  activaId?: string | null
  acciones: AccionesTarea
  /** Los ids de grupo llevan la fila delante cuando hay filas (`SEP_TABLERO`). */
  onSoltar: (s: Soltar) => void
  onCrearEnGrupo?: (grupoId: string, titulo: string) => void
}) {
  const [plegadas, setPlegadas] = React.useState<Set<string>>(new Set())
  const conFilas = !(filas.length === 1 && filas[0].id === "todas")
  return (
    <ArrastreFilas onSoltar={onSoltar}>
      <div className="flex flex-col gap-4 p-3">
        {filas.map((f) => {
          const plegada = plegadas.has(f.id)
          const total = f.columnas.reduce((n, c) => n + c.filas.length, 0)
          return (
            <section key={f.id} className="grid gap-2">
              {conFilas && (
                <button
                  type="button"
                  onClick={() =>
                    setPlegadas((p) => {
                      const n = new Set(p)
                      if (n.has(f.id)) n.delete(f.id)
                      else n.add(f.id)
                      return n
                    })
                  }
                  aria-expanded={!plegada}
                  className="flex items-center gap-1.5 justify-self-start rounded-md px-1 text-sm font-medium hover:bg-muted"
                >
                  <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", plegada && "-rotate-90")} />
                  {f.label}
                  <span className="text-xs font-normal tabular-nums text-muted-foreground">{total}</span>
                </button>
              )}
              {!plegada && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {f.columnas.map((c) => {
                    const grupoId = conFilas ? `${f.id}${SEP_TABLERO}${c.id}` : c.id
                    return (
                      <Columna
                        key={grupoId}
                        grupo={c}
                        grupoId={grupoId}
                        cabecera={cabeceraGrupo(c)}
                        hoy={hoy}
                        ctx={ctx}
                        etiquetas={etiquetas}
                        propiedades={propiedades}
                        subtareasDe={subtareasDe}
                        activaId={activaId}
                        acciones={acciones}
                        onCrear={onCrearEnGrupo ? (titulo) => onCrearEnGrupo(grupoId, titulo) : undefined}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </ArrastreFilas>
  )
}
