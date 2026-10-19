import { describe, expect, it } from "vitest"
import { resultadosGenerales } from "@/lib/influencer/informe"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoInformes } from "@/lib/influencer/demo-documentos"
import type { Resultado } from "@/lib/influencer/modelo"

const resultados: Resultado[] = demoInformes.flatMap((i) => i.resultados)

describe("resultados de todas las collabs", () => {
  it("una fila por pieza publicada, con su último resultado", () => {
    const { filas, totales } = resultadosGenerales(demoCollabs, resultados, {})
    expect(filas.length).toBe(totales.publicadas)
    expect(filas.every((f) => f.pieza.publicada)).toBe(true)
    expect(totales.medidas).toBe(filas.filter((f) => f.resultado).length)
  })
  it("filtra por marca, collab y tipo de pieza", () => {
    const todas = resultadosGenerales(demoCollabs, resultados, {}).filas
    const marcaId = todas[0].collab.marcaId
    expect(resultadosGenerales(demoCollabs, resultados, { marcaId }).filas.every((f) => f.collab.marcaId === marcaId)).toBe(true)
    const collabId = todas[0].collab.id
    expect(resultadosGenerales(demoCollabs, resultados, { collabId }).filas.every((f) => f.collab.id === collabId)).toBe(true)
    expect(resultadosGenerales(demoCollabs, resultados, { tipo: "foto" }).filas.every((f) => f.pieza.tipo === "foto")).toBe(true)
  })
  it("el CPM es el coste de las piezas medidas sobre sus visualizaciones", () => {
    const { filas, totales } = resultadosGenerales(demoCollabs, resultados, {})
    const conVistas = filas.filter((f) => (f.metricas.visualizaciones ?? 0) > 0)
    const vistas = conVistas.reduce((a, f) => a + (f.metricas.visualizaciones ?? 0), 0)
    if (vistas === 0) return expect(totales.cpm).toBeNull()
    expect(totales.cpm).toBeCloseTo((conVistas.reduce((a, f) => a + f.coste, 0) / vistas) * 1000)
  })
})
