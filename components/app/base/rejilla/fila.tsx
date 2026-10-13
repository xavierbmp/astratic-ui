"use client"

// Un registro de la rejilla: la columna de la izquierda y una celda por campo, con su selección,
// su editor y el velo de las columnas que filtran u ordenan.

import * as React from "react"
import { toast } from "sonner"
import { cn } from "cn"
import type { DefCampo, OpcionCampo, ValorCampo } from "@/lib/base/campos"
import { enCaja, type caja, type Celda } from "@/lib/base/seleccion"
import type { ColoresRegistro, VistaBase } from "@/lib/base/vistas"
import { CeldaIzquierda, FONDO, VeloColor } from "@/components/app/base/rejilla/lineas"
import { EditorCelda, type Salida } from "@/components/app/base/rejilla/editor-celda"
import { ValorCelda } from "@/components/app/base/rejilla/valor-celda"
import type { Columna } from "@/components/app/base/rejilla/medidas"

const TINTE_COLUMNA = "bg-brand-soft opacity-60"

/**
 * Las columnas por las que se filtra o se ordena llevan un velo del color de la marca: se ve de un
 * vistazo qué está mandando en la vista.
 */
export function tintesDeColumnas(vista: VistaBase): Map<string, string> {
  const tintes = new Map<string, string>()
  const recorrer = (g: VistaBase["filtro"]) => {
    g.condiciones.forEach((c) => tintes.set(c.campo, TINTE_COLUMNA))
    g.grupos?.forEach(recorrer)
  }
  vista.orden.forEach((o) => tintes.set(o.campo, TINTE_COLUMNA))
  recorrer(vista.filtro)
  return tintes
}

export type PropsFila<T> = {
  estilo: React.CSSProperties
  fila: T
  indice: number
  numero: number
  columnas: Columna<T>[]
  congelar: number
  altura: VistaBase["altura"]
  colores?: ColoresRegistro
  marcada: boolean
  abierta: boolean
  sel: ReturnType<typeof caja> | null
  cursor: Celda | null
  rellenoHasta: number | null
  editando: { celda: Celda; inicial?: string } | null
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  tintes: Map<string, string>
  editable: boolean
  onMarcar: (m: boolean) => void
  onExpandir: () => void
  onCambiar: (campo: DefCampo<T>, valor: ValorCampo) => void
  onGuardar: (valor: ValorCampo, salida: Salida) => void
  onCancelar: () => void
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
  onAbrirVinculo?: (campoId: string, id: string) => void
}

/** Un registro: la columna de la izquierda y una celda por campo, con su selección y su editor. */
export function FilaRegistro<T>(f: PropsFila<T>) {
  const alta = f.altura !== "corta"
  return (
    <div style={f.estilo} className="group/fila flex">
      <CeldaIzquierda indice={f.indice} numero={f.numero} color={f.colores?.marca} fondo={f.colores?.fondo} alta={alta} marcada={f.marcada} abierta={f.abierta} onMarcar={f.onMarcar} onExpandir={f.onExpandir} />
      {f.columnas.map((c, ci) => (
        <CeldaRegistro key={c.campo.id} {...f} columna={c} col={ci} alta={alta} />
      ))}
    </div>
  )
}

function CeldaRegistro<T>({ columna: c, col, alta, ...f }: PropsFila<T> & { columna: Columna<T>; col: number; alta: boolean }) {
  const celda = { fila: f.indice, col }
  const enSeleccion = !!f.sel && enCaja(f.sel, celda)
  const activa = f.cursor?.fila === f.indice && f.cursor.col === col
  const esquina = !!f.sel && f.sel.f1 === f.indice && f.sel.c1 === col && f.rellenoHasta === null
  const enRelleno = f.rellenoHasta !== null && !!f.sel && col >= f.sel.c0 && col <= f.sel.c1 && ((f.indice > f.sel.f1 && f.indice <= f.rellenoHasta) || (f.indice < f.sel.f0 && f.indice >= f.rellenoHasta))
  const editandoAqui = f.editando?.celda.col === col
  const valor = c.campo.valor(f.fila)
  const aMedida = f.celdas?.[c.campo.id]
  const ultimaFija = c.fija && col === f.congelar - 1
  // Lo marcado o abierto manda sobre el color; si no, la regla de la celda y, si no hay, la de la fila.
  const colorCelda = f.marcada || f.abierta ? undefined : f.colores?.celdas.get(c.campo.id)
  const colorFila = f.marcada || f.abierta || colorCelda ? undefined : f.colores?.fondo
  return (
    <div
      data-celda
      data-fila={f.indice}
      data-col={col}
      role="gridcell"
      aria-selected={enSeleccion}
      className={cn(
        "relative flex flex-none overflow-hidden border-r border-b px-1.5 text-[13px] leading-[18px]",
        alta ? "items-start py-1.5" : "items-center",
        f.marcada || f.abierta ? FONDO.marcada : FONDO.normal,
        c.fija && "sticky z-[5]",
        ultimaFija && "border-r-2 border-r-control",
        (activa || editandoAqui) && "z-[7] overflow-visible",
      )}
      style={{ width: c.ancho, left: c.fija ? c.x : undefined }}
    >
      {colorCelda && <VeloColor color={colorCelda} />}
      {colorFila && <VeloColor color={colorFila} fila />}
      {f.tintes.has(c.campo.id) && <span aria-hidden className={cn("pointer-events-none absolute inset-0", f.tintes.get(c.campo.id))} />}
      {(enSeleccion || enRelleno) && <span aria-hidden className={cn("pointer-events-none absolute inset-0 bg-brand-soft", enRelleno && "border border-dashed border-brand")} />}
      {activa && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2px] ring-2 ring-brand ring-inset" />}
      {editandoAqui && f.editando ? (
        <>
          <span className="relative min-w-0 flex-1 opacity-0">{aMedida ? aMedida(f.fila) : <ValorCelda campo={c.campo} valor={valor} altura={f.altura} editable={false} onCambiar={() => undefined} />}</span>
          <EditorCelda
            campo={c.campo}
            valor={valor}
            inicial={f.editando.inicial}
            onGuardar={f.onGuardar}
            onAplicar={(v) => f.onCambiar(c.campo, v)}
            onCancelar={f.onCancelar}
            onCrearOpcion={c.campo.propio && f.onCrearOpcion ? (label) => f.onCrearOpcion?.(c.campo.id, label) ?? null : undefined}
            error={(m) => toast.error(m)}
          />
        </>
      ) : (
        <span className="relative flex min-w-0 flex-1">{aMedida ? aMedida(f.fila) : <ValorCelda campo={c.campo} valor={valor} altura={f.altura} editable={f.editable && !c.campo.soloLectura} onCambiar={(v) => f.onCambiar(c.campo, v)} onAbrirVinculo={f.onAbrirVinculo ? (id) => f.onAbrirVinculo?.(c.campo.id, id) : undefined} />}</span>
      )}
      {esquina && f.editable && !f.editando && <span data-relleno aria-label="Arrastra para rellenar" className="absolute -right-[3px] -bottom-[3px] z-10 size-[7px] cursor-crosshair rounded-[1px] border border-card bg-brand" />}
    </div>
  )
}
