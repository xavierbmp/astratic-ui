// La selección de celdas de la rejilla, como en una hoja de cálculo: una celda activa (el cursor)
// y un rango que va de un ancla al foco. Las coordenadas son posiciones entre los registros que se
// ven (sin las cabeceras de grupo) y entre las columnas visibles.

export type Celda = { fila: number; col: number }

/** El rango seleccionado: se empieza en el ancla y se extiende hasta el foco (Mayús + clic, arrastrar). */
export type Rango = { ancla: Celda; foco: Celda }

export type Limites = { filas: number; cols: number }

export type Caja = { f0: number; f1: number; c0: number; c1: number }

export function caja(r: Rango): Caja {
  return {
    f0: Math.min(r.ancla.fila, r.foco.fila),
    f1: Math.max(r.ancla.fila, r.foco.fila),
    c0: Math.min(r.ancla.col, r.foco.col),
    c1: Math.max(r.ancla.col, r.foco.col),
  }
}

export const enCaja = (c: Caja, celda: Celda) => celda.fila >= c.f0 && celda.fila <= c.f1 && celda.col >= c.c0 && celda.col <= c.c1

/** ¿Hay más de una celda? Con una sola, el rango es solo el cursor. */
export const esMultiple = (r: Rango) => r.ancla.fila !== r.foco.fila || r.ancla.col !== r.foco.col

export const unaCelda = (celda: Celda): Rango => ({ ancla: celda, foco: celda })

const limitar = (celda: Celda, l: Limites): Celda => ({
  fila: Math.max(0, Math.min(l.filas - 1, celda.fila)),
  col: Math.max(0, Math.min(l.cols - 1, celda.col)),
})

export type Direccion = "arriba" | "abajo" | "izquierda" | "derecha"

const PASO: Record<Direccion, Celda> = { arriba: { fila: -1, col: 0 }, abajo: { fila: 1, col: 0 }, izquierda: { fila: 0, col: -1 }, derecha: { fila: 0, col: 1 } }

/**
 * La celda a la que se va con una flecha. Con ⌘ (`hastaElBorde`) se salta al borde, como en una
 * hoja de cálculo.
 */
export function moverCelda(celda: Celda, dir: Direccion, l: Limites, hastaElBorde = false): Celda {
  const p = PASO[dir]
  if (hastaElBorde) {
    return limitar({ fila: p.fila === 0 ? celda.fila : p.fila < 0 ? 0 : l.filas - 1, col: p.col === 0 ? celda.col : p.col < 0 ? 0 : l.cols - 1 }, l)
  }
  return limitar({ fila: celda.fila + p.fila, col: celda.col + p.col }, l)
}

/** Flecha sola: mueve el cursor y deja una celda. Con Mayús: mueve el foco y el ancla se queda. */
export function moverSeleccion(r: Rango, dir: Direccion, l: Limites, opciones: { extender?: boolean; hastaElBorde?: boolean } = {}): Rango {
  if (opciones.extender) return { ancla: r.ancla, foco: moverCelda(r.foco, dir, l, opciones.hastaElBorde) }
  return unaCelda(moverCelda(r.foco, dir, l, opciones.hastaElBorde))
}

/** Tab y Mayús + Tab: a la derecha o a la izquierda, saltando de línea al llegar al borde. */
export function tabular(celda: Celda, atras: boolean, l: Limites): Celda {
  if (!atras) return celda.col < l.cols - 1 ? { ...celda, col: celda.col + 1 } : limitar({ fila: celda.fila + 1, col: 0 }, l)
  return celda.col > 0 ? { ...celda, col: celda.col - 1 } : limitar({ fila: celda.fila - 1, col: l.cols - 1 }, l)
}

/** Si las filas o las columnas cambian (filtro, columna oculta), la selección se queda dentro. */
export function ajustarRango(r: Rango, l: Limites): Rango | null {
  if (l.filas === 0 || l.cols === 0) return null
  return { ancla: limitar(r.ancla, l), foco: limitar(r.foco, l) }
}

/**
 * Las celdas que se rellenan al arrastrar el tirador de la esquina: se repite lo seleccionado hacia
 * abajo o hacia arriba hasta `hasta`, como el relleno de Excel (sin series: copia tal cual).
 */
export function celdasDeRelleno(sel: Caja, hasta: number): { fila: number; origen: number }[] {
  const alto = sel.f1 - sel.f0 + 1
  if (hasta > sel.f1) return Array.from({ length: hasta - sel.f1 }, (_, i) => ({ fila: sel.f1 + 1 + i, origen: sel.f0 + (i % alto) }))
  if (hasta < sel.f0) return Array.from({ length: sel.f0 - hasta }, (_, i) => ({ fila: sel.f0 - 1 - i, origen: sel.f1 - (i % alto) }))
  return []
}
