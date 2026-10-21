"use client"

import * as React from "react"
import { cn } from "cn"
import { TarjetaRegistro, type PropsTarjetas } from "@/components/app/base/tarjeta"

/**
 * La galería de la base: una tarjeta por registro con los campos que elige la vista, en columnas
 * que se reparten solas. Pulsar una tarjeta abre su ficha. Con `aMedida`, cada tarjeta la pinta la
 * página (una tarjeta de perfil, como el roster de la red) y la galería solo la coloca y la abre.
 */
export function GaleriaBase<T>({ registros, getId, abiertoId, onAbrir, vacio, aMedida, ...tarjeta }: PropsTarjetas<T> & { registros: T[]; getId: (fila: T) => string; abiertoId?: string | null; onAbrir: (id: string) => void; vacio?: React.ReactNode; aMedida?: (fila: T) => React.ReactNode }) {
  if (registros.length === 0) return <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-background pt-10">{vacio}</div>
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-background p-3">
      <div className={cn("grid gap-3", aMedida ? "grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4" : "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]")}>
        {registros.map((fila) => {
          const id = getId(fila)
          return (
            // Un div y no un botón: dentro puede ir otro botón (el registro vinculado, que abre su ficha).
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => onAbrir(id)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return
                e.preventDefault()
                onAbrir(id)
              }}
              className={cn(
                "cursor-pointer rounded-lg border bg-card text-left shadow-xs outline-none hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring/50",
                aMedida ? "overflow-hidden rounded-2xl" : "p-3",
                abiertoId === id && "border-brand hover:border-brand",
                abiertoId === id && !aMedida && "bg-brand-soft"
              )}
            >
              {aMedida ? aMedida(fila) : <TarjetaRegistro fila={fila} {...tarjeta} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
