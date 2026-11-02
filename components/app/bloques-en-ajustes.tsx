"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { AjusteDeBase } from "@/components/app/base/barra-base"

/** Algo de la página que se configura o se consulta de vez en cuando: el buzón, las sugerencias por mirar, la recalibración. */
export type BloqueDeAjustes = { id: string; title: string; icon: LucideIcon; action?: React.ReactNode; render: () => React.ReactNode }

/**
 * Lo que no es la tabla pero hace falta a mano: una página no lleva paneles al lado, así que estos bloques van en los
 * ajustes de su base, cada uno en su diálogo. Devuelve lo que se pasa a `BaseDatos ajustes` y el diálogo, que va en la página.
 */
export function useBloquesEnAjustes(bloques: BloqueDeAjustes[]) {
  const [abierto, setAbierto] = React.useState<string | null>(null)
  const bloque = bloques.find((b) => b.id === abierto)
  const ajustes: AjusteDeBase[] = bloques.map((b) => ({ id: b.id, label: b.title, icono: b.icon, onSelect: () => setAbierto(b.id) }))
  const dialogo = (
    <Dialog open={!!bloque} onOpenChange={(a) => !a && setAbierto(null)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {bloque?.title}
            {bloque?.action}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70dvh] overflow-y-auto">{bloque?.render()}</div>
      </DialogContent>
    </Dialog>
  )
  return { ajustes, dialogo }
}
