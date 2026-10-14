"use client"

// Recuadros del lienzo (`ReportCanvas`): uno por cada elemento que se ve en la pantalla. Se mueven, se estiran
// o se quitan sin tocar la página: solo sirven para enseñar dónde y cómo se quiere cada cosa.

import * as React from "react"
import { CornerLeftUpIcon, RotateCcwIcon, Trash2Icon, Undo2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { elementLabel } from "@/components/app/report-context"
import { center, distance, HANDLES, MIN_SIDE, resizeRect, sameRect, type Handle, type Rect } from "@/lib/report-canvas"

export type Box = { id: number; el: Element; rect: Rect; label: string; parent: number | null }
/** Lo que se ha hecho con un recuadro: dónde está ahora y si se quiere quitar. */
export type BoxChange = { rect: Rect; removed: boolean }
export type BoxChanges = Partial<Record<number, BoxChange>>

// ---------- Detectar los elementos ----------

const CANDIDATES = [
  "[data-slot]",
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "img",
  "video",
  "canvas",
  "h1",
  "h2",
  "h3",
  "h4",
  '[role="button"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="combobox"]',
].join(",")

/** Piezas del kit demasiado finas o que solo envuelven: celdas, separadores, iconos, capas de un diálogo… */
const SKIP_SLOT =
  /^(table-(row|cell|head|header|body|footer)|separator|kbd|tooltip(-.*)?|sidebar-(wrapper|inset|rail|gap|container|inner)|.*-(icon|indicator|viewport|portal|overlay|thumb|scrollbar|corner)|scroll-area|avatar-(image|fallback)|label)$/

/** Un elemento que ocupa casi toda la pantalla es un envoltorio, no un bloque que se pueda mover. */
const MAX_SCREEN_SHARE = 0.85
const MAX_BOXES = 500
const SAMPLE_POINTS: [number, number][] = [
  [0.5, 0.5],
  [0.2, 0.2],
  [0.8, 0.2],
  [0.2, 0.8],
  [0.8, 0.8],
]

const toRect = (r: DOMRect): Rect => ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) })

/** Se ve en algún punto: no lo tapa otra capa (un diálogo, una ficha, su velo). */
function onTop(el: Element, r: DOMRect, vw: number, vh: number) {
  const left = Math.max(r.left, 0)
  const top = Math.max(r.top, 0)
  const width = Math.min(r.right, vw) - left
  const height = Math.min(r.bottom, vh) - top
  return SAMPLE_POINTS.some(([fx, fy]) => {
    const hit = document.elementFromPoint(left + width * fx, top + height * fy)
    return !!hit && (hit === el || el.contains(hit))
  })
}

/**
 * Los elementos que se ven ahora en la pantalla, de mayor a menor (así los pequeños quedan encima y se pueden
 * coger). Un elemento que mide lo mismo que su contenedor no lleva recuadro propio.
 */
export function scanBoxes(): Box[] {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const kept = new Map<Element, Box>()
  // Lo que tapa otra capa (la página bajo un diálogo): sus hijos también están tapados y no se comprueban.
  const covered = new Set<Element>()
  const insideCovered = (el: Element) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (covered.has(p)) return true
    return false
  }
  for (const el of document.body.querySelectorAll(CANDIDATES)) {
    if (kept.size >= MAX_BOXES) break
    if (el.closest("[data-report-ui], [data-sonner-toaster]") || insideCovered(el)) continue
    const slot = el.getAttribute("data-slot")
    if (slot && SKIP_SLOT.test(slot)) continue
    const r = el.getBoundingClientRect()
    const visibleWidth = Math.min(r.right, vw) - Math.max(r.left, 0)
    const visibleHeight = Math.min(r.bottom, vh) - Math.max(r.top, 0)
    if (visibleWidth < MIN_SIDE || visibleHeight < MIN_SIDE) continue
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    if (!onTop(el, r, vw, vh)) {
      covered.add(el)
      continue
    }
    if (r.width * r.height > vw * vh * MAX_SCREEN_SHARE) continue
    let parent: Box | undefined
    for (let p = el.parentElement; p && !parent; p = p.parentElement) parent = kept.get(p)
    const rect = toRect(r)
    if (parent && sameRect(parent.rect, rect)) continue
    kept.set(el, { id: kept.size, el, rect, label: elementLabel(el), parent: parent?.id ?? null })
  }
  return [...kept.values()].sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height)
}

// ---------- Pintarlos y editarlos ----------

/** Dónde está el recuadro ahora y qué se ha hecho con él. */
export function boxState(box: Box, change: BoxChange | undefined) {
  const removed = !!change?.removed
  const rect = change && !removed ? change.rect : box.rect
  return { rect, removed, moved: !!change && !removed && !sameRect(rect, box.rect) }
}

const at = (r: Rect): React.CSSProperties => ({ left: r.x, top: r.y, width: r.width, height: r.height })

type Drag = { id: number; handle: Handle | "move"; x: number; y: number; start: Rect; began: boolean }

export function BoxesLayer({
  boxes,
  changes,
  selected,
  interactive,
  exporting,
  onSelect,
  onBegin,
  onChange,
  onToggleRemove,
  onReset,
  onPress,
}: {
  boxes: Box[]
  changes: BoxChanges
  selected: number | null
  /** En el modo «Recuadros»; si no, solo se ven los cambiados. */
  interactive: boolean
  /** Para la captura: solo lo cambiado, sin selección. */
  exporting: boolean
  onSelect: (id: number | null) => void
  /** Antes del primer cambio de un arrastre, para poder deshacerlo entero. */
  onBegin: () => void
  onChange: (id: number, change: BoxChange | null) => void
  onToggleRemove: (box: Box) => void
  onReset: (box: Box) => void
  /** Clic derecho: pulsar de verdad lo que hay en ese punto. */
  onPress: (x: number, y: number) => void
}) {
  const drag = React.useRef<Drag | null>(null)
  const changed = boxes.filter((b) => changes[b.id])
  const shown = interactive && !exporting ? boxes : changed
  const current = selected === null || exporting ? undefined : boxes.find((b) => b.id === selected)

  const startDrag = (e: React.PointerEvent, box: Box, handle: Handle | "move") => {
    if (e.button !== 0 || !interactive) return
    onSelect(box.id)
    const { rect, removed } = boxState(box, changes[box.id])
    if (removed) return
    drag.current = { id: box.id, handle, x: e.clientX, y: e.clientY, start: rect, began: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.began) {
      if (Math.hypot(dx, dy) < 3) return
      d.began = true
      onBegin()
    }
    onChange(d.id, { rect: resizeRect(d.start, d.handle, dx, dy), removed: false })
  }
  const endDrag = () => {
    const d = drag.current
    drag.current = null
    if (!d?.began) return
    // Si ha vuelto a su sitio, deja de contar como cambio.
    const box = boxes.find((b) => b.id === d.id)
    const change = changes[d.id]
    if (box && change && sameRect(change.rect, box.rect)) onChange(d.id, null)
  }

  return (
    <div
      className={cn("absolute inset-0", !interactive && "pointer-events-none")}
      onPointerDown={(e) => e.target === e.currentTarget && onSelect(null)}
    >
      {/* Dónde estaba lo que se ha movido, con una flecha hasta donde se quiere. */}
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        {changed.map((b) => {
          const { rect, moved } = boxState(b, changes[b.id])
          if (!moved) return null
          const from = center(b.rect)
          const to = center(rect)
          return (
            <g key={b.id}>
              <rect x={b.rect.x} y={b.rect.y} width={b.rect.width} height={b.rect.height} rx={3} className="fill-muted-foreground/10 stroke-muted-foreground" strokeWidth={1.5} strokeDasharray="5 4" />
              {distance(from, to) > 12 && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-brand" strokeWidth={2} strokeDasharray="6 5" />}
            </g>
          )
        })}
      </svg>

      {shown.map((b) => {
        const { rect, removed } = boxState(b, changes[b.id])
        const touched = !!changes[b.id]
        return (
          <div
            key={b.id}
            data-box={b.id}
            style={at(rect)}
            className={cn(
              "group absolute rounded-[3px]",
              interactive && !exporting ? "cursor-move" : "pointer-events-none",
              !touched && "border border-dashed border-brand/35 hover:border-solid hover:border-brand hover:bg-brand/5",
              touched && !removed && "border-2 border-brand bg-brand/10",
              removed && "border-2 border-danger bg-danger/10",
              selected === b.id && !exporting && "ring-2 ring-brand ring-offset-1 ring-offset-background",
            )}
            onPointerDown={(e) => startDrag(e, b, "move")}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (interactive) onPress(e.clientX, e.clientY)
            }}
          >
            {removed && (
              <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
                <path d="M0 0L100 100M100 0L0 100" className="stroke-danger" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              </svg>
            )}
            <span
              className={cn(
                "absolute left-0 w-max max-w-72 truncate rounded px-1.5 py-0.5 font-mono text-[11px] leading-4",
                rect.y < 22 ? "top-full mt-0.5" : "bottom-full mb-0.5",
                removed ? "bg-danger text-background" : "bg-brand text-brand-foreground",
                touched ? "block" : "hidden group-hover:block",
              )}
            >
              {removed ? `Quitar · ${b.label}` : b.label}
            </span>
          </div>
        )
      })}

      {current && <Selection box={current} change={changes[current.id]} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} />}
      {current && (
        <BoxActions
          box={current}
          change={changes[current.id]}
          onParent={current.parent === null ? undefined : () => onSelect(current.parent)}
          onToggleRemove={() => onToggleRemove(current)}
          onReset={() => onReset(current)}
        />
      )}
    </div>
  )
}

/** Los ocho tiradores del recuadro seleccionado. */
function Selection({
  box,
  change,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  box: Box
  change: BoxChange | undefined
  onPointerDown: (e: React.PointerEvent, box: Box, handle: Handle) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
}) {
  const { rect, removed } = boxState(box, change)
  if (removed) return null
  const cursor: Record<Handle, string> = {
    n: "cursor-ns-resize",
    s: "cursor-ns-resize",
    e: "cursor-ew-resize",
    w: "cursor-ew-resize",
    ne: "cursor-nesw-resize",
    sw: "cursor-nesw-resize",
    nw: "cursor-nwse-resize",
    se: "cursor-nwse-resize",
  }
  const position = (h: Handle) => ({
    left: rect.x + (h.includes("w") ? 0 : h.includes("e") ? rect.width : rect.width / 2),
    top: rect.y + (h.includes("n") ? 0 : h.includes("s") ? rect.height : rect.height / 2),
  })
  return HANDLES.map((h) => (
    <span
      key={h}
      aria-hidden
      style={position(h)}
      className={cn("absolute size-2.5 -translate-1/2 rounded-[2px] border border-brand bg-background", cursor[h])}
      onPointerDown={(e) => onPointerDown(e, box, h)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  ))
}

/** Barra pequeña sobre el recuadro seleccionado: subir al contenedor, quitar y deshacer sus cambios. */
function BoxActions({
  box,
  change,
  onParent,
  onToggleRemove,
  onReset,
}: {
  box: Box
  change: BoxChange | undefined
  onParent?: () => void
  onToggleRemove: () => void
  onReset: () => void
}) {
  const { rect, removed } = boxState(box, change)
  // Debajo del recuadro, que encima va su etiqueta (salvo pegado arriba, donde la etiqueta va debajo).
  const labelBelow = rect.y < 22
  const below = rect.y + rect.height + (labelBelow ? 30 : 8)
  return (
    <div
      className="absolute flex items-center gap-0.5 rounded-lg border bg-popover p-0.5 text-popover-foreground shadow-pop"
      style={{
        left: Math.min(Math.max(rect.x, 8), window.innerWidth - 300),
        top: below + 40 < window.innerHeight ? below : Math.max(rect.y - 64, 8),
      }}
    >
      {onParent && (
        <Button type="button" variant="ghost" size="xs" onClick={onParent} title="Seleccionar el bloque que lo contiene">
          <CornerLeftUpIcon /> Contenedor
        </Button>
      )}
      <Button type="button" variant="ghost" size="xs" onClick={onToggleRemove} className={cn(!removed && "text-danger")}>
        {removed ? <Undo2Icon /> : <Trash2Icon />} {removed ? "No quitar" : "Quitar"}
      </Button>
      {change && !removed && (
        <Button type="button" variant="ghost" size="xs" onClick={onReset}>
          <RotateCcwIcon /> Devolver a su sitio
        </Button>
      )}
    </div>
  )
}
