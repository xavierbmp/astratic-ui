"use client"

import * as React from "react"
import { InboxIcon, LayersIcon } from "lucide-react"
import { borrarCarpeta, conDescendientes, moverCarpeta, siguienteOrden, type CarpetaArbol } from "@/lib/carpetas"
import { CarpetasBloque } from "@/components/app/carpetas-bloque"

type Carpeta = CarpetaArbol & { color: string }

const TODO = "todo"
const SIN = "sin-carpeta"

const INICIALES: Carpeta[] = [
  { id: "c1", nombre: "Clientes", orden: 0, color: "bg-info" },
  { id: "c2", nombre: "Propuestas", padreId: "c1", orden: 0, color: "bg-info" },
  { id: "c3", nombre: "Contratos", padreId: "c1", orden: 1, color: "bg-info" },
  { id: "c4", nombre: "Interno", orden: 1, color: "bg-warning" },
  { id: "c5", nombre: "Plantillas", orden: 2, color: "bg-success" },
]

/** Lo que hay en cada carpeta, sin contar lo de dentro. */
const ARCHIVOS: Record<string, number> = { c1: 2, c2: 5, c3: 3, c4: 4, c5: 6, [SIN]: 2 }

export function CarpetasDemo() {
  const [carpetas, setCarpetas] = React.useState(INICIALES)
  const [actual, setActual] = React.useState(TODO)
  // Cada carpeta cuenta también lo de las que lleva dentro.
  const cuentas = Object.fromEntries([
    ...carpetas.map((c) => [c.id, [...conDescendientes(carpetas, c.id)].reduce((n, id) => n + (ARCHIVOS[id] ?? 0), 0)] as const),
    [TODO, Object.values(ARCHIVOS).reduce((a, b) => a + b, 0)],
    [SIN, ARCHIVOS[SIN]],
  ])
  return (
    <div className="w-72 max-w-full">
      <CarpetasBloque
        carpetas={carpetas}
        actual={actual}
        cuentas={cuentas}
        color={(c) => c.color}
        atajos={[
          { id: TODO, label: "Todo", icon: LayersIcon },
          { id: SIN, label: "Sin carpeta", icon: InboxIcon, enFila: false },
        ]}
        claves={{ plegadas: "docs-carpetas-plegadas", ancho: "docs-carpetas-ancho" }}
        contenido="archivos"
        alBorrarIrA={TODO}
        onElegir={setActual}
        onCrear={(nombre, padreId) => {
          const nueva = { id: `c${Date.now()}`, nombre, padreId, orden: siguienteOrden(carpetas, padreId), color: "bg-muted-foreground" }
          setCarpetas([...carpetas, nueva])
          return nueva
        }}
        onRenombrar={(id, nombre) => setCarpetas(carpetas.map((c) => (c.id === id ? { ...c, nombre } : c)))}
        onMover={(id, destino) => {
          const nuevas = moverCarpeta(carpetas, id, destino)
          if (nuevas) setCarpetas(nuevas)
          return nuevas !== null
        }}
        onBorrar={(id) => setCarpetas(borrarCarpeta(carpetas, id).carpetas)}
      />
    </div>
  )
}
