import { describe, expect, it } from "vitest"
import { AJUSTES_COLLABS_DE_SERIE, piezaDeFormato } from "@/lib/influencer/ajustes-collabs"
import { collabDePropuesta, propuestaDeAlta, valoresAltaDePropuesta, type ValoresAlta } from "@/lib/influencer/alta-collab"
import { demoMarcas } from "@/lib/influencer/demo-data"
import type { FormatoPieza } from "@/lib/influencer/modelo"

const hoy = "2026-10-16T10:00"
const marca = demoMarcas[0]
const formato = (id: string): FormatoPieza => {
  const f = AJUSTES_COLLABS_DE_SERIE.formatos.find((x) => x.id === id)
  if (!f) throw new Error(`Sin formato ${id}`)
  return f
}
const ctx = { campana: "Otoño", diasGuion: 7, hoy }

const alta: ValoresAlta = {
  modo: "yo",
  campana: "Otoño",
  plataformas: ["instagram", "podcast"],
  brief: "Enseñar la textura",
  briefAdjunto: null,
  coverUrl: "https://ejemplo.com/portada.jpg",
  importe: 900,
  desde: "2026-10-20",
  hasta: "2026-10-31",
  piezas: [piezaDeFormato(formato("reel"), "2026-10-31", ctx), piezaDeFormato(formato("story"), "2026-10-30", ctx), piezaDeFormato(formato("story"), "2026-10-31", ctx), piezaDeFormato(formato("podcast"), "2026-10-25", ctx)],
  condiciones: [],
  para: { nombre: "", email: "" },
  campos: [],
  mensaje: "",
}

describe("propuesta con el formulario de collab", () => {
  it("guarda lo de la propuesta y el resto en su borrador", () => {
    const p = propuestaDeAlta(alta, { marca, origen: "marca", hoy })
    expect(p).toMatchObject({ marcaId: marca.id, campana: "Otoño", estado: "nueva", ofrecen: 900, desde: "2026-10-20", hasta: "2026-10-31" })
    // Los formatos de siempre se cuentan; el podcast queda solo en el borrador.
    expect(p.piezas).toEqual([
      { formato: "reel", cantidad: 1 },
      { formato: "story", cantidad: 2 },
    ])
    expect(p.borrador?.piezas).toHaveLength(4)
    expect(p.borrador?.brief).toBe("Enseñar la textura")
  })

  it("al editarla conserva su estado, su origen y su fecha de alta", () => {
    const antes = { ...propuestaDeAlta(alta, { marca, origen: "marca", hoy: "2026-10-01T09:00" }), estado: "negociando" as const }
    const p = propuestaDeAlta({ ...alta, campana: "Otoño bis" }, { marca, origen: "propia", hoy, antes })
    expect(p).toMatchObject({ id: antes.id, estado: "negociando", origen: "marca", creadaEl: "2026-10-01T09:00", campana: "Otoño bis" })
  })

  it("al ganarla, la collab nace con el borrador entero", () => {
    const p = propuestaDeAlta(alta, { marca, origen: "marca", hoy })
    expect(valoresAltaDePropuesta(p, AJUSTES_COLLABS_DE_SERIE, hoy)).toMatchObject({ plataformas: ["instagram", "podcast"], brief: "Enseñar la textura", importe: 900, coverUrl: alta.coverUrl })
    const collab = collabDePropuesta(p, { marca, ajustes: AJUSTES_COLLABS_DE_SERIE, hoy })
    expect(collab.piezas).toHaveLength(4)
    expect(collab.importe).toBe(900)
    expect(collab.coverUrl).toBe(alta.coverUrl)
  })
})
