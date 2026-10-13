"use client"

import * as React from "react"
import { PanelRightIcon } from "lucide-react"
import { ANCHO_FICHA, type PanelFicha } from "@/components/app/detail-panel"
import { ResizeHandle } from "@/components/app/resize-handle"

// La base nunca se queda más estrecha que esto al ensanchar la ficha.
const ANCHO_MINIMO_BASE = 420

/**
 * La ficha integrada a la derecha de la base: `DetailSheet` (con `ficha`) pinta aquí el registro
 * abierto y, sin ninguno, se explica cómo elegirlo. El borde izquierdo se arrastra para cambiar el
 * ancho (doble clic vuelve al de siempre), y la base se ajusta sola.
 */
export function PanelFichaBase({ ficha, objeto }: { ficha: PanelFicha; objeto: string }) {
  return (
    <aside data-slot="detail-panel" className="group/panel relative flex w-[var(--ficha-w)] min-w-0 flex-none flex-col border-l bg-card">
      <Borde ficha={ficha} />
      <Destino setNodo={ficha.setNodo} />
      <div className="flex flex-1 flex-col items-center gap-2 px-8 pt-24 text-center group-has-[[data-slot=detail-panel-content]]/panel:hidden">
        <PanelRightIcon className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">Ningún {objeto} abierto</p>
        <p className="text-xs text-muted-foreground">Pulsa una fila o una tarjeta para verlo aquí.</p>
      </div>
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
