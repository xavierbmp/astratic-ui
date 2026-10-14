import { describe, expect, it } from "vitest"
import { arrowHead, MIN_SIDE, rectBetween, resizeRect, sameRect, smoothPath } from "@/lib/report-canvas"

const caja = { x: 100, y: 100, width: 200, height: 80 }

describe("lienzo de reportes: recuadros", () => {
  it("mover desplaza sin cambiar el tamaño", () => {
    expect(resizeRect(caja, "move", 30, -20)).toEqual({ x: 130, y: 80, width: 200, height: 80 })
  })
  it("los tiradores de abajo a la derecha solo estiran", () => {
    expect(resizeRect(caja, "se", 50, 20)).toEqual({ x: 100, y: 100, width: 250, height: 100 })
  })
  it("los de arriba a la izquierda mueven la esquina y dejan fija la contraria", () => {
    expect(resizeRect(caja, "nw", 20, 10)).toEqual({ x: 120, y: 110, width: 180, height: 70 })
  })
  it("no baja del lado mínimo aunque se arrastre de más", () => {
    const r = resizeRect(caja, "w", 500, 0)
    expect(r.width).toBe(MIN_SIDE)
    expect(r.x + r.width).toBe(caja.x + caja.width)
  })
  it("un tirador de lado solo cambia ese lado", () => {
    expect(resizeRect(caja, "n", 999, -10)).toEqual({ x: 100, y: 90, width: 200, height: 90 })
  })
  it("da por igual un recuadro que solo difiere en un par de píxeles", () => {
    expect(sameRect(caja, { ...caja, x: 102 })).toBe(true)
    expect(sameRect(caja, { ...caja, x: 104 })).toBe(false)
  })
})

describe("lienzo de reportes: dibujo", () => {
  it("el rectángulo sale bien aunque se dibuje hacia arriba y a la izquierda", () => {
    expect(rectBetween({ x: 50, y: 60 }, { x: 10, y: 20 })).toEqual({ x: 10, y: 20, width: 40, height: 40 })
  })
  it("la punta de la flecha empieza en el final y se abre hacia atrás", () => {
    const [punta, ...lados] = arrowHead({ x: 0, y: 0 }, { x: 100, y: 0 }).split(" ")
    expect(punta).toBe("100,0")
    for (const lado of lados) expect(Number(lado.split(",")[0])).toBeLessThan(100)
  })
  it("el trazo del lápiz empieza en el primer punto y acaba en el último", () => {
    const d = smoothPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
    ])
    expect(d.startsWith("M0 0")).toBe(true)
    expect(d.endsWith("L20 0")).toBe(true)
    expect(smoothPath([])).toBe("")
  })
})
