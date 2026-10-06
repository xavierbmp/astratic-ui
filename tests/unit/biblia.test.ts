import { describe, expect, it } from "vitest"
import { capituloRecomendado, progresoBiblia, vecinosDe } from "@/lib/influencer/biblia"
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
  it("el texto de la guía no lleva guiones largos ni punto y coma", () => {
    const textos = demoCapitulosBiblia.flatMap((c) => [c.titulo, c.resumen, ...c.secciones.flatMap((s) => s.bloques.flatMap((b) => ("items" in b ? b.items : [b.texto])))])
    expect(textos.filter((t) => /—|;/.test(t))).toEqual([])
  })
})
