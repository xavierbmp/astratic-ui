"use client"

// Capa de dibujo del lienzo (`ReportCanvas`): flechas, lápiz, rectángulos y textos encima de la pantalla.

import * as React from "react"
import { cn } from "cn"
import { arrowHead, distance, rectBetween, smoothPath, type Point } from "@/lib/report-canvas"

export type Tool = "arrow" | "pen" | "rect" | "text"
export type MarkColor = "danger" | "brand" | "warning" | "success"

export const MARK_COLORS: { value: MarkColor; label: string }[] = [
  { value: "danger", label: "Rojo" },
  { value: "brand", label: "Azul" },
  { value: "warning", label: "Ámbar" },
  { value: "success", label: "Verde" },
]

export type Mark =
  | { kind: "pen"; color: MarkColor; points: Point[] }
  | { kind: "arrow" | "rect"; color: MarkColor; from: Point; to: Point }
  | { kind: "text"; color: MarkColor; at: Point; text: string }

/** El texto que se está escribiendo, antes de fijarlo. */
export type Typing = { at: Point; value: string; color: MarkColor }

const STROKE = 3
const MIN_LENGTH = 6
const paint = (c: MarkColor) => `var(--${c})`

function MarkShape({ mark }: { mark: Mark }) {
  const color = paint(mark.color)
  switch (mark.kind) {
    case "pen":
      return <path d={smoothPath(mark.points)} fill="none" style={{ stroke: color }} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    case "arrow": {
      // La línea acaba antes de la punta para que su extremo redondo no asome.
      const length = distance(mark.from, mark.to)
      const cut = Math.min(10, length / 2) / (length || 1)
      const end = { x: mark.to.x - (mark.to.x - mark.from.x) * cut, y: mark.to.y - (mark.to.y - mark.from.y) * cut }
      return (
        <g>
          <line x1={mark.from.x} y1={mark.from.y} x2={end.x} y2={end.y} style={{ stroke: color }} strokeWidth={STROKE} strokeLinecap="round" />
          <polygon points={arrowHead(mark.from, mark.to)} style={{ fill: color, stroke: color }} strokeWidth={2} strokeLinejoin="round" />
        </g>
      )
    }
    case "rect": {
      const r = rectBetween(mark.from, mark.to)
      return <rect x={r.x} y={r.y} width={r.width} height={r.height} rx={4} fill="none" style={{ stroke: color }} strokeWidth={STROKE} />
    }
    case "text":
      // Con un halo del color del fondo, para que se lea encima de cualquier cosa.
      return (
        <text
          x={mark.at.x}
          y={mark.at.y}
          dominantBaseline="hanging"
          fontSize={16}
          fontWeight={600}
          strokeWidth={4}
          strokeLinejoin="round"
          style={{ fill: color, stroke: "var(--background)", paintOrder: "stroke" }}
        >
          {mark.text}
        </text>
      )
  }
}

const worthKeeping = (m: Mark) => (m.kind === "pen" ? m.points.length > 1 : m.kind === "text" ? !!m.text : distance(m.from, m.to) >= MIN_LENGTH)

export function DrawLayer({
  marks,
  tool,
  color,
  active,
  typing,
  onAdd,
  onTextAt,
  onTyping,
}: {
  marks: Mark[]
  tool: Tool
  color: MarkColor
  /** En el modo «Dibujar»; si no, solo se ve lo dibujado. */
  active: boolean
  typing: Typing | null
  onAdd: (mark: Mark) => void
  /** Clic con la herramienta de texto: empezar a escribir ahí. */
  onTextAt: (at: Point) => void
  onTyping: (value: string) => void
}) {
  const [draft, setDraft] = React.useState<Mark | null>(null)

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!active || e.button !== 0) return
    const at = { x: e.clientX, y: e.clientY }
    if (tool === "text") return onTextAt(at)
    e.currentTarget.setPointerCapture(e.pointerId)
    setDraft(tool === "pen" ? { kind: "pen", color, points: [at] } : { kind: tool, color, from: at, to: at })
  }
  const move = (e: React.PointerEvent) => {
    const at = { x: e.clientX, y: e.clientY }
    setDraft((d) => {
      if (!d || d.kind === "text") return d
      if (d.kind !== "pen") return { ...d, to: at }
      const last = d.points.at(-1)
      return last && distance(last, at) < 2 ? d : { ...d, points: [...d.points, at] }
    })
  }
  const up = () => {
    if (draft && worthKeeping(draft)) onAdd(draft)
    setDraft(null)
  }

  return (
    <>
      <svg
        className={cn("absolute inset-0 size-full", active ? "cursor-crosshair" : "pointer-events-none", active && tool === "text" && "cursor-text")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-hidden
      >
        {marks.map((m, i) => (
          <MarkShape key={i} mark={m} />
        ))}
        {draft && <MarkShape mark={draft} />}
      </svg>
      {typing && (
        <input
          data-canvas-text
          autoFocus
          value={typing.value}
          onChange={(e) => onTyping(e.target.value)}
          placeholder="Escribe y pulsa Enter"
          aria-label="Texto sobre la pantalla"
          style={{ left: typing.at.x, top: typing.at.y - 3, color: paint(typing.color) }}
          className="absolute w-64 border-0 border-b-2 border-dashed border-current bg-background/80 px-0.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
        />
      )}
    </>
  )
}
