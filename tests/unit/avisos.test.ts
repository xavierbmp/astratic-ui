import { describe, expect, it } from "vitest"
import type { Aviso } from "@/lib/influencer/modelo"
import { agruparAvisos, cuentaPorTipo } from "@/lib/influencer/avisos"

const aviso = (id: string, el: string, leido = true): Aviso => ({ id, tipo: "cobro", titulo: id, el, leido })

describe("avisos", () => {
  it("agrupa por hoy, ayer, esta semana y antes, del más nuevo al más viejo", () => {
    const grupos = agruparAvisos([aviso("a", "2026-09-01T10:00:00"), aviso("b", "2026-10-06T09:00:00"), aviso("c", "2026-10-05T09:00:00"), aviso("d", "2026-10-02T09:00:00"), aviso("e", "2026-10-06T11:00:00")], "2026-10-06T12:00:00")
    expect(grupos.map((g) => [g.id, g.avisos.map((a) => a.id).join("")])).toEqual([["hoy", "eb"], ["ayer", "c"], ["semana", "d"], ["antes", "a"]])
  })
  it("cuenta por tipo los que hay y los sin leer", () => {
    expect(cuentaPorTipo([aviso("a", "2026-10-01", false), aviso("b", "2026-10-01")]).cobro).toEqual({ total: 2, sinLeer: 1 })
  })
})
