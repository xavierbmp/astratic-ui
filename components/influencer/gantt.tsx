"use client"

import type * as React from "react"
import { Gantt as GanttBase, type PropsGantt } from "@/components/app/gantt"
import { FASES, type Fase, type TipoFase } from "@/lib/influencer/cronograma"
import { tintClass, type Tint } from "@/lib/influencer/tints"

/** Cada fase con su tinte: colorean por tipo de trabajo, nunca por estado. */
const TINTE_FASE: Record<TipoFase, Tint> = { guion: "lavender", grabacion: "peach", edicion: "sky", revision: "mint", resultados: "lime" }

const LEYENDA = (Object.keys(FASES) as TipoFase[]).map((t) => ({ label: FASES[t], color: tintClass[TINTE_FASE[t]] }))

export type FilaGantt = {
  id: string
  titulo: string
  subtitulo?: string
  inicio?: React.ReactNode
  fases: Fase[]
  publicacion: string
  publicada?: boolean
}

/**
 * El cronograma de una collab sobre el `Gantt` del madre: una fila por pieza con sus fases (guion,
 * grabación, edición, revisión, resultados) en su tinte y el rombo de la publicación.
 */
export function Gantt({ filas, ...props }: Omit<PropsGantt, "filas" | "columna" | "nombreHito" | "leyenda"> & { filas: FilaGantt[] }) {
  const deGantt = filas.map(({ fases, publicacion, publicada, ...f }) => ({
    ...f,
    tramos: fases.map((x) => ({ id: x.tipo, label: x.label, desde: x.desde, hasta: x.hasta, hecho: x.hecha, color: tintClass[TINTE_FASE[x.tipo]] })),
    hito: { fecha: publicacion, hecho: publicada },
  }))
  return <GanttBase {...props} filas={deGantt} columna="Pieza" nombreHito={{ pendiente: "Publicación", hecho: "Publicada" }} leyenda={LEYENDA} />
}
