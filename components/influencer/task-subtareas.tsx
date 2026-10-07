"use client"

import { ChevronRightIcon } from "lucide-react"
import { cn } from "cn"
import type { Tarea } from "@/lib/influencer/modelo"
import { estaCerrada } from "@/lib/influencer/tareas"
import { CasillaTarea } from "@/components/influencer/task-cells"

/**
 * La flechita de una tarea con subtareas, con su progreso («1/3»): abre y cierra la lista de sus
 * subtareas debajo. No abre la ficha: el clic se queda aquí.
 */
export function BotonSubtareas({ hechas, total, abiertas, onAlternar, className }: { hechas: number; total: number; abiertas: boolean; onAlternar: () => void; className?: string }) {
  if (total === 0) return null
  return (
    <button
      type="button"
      aria-expanded={abiertas}
      aria-label={abiertas ? "Ocultar las subtareas" : `Ver las ${total} subtareas`}
      onClick={(e) => {
        e.stopPropagation()
        onAlternar()
      }}
      className={cn("inline-flex h-5 flex-none items-center gap-0.5 rounded px-1 text-[11px] font-medium tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground", hechas === total && "text-success", className)}
    >
      <ChevronRightIcon className={cn("size-3 transition-transform", abiertas && "rotate-90")} aria-hidden />
      {hechas}/{total}
    </button>
  )
}

/** Las subtareas en pequeño, debajo de su tarea, para marcarlas sin abrir la ficha; el título abre la suya. */
export function MiniSubtareas({ hijas, onToggle, onAbrir, className }: { hijas: Tarea[]; onToggle: (t: Tarea) => void; onAbrir?: (t: Tarea) => void; className?: string }) {
  if (hijas.length === 0) return null
  return (
    <ul className={cn("grid gap-0.5", className)} onClick={(e) => e.stopPropagation()}>
      {hijas.map((h) => (
        <li key={h.id} className="flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted/70">
          <CasillaTarea tarea={h} onToggle={() => onToggle(h)} size="xs" />
          <button type="button" onClick={() => onAbrir?.(h)} className={cn("min-w-0 flex-1 truncate text-left text-xs", estaCerrada(h) ? "text-muted-foreground line-through" : "text-foreground/90")}>
            {h.titulo}
          </button>
        </li>
      ))}
    </ul>
  )
}
