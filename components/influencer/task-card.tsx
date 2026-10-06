"use client"

import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"

export type TaskTone = "vencida" | "hoy" | "normal"

/**
 * Tarea en tarjeta: un círculo para marcarla (al hacerla se tacha), el título, a qué collab
 * pertenece y la fecha, en rojo si venció y en naranja si es hoy.
 */
export function TaskCard({
  title,
  context,
  dueAt,
  tone = "normal",
  done,
  onToggle,
  className,
}: {
  title: string
  context?: string
  dueAt: string
  tone?: TaskTone
  done: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <div
      data-slot="ws-task-card"
      className={cn(
        "flex items-start gap-3 rounded-xl bg-background/70 px-3.5 py-3 transition-colors hover:bg-muted",
        done && "opacity-60",
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Desmarcar «${title}»` : `Marcar «${title}» como hecha`}
        onClick={onToggle}
        className={cn(
          "mt-0.5 grid size-5 flex-none place-items-center rounded-full border-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
          done ? "border-brand bg-brand text-brand-foreground" : "border-control bg-card hover:border-brand"
        )}
      >
        {done && <CheckIcon className="size-3" strokeWidth={3} aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-snug", done && "line-through")}>{title}</p>
        {context && <p className="mt-0.5 truncate text-xs text-muted-foreground">{context}</p>}
      </div>
      <span
        className={cn(
          "flex-none text-xs font-medium tabular-nums",
          tone === "vencida" && !done && "text-danger",
          tone === "hoy" && !done && "text-warning",
          (tone === "normal" || done) && "text-muted-foreground"
        )}
      >
        {tone === "hoy" ? "Hoy" : fmt.date(dueAt)}
      </span>
    </div>
  )
}
