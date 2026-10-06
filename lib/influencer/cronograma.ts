// El cronograma de una collab: las fases de cada pieza como tramos entre sus hitos, para el Gantt.
// Pura: sale de la fecha de publicación de cada pieza, como las tareas automáticas.
import type { Pieza } from "@/lib/influencer/modelo"
import { hitosDePieza, type TipoHito } from "@/lib/influencer/collabs"
import { diasEntre, sumarDias } from "@/lib/influencer/fechas"

/** Días que se dan para escribir el guion antes de su entrega. */
const DIAS_ESCRIBIR = 4

export type TipoFase = "guion" | "grabacion" | "edicion" | "revision" | "resultados"

export const FASES: Record<TipoFase, string> = {
  guion: "Guion",
  grabacion: "Grabación",
  edicion: "Edición",
  revision: "Revisión",
  resultados: "Resultados",
}

export type Fase = { tipo: TipoFase; label: string; desde: string; hasta: string; hecha: boolean }

/** Qué fase acaba en cada hito: el guion se entrega, se graba, se edita hasta la v1 y se revisa hasta publicar. */
const FASE_QUE_CIERRA: Partial<Record<TipoHito, TipoFase>> = {
  guion: "guion",
  grabacion: "grabacion",
  v1: "edicion",
  publicacion: "revision",
  resultados: "resultados",
}

/**
 * Las fases de una pieza, cada una del hito anterior al suyo. La primera empieza unos días antes de
 * su entrega. Las fotos se hacen en la fase de grabación; una pieza de texto solo tiene guion,
 * revisión y resultados.
 */
export function fasesDePieza(p: Pieza): Fase[] {
  const hitos = hitosDePieza(p)
  return hitos.flatMap((h, i) => {
    const tipo = FASE_QUE_CIERRA[h.tipo]
    if (!tipo) return []
    const desde = i === 0 ? sumarDias(h.fecha, -DIAS_ESCRIBIR) : hitos[i - 1].fecha
    const label = tipo === "grabacion" && p.tipo !== "video" ? "Fotos" : tipo === "guion" && p.tipo === "texto" ? "Texto" : FASES[tipo]
    return [{ tipo, label, desde, hasta: h.fecha, hecha: h.hecho }]
  })
}

/** De qué día a qué día se pinta un cronograma: todas las fechas con un margen, y siempre con hoy dentro. */
export function rangoDeFechas(fechas: string[], hoy: string, margen = 3) {
  const todas = [...fechas, hoy].sort()
  const desde = sumarDias(todas[0], -margen)
  const hasta = sumarDias(todas[todas.length - 1], margen)
  return { desde, hasta, dias: diasEntre(desde, hasta) + 1 }
}

/** Mueve la publicación (y con ella todas sus fases) unos días. */
export function moverPieza(p: Pieza, dias: number): Pieza {
  return { ...p, publicacion: sumarDias(p.publicacion, dias) }
}
