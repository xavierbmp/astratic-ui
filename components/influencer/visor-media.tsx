"use client"

import { VisorMedia as VisorMediaBase, type PropsVisorMedia } from "@/components/app/visor-media"
import { ESTADOS_VERSION, estadoDe, type Version } from "@/lib/influencer/modelo"
import { tintClass, type Tint } from "@/lib/influencer/tints"

/** El visor del madre con el estado de cada versión y, de fondo, el tinte de la marca. */
export function VisorMedia({ tint, ...props }: Omit<PropsVisorMedia<Version>, "estado" | "fondo"> & { tint: Tint }) {
  return <VisorMediaBase {...props} estado={(v) => estadoDe(ESTADOS_VERSION, v.estado).label} fondo={tintClass[tint]} />
}
