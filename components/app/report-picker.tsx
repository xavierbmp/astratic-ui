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

/** Los marcos de la misma web que hay en la página (las vistas previas): se señala también dentro. */
function marcosPropios() {
  const marcos: { marco: HTMLIFrameElement; ventana: Window; doc: Document }[] = []
  for (const marco of document.querySelectorAll("iframe")) {
    try {
      const doc = marco.contentDocument
      const ventana = marco.contentWindow
      if (doc && ventana && doc.body) marcos.push({ marco, ventana, doc })
    } catch {
      // De otra web: el navegador no deja mirar dentro y se señala el marco entero.
    }
  }
  return marcos
}

/** Dónde empieza el contenido de un marco en la página: lo de dentro mide desde su esquina. */
function origenDe(marco: HTMLIFrameElement | null) {
  if (!marco) return { x: 0, y: 0 }
  const r = marco.getBoundingClientRect()
  return { x: r.left + marco.clientLeft, y: r.top + marco.clientTop }
}

export function ElementPicker({ onPick, onCancel }: { onPick: (el: ReportElement) => void; onCancel: () => void }) {
  const [hover, setHover] = React.useState<{ rect: DOMRect; label: string } | null>(null)
  const current = React.useRef<{ el: Element; marco: HTMLIFrameElement | null } | null>(null)

  React.useEffect(() => {
    const ours = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-report-ui]")
    const at = (doc: Document, x: number, y: number) => {
      let el = doc.elementFromPoint(x, y)
      if (!el || ours(el)) return null
      // Un icono dentro de un botón señala el botón, no el trazo del SVG.
      // (Por su espacio de nombres y no con instanceof: lo de un marco es de otra ventana.)
      if (el.namespaceURI === "http://www.w3.org/2000/svg") el = el.closest("button, a, [role]") ?? el.closest("svg") ?? el
      return el
    }
    const show = (hit: { el: Element; marco: HTMLIFrameElement | null } | null) => {
      current.current = hit
      if (!hit) return setHover(null)
      const r = hit.el.getBoundingClientRect()
      const o = origenDe(hit.marco)
      setHover({ rect: new DOMRect(r.x + o.x, r.y + o.y, r.width, r.height), label: elementLabel(hit.el) })
    }
    /** Lo señalado dentro de un marco dice que va en la vista previa y su caja se cuenta desde la página. */
    const describir = (el: Element, marco: HTMLIFrameElement | null): ReportElement => {
      const d = describeElement(el)
      if (!marco) return d
      const o = origenDe(marco)
      const nombre = marco.title || "vista previa"
      return { ...d, path: `iframe «${nombre}» › ${d.path || d.tag}`, selector: `iframe › ${d.selector}`, rect: { ...d.rect, x: Math.round(d.rect.x + o.x), y: Math.round(d.rect.y + o.y) } }
    }
    // Mientras se señala, la página no reacciona: ni tooltips, ni menús, ni filas, ni cerrar la ficha.
    const block = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      block(e)
      onCancel()
    }
    const blocked = ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick", "auxclick", "contextmenu"]

    /** Escucha una ventana (la página o un marco): lo que pasa dentro se mide en su documento. */
    const escuchar = (ventana: Window, doc: Document, marco: HTMLIFrameElement | null) => {
      const hitAt = (x: number, y: number) => {
        const el = at(doc, x, y)
        // El marco desde fuera no se señala: su contenido avisa por su cuenta.
        if (!el || (!marco && marcos.some((m) => m.marco === el))) return null
        return { el, marco }
      }
      const onMove = (e: MouseEvent) => {
        e.stopPropagation()
        const hit = hitAt(e.clientX, e.clientY)
        if (hit || !marco) show(hit)
      }
      const onOver = (e: Event) => e.stopPropagation()
      const onScroll = () => show(current.current)
      const onClick = (e: MouseEvent) => {
        block(e)
        if (!marco && ours(e.target)) {
          if ((e.target as Element).closest("[data-report-cancel]")) onCancel()
          return
        }
        const hit = hitAt(e.clientX, e.clientY)
        if (hit) onPick(describir(hit.el, hit.marco))
      }
      const cursor = doc.createElement("style")
      cursor.textContent = "*{cursor:crosshair!important}"
      doc.head.appendChild(cursor)
      const oyentes: [string, EventListener][] = [
        ["pointermove", onMove as EventListener],
        ["mousemove", onMove as EventListener],
        ["pointerover", onOver],
        ["scroll", onScroll],
        ["click", onClick as EventListener],
        ["keydown", onKey as EventListener],
        ...blocked.map((t) => [t, block] as [string, EventListener]),
      ]
      oyentes.forEach(([t, f]) => ventana.addEventListener(t, f, true))
      return () => {
        cursor.remove()
        oyentes.forEach(([t, f]) => ventana.removeEventListener(t, f, true))
      }
    }

    const marcos = marcosPropios()
    const quitar = [escuchar(window, document, null), ...marcos.map((m) => escuchar(m.ventana, m.doc, m.marco))]
    return () => quitar.forEach((q) => q())
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
