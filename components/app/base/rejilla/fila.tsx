"use client"

// Un registro de la rejilla: la columna de la izquierda y una celda por campo, con su selección,
// su editor y el velo de las columnas que filtran u ordenan.

import * as React from "react"
import { toast } from "sonner"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"
import type { DefCampo, OpcionCampo, ValorCampo } from "@/lib/base/campos"
import { enCaja, type caja, type Celda } from "@/lib/base/seleccion"
import type { ColoresRegistro, VistaBase } from "@/lib/base/vistas"
import { CeldaInicio } from "@/components/app/base/celda-inicio"
import { CeldaIzquierda, FONDO, RAYA_FILA, VeloColor } from "@/components/app/base/rejilla/lineas"
import { EditorCelda, type Salida } from "@/components/app/base/rejilla/editor-celda"
import { ValorCelda } from "@/components/app/base/rejilla/valor-celda"
import type { Columna } from "@/components/app/base/rejilla/medidas"

/** Los campos que se eligen de una lista: al pasar el ratón enseñan su flecha, porque un clic abre sus opciones. */
const CON_LISTA = new Set(["select", "multiselect", "vinculo"])

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
  editable: boolean
  onMarcar: (m: boolean) => void
  onExpandir: () => void
  onCambiar: (campo: DefCampo<T>, valor: ValorCampo) => void
  onGuardar: (valor: ValorCampo, salida: Salida) => void
  onCancelar: () => void
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
  onAbrirVinculo?: (campoId: string, id: string) => void
}

/**
 * Un registro: la columna de la izquierda y una celda por campo, con su selección y su editor. Entre filas, una sola raya
 * fina y ninguna entre columnas; al pasar el ratón la fila entera se levanta sobre las demás, redondeada y con su sombra.
 */
export function FilaRegistro<T>(f: PropsFila<T>) {
  const alta = f.altura !== "corta"
  return (
    <div style={f.estilo} className="group/fila flex hover:z-[8] hover:rounded-[10px] hover:shadow-fila">
      <CeldaIzquierda indice={f.indice} numero={f.numero} color={f.colores?.marca} fondo={f.colores?.fondo} alta={alta} marcada={f.marcada} abierta={f.abierta} onMarcar={f.onMarcar} />
      {f.columnas.map((c, ci) => (
        <CeldaRegistro key={c.campo.id} {...f} columna={c} col={ci} alta={alta} />
      ))}
      <div className={cn("min-w-0 flex-1 group-hover/fila:rounded-r-[10px]", RAYA_FILA, f.marcada || f.abierta ? FONDO.marcada : FONDO.normal)} />
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
  const seEdita = f.editable && !c.campo.soloLectura && !c.campo.principal
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
        "group/celda relative flex flex-none overflow-hidden px-2.5 text-[13px] leading-[18px]",
        RAYA_FILA,
        alta ? "items-start py-2" : "items-center",
        f.marcada || f.abierta ? FONDO.marcada : FONDO.normal,
        c.fija && "sticky z-[5]",
        ultimaFija && "group-data-[desplazada=true]/rejilla:shadow-[8px_0_10px_-8px_oklch(0_0_0/0.14)]",
        (activa || editandoAqui) && "z-[7] overflow-visible",
        seEdita && !aMedida && "cursor-text",
      )}
      style={{ width: c.ancho, left: c.fija ? c.x : undefined }}
    >
      {colorCelda && <VeloColor color={colorCelda} />}
      {colorFila && <VeloColor color={colorFila} fila />}
      {(enSeleccion || enRelleno) && <span aria-hidden className={cn("pointer-events-none absolute inset-0 bg-brand-soft", enRelleno && "border border-dashed border-brand")} />}
      {activa && <span aria-hidden className="pointer-events-none absolute inset-0.5 rounded-md ring-[1.5px] ring-brand" />}
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
        <span className="relative flex min-w-0 flex-1">
          {c.campo.inicio ? (
            <CeldaInicio inicio={c.campo.inicio(f.fila)} onAbrir={f.onExpandir} />
          ) : c.campo.principal ? (
            <button type="button" data-abre-registro onClick={f.onExpandir} className="min-w-0 cursor-pointer truncate text-left font-medium hover:underline hover:underline-offset-2">
              {aMedida ? aMedida(f.fila) : String(valor ?? "") || "Sin nombre"}
            </button>
          ) : aMedida ? (
            aMedida(f.fila)
          ) : (
            <ValorCelda campo={c.campo} valor={valor} altura={f.altura} editable={seEdita} onCambiar={(v) => f.onCambiar(c.campo, v)} onAbrirVinculo={f.onAbrirVinculo ? (id) => f.onAbrirVinculo?.(c.campo.id, id) : undefined} />
          )}
        </span>
      )}
      {seEdita && CON_LISTA.has(c.campo.tipo) && !editandoAqui && <ChevronDownIcon aria-hidden className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 rounded-sm bg-card text-muted-foreground opacity-0 group-hover/celda:opacity-100" />}
      {esquina && f.editable && !f.editando && <span data-relleno aria-label="Arrastra para rellenar" className="absolute -right-[3px] -bottom-[3px] z-10 size-[7px] cursor-crosshair rounded-[1px] border border-card bg-brand" />}
    </div>
  )
}
