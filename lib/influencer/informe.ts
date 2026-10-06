// El informe de resultados: las cifras de cada pieza publicada sumadas y lo que valen para la marca
// (CPM, interacción, clics). Hoy se apuntan a mano con capturas; con la API de Instagram y TikTok
// entrarán solas con las mismas métricas.
import { LISTA_METRICAS, type Collab, type Metrica, type Resultado } from "@/lib/influencer/modelo"

/** El último resultado de cada pieza: si se midió dos veces, vale el más reciente. */
export function ultimosResultados(resultados: Resultado[]) {
  const porPieza = new Map<string, Resultado>()
  for (const r of [...resultados].sort((a, b) => a.medidoEl.localeCompare(b.medidoEl))) porPieza.set(r.piezaId, r)
  return Array.from(porPieza.values())
}

export function sumarMetricas(resultados: Resultado[]): Partial<Record<Metrica, number>> {
  const total: Partial<Record<Metrica, number>> = {}
  for (const r of ultimosResultados(resultados)) {
    for (const m of LISTA_METRICAS) {
      const v = r.metricas[m]
      if (v !== undefined) total[m] = (total[m] ?? 0) + v
    }
  }
  return total
}

export const interaccionesDe = (m: Partial<Record<Metrica, number>>) => (m.meGusta ?? 0) + (m.comentarios ?? 0) + (m.guardados ?? 0) + (m.compartidos ?? 0)

/** CPM, tasa de interacción y CTR de la collab. Sin la cifra necesaria, `null`. */
export function indicadores(collab: Collab, resultados: Resultado[]) {
  const m = sumarMetricas(resultados)
  const vistas = m.visualizaciones ?? 0
  const interacciones = interaccionesDe(m)
  return {
    metricas: m,
    interacciones,
    /** Euros por cada mil visualizaciones. */
    cpm: vistas > 0 ? (collab.importe / vistas) * 1000 : null,
    /** Interacciones sobre alcance (o visualizaciones si no hay alcance), en %. */
    tasaInteraccion: (m.alcance ?? vistas) > 0 ? (interacciones / (m.alcance ?? vistas)) * 100 : null,
    /** Clics sobre visualizaciones, en %. */
    ctr: vistas > 0 && m.clics !== undefined ? (m.clics / vistas) * 100 : null,
  }
}
