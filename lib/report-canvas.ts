// Geometría del lienzo de reportes (`ReportCanvas`): mover y estirar recuadros y dibujar flechas y trazos.
// Puro: se prueba sin navegador.

export type Rect = { x: number; y: number; width: number; height: number }
export type Point = { x: number; y: number }

/** Tiradores de un recuadro seleccionado, por los puntos cardinales. */
export type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"
export const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]

/** Lado mínimo de un recuadro, al detectar elementos y al estirarlos. */
export const MIN_SIDE = 8

/** Mismo sitio y tamaño, con un margen de unos píxeles (redondeos, bordes). */
export function sameRect(a: Rect, b: Rect, tolerance = 2) {
  return (
    Math.abs(a.x - b.x) <= tolerance &&
    Math.abs(a.y - b.y) <= tolerance &&
    Math.abs(a.width - b.width) <= tolerance &&
    Math.abs(a.height - b.height) <= tolerance
  )
}

/** El recuadro tras arrastrarlo (`move`) o tirar de uno de sus tiradores, sin bajar del lado mínimo. */
export function resizeRect(r: Rect, handle: Handle | "move", dx: number, dy: number): Rect {
  if (handle === "move") return { ...r, x: r.x + dx, y: r.y + dy }
  let { x, y, width, height } = r
  if (handle.includes("e")) width = Math.max(MIN_SIDE, width + dx)
  if (handle.includes("s")) height = Math.max(MIN_SIDE, height + dy)
  if (handle.includes("w")) {
    const w = Math.max(MIN_SIDE, width - dx)
    x += width - w
    width = w
  }
  if (handle.includes("n")) {
    const h = Math.max(MIN_SIDE, height - dy)
    y += height - h
    height = h
  }
  return { x, y, width, height }
}

/** El rectángulo entre dos esquinas cualesquiera (se puede dibujar hacia arriba o a la izquierda). */
export function rectBetween(a: Point, b: Point): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

export const center = (r: Rect): Point => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })

export const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)

/** Los tres vértices de la punta de una flecha que acaba en `to`, como `points` de un `<polygon>`. */
export function arrowHead(from: Point, to: Point, size = 14): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const side = (turn: number) => {
    const a = angle + Math.PI + turn
    return `${round(to.x + size * Math.cos(a))},${round(to.y + size * Math.sin(a))}`
  }
  return `${round(to.x)},${round(to.y)} ${side(Math.PI / 7)} ${side(-Math.PI / 7)}`
}

/** El trazo del lápiz suavizado: curvas por los puntos medios en vez de una línea quebrada. */
export function smoothPath(points: Point[]): string {
  const [first, ...rest] = points
  if (!first) return ""
  if (!rest.length) return `M${round(first.x)} ${round(first.y)}l0 0`
  let d = `M${round(first.x)} ${round(first.y)}`
  rest.forEach((p, i) => {
    const next = rest[i + 1]
    if (!next) {
      d += ` L${round(p.x)} ${round(p.y)}`
      return
    }
    d += ` Q${round(p.x)} ${round(p.y)} ${round((p.x + next.x) / 2)} ${round((p.y + next.y) / 2)}`
  })
  return d
}

const round = (n: number) => Math.round(n * 10) / 10
