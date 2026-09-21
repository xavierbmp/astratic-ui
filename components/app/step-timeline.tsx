"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Punto de un paso en el recorrido:
 * - `done`: ya pasó (enviado, hecho).
 * - `current`: lo que toca ahora.
 * - `upcoming`: vendrá después.
 * - `off`: no pasará o se saltó.
 */
export type StepState = "done" | "current" | "upcoming" | "off"

export type StepItem = {
  id: string
  title: React.ReactNode
  /** Día, fecha, lo que pasó: una línea en gris. */
  meta?: React.ReactNode
  /** Insignia de estado (`StatusBadge`) a la derecha del título. */
  status?: React.ReactNode
  icon: LucideIcon
  state: StepState
}

const punto: Record<StepState, string> = {
  done: "border-foreground bg-foreground text-background",
  current: "border-brand bg-brand-soft text-brand ring-3 ring-brand-soft",
  upcoming: "border-dashed border-control bg-background text-muted-foreground",
  off: "border-border bg-muted text-muted-foreground/70",
}

/**
 * Recorrido vertical por pasos: dónde está un registro en una secuencia (un contacto en una
 * campaña, un pedido en sus fases). Cada paso se pulsa para verlo en detalle al lado; el elegido
 * queda marcado. Va en la columna izquierda de `DetailSplit`.
 */
export function StepTimeline({
  items,
  value,
  onSelect,
  className,
}: {
  items: StepItem[]
  /** Paso que se está viendo. */
  value?: string | null
  onSelect?: (id: string) => void
  className?: string
}) {
  return (
    <ol data-slot="step-timeline" className={cn("flex flex-col", className)}>
      {items.map((it, i) => {
        const Icon = it.icon
        const activo = it.id === value
        const ultimo = i === items.length - 1
        return (
          <li key={it.id} className="relative">
            {!ultimo && (
              <span
                aria-hidden
                className={cn("absolute top-9 bottom-[-8px] left-[21px] w-px", it.state === "done" ? "bg-foreground/40" : "border-l border-dashed border-control")}
              />
            )}
            <button
              type="button"
              disabled={!onSelect}
              aria-current={activo ? "step" : undefined}
              onClick={() => onSelect?.(it.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-default",
                activo ? "bg-muted ring-1 ring-border" : onSelect && "hover:bg-muted/70",
              )}
            >
              <span className={cn("relative z-10 grid size-7 flex-none place-items-center rounded-full border", punto[it.state])}>
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5 pt-0.5 leading-tight">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn("text-sm font-medium", it.state === "off" && "text-muted-foreground")}>{it.title}</span>
                  {it.status}
                </span>
                {it.meta && <span className="text-xs text-muted-foreground">{it.meta}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
