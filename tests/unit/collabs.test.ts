import { describe, expect, it } from "vitest"
import type { Collab, Pieza } from "@/lib/influencer/modelo"
import { collabsPorUrgencia, esCollabNueva, hitosPendientes, siguienteHito } from "@/lib/influencer/collabs"

const HOY = "2026-10-14"

const pieza = (datos: Partial<Pieza>): Pieza => ({
  id: "p",
  collabId: "c",
  tipo: "texto",
  unidades: 1,
  titulo: "Post",
  publicacion: "2026-10-20",
  estado: "borrador",
  guion: [],
  media: [],
  rondaActual: 1,
  ...datos,
})

const collab = (datos: Partial<Collab>): Collab => ({
  id: "c",
  marcaId: "lumea",
  campana: "Campaña",
  tipo: "directa",
  estado: "en-curso",
  importe: 1000,
  tint: "rose",
  desde: "2026-10-01",
  hasta: "2026-10-30",
  brief: { texto: "", menciones: [], hashtags: [], rondasIncluidas: 2, contacto: { nombre: "Ana", email: "ana@example.com" }, condicionesPago: "30 días tras publicar" },
  piezas: [],
  cobro: { estado: "por-facturar" },
  plazos: [],
  creadaEl: "2026-09-01T10:00:00",
  ...datos,
})

describe("hitos pendientes", () => {
  it("todos los de sus piezas sin hacer, del más cercano al más lejano", () => {
    const c = collab({ piezas: [pieza({ id: "a", titulo: "Post A", publicacion: "2026-10-25" }), pieza({ id: "b", titulo: "Post B", publicacion: "2026-10-20" })] })
    expect(hitosPendientes(c).map((h) => [h.piezaId, h.fecha])).toEqual([
      ["b", "2026-10-10"],
      ["a", "2026-10-15"],
      ["b", "2026-10-20"],
      ["a", "2026-10-25"],
      ["b", "2026-10-27"],
      ["a", "2026-11-01"],
    ])
    expect(siguienteHito(c)?.label).toBe("Enviar el texto · Post B")
  })
  it("sin piezas no hay ninguno", () => {
    expect(hitosPendientes(collab({}))).toEqual([])
    expect(siguienteHito(collab({}))).toBeNull()
  })
})

describe("collab nueva", () => {
  it("lo es durante sus siete primeros días", () => {
    expect(esCollabNueva(collab({ creadaEl: "2026-10-08T09:00:00" }), HOY)).toBe(true)
    expect(esCollabNueva(collab({ creadaEl: "2026-10-07T23:00:00" }), HOY)).toBe(false)
  })
})

describe("collabs por urgencia", () => {
  it("las nuevas primero y después por su siguiente hito, las que no tienen al final", () => {
    const sinHitos = collab({ id: "sin" })
    const tarde = collab({ id: "tarde", piezas: [pieza({ publicacion: "2026-11-20" })] })
    const pronto = collab({ id: "pronto", piezas: [pieza({ publicacion: "2026-10-18" })] })
    const nueva = collab({ id: "nueva", creadaEl: "2026-10-13T10:00:00", piezas: [pieza({ publicacion: "2026-12-01" })] })
    expect(collabsPorUrgencia([sinHitos, tarde, pronto, nueva], HOY).map((c) => c.id)).toEqual(["nueva", "pronto", "tarde", "sin"])
  })
})
