// Las medidas de la rejilla, sacadas de Airtable (bóveda: Portal-Astratic-Base-de-datos §5).

import type { DefCampo } from "@/lib/base/campos"

/** La columna de la izquierda: número de fila, casilla y expandir. */
export const ANCHO_IZQUIERDA = 84
/** La columna del «+» para crear un campo. */
export const ANCHO_ANADIR = 92
export const ALTO_PIE = 34
export const ALTO_SUBGRUPO = 32

/** Una columna ya colocada: su campo, su ancho y dónde empieza (contando la columna de la izquierda). */
export type Columna<T> = { campo: DefCampo<T>; ancho: number; x: number; fija: boolean }

export function colocarColumnas<T>(columnas: { campo: DefCampo<T>; ancho: number }[], congelar: number): Columna<T>[] {
  let x = ANCHO_IZQUIERDA
  return columnas.map((c, i) => {
    const col = { ...c, x, fija: i < congelar }
    x += c.ancho
    return col
  })
}

/** El ancho de toda la rejilla: hasta el final de la última columna, más la del «+». */
export function anchoTotal<T>(columnas: Columna<T>[]): number {
  const ultima = columnas[columnas.length - 1]
  return (ultima ? ultima.x + ultima.ancho : ANCHO_IZQUIERDA) + ANCHO_ANADIR
}
