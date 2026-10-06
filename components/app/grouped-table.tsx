"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronDownIcon, GripVerticalIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrastreFilas, FinDeGrupo, GrupoArrastrable, useFilaArrastrable, type Soltar } from "@/components/app/arrastre-filas"
import type { GrupoFilas } from "@/lib/vistas/core"

export type ColumnaTabla<T> = {
  id: string
  header: string
  icon?: LucideIcon
  cell: (row: T) => React.ReactNode
  /** Ancho de partida en píxeles; se cambia arrastrando el borde de la cabecera. */
  width?: number
  minWidth?: number
  align?: "left" | "right" | "center"
  /** Opciones del menú de su cabecera (ordenar, agrupar por ella, ocultar…). */
  menu?: React.ReactNode
}

const ANCHO_POR_DEFECTO = 160
const ANCHO_MINIMO = 80
const ANCHO_PRINCIPAL = 320
// Asa de arrastre + casilla de selección.
const ANCHO_INICIO = 52
const sinArrastre = () => {}

/** La cabecera de un grupo, la misma en la tabla y en la lista: flecha para plegar, nombre, cuántas hay y «+». */
export function CabeceraGrupo({
  label,
  count,
  plegado,
  onPlegar,
  onNueva,
  className,
}: {
  label: React.ReactNode
  count: number
  plegado: boolean
  onPlegar: () => void
  onNueva?: () => void
  className?: string
}) {
  return (
    <div className={cn("group/cabecera flex items-center gap-1.5 py-1", className)}>
      <button type="button" onClick={onPlegar} aria-expanded={!plegado} className="flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-left text-sm font-medium hover:bg-muted">
        <ChevronDownIcon className={cn("size-4 flex-none text-muted-foreground transition-transform", plegado && "-rotate-90")} />
        <span className="min-w-0 truncate">{label}</span>
        <span className="text-xs font-normal tabular-nums text-muted-foreground">{count}</span>
      </button>
      {onNueva && (
        <Button variant="ghost" size="icon-sm" aria-label="Nueva en este grupo" className="size-6 text-muted-foreground opacity-0 group-hover/cabecera:opacity-100 focus-visible:opacity-100" onClick={onNueva}>
          <PlusIcon />
        </Button>
      )}
    </div>
  )
}

/**
 * La tabla de una base al estilo de Notion: agrupada (o no), con grupos plegables, columnas que se
 * ensanchan arrastrando su borde, la primera fija al desplazarse en horizontal, texto ajustado o
 * cortado, cálculos al pie, selección, fila abierta y filas que se arrastran entre grupos.
 */
export function TablaAgrupada<T>({
  grupos,
  columnas,
  getRowId,
  anchos,
  onAncho,
  congelar = true,
  ajustarTexto = false,
  plegados,
  onPlegar,
  cabeceraGrupo,
  onNuevaEnGrupo,
  seleccion,
  onSeleccion,
  activaId,
  onFila,
  pie,
  arrastre,
  filaClassName,
  vacio,
  className,
}: {
  grupos: GrupoFilas<T>[]
  columnas: ColumnaTabla<T>[]
  getRowId: (row: T) => string
  anchos?: Record<string, number>
  onAncho?: (id: string, ancho: number) => void
  /** La primera columna queda fija a la izquierda. */
  congelar?: boolean
  ajustarTexto?: boolean
  plegados: Set<string>
  onPlegar: (grupoId: string) => void
  cabeceraGrupo?: (g: GrupoFilas<T>) => React.ReactNode
  onNuevaEnGrupo?: (grupoId: string) => void
  seleccion: Set<string>
  onSeleccion: (s: Set<string>) => void
  activaId?: string | null
  onFila?: (row: T) => void
  /** El pie de una columna para unas filas (cálculos): se pinta bajo cada grupo y al final de todo. */
  pie?: (columnaId: string, filas: T[]) => React.ReactNode
  arrastre?: { onSoltar: (s: Soltar) => void; desactivado?: boolean }
  filaClassName?: (row: T) => string | undefined
  vacio?: React.ReactNode
  className?: string
}) {
  const [vivos, setVivos] = React.useState<Record<string, number>>({})
  const ancho = (c: ColumnaTabla<T>, i: number) => vivos[c.id] ?? anchos?.[c.id] ?? c.width ?? (i === 0 ? ANCHO_PRINCIPAL : ANCHO_POR_DEFECTO)
  const total = ANCHO_INICIO + columnas.reduce((a, c, i) => a + ancho(c, i), 0)
  const conCabeceras = !(grupos.length === 1 && grupos[0].id === "todas")
  const todas = grupos.flatMap((g) => g.filas)
  const idsVisibles = [...new Set(todas.map(getRowId))]
  const todasMarcadas = idsVisibles.length > 0 && idsVisibles.every((id) => seleccion.has(id))
  const algunas = !todasMarcadas && idsVisibles.some((id) => seleccion.has(id))

  const redimensionar = (c: ColumnaTabla<T>, i: number) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const inicioX = e.clientX
    const inicio = ancho(c, i)
    const min = c.minWidth ?? ANCHO_MINIMO
    let ultimo = inicio
    const mover = (ev: PointerEvent) => {
      ultimo = Math.max(min, Math.round(inicio + ev.clientX - inicioX))
      setVivos((v) => ({ ...v, [c.id]: ultimo }))
    }
    const soltar = () => {
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
      setVivos((v) => {
        const n = { ...v }
        delete n[c.id]
        return n
      })
      onAncho?.(c.id, ultimo)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }

  const fijas = (i: number) => (congelar && i === 0 ? "sticky z-[1] bg-card" : undefined)
  const filaPie = (filas: T[], clave: string) =>
    pie ? (
      <tr key={clave} className="border-b bg-card text-xs text-muted-foreground">
        <td className="sticky left-0 z-[1] bg-card" />
        {columnas.map((c, i) => (
          <td key={c.id} className={cn("px-2 py-1", fijas(i), c.align === "right" && "text-right")} style={i === 0 && congelar ? { left: ANCHO_INICIO } : undefined}>
            {pie(c.id, filas)}
          </td>
        ))}
      </tr>
    ) : null

  const tabla = (
    <table className="w-full border-separate border-spacing-0 text-[13.5px]" style={{ tableLayout: "fixed", minWidth: total }}>
      <colgroup>
        <col style={{ width: ANCHO_INICIO }} />
        {columnas.map((c, i) => (
          <col key={c.id} style={{ width: ancho(c, i) }} />
        ))}
      </colgroup>
      <thead className="sticky top-0 z-[2] bg-muted/60 backdrop-blur-sm">
        <tr>
          <th className="sticky left-0 z-[2] h-9 border-b bg-muted/60 pl-6 text-left">
            <Checkbox aria-label="Seleccionar todas" checked={todasMarcadas ? true : algunas ? "indeterminate" : false} onCheckedChange={() => onSeleccion(todasMarcadas ? new Set() : new Set(idsVisibles))} />
          </th>
          {columnas.map((c, i) => {
            const Icono = c.icon
            return (
              <th
                key={c.id}
                className={cn("group/th relative h-9 border-b px-2 text-left text-xs font-medium text-muted-foreground", congelar && i === 0 && "sticky z-[2] bg-muted/60", c.align === "right" && "text-right")}
                style={i === 0 && congelar ? { left: ANCHO_INICIO } : undefined}
              >
                {c.menu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn("inline-flex max-w-full items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted hover:text-foreground", c.align === "right" && "flex-row-reverse")}>
                      {Icono && <Icono className="size-3.5 flex-none" aria-hidden />}
                      <span className="truncate">{c.header}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">{c.menu}</DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-1">
                    {Icono && <Icono className="size-3.5" aria-hidden />}
                    {c.header}
                  </span>
                )}
                {onAncho && (
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Ancho de ${c.header}`}
                    onPointerDown={redimensionar(c, i)}
                    onDoubleClick={() => onAncho(c.id, c.width ?? (i === 0 ? ANCHO_PRINCIPAL : ANCHO_POR_DEFECTO))}
                    className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize opacity-0 transition-opacity group-hover/th:bg-border group-hover/th:opacity-100"
                  />
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      {grupos.map((g) => {
        const plegado = conCabeceras && plegados.has(g.id)
        return (
          <tbody key={g.id}>
            {conCabeceras && (
              <tr>
                <td colSpan={columnas.length + 1} className="border-b bg-card px-2">
                  <div className="sticky left-2 inline-flex">
                    <CabeceraGrupo label={cabeceraGrupo ? cabeceraGrupo(g) : g.label} count={g.filas.length} plegado={plegado} onPlegar={() => onPlegar(g.id)} onNueva={onNuevaEnGrupo ? () => onNuevaEnGrupo(g.id) : undefined} />
                  </div>
                </td>
              </tr>
            )}
            {!plegado && (
              <GrupoArrastrable grupoId={g.id} ids={g.filas.map(getRowId)}>
                {g.filas.map((row) => (
                  <FilaTabla
                    key={`${g.id}-${getRowId(row)}`}
                    row={row}
                    id={getRowId(row)}
                    grupoId={g.id}
                    columnas={columnas}
                    congelar={congelar}
                    ajustarTexto={ajustarTexto}
                    seleccionada={seleccion.has(getRowId(row))}
                    activa={activaId === getRowId(row)}
                    onMarcar={() => {
                      const n = new Set(seleccion)
                      const id = getRowId(row)
                      if (n.has(id)) n.delete(id)
                      else n.add(id)
                      onSeleccion(n)
                    }}
                    onFila={onFila}
                    arrastrable={!!arrastre && !arrastre.desactivado}
                    className={filaClassName?.(row)}
                  />
                ))}
              </GrupoArrastrable>
            )}
            {!plegado && arrastre && (
              <tr>
                <td colSpan={columnas.length + 1} className="p-0">
                  <FinDeGrupo grupoId={g.id} className="h-1.5 data-[over]:bg-brand/30" />
                </td>
              </tr>
            )}
            {!plegado && conCabeceras && g.filas.length > 0 && filaPie(g.filas, `pie-${g.id}`)}
          </tbody>
        )
      })}
      {(!conCabeceras || grupos.length > 1) && todas.length > 0 && <tfoot>{filaPie(todas, "pie-total")}</tfoot>}
    </table>
  )

  return (
    <div className={cn("relative w-full overflow-auto", className)}>
      {/* Siempre dentro del contexto de arrastre, aunque no se arrastre: las filas usan sus hooks. */}
      <ArrastreFilas onSoltar={arrastre?.onSoltar ?? sinArrastre}>{tabla}</ArrastreFilas>
      {todas.length === 0 && vacio}
    </div>
  )
}

function FilaTabla<T>({
  row,
  id,
  grupoId,
  columnas,
  congelar,
  ajustarTexto,
  seleccionada,
  activa,
  onMarcar,
  onFila,
  arrastrable,
  className,
}: {
  row: T
  id: string
  grupoId: string
  columnas: ColumnaTabla<T>[]
  congelar: boolean
  ajustarTexto: boolean
  seleccionada: boolean
  activa: boolean
  onMarcar: () => void
  onFila?: (row: T) => void
  arrastrable: boolean
  className?: string
}) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(id, grupoId, !arrastrable)
  const marcada = seleccionada || activa
  const fondo = marcada ? "bg-brand-soft" : "bg-card group-hover/fila:bg-muted/60"
  return (
    <tr
      ref={ref}
      style={style}
      data-state={seleccionada ? "selected" : undefined}
      aria-current={activa || undefined}
      onClick={onFila ? () => onFila(row) : undefined}
      className={cn("group/fila", onFila && "cursor-pointer", arrastrando && "opacity-70 shadow-pop", className)}
    >
      <td className={cn("sticky left-0 z-[1] border-b py-1.5 pr-1 pl-1", fondo, marcada && "shadow-[inset_2px_0_0_var(--brand)]")} onClick={(e) => e.stopPropagation()}>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Arrastrar"
            className={cn("cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover/fila:opacity-100 focus-visible:opacity-100", !arrastrable && "invisible")}
            {...asa}
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <Checkbox aria-label="Seleccionar fila" checked={seleccionada} onCheckedChange={onMarcar} className={cn(!seleccionada && "opacity-0 group-hover/fila:opacity-100 focus-visible:opacity-100")} />
        </span>
      </td>
      {columnas.map((c, i) => (
        <td
          key={c.id}
          className={cn(
            "border-b px-2 py-1.5 align-middle",
            fondo,
            congelar && i === 0 && "sticky z-[1]",
            ajustarTexto ? "break-words whitespace-normal" : "overflow-hidden text-ellipsis whitespace-nowrap",
            c.align === "right" && "text-right tabular-nums",
            c.align === "center" && "text-center",
          )}
          style={i === 0 && congelar ? { left: ANCHO_INICIO } : undefined}
        >
          {c.cell(row)}
        </td>
      ))}
    </tr>
  )
}
