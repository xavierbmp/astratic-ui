"use client"

// Selector de elementos de `ReportButton`: se pasa el ratón por la página, se resalta lo que hay
// debajo y un clic lo señala. Mientras dura, la página no reacciona a nada.

import * as React from "react"
import { createPortal } from "react-dom"
import { SquareDashedMousePointerIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { describeElement, elementLabel, type ReportElement } from "@/components/app/report-context"

export function ElementPicker({ onPick, onCancel }: { onPick: (el: ReportElement) => void; onCancel: () => void }) {
  const [hover, setHover] = React.useState<{ rect: DOMRect; label: string } | null>(null)
  const current = React.useRef<Element | null>(null)

  React.useEffect(() => {
    const ours = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-report-ui]")
    const at = (x: number, y: number) => {
      let el = document.elementFromPoint(x, y)
      if (!el || ours(el)) return null
      // Un icono dentro de un botón señala el botón, no el trazo del SVG.
      if (el instanceof SVGElement) el = el.closest("button, a, [role]") ?? el.closest("svg") ?? el
      return el
    }
    const show = (el: Element | null) => {
      current.current = el
      setHover(el ? { rect: el.getBoundingClientRect(), label: elementLabel(el) } : null)
    }
    // Mientras se señala, la página no reacciona: ni tooltips, ni menús, ni filas, ni cerrar la ficha.
    const block = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onMove = (e: MouseEvent) => {
      e.stopPropagation()
      show(at(e.clientX, e.clientY))
    }
    const onOver = (e: Event) => e.stopPropagation()
    const onScroll = () => show(current.current)
    const onClick = (e: MouseEvent) => {
      block(e)
      if (ours(e.target)) {
        if ((e.target as Element).closest("[data-report-cancel]")) onCancel()
        return
      }
      const el = at(e.clientX, e.clientY)
      if (el) onPick(describeElement(el))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      block(e)
      onCancel()
    }
    const blocked = ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick", "auxclick", "contextmenu"]
    const cursor = document.createElement("style")
    cursor.textContent = "*{cursor:crosshair!important}"
    document.head.appendChild(cursor)
    window.addEventListener("pointermove", onMove, true)
    window.addEventListener("mousemove", onMove, true)
    window.addEventListener("pointerover", onOver, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("click", onClick, true)
    window.addEventListener("keydown", onKey, true)
    blocked.forEach((t) => window.addEventListener(t, block, true))
    return () => {
      cursor.remove()
      window.removeEventListener("pointermove", onMove, true)
      window.removeEventListener("mousemove", onMove, true)
      window.removeEventListener("pointerover", onOver, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("click", onClick, true)
      window.removeEventListener("keydown", onKey, true)
      blocked.forEach((t) => window.removeEventListener(t, block, true))
    }
  }, [onPick, onCancel])

  return createPortal(
    <div data-report-ui className="pointer-events-none fixed inset-0 z-[100]">
      {hover && (
        <div
          aria-hidden
          className="absolute rounded-[3px] bg-brand/10 ring-2 ring-brand transition-[top,left,width,height] duration-75"
          style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }}
        >
          <span
            className={cn(
              "absolute left-0 max-w-72 truncate rounded bg-brand px-1.5 py-0.5 font-mono text-[11px] leading-4 text-brand-foreground",
              hover.rect.top < 28 ? "top-full mt-1" : "bottom-full mb-1",
            )}
          >
            {hover.label}
          </span>
        </div>
      )}
      <div
        role="status"
        className="pointer-events-auto absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-foreground py-1 pr-1 pl-3.5 text-sm whitespace-nowrap text-background shadow-pop"
      >
        <SquareDashedMousePointerIcon className="size-4" aria-hidden />
        Haz clic en lo que falla
        <Button data-report-cancel size="xs" variant="secondary" className="rounded-full">
          Cancelar <Kbd>Esc</Kbd>
        </Button>
      </div>
    </div>,
    document.body,
  )
}
