"use client"

import * as React from "react"
import { cn } from "cn"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type LimitesAncho = { min: number; porDefecto: number; max: number }

const PASO_TECLADO = 24

export function acotarAncho(px: number, { min, max }: Pick<LimitesAncho, "min" | "max">) {
  return Math.round(Math.min(Math.max(px, min), Math.max(min, max)))
}

/**
 * El ancho de un bloque que se ensancha arrastrando, recordado por persona y navegador. Sin nada
 * guardado, el de siempre (`porDefecto`). `clave`: una por bloque y página (`panel:/crm`).
 */
export function useAnchoGuardado(clave: string, limites: LimitesAncho) {
  const [guardado, setGuardado] = useLocalStorage<number | null>(`ancho:${clave}`, null)
  return {
    ancho: acotarAncho(guardado ?? limites.porDefecto, limites),
    setAncho: (px: number) => setGuardado(acotarAncho(px, limites)),
    restablecer: () => setGuardado(null),
  }
}

/**
 * El borde que se arrastra para ensanchar o estrechar un bloque (el panel de la derecha, una ficha,
 * una columna lateral), con las flechas del teclado también, y doble clic para volver al ancho de
 * siempre. Va dentro del bloque, pegado a su borde (`lado`) y con el bloque en `relative`.
 *
 * Mientras se arrastra solo cambia una variable CSS (`variable`) en `destino`, el elemento que
 * reparte el sitio; el ancho se guarda al soltar, para no repintar la página en cada píxel.
 */
export function ResizeHandle({
  ancho,
  onAncho,
  limites,
  maximo,
  lado = "izquierda",
  destino,
  variable,
  label = "Ancho del bloque",
  className,
}: {
  ancho: number
  /** El ancho elegido, al soltar o con el teclado. */
  onAncho: (px: number) => void
  limites: LimitesAncho
  /** El máximo según el sitio que haya ahora en `destino` (para no dejar el resto sin espacio). Por defecto, `limites.max`. */
  maximo?: (destino: HTMLElement) => number
  /** En qué borde del bloque va: a la izquierda, arrastrar hacia la izquierda ensancha; a la derecha, al revés. */
  lado?: "izquierda" | "derecha"
  /** El elemento que lleva la variable CSS con el ancho (la rejilla, la ficha), buscado desde el borde. */
  destino: (borde: HTMLElement) => HTMLElement | null
  variable: string
  label?: string
  className?: string
}) {
  const max = (el: HTMLElement | null) => Math.min(limites.max, el && maximo ? maximo(el) : limites.max)
  const signo = lado === "izquierda" ? -1 : 1

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = destino(e.currentTarget)
    if (!el || e.button !== 0) return
    e.preventDefault()
    const x0 = e.clientX
    const tope = max(el)
    let actual = ancho
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    const mover = (ev: PointerEvent) => {
      actual = acotarAncho(ancho + signo * (ev.clientX - x0), { min: limites.min, max: tope })
      el.style.setProperty(variable, `${actual}px`)
    }
    const soltar = () => {
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
      onAncho(actual)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const paso = (e.key === "ArrowRight" ? 1 : -1) * signo * PASO_TECLADO
    onAncho(acotarAncho(ancho + paso, { min: limites.min, max: max(destino(e.currentTarget as HTMLElement)) }))
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={limites.min}
      aria-valuemax={limites.max}
      aria-valuenow={ancho}
      tabIndex={0}
      title="Arrastra para cambiar el ancho · doble clic para volver al de siempre"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => onAncho(limites.porDefecto)}
      className={cn(
        "absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none outline-none",
        lado === "izquierda" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-transparent after:transition-colors hover:after:bg-brand/60 focus-visible:after:bg-brand",
        className,
      )}
    />
  )
}
