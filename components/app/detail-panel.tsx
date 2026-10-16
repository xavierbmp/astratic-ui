"use client"

import * as React from "react"
import { PanelRightCloseIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ResizeHandle, acotarAncho } from "@/components/app/resize-handle"

/**
 * El panel de la derecha de una página de operación y la ficha (Xavier, 2026-10-16: «el bloque lateral siempre el
 * mismo»). Desplegado (lo de serie), enseña «Información» y, al pulsar un registro, su ficha en ese mismo sitio; al
 * cerrarla, vuelve «Información». Plegado (el botón del final de la barra de la base), la lista ocupa todo el ancho
 * y el registro se abre encima, con la ficha completa. Se ensancha o estrecha arrastrando su borde y es una
 * preferencia de cada persona y de cada página.
 *
 * Solo con sitio para las dos columnas (1280 px o más): en pantallas estrechas el panel va debajo
 * del bloque, así que la ficha se abre encima, como siempre.
 */
export type PanelFicha = {
  /** El panel está desplegado (lo que ha elegido la persona para esta página). */
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
  // Clave nueva desde el 2026-10-16: la de antes guardaba «ficha en el panel», que ahora es lo de serie.
  const [prefs, setPrefs] = useLocalStorage<Prefs>(`panel-lateral:${pageKey}`, { plegado: false, ancho: ANCHO_FICHA.porDefecto })
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

/** Plegar el panel: en la cabecera de «Información» y de la ficha integrada. Desplegarlo, desde la barra de la base. */
export function PlegarPanel({ ficha, className }: { ficha: PanelFicha; className?: string }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Plegar el panel" title="Plegar el panel" className={className} onClick={() => ficha.alternar(false)}>
      <PanelRightCloseIcon />
    </Button>
  )
}

/**
 * La columna derecha con el panel desplegado: «Información» (`aside`) y, encima de ella en el mismo sitio, la ficha
 * del registro abierto, que `DetailSheet` pinta aquí. Sin ninguno abierto se ve «Información». El borde izquierdo se
 * arrastra para cambiar el ancho de la ficha.
 */
export function DetailPanelHost({ ficha, aside }: { ficha: PanelFicha; aside: React.ReactNode }) {
  return (
    <div className="group/panel flex h-full min-h-0 flex-col">
      <div className="flex h-full min-h-0 flex-col group-has-[[data-slot=detail-panel-content]]/panel:hidden">{aside}</div>
      <section data-slot="detail-panel" className="relative hidden h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-xs group-has-[[data-slot=detail-panel-content]]/panel:flex">
        <BordeRedimensionable ficha={ficha} />
        <DestinoFicha setNodo={ficha.setNodo} />
      </section>
    </div>
  )
}

/** Donde `DetailSheet` pinta la ficha abierta (con un portal); vacío, no ocupa sitio. */
function DestinoFicha({ setNodo }: { setNodo: (el: HTMLElement | null) => void }) {
  return <div ref={setNodo} className="flex min-h-0 flex-1 flex-col empty:hidden" />
}

/** El borde izquierdo del panel: se arrastra (o se mueve con las flechas) para ensanchar la ficha. */
function BordeRedimensionable({ ficha }: { ficha: PanelFicha }) {
  return (
    <ResizeHandle
      ancho={ficha.ancho}
      onAncho={ficha.setAncho}
      limites={ANCHO_FICHA}
      maximo={(rejilla) => rejilla.clientWidth - ANCHO_MINIMO_LISTA}
      lado="izquierda"
      destino={(borde) => borde.closest<HTMLElement>("[data-slot=work-grid]")}
      variable="--ficha-w"
      label="Ancho de la ficha"
    />
  )
}
