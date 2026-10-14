"use client"

// El lienzo de `ReportButton`: la pantalla actual con un recuadro por cada elemento, que se mueven, se estiran
// o se quitan sin tocar la página, y una capa para dibujar encima. Sirve para enseñar cómo se quiere algo; al
// guardar, la captura con lo marcado y la lista de cambios viajan con el reporte. Se carga solo al abrirlo.
//
// Mientras está abierto, la página no se entera de nada: ni teclas, ni foco, ni clics (una ficha o un diálogo
// abiertos debajo no se cierran). Los clics se cortan en la raíz con `stopImmediatePropagation`, que corre
// dentro del listener de React en `document`, antes que los de Radix; por eso las piezas del lienzo no deben
// llamar a `stopPropagation` en pointerdown, mousedown ni click.

import * as React from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { cn } from "cn"
import { canvasToDataUrl, type ReportAttachment, type ReportCanvasData } from "@/components/app/report-attachments"
import { BoxesLayer, boxState, scanBoxes, type Box, type BoxChange, type BoxChanges } from "@/components/app/report-canvas-boxes"
import { DrawLayer, type Mark, type MarkColor, type Tool, type Typing } from "@/components/app/report-canvas-draw"
import {
  CanvasBusyBar,
  CanvasConfirmBar,
  CanvasToolbar,
  CanvasUsingBar,
  type CanvasConfirm,
  type CanvasMode,
} from "@/components/app/report-canvas-toolbar"
import { describeElement } from "@/components/app/report-context"
import { resizeRect, type Point } from "@/lib/report-canvas"

// ---------- Lo marcado, con su historial para deshacer ----------

type Sketch = { changes: BoxChanges; marks: Mark[] }
type History = { sketch: Sketch; past: Sketch[] }
type Action =
  | { type: "begin" }
  | { type: "change"; id: number; change: BoxChange | null; checkpoint?: boolean }
  | { type: "mark"; mark: Mark }
  | { type: "undo" }
  | { type: "reset" }

const EMPTY: History = { sketch: { changes: {}, marks: [] }, past: [] }

function withChange(changes: BoxChanges, id: number, change: BoxChange | null): BoxChanges {
  const rest = Object.fromEntries(Object.entries(changes).filter(([k]) => Number(k) !== id))
  return change ? { ...rest, [id]: change } : rest
}

function reducer(h: History, a: Action): History {
  switch (a.type) {
    case "begin":
      return { ...h, past: [...h.past, h.sketch] }
    case "change": {
      const sketch = { ...h.sketch, changes: withChange(h.sketch.changes, a.id, a.change) }
      return { sketch, past: a.checkpoint ? [...h.past, h.sketch] : h.past }
    }
    case "mark":
      return { sketch: { ...h.sketch, marks: [...h.sketch.marks, a.mark] }, past: [...h.past, h.sketch] }
    case "undo": {
      const prev = h.past.at(-1)
      return prev ? { sketch: prev, past: h.past.slice(0, -1) } : h
    }
    case "reset":
      return EMPTY
  }
}

// ---------- Esperar a que la pantalla esté quieta ----------

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
/** El siguiente fotograma; si el navegador los frena (pestaña en segundo plano), no se espera más de 50 ms. */
const nextFrame = () => Promise.race([new Promise<void>((r) => requestAnimationFrame(() => r())), sleep(50)])

/** Sin el diálogo del reporte cerrándose ni animaciones a medias (una ficha que entra, un menú que se abre). */
function settled() {
  if (document.querySelector('[data-report-ui][role="dialog"]')) return false
  return document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
}

async function waitUntilSettled(maxMs = 1500) {
  const start = performance.now()
  while (!settled() && performance.now() - start < maxMs) await sleep(50)
  await nextFrame()
}

/** Pulsa de verdad lo que hay en ese punto, con la secuencia completa (los menús de Radix se abren al bajar). */
function pressAt(x: number, y: number) {
  const el = document.elementFromPoint(x, y)
  if (!el) return
  const base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, view: window }
  const pointer = { ...base, pointerId: 1, pointerType: "mouse", isPrimary: true }
  el.dispatchEvent(new PointerEvent("pointerdown", { ...pointer, buttons: 1 }))
  el.dispatchEvent(new MouseEvent("mousedown", { ...base, buttons: 1 }))
  if (el instanceof HTMLElement) el.focus()
  el.dispatchEvent(new PointerEvent("pointerup", pointer))
  el.dispatchEvent(new MouseEvent("mouseup", base))
  el.dispatchEvent(new MouseEvent("click", base))
}

/** Captura de lo que se ve, con lo marcado y sin las barras del lienzo. */
async function captureScreen(): Promise<string> {
  const { domToCanvas } = await import("modern-screenshot")
  const canvas = await domToCanvas(document.body, {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    filter: (node) => !(node instanceof Element && node.hasAttribute("data-canvas-chrome")),
    timeout: 8000,
  })
  return canvasToDataUrl(canvas)
}

// ---------- El lienzo ----------

type Phase = "waiting" | "editing" | "using" | "saving"

const ours = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-report-ui]")

export default function ReportCanvas({ name, onSave, onCancel }: { name: string; onSave: (attachment: ReportAttachment) => void; onCancel: () => void }) {
  const [phase, setPhase] = React.useState<Phase>("waiting")
  const [boxes, setBoxes] = React.useState<Box[]>([])
  const [{ sketch, past }, dispatch] = React.useReducer(reducer, EMPTY)
  const [mode, setMode] = React.useState<CanvasMode>("boxes")
  const [tool, setTool] = React.useState<Tool>("arrow")
  const [color, setColor] = React.useState<MarkColor>("danger")
  const [selected, setSelected] = React.useState<number | null>(null)
  const [typing, setTyping] = React.useState<Typing | null>(null)
  const [confirm, setConfirm] = React.useState<CanvasConfirm | null>(null)
  const root = React.useRef<HTMLDivElement>(null)
  const scanToken = React.useRef(0)
  const mounted = React.useRef(false)
  const dirty = Object.keys(sketch.changes).length > 0 || sketch.marks.length > 0

  /** Busca los elementos de la pantalla cuando está quieta. `before` la cambia antes (pulsar algo de verdad). */
  const scan = React.useCallback(async (before?: () => void) => {
    const token = ++scanToken.current
    await nextFrame()
    await nextFrame()
    before?.()
    await waitUntilSettled()
    if (token !== scanToken.current || !mounted.current) return
    // Un diálogo abierto encima esconde el resto a los lectores de pantalla, lienzo incluido: el lienzo se queda visible.
    root.current?.removeAttribute("aria-hidden")
    setBoxes(scanBoxes())
    setPhase("editing")
  }, [])

  /** Vuelve a empezar con lo marcado en blanco: otra pantalla, otros elementos. */
  const rescan = (before?: () => void) => {
    setPhase("waiting")
    setSelected(null)
    setTyping(null)
    setConfirm(null)
    dispatch({ type: "reset" })
    void scan(before)
  }

  React.useEffect(() => {
    mounted.current = true
    void scan()
    return () => {
      mounted.current = false
    }
  }, [scan])

  const commitText = React.useCallback(() => {
    if (typing?.value.trim()) dispatch({ type: "mark", mark: { kind: "text", color: typing.color, at: typing.at, text: typing.value.trim() } })
    setTyping(null)
  }, [typing])

  const toggleRemove = React.useCallback(
    (box: Box) => dispatch({ type: "change", id: box.id, change: sketch.changes[box.id]?.removed ? null : { rect: box.rect, removed: true }, checkpoint: true }),
    [sketch.changes],
  )
  const reset = React.useCallback((box: Box) => dispatch({ type: "change", id: box.id, change: null, checkpoint: true }), [])

  const leave = () => (dirty ? setConfirm({ kind: "cancel" }) : onCancel())
  const use = () => {
    if (dirty) return setConfirm({ kind: "use" })
    setPhase("using")
  }
  const press = (x: number, y: number) => (dirty ? setConfirm({ kind: "press", x, y }) : rescan(() => pressAt(x, y)))
  const confirmed = () => {
    if (!confirm) return
    setConfirm(null)
    if (confirm.kind === "cancel") return onCancel()
    if (confirm.kind === "press") return rescan(() => pressAt(confirm.x, confirm.y))
    dispatch({ type: "reset" })
    setSelected(null)
    setPhase("using")
  }

  const save = async () => {
    // El texto que se estaba escribiendo cuenta: se fija antes de capturar.
    const pending: Mark[] = typing?.value.trim() ? [{ kind: "text", color: typing.color, at: typing.at, text: typing.value.trim() }] : []
    commitText()
    setSelected(null)
    setPhase("saving")
    await nextFrame()
    await nextFrame()
    try {
      const dataUrl = await captureScreen()
      onSave({ kind: "canvas", name, dataUrl, canvas: canvasData(boxes, { ...sketch, marks: [...sketch.marks, ...pending] }) })
    } catch (e) {
      console.error("[reportes] no se ha podido capturar la pantalla", e)
      toast.error("No se ha podido capturar la pantalla. Vuelve a intentarlo.")
      setPhase("editing")
    }
  }

  // Teclado: mientras se marca, la página no ve ninguna tecla (ni Esc, que cerraría la ficha de debajo).
  const onKey = (e: KeyboardEvent) => {
    if (typing) {
      if (e.key === "Enter") commitText()
      else if (e.key === "Escape") setTyping(null)
      else return
      return e.preventDefault()
    }
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault()
      return dispatch({ type: "undo" })
    }
    if (mod && e.key === "Enter") {
      e.preventDefault()
      return void save()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      if (confirm) return setConfirm(null)
      if (selected !== null) return setSelected(null)
      return leave()
    }
    const box = mode === "boxes" && selected !== null ? boxes.find((b) => b.id === selected) : undefined
    if (!box) return
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault()
      return toggleRemove(box)
    }
    const step = e.shiftKey ? 10 : 1
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const delta = arrows[e.key]
    const { rect, removed } = boxState(box, sketch.changes[box.id])
    if (!delta || removed) return
    e.preventDefault()
    dispatch({ type: "change", id: box.id, change: { rect: resizeRect(rect, "move", ...delta), removed: false }, checkpoint: true })
  }
  const keyHandler = React.useRef(onKey)
  React.useEffect(() => {
    keyHandler.current = onKey
  })

  const phaseRef = React.useRef(phase)
  React.useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  React.useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (phaseRef.current === "using") return
      e.stopPropagation()
      if (e.type === "keydown" && phaseRef.current === "editing") keyHandler.current(e)
    }
    // El foco que entra o sale del lienzo no lo ven las trampas de foco de una ficha o un diálogo abiertos.
    const focus = (e: FocusEvent) => {
      if (ours(e.target) || ours(e.relatedTarget)) e.stopImmediatePropagation()
    }
    const wheel = (e: WheelEvent) => {
      if (phaseRef.current !== "using" && ours(e.target)) e.preventDefault()
    }
    const keyEvents = ["keydown", "keyup", "keypress"] as const
    keyEvents.forEach((t) => window.addEventListener(t, keys, true))
    window.addEventListener("focusin", focus, true)
    window.addEventListener("focusout", focus, true)
    window.addEventListener("wheel", wheel, { capture: true, passive: false })
    return () => {
      keyEvents.forEach((t) => window.removeEventListener(t, keys, true))
      window.removeEventListener("focusin", focus, true)
      window.removeEventListener("focusout", focus, true)
      window.removeEventListener("wheel", wheel, true)
    }
  }, [])

  const stop = (e: React.SyntheticEvent) => e.nativeEvent.stopImmediatePropagation()
  const showing = phase === "editing" || phase === "saving"

  return createPortal(
    <div
      ref={root}
      data-report-ui
      className={cn("fixed inset-0 z-[100] overflow-hidden select-none", phase === "editing" ? "pointer-events-auto" : "pointer-events-none")}
      onPointerDown={(e) => {
        stop(e)
        if (typing && !(e.target instanceof Element && e.target.closest("[data-canvas-text]"))) commitText()
      }}
      onPointerUp={stop}
      onMouseDown={stop}
      onMouseUp={stop}
      onClick={stop}
      onTouchStart={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showing && (
        <>
          <div data-canvas-chrome aria-hidden className="pointer-events-none absolute inset-0 ring-2 ring-brand/60 ring-inset" />
          <BoxesLayer
            boxes={boxes}
            changes={sketch.changes}
            selected={selected}
            interactive={mode === "boxes" && phase === "editing"}
            exporting={phase === "saving"}
            onSelect={setSelected}
            onBegin={() => dispatch({ type: "begin" })}
            onChange={(id, change) => dispatch({ type: "change", id, change })}
            onToggleRemove={toggleRemove}
            onReset={reset}
            onPress={press}
          />
          <DrawLayer
            marks={sketch.marks}
            tool={tool}
            color={color}
            active={mode === "draw" && phase === "editing"}
            typing={phase === "editing" ? typing : null}
            onAdd={(mark) => dispatch({ type: "mark", mark })}
            onTextAt={(at: Point) => {
              commitText()
              setTyping({ at, value: "", color })
            }}
            onTyping={(value) => setTyping((t) => t && { ...t, value })}
          />
        </>
      )}
      {phase === "editing" &&
        (confirm ? (
          <CanvasConfirmBar confirm={confirm} onConfirm={confirmed} onDismiss={() => setConfirm(null)} />
        ) : (
          <CanvasToolbar
            mode={mode}
            tool={tool}
            color={color}
            canUndo={past.length > 0}
            onMode={(m) => {
              commitText()
              setSelected(null)
              setMode(m)
            }}
            onTool={(t) => {
              commitText()
              setTool(t)
            }}
            onColor={setColor}
            onUndo={() => dispatch({ type: "undo" })}
            onUse={use}
            onCancel={leave}
            onSave={() => void save()}
          />
        ))}
      {phase === "using" && <CanvasUsingBar onBack={() => rescan()} />}
      {(phase === "waiting" || phase === "saving") && <CanvasBusyBar saving={phase === "saving"} />}
    </div>,
    document.body,
  )
}

/** Lo que viaja con la captura: qué se ha movido, estirado o quitado, y los textos escritos encima. */
function canvasData(boxes: Box[], sketch: Sketch): ReportCanvasData {
  return {
    url: location.pathname + location.search,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    changes: boxes.flatMap((b) => {
      const change = sketch.changes[b.id]
      if (!change) return []
      const { rect, removed } = boxState(b, change)
      const { selector, path, tag, text } = describeElement(b.el)
      return [{ element: { selector, path, tag, text }, from: b.rect, to: removed ? null : rect }]
    }),
    notes: sketch.marks.flatMap((m) => (m.kind === "text" ? [m.text] : [])),
    marks: sketch.marks.filter((m) => m.kind !== "text").length,
  }
}
