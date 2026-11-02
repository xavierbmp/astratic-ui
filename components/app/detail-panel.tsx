"use client"

import * as React from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ResizeHandle, acotarAncho } from "@/components/app/resize-handle"

/**
 * Dónde se abre la ficha de un registro: encima de la lista (lo de serie) o al lado de la tabla, si alguien lo elige en
 * los ajustes de la base. Es una preferencia de cada persona y de cada página, con el ancho que le dé arrastrando su
 * borde. Al lado, solo con sitio para las dos columnas (1280 px o más).
 */
export type PanelFicha = {
  /** La ficha va al lado de la tabla (lo que ha elegido la persona para esta página). */
  preferida: boolean
  /** La ficha va en el panel ahora: desplegado y con sitio para dos columnas. */
  activa: boolean
  /** Despliega (`true`) o pliega el panel. */
  alternar: (desplegado: boolean) => void
  ancho: number
  setAncho: (px: number) => void
  /** Dónde pinta `DetailSheet` la ficha cuando va en el panel. Lo pone `WorkGrid`. */
  nodo: HTMLElement | null
  setNodo: (el: HTMLElement | null) => void
}

export const ANCHO_FICHA = { min: 380, porDefecto: 480, max: 960 }
// La lista nunca se queda más estrecha que esto al ensanchar la ficha.
const ANCHO_MINIMO_LISTA = 520
const DOS_COLUMNAS = "(min-width: 1280px)"

type Prefs = { plegado: boolean; ancho: number }

function suscribirDosColumnas(cb: () => void) {
  const mql = window.matchMedia(DOS_COLUMNAS)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

function useDosColumnas() {
  return React.useSyncExternalStore(suscribirDosColumnas, () => window.matchMedia(DOS_COLUMNAS).matches, () => false)
}

const acotar = (px: number) => acotarAncho(px, ANCHO_FICHA)

/** Estado del panel de una página (desplegado o plegado, y el ancho de la ficha). Se pasa a `WorkGrid`, `InsightsPanel`, `BaseDatos` y `DetailSheet`. */
export function usePanelFicha(pageKey: string): PanelFicha {
  // De serie la ficha se abre encima; quien quiera, la pone al lado de la tabla desde los ajustes de la base.
  const [prefs, setPrefs] = useLocalStorage<Prefs>(`ficha-al-lado:${pageKey}`, { plegado: true, ancho: ANCHO_FICHA.porDefecto })
  const dosColumnas = useDosColumnas()
  const [nodo, setNodo] = React.useState<HTMLElement | null>(null)
  return {
    preferida: !prefs.plegado,
    activa: !prefs.plegado && dosColumnas,
    alternar: (desplegado) => setPrefs((p) => ({ ...p, plegado: !desplegado })),
    ancho: acotar(prefs.ancho),
    setAncho: (px) => setPrefs((p) => ({ ...p, ancho: acotar(px) })),
    nodo,
    setNodo,
  }
}
