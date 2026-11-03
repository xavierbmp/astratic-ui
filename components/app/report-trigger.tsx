"use client"

// La bombilla en pequeño de «Sugerencias y problemas», para donde la del shell queda tapada: una ficha, un formulario
// o cualquier diálogo. Abre el diálogo del `ReportButton` del shell, que se apunta aquí al montarse. Va aparte de él
// para que el diálogo base (`components/ui/dialog`) la lleve sin depender del botón entero.

import * as React from "react"
import { LightbulbIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Nombre del botón: sirve igual para proponer un cambio que para contar un fallo. */
export const ETIQUETA_SUGERENCIAS = "Sugerencias y problemas"

const openers = new Set<() => void>()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
const hasOpener = () => openers.size > 0

/** El `ReportButton` principal (el que lleva el atajo) se apunta al montarse; devuelve cómo desapuntarse. */
export function apuntarAbridorReporte(open: () => void): () => void {
  openers.add(open)
  notify()
  return () => {
    openers.delete(open)
    notify()
  }
}

/** La bombilla en pequeño. Sin un `ReportButton` montado (las páginas públicas) no se pinta. */
export function ReportTrigger({ className }: { className?: string }) {
  const available = React.useSyncExternalStore(subscribe, hasOpener, () => false)
  if (!available) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={ETIQUETA_SUGERENCIAS} className={cn("text-muted-foreground", className)} onClick={() => openers.values().next().value?.()}>
          <LightbulbIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {ETIQUETA_SUGERENCIAS} <Kbd>⇧⌘X</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
