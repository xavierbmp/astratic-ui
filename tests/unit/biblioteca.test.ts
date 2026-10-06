import { describe, expect, it } from "vitest"
import { filasDePiezas, ordenarPiezas, recordatorioDeRevision } from "@/lib/influencer/biblioteca"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoMarcas } from "@/lib/influencer/demo-data"

const HOY = "2026-10-06"
const filas = filasDePiezas(demoCollabs, HOY).sort(ordenarPiezas)

describe("biblioteca de contenidos", () => {
  it("una fila por pieza, con lo que le toca a ella primero y lo publicado al final", () => {
    expect(filas.length).toBe(demoCollabs.filter((c) => c.estado !== "cancelada").reduce((a, c) => a + c.piezas.length, 0))
    const grupos = filas.map((f) => f.grupo)
    expect(grupos.indexOf("publicado")).toBeGreaterThan(grupos.lastIndexOf("te-toca"))
  })
  it("lo que está en revisión espera a la marca, con los días que lleva", () => {
    const enRevision = filas.filter((f) => f.turno === "marca")
    expect(enRevision.length).toBeGreaterThan(0)
    expect(enRevision.every((f) => f.esperando >= 0)).toBe(true)
  })
  it("el recordatorio agrupa por marca y lleva un enlace por versión", () => {
    const texto = recordatorioDeRevision({ filas, marcas: demoMarcas, origen: "https://ws.test" })
    expect(texto).toContain("https://ws.test/revisar/")
    expect(recordatorioDeRevision({ filas: filas.filter((f) => f.turno !== "marca"), marcas: demoMarcas, origen: "x" })).toBeNull()
  })
})
