"use client"

import * as React from "react"
import { ANCHO_FICHA, type PanelFicha } from "@/components/app/detail-panel"
import { ResizeHandle } from "@/components/app/resize-handle"

// La base nunca se queda más estrecha que esto al ensanchar la ficha.
const ANCHO_MINIMO_BASE = 420

/**
 * La ficha integrada a la derecha de la base (con el panel desplegado): `DetailSheet` (con `ficha`) pinta aquí el
 * registro abierto; sin ninguno, no ocupa sitio y la base usa todo el ancho. El borde izquierdo se arrastra para cambiar el
 * ancho (doble clic vuelve al de siempre), y la base se ajusta sola.
 */
export function PanelFichaBase({ ficha }: { ficha: PanelFicha }) {
  return (
    <aside data-slot="detail-panel" className="relative hidden w-[var(--ficha-w)] min-w-0 flex-none flex-col border-l bg-card has-[[data-slot=detail-panel-content]]:flex">
      <Borde ficha={ficha} />
      <Destino setNodo={ficha.setNodo} />
    </aside>
  )
}

/** Donde `DetailSheet` pinta la ficha abierta (con un portal); vacío, no ocupa sitio. */
function Destino({ setNodo }: { setNodo: (el: HTMLElement | null) => void }) {
  return <div ref={setNodo} className="flex min-h-0 flex-1 flex-col empty:hidden" />
}

function Borde({ ficha }: { ficha: PanelFicha }) {
  return (
    <ResizeHandle
      ancho={ficha.ancho}
      onAncho={ficha.setAncho}
      limites={ANCHO_FICHA}
      maximo={(base) => base.clientWidth - ANCHO_MINIMO_BASE}
      lado="izquierda"
      destino={(borde) => borde.closest<HTMLElement>("[data-slot=base-datos]")}
      variable="--ficha-w"
      label="Ancho de la ficha"
    />
  )
}
