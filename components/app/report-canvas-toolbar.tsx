"use client"

// Barras del lienzo (`ReportCanvas`): la de herramientas, la de confirmar y los avisos mientras se prepara,
// se usa la página o se guarda. Todo lleva `data-canvas-chrome`: no sale en la captura.

import * as React from "react"
import {
  CheckIcon,
  Loader2Icon,
  MousePointerClickIcon,
  MoveUpRightIcon,
  PencilIcon,
  RectangleHorizontalIcon,
  SquareDashedIcon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { MARK_COLORS, type MarkColor, type Tool } from "@/components/app/report-canvas-draw"

export type CanvasMode = "boxes" | "draw"

/** Lo que espera un «¿seguro?» antes de hacerse. */
export type CanvasConfirm = { kind: "cancel" } | { kind: "use" } | { kind: "press"; x: number; y: number }

const TOOLS: { value: Tool; label: string; icon: typeof PencilIcon }[] = [
  { value: "arrow", label: "Flecha", icon: MoveUpRightIcon },
  { value: "pen", label: "Lápiz", icon: PencilIcon },
  { value: "rect", label: "Rectángulo", icon: RectangleHorizontalIcon },
  { value: "text", label: "Texto", icon: TypeIcon },
]

const HINT: Record<CanvasMode, string> = {
  boxes: "Arrastra un recuadro para moverlo y tira de sus esquinas para cambiar su tamaño. Supr lo quita. Clic derecho pulsa de verdad: abre menús y formularios.",
  draw: "Dibuja encima de la pantalla: flechas, trazos, recuadros y textos.",
}

const CONFIRM: Record<CanvasConfirm["kind"], { text: string; go: string }> = {
  cancel: { text: "¿Salir sin guardar lo que has marcado?", go: "Salir sin guardar" },
  use: { text: "Para usar la página se borra lo marcado en esta pantalla.", go: "Usar la página" },
  press: { text: "Pulsar ahí cambia la pantalla y se borra lo marcado.", go: "Pulsar" },
}

const bar = "pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2"

/** Botón de dos estados de la barra (modo, herramienta). */
function ToggleButton({ active, className, ...props }: React.ComponentProps<typeof Button> & { active: boolean }) {
  return <Button type="button" variant="ghost" aria-pressed={active} className={cn(active && "bg-accent text-accent-foreground", className)} {...props} />
}

export function CanvasToolbar({
  mode,
  tool,
  color,
  canUndo,
  onMode,
  onTool,
  onColor,
  onUndo,
  onUse,
  onCancel,
  onSave,
}: {
  mode: CanvasMode
  tool: Tool
  color: MarkColor
  canUndo: boolean
  onMode: (m: CanvasMode) => void
  onTool: (t: Tool) => void
  onColor: (c: MarkColor) => void
  onUndo: () => void
  onUse: () => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div data-canvas-chrome className={cn(bar, "grid w-max max-w-[calc(100vw-2rem)] justify-items-center gap-1.5")}>
      <p className="max-w-xl rounded-md bg-foreground/85 px-2.5 py-1 text-center text-xs text-background">{HINT[mode]}</p>
      <div role="toolbar" aria-label="Lienzo" className="flex flex-wrap items-center justify-center gap-1 rounded-xl border bg-popover p-1 text-popover-foreground shadow-pop">
        <ToggleButton size="sm" active={mode === "boxes"} onClick={() => onMode("boxes")}>
          <SquareDashedIcon /> Recuadros
        </ToggleButton>
        <ToggleButton size="sm" active={mode === "draw"} onClick={() => onMode("draw")}>
          <PencilIcon /> Dibujar
        </ToggleButton>
        {mode === "draw" && (
          <>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            {TOOLS.map((t) => (
              <ToggleButton key={t.value} size="icon-sm" active={tool === t.value} aria-label={t.label} title={t.label} onClick={() => onTool(t.value)}>
                <t.icon />
              </ToggleButton>
            ))}
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            {MARK_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                aria-pressed={color === c.value}
                title={c.label}
                onClick={() => onColor(c.value)}
                className={cn("grid size-7 place-items-center rounded-md hover:bg-muted", color === c.value && "bg-accent")}
              >
                <span className="size-4 rounded-full ring-1 ring-foreground/10" style={{ background: `var(--${c.value})` }} />
              </button>
            ))}
          </>
        )}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Deshacer" title="Deshacer (⌘Z)" disabled={!canUndo} onClick={onUndo}>
          <Undo2Icon />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onUse} title="Usa la página con normalidad (abrir un formulario, cambiar de pestaña) y vuelve para marcarla">
          <MousePointerClickIcon /> Usar la página
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={onSave}>
          <CheckIcon /> Guardar
        </Button>
      </div>
    </div>
  )
}

export function CanvasConfirmBar({ confirm, onConfirm, onDismiss }: { confirm: CanvasConfirm; onConfirm: () => void; onDismiss: () => void }) {
  const { text, go } = CONFIRM[confirm.kind]
  return (
    <div data-canvas-chrome role="alertdialog" aria-label={text} className={cn(bar, "flex items-center gap-2 rounded-xl border bg-popover py-1 pr-1 pl-3 text-sm whitespace-nowrap text-popover-foreground shadow-pop")}>
      {text}
      <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
        Seguir marcando
      </Button>
      <Button type="button" variant={confirm.kind === "cancel" ? "destructive" : "default"} size="sm" onClick={onConfirm}>
        {go}
      </Button>
    </div>
  )
}

/** Mientras se usa la página con normalidad. */
export function CanvasUsingBar({ onBack }: { onBack: () => void }) {
  return (
    <div data-canvas-chrome className={cn(bar, "flex items-center gap-2.5 rounded-full bg-foreground py-1 pr-1 pl-3.5 text-sm whitespace-nowrap text-background shadow-pop")}>
      <MousePointerClickIcon className="size-4" aria-hidden />
      Usa la página y vuelve cuando esté como la quieres marcar
      <Button type="button" size="xs" variant="secondary" className="rounded-full" onClick={onBack}>
        Volver al lienzo
      </Button>
    </div>
  )
}

/** Mientras se prepara (se buscan los elementos) o se guarda (se captura la pantalla). */
export function CanvasBusyBar({ saving }: { saving: boolean }) {
  return (
    <div data-canvas-chrome role="status" className={cn(bar, "pointer-events-none flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-sm whitespace-nowrap text-background shadow-pop")}>
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      {saving ? "Guardando el lienzo…" : "Preparando el lienzo…"}
    </div>
  )
}
