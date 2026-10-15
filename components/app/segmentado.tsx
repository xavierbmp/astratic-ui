"use client"

import type * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * El control segmentado pequeño de la cabecera de un bloque o un panel: elige un valor o recorta lo
 * que se ve (Mes o Semana, Todo o Notas, Alcance o Seguidores). Es el `TabsList` gris de siempre a
 * 28 px; para cambiar de página o de parte de una ficha se usan las pestañas de navegación.
 */
export function Segmentado<T extends string>({ valor, opciones, onCambiar, label, className }: { valor: T; opciones: { id: T; label: React.ReactNode }[]; onCambiar: (valor: T) => void; label: string; className?: string }) {
  return (
    <Tabs
      value={valor}
      onValueChange={(v) => {
        const elegida = opciones.find((o) => o.id === v)
        if (elegida) onCambiar(elegida.id)
      }}
      className={className}
    >
      <TabsList className="h-7" aria-label={label}>
        {opciones.map((o) => (
          <TabsTrigger key={o.id} value={o.id} className="px-2 text-xs">
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
