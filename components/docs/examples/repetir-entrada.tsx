"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Vuelve a montar lo de dentro para ver otra vez su entrada (las animaciones de las escenas y del movimiento). */
export function RepetirEntrada({ children }: { children: React.ReactNode }) {
  const [vez, setVez] = React.useState(0)
  return (
    <div className="flex flex-col gap-3">
      <div key={vez}>{children}</div>
      <Button variant="outline" size="sm" className="self-start" onClick={() => setVez((v) => v + 1)}>
        <RotateCcwIcon />
        Repetir la entrada
      </Button>
    </div>
  )
}
