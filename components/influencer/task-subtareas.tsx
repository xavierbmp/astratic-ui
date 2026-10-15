"use client"

import * as React from "react"
import { ChevronRightIcon, CircleIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import type { Tarea } from "@/lib/influencer/modelo"
import { estaCerrada } from "@/lib/influencer/tareas"
import { CasillaTarea } from "@/components/influencer/task-cells"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

/**
 * Las subtareas de una tarea que aún no existe (el alta, una plantilla, una automatización): una
 * lista que se escribe. Intro añade la siguiente debajo, borrar una vacía vuelve a la anterior y la
 * equis la quita. Las vacías no cuentan al guardar (quien guarda las limpia).
 */
export function EditorSubtareas({ value, onChange, placeholder = "Qué hay que hacer", id }: { value: string[]; onChange: (subtareas: string[]) => void; placeholder?: string; id?: string }) {
  const campos = React.useRef<(HTMLInputElement | null)[]>([])
  const enfocar = React.useRef<number | null>(null)
  // Tras añadir o quitar una fila, el cursor va a la que toca, cuando ya está pintada.
  React.useLayoutEffect(() => {
    if (enfocar.current === null) return
    campos.current[enfocar.current]?.focus()
    enfocar.current = null
  })

  const insertar = (en: number) => {
    enfocar.current = en
    onChange([...value.slice(0, en), "", ...value.slice(en)])
  }
  const quitar = (i: number) => {
    enfocar.current = i > 0 ? i - 1 : null
    onChange(value.filter((_, j) => j !== i))
  }

  return (
    <div data-slot="editor-subtareas" className="grid gap-1">
      {value.map((texto, i) => (
        <div key={i} className="group flex items-center gap-2">
          <CircleIcon className="size-3.5 flex-none text-control" aria-hidden />
          <Input
            id={i === 0 ? id : undefined}
            ref={(el) => {
              campos.current[i] = el
            }}
            aria-label={`Subtarea ${i + 1}`}
            value={texto}
            placeholder={placeholder}
            className="h-8 border-transparent bg-transparent px-1.5 text-sm shadow-none hover:bg-muted/50 focus-visible:bg-transparent"
            onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault()
                insertar(i + 1)
              } else if (e.key === "Backspace" && !texto) {
                e.preventDefault()
                quitar(i)
              }
            }}
          />
          <Button type="button" variant="ghost" size="icon-xs" aria-label={`Quitar la subtarea ${i + 1}`} className="text-muted-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" onClick={() => quitar(i)}>
            <XIcon />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="justify-self-start text-muted-foreground" onClick={() => insertar(value.length)}>
        <PlusIcon />
        Añadir subtarea
      </Button>
    </div>
  )
}
