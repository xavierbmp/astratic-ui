"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Un botón de la barra de la base: icono y texto. Activo (hay filtro, grupos, orden…) va en el tono
 * de la marca, como lo seleccionado en el resto del design system. Si no cabe todo, los apagados se
 * quedan en icono y los activos siguen diciendo qué hacen.
 */
export const BotonBarra = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { icono: LucideIcon; texto: string; activo?: boolean; soloIcono?: boolean }>(function BotonBarra(
  { icono: Icono, texto, activo, soloIcono, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={soloIcono ? texto : undefined}
      title={texto}
      className={cn(
        "inline-flex h-7 flex-none items-center gap-1.5 rounded-md px-2 text-[13px] whitespace-nowrap text-foreground/80 hover:bg-muted aria-expanded:bg-muted",
        activo && "bg-brand-soft text-foreground hover:bg-brand-soft aria-expanded:bg-brand-soft [&>svg]:text-brand",
        soloIcono && "w-7 justify-center px-0",
        className,
      )}
      {...props}
    >
      <Icono className="size-4 flex-none" />
      {!soloIcono && <span className={activo ? "hidden max-w-44 truncate @3xl/barra:inline" : "hidden @6xl/barra:inline"}>{texto}</span>}
    </button>
  )
})
