"use client"

import * as React from "react"
import { CalendarIcon, ChevronRightIcon, CopyIcon, EllipsisIcon, GripVerticalIcon, PlusIcon, StickyNoteIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import type { EtiquetaTarea, Tarea } from "@/lib/influencer/modelo"
import { estaCerrada, type ContextoTareas } from "@/lib/influencer/tareas"
import { sumarDias } from "@/lib/influencer/fechas"
import type { GrupoFilas } from "@/lib/vistas/core"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrastreFilas, FinDeGrupo, GrupoArrastrable, useFilaArrastrable, type Soltar } from "@/components/app/arrastre-filas"
import { CabeceraGrupo } from "@/components/app/grouped-table"
import { CasillaTarea, DondeChip, EsperandoDias, EstadoTareaBadge, EtiquetasTarea, FechaTarea, PrioridadBandera, ProgresoSubtareas, RepiteIcono } from "@/components/influencer/task-cells"

/** Propiedades que la lista enseña a la derecha de cada tarea, en este orden si se eligen. */
export type PropiedadFila = "donde" | "estado" | "prioridad" | "fecha" | "fechaLimite" | "etiquetas" | "repite" | "subtareas"

export type AccionesTarea = {
  onAbrir: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onDuplicar?: (t: Tarea) => void
  onBorrar?: (t: Tarea) => void
  onMoverDia?: (t: Tarea, dia: string) => void
}

/**
 * Una tarea en una lista: el círculo para hacerla, el título y, a la derecha, las propiedades que
 * elige la vista. Se pulsa para abrir su ficha; se arrastra por el asa.
 */
export function FilaTarea({
  tarea,
  grupoId,
  hoy,
  ctx,
  etiquetas,
  propiedades,
  subtareas,
  profundidad = 0,
  seleccionada,
  onMarcar,
  activa,
  arrastrable,
  acciones,
}: {
  tarea: Tarea
  grupoId: string
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  propiedades: string[]
  subtareas?: { hechas: number; total: number; abiertas: boolean; onAlternar: () => void }
  profundidad?: number
  seleccionada: boolean
  onMarcar: () => void
  activa: boolean
  arrastrable: boolean
  acciones: AccionesTarea
}) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(tarea.id, grupoId, !arrastrable)
  const cerrada = estaCerrada(tarea)
  const ver = (p: PropiedadFila) => propiedades.includes(p)
  return (
    <li
      ref={ref}
      style={style}
      data-state={seleccionada ? "selected" : undefined}
      aria-current={activa || undefined}
      onClick={() => acciones.onAbrir(tarea)}
      className={cn(
        "group/tarea flex cursor-pointer items-center gap-2 py-1.5 pr-2 transition-colors hover:bg-muted/60",
        (seleccionada || activa) && "bg-brand-soft shadow-[inset_2px_0_0_var(--brand)] hover:bg-brand-soft",
        arrastrando && "bg-card opacity-80 shadow-pop",
      )}
    >
      <span className="flex flex-none items-center gap-0.5 pl-1" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Arrastrar" className={cn("cursor-grab text-muted-foreground opacity-0 group-hover/tarea:opacity-100 focus-visible:opacity-100", !arrastrable && "invisible")} {...asa}>
          <GripVerticalIcon className="size-4" />
        </button>
        <Checkbox aria-label={`Seleccionar ${tarea.titulo}`} checked={seleccionada} onCheckedChange={onMarcar} className={cn(!seleccionada && "opacity-0 group-hover/tarea:opacity-100 focus-visible:opacity-100")} />
      </span>
      <span className="flex flex-none items-center" style={{ paddingLeft: profundidad * 20 }}>
        {subtareas && subtareas.total > 0 ? (
          <button
            type="button"
            aria-label={subtareas.abiertas ? "Ocultar subtareas" : "Ver subtareas"}
            aria-expanded={subtareas.abiertas}
            onClick={(e) => {
              e.stopPropagation()
              subtareas.onAlternar()
            }}
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <ChevronRightIcon className={cn("size-3.5 transition-transform", subtareas.abiertas && "rotate-90")} />
          </button>
        ) : (
          <span className="size-5" aria-hidden />
        )}
      </span>
      <CasillaTarea tarea={tarea} onToggle={() => acciones.onToggle(tarea)} />
      <span className={cn("min-w-0 flex-1 truncate text-sm", cerrada && "text-muted-foreground line-through")}>
        {tarea.titulo}
        {tarea.notas && <StickyNoteIcon className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Con notas" />}
      </span>
      <span className="flex min-w-0 flex-none items-center gap-3">
        {ver("subtareas") && subtareas && <ProgresoSubtareas hechas={subtareas.hechas} total={subtareas.total} />}
        {ver("etiquetas") && <span className="hidden lg:inline-flex"><EtiquetasTarea ids={tarea.etiquetas} etiquetas={etiquetas} max={2} /></span>}
        {ver("estado") ? <EstadoTareaBadge tarea={tarea} hoy={hoy} /> : <EsperandoDias tarea={tarea} hoy={hoy} />}
        {ver("repite") && <RepiteIcono repetir={tarea.repetir} />}
        {ver("prioridad") && <PrioridadBandera prioridad={tarea.prioridad} soloSiImporta />}
        {ver("donde") && <DondeChip donde={tarea.donde} ctx={ctx} className="hidden max-w-56 md:inline-flex" />}
        {ver("fecha") && <FechaTarea tarea={tarea} hoy={hoy} />}
        {ver("fechaLimite") && tarea.fechaLimite && <FechaTarea tarea={tarea} hoy={hoy} campo="fechaLimite" />}
      </span>
      <span onClick={(e) => e.stopPropagation()}>
        <MenuTarea tarea={tarea} hoy={hoy} acciones={acciones} />
      </span>
    </li>
  )
}

/** El «…» de una tarea: abrir, duplicar, pasarla a hoy o a mañana y eliminar. */
export function MenuTarea({ tarea, hoy, acciones }: { tarea: Tarea; hoy: string; acciones: AccionesTarea }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Más acciones de ${tarea.titulo}`} className="opacity-0 group-hover/tarea:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => acciones.onAbrir(tarea)}>Abrir</DropdownMenuItem>
        {acciones.onMoverDia && (
          <>
            <DropdownMenuItem onSelect={() => acciones.onMoverDia?.(tarea, hoy.slice(0, 10))}>
              <CalendarIcon /> Para hoy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => acciones.onMoverDia?.(tarea, sumarDias(hoy, 1))}>
              <CalendarIcon /> Para mañana
            </DropdownMenuItem>
          </>
        )}
        {acciones.onDuplicar && (
          <DropdownMenuItem onSelect={() => acciones.onDuplicar?.(tarea)}>
            <CopyIcon /> Duplicar
          </DropdownMenuItem>
        )}
        {acciones.onBorrar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => acciones.onBorrar?.(tarea)}>
              <Trash2Icon /> Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Escribir el título y Enter: la tarea nace en ese grupo, con su valor. Escape cierra. */
function AltaRapida({ placeholder, onCrear, onCerrar, autoFocus }: { placeholder: string; onCrear: (titulo: string) => void; onCerrar?: () => void; autoFocus?: boolean }) {
  const [texto, setTexto] = React.useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!texto.trim()) return
        onCrear(texto.trim())
        setTexto("")
      }}
      className="flex items-center gap-2 py-1 pr-2 pl-[52px]"
    >
      <PlusIcon className="size-4 flex-none text-muted-foreground" />
      <Input
        value={texto}
        autoFocus={autoFocus}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCerrar?.()}
        onBlur={() => !texto.trim() && onCerrar?.()}
        placeholder={placeholder}
        className="h-8 border-transparent bg-transparent shadow-none focus-visible:border-input"
      />
    </form>
  )
}

/**
 * La lista de una base de tareas al estilo de Notion: grupos plegables con su número y su «+»,
 * subtareas debajo de su tarea (o sueltas, según la vista), selección, la tarea abierta marcada y
 * arrastrar para colocar a mano o mover a otro grupo (lo que le cambia el valor).
 */
export function TareasLista({
  grupos,
  hijas,
  modoSubtareas = "anidadas",
  hoy,
  ctx,
  etiquetas,
  propiedades,
  plegados,
  onPlegar,
  cabeceraGrupo,
  seleccion,
  onSeleccion,
  activaId,
  acciones,
  onCrearEnGrupo,
  onSoltar,
  arrastreDesactivado,
  altaFinal,
  vacio,
}: {
  grupos: GrupoFilas<Tarea>[]
  /** Subtareas de cada tarea, ya filtradas y ordenadas. */
  hijas: Map<string, Tarea[]>
  modoSubtareas?: "anidadas" | "planas" | "principales"
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  propiedades: string[]
  plegados: Set<string>
  onPlegar: (grupoId: string) => void
  cabeceraGrupo?: (g: GrupoFilas<Tarea>) => React.ReactNode
  seleccion: Set<string>
  onSeleccion: (s: Set<string>) => void
  activaId?: string | null
  acciones: AccionesTarea
  /** Alta rápida dentro de un grupo: la tarea hereda su valor. */
  onCrearEnGrupo?: (grupoId: string, titulo: string) => void
  onSoltar?: (s: Soltar) => void
  arrastreDesactivado?: boolean
  /** Alta rápida al final de la lista (sin grupos o en el último). */
  altaFinal?: { placeholder: string; onCrear: (titulo: string) => void }
  vacio?: React.ReactNode
}) {
  const [abiertas, setAbiertas] = React.useState<Set<string>>(new Set())
  const [creandoEn, setCreandoEn] = React.useState<string | null>(null)
  const conCabeceras = !(grupos.length === 1 && grupos[0].id === "todas")
  const total = grupos.reduce((n, g) => n + g.filas.length, 0)
  const marcar = (id: string) => {
    const n = new Set(seleccion)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    onSeleccion(n)
  }
  const alternar = (id: string) =>
    setAbiertas((a) => {
      const n = new Set(a)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const fila = (t: Tarea, grupoId: string, profundidad: number): React.ReactNode => {
    const susHijas = modoSubtareas === "anidadas" ? (hijas.get(t.id) ?? []) : []
    const abierta = abiertas.has(t.id)
    const todasHijas = hijas.get(t.id) ?? []
    return (
      <React.Fragment key={`${grupoId}-${t.id}`}>
        <FilaTarea
          tarea={t}
          grupoId={grupoId}
          hoy={hoy}
          ctx={ctx}
          etiquetas={etiquetas}
          propiedades={propiedades}
          subtareas={modoSubtareas === "anidadas" ? { hechas: todasHijas.filter(estaCerrada).length, total: todasHijas.length, abiertas: abierta, onAlternar: () => alternar(t.id) } : { hechas: todasHijas.filter(estaCerrada).length, total: todasHijas.length, abiertas: false, onAlternar: () => {} }}
          profundidad={profundidad}
          seleccionada={seleccion.has(t.id)}
          onMarcar={() => marcar(t.id)}
          activa={activaId === t.id}
          arrastrable={!!onSoltar && !arrastreDesactivado && profundidad === 0}
          acciones={acciones}
        />
        {abierta && susHijas.map((h) => fila(h, grupoId, profundidad + 1))}
      </React.Fragment>
    )
  }

  if (total === 0 && !onCrearEnGrupo && vacio) return <>{vacio}</>

  return (
    <ArrastreFilas onSoltar={onSoltar ?? (() => {})}>
      <div className="flex flex-col">
        {grupos.map((g) => {
          const plegado = conCabeceras && plegados.has(g.id)
          return (
            <section key={g.id} className={cn(conCabeceras && "border-b last:border-b-0")}>
              {conCabeceras && (
                <div className="px-2">
                  <CabeceraGrupo label={cabeceraGrupo ? cabeceraGrupo(g) : g.label} count={g.filas.length} plegado={plegado} onPlegar={() => onPlegar(g.id)} onNueva={onCrearEnGrupo ? () => setCreandoEn(g.id) : undefined} />
                </div>
              )}
              {!plegado && (
                <>
                  <GrupoArrastrable grupoId={g.id} ids={g.filas.map((t) => t.id)}>
                    <ul className="divide-y divide-border/50">{g.filas.map((t) => fila(t, g.id, 0))}</ul>
                  </GrupoArrastrable>
                  <FinDeGrupo grupoId={g.id} className={cn("min-h-1.5 data-[over]:bg-brand/20", g.filas.length === 0 && "min-h-8")}>
                    {creandoEn === g.id && onCrearEnGrupo && <AltaRapida autoFocus placeholder={`Nueva en «${g.label}»… (Enter)`} onCrear={(titulo) => onCrearEnGrupo(g.id, titulo)} onCerrar={() => setCreandoEn(null)} />}
                  </FinDeGrupo>
                </>
              )}
            </section>
          )
        })}
        {total === 0 && vacio}
        {altaFinal && <AltaRapida placeholder={altaFinal.placeholder} onCrear={altaFinal.onCrear} />}
      </div>
    </ArrastreFilas>
  )
}
