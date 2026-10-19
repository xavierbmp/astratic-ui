// El informe de resultados: las cifras de cada pieza publicada sumadas y lo que valen para la marca
// (CPM, interacción, clics). Hoy se apuntan a mano con capturas; con la API de Instagram y TikTok
// entrarán solas con las mismas métricas.
import { LISTA_METRICAS, type Collab, type Metrica, type Pieza, type Resultado } from "@/lib/influencer/modelo"

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

// ───────────────────────── Resultados de todas las collabs ─────────────────────────

/** Lo que se mira en Collabs › Resultados: todas, las de una marca o una collab, y solo un tipo de pieza. */
export type FiltroResultados = { marcaId?: string; collabId?: string; tipo?: Pieza["tipo"] }

/** Una pieza publicada con su último resultado y lo que costó a la marca (su importe o su parte de la collab). */
export type FilaResultado = { pieza: Pieza; collab: Collab; resultado: Resultado | null; coste: number; metricas: Partial<Record<Metrica, number>>; interacciones: number }

const costeDe = (p: Pieza, c: Collab) => p.importe ?? (c.piezas.length ? c.importe / c.piezas.length : 0)

/**
 * Los resultados de varias collabs juntas (Xavier, 2026-10-17, reporte cmvcq0lc: «una collab, o todas las de una marca,
 * filtrando por tipo de contenido»): una fila por pieza publicada, los totales con su CPM (el coste de esas piezas sobre
 * sus visualizaciones), su interacción y su CTR, y lo de cada collab para compararlas.
 */
export function resultadosGenerales(collabs: Collab[], resultados: Resultado[], f: FiltroResultados) {
  const ultimos = new Map(ultimosResultados(resultados).map((r) => [r.piezaId, r]))
  const filas: FilaResultado[] = collabs
    .filter((c) => c.estado !== "cancelada" && (!f.marcaId || c.marcaId === f.marcaId) && (!f.collabId || c.id === f.collabId))
    .flatMap((c) =>
      c.piezas
        .filter((p) => p.publicada && (!f.tipo || p.tipo === f.tipo))
        .map((p) => {
          const resultado = ultimos.get(p.id) ?? null
          const metricas = resultado?.metricas ?? {}
          return { pieza: p, collab: c, resultado, coste: costeDe(p, c), metricas, interacciones: interaccionesDe(metricas) }
        }),
    )
    .sort((a, b) => (b.pieza.publicada?.fecha ?? "").localeCompare(a.pieza.publicada?.fecha ?? ""))
  const medidas = filas.filter((x) => x.resultado)
  const metricas = sumarMetricas(medidas.flatMap((x) => (x.resultado ? [x.resultado] : [])))
  const vistas = metricas.visualizaciones ?? 0
  const costeMedido = medidas.filter((x) => (x.metricas.visualizaciones ?? 0) > 0).reduce((a, x) => a + x.coste, 0)
  const interacciones = interaccionesDe(metricas)
  const base = metricas.alcance ?? vistas
  const porCollab = [...new Set(filas.map((x) => x.collab.id))].map((id) => {
    const del = filas.filter((x) => x.collab.id === id)
    return { collab: del[0].collab, piezas: del.length, visualizaciones: del.reduce((a, x) => a + (x.metricas.visualizaciones ?? 0), 0), interacciones: del.reduce((a, x) => a + x.interacciones, 0) }
  })
  return {
    filas,
    porCollab: porCollab.sort((a, b) => b.visualizaciones - a.visualizaciones),
    totales: {
      publicadas: filas.length,
      medidas: medidas.length,
      metricas,
      interacciones,
      cpm: vistas > 0 ? (costeMedido / vistas) * 1000 : null,
      tasaInteraccion: base > 0 ? (interacciones / base) * 100 : null,
      ctr: vistas > 0 && metricas.clics !== undefined ? (metricas.clics / vistas) * 100 : null,
    },
  }
}
