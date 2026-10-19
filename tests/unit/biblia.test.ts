import { describe, expect, it } from "vitest"
import { buscarLecciones, capituloRecomendado, progresoBiblia, textosDeBloque, vecinosDe } from "@/lib/influencer/biblia"
import { demoCapitulosBiblia, demoLecturasBiblia } from "@/lib/influencer/demo-biblia"

describe("biblia", () => {
  it("cuenta lo leído y los esenciales que faltan", () => {
    const p = progresoBiblia(demoCapitulosBiblia, demoLecturasBiblia)
    expect(p.leidos).toBe(3)
    expect(p.esencialesPendientes.every((c) => c.esencial && !demoLecturasBiblia[c.id])).toBe(true)
  })
  it("recomienda primero un esencial sin leer", () => {
    expect(capituloRecomendado(demoCapitulosBiblia, demoLecturasBiblia)?.esencial).toBe(true)
    expect(capituloRecomendado(demoCapitulosBiblia, Object.fromEntries(demoCapitulosBiblia.map((c) => [c.id, "2026-10-01"])))).toBeNull()
  })
  it("da el capítulo anterior y el siguiente", () => {
    const { anterior, siguiente, numero } = vecinosDe(demoCapitulosBiblia, demoCapitulosBiblia[1].id)
    expect([anterior?.id, siguiente?.id, numero]).toEqual([demoCapitulosBiblia[0].id, demoCapitulosBiblia[2].id, 2])
  })
  it("busca por palabras sueltas, sin acentos, y pone delante lo que sale en el título", () => {
    const [primera] = buscarLecciones(demoCapitulosBiblia, demoCapitulosBiblia[2].titulo.split(" ").slice(0, 2).join(" ").toUpperCase())
    expect(primera?.id).toBe(demoCapitulosBiblia[2].id)
    expect(buscarLecciones(demoCapitulosBiblia, "")).toHaveLength(demoCapitulosBiblia.length)
    expect(buscarLecciones(demoCapitulosBiblia, "zzzqqq")).toEqual([])
  })
  it("el texto de la guía no lleva guiones largos ni punto y coma", () => {
    const textos = demoCapitulosBiblia.flatMap((c) => [c.titulo, c.resumen, ...c.secciones.flatMap((s) => s.bloques.flatMap(textosDeBloque))])
    expect(textos.filter((t) => /—|;/.test(t))).toEqual([])
  })
})
