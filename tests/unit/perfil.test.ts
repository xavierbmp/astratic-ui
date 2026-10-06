import { describe, expect, it } from "vitest"
import type { CambioTarifa, CuentaRed } from "@/lib/influencer/modelo"
import { cambioPendiente, compararCifras, cpmDeTarifa, errorDePropuesta, frenteAReferencia, progresoMejoras, proponerCambio } from "@/lib/influencer/perfil"

const cuentas: CuentaRed[] = [{ red: "instagram", handle: "@a", url: "#", seguidores: 50_000, visualizacionesMedias: 20_000, interaccion: 5 }]

describe("perfil y tarifas", () => {
  it("el CPM de una tarifa sale de las visualizaciones medias de su red", () => {
    expect(cpmDeTarifa({ formato: "reel", precio: 500 }, cuentas)).toBe(25)
    expect(cpmDeTarifa({ formato: "tiktok", precio: 500 }, cuentas)).toBeNull()
    expect(cpmDeTarifa({ formato: "ugc", precio: 500 }, cuentas)).toBeNull()
    expect(cpmDeTarifa({ formato: "story", precio: 100 }, cuentas)).toBeNull()
  })
  it("solo el vídeo corto se compara con el CPM de referencia", () => {
    expect(frenteAReferencia({ formato: "reel", precio: 500 }, cuentas, 20)).toBe(25)
    expect(frenteAReferencia({ formato: "youtube", precio: 500 }, [{ ...cuentas[0], red: "youtube" }], 20)).toBeNull()
  })
  it("compara con la auditoría anterior: seguidores en %, interacción en puntos", () => {
    const [c] = compararCifras([{ red: "instagram", seguidores: 55_000, visualizacionesMedias: 20_000, interaccion: 5.4 }], [{ red: "instagram", seguidores: 50_000, visualizacionesMedias: 25_000, interaccion: 5 }])
    expect(c.cambio).toEqual({ seguidores: 10, visualizaciones: -20, interaccion: 0.4 })
    expect(compararCifras(cuentas)[0].cambio.seguidores).toBeNull()
  })
  it("cuenta las mejoras hechas", () => {
    expect(progresoMejoras([{ id: "a", area: "perfil", texto: "", hechaEl: "2026-10-01" }, { id: "b", area: "perfil", texto: "" }])).toEqual({ hechas: 1, total: 2, pct: 50 })
  })
  it("una propuesta nueva sustituye a la pendiente del mismo formato y guarda lo de antes", () => {
    const tarifa = { formato: "reel" as const, precio: 600, minimo: 480 }
    const previa: CambioTarifa = { id: "v", formato: "reel", precio: 650, minimo: 500, antes: { precio: 600, minimo: 480 }, estado: "pendiente", propuestoEl: "2026-10-01" }
    const cambios = proponerCambio({ tarifa, propuesta: { precio: 700, minimo: 560, motivo: "  " }, cambios: [previa], hoy: "2026-10-06", id: "n" })
    expect(cambios).toHaveLength(1)
    expect(cambioPendiente("reel", cambios)).toMatchObject({ id: "n", precio: 700, antes: { precio: 600 }, motivo: undefined })
  })
  it("no deja proponer un mínimo por encima del precio ni la misma tarifa", () => {
    const tarifa = { formato: "reel" as const, precio: 600, minimo: 480 }
    expect(errorDePropuesta(tarifa, { precio: 500, minimo: 520 })).toMatch(/mínimo/)
    expect(errorDePropuesta(tarifa, { precio: 600, minimo: 480 })).toMatch(/ya tienes/)
    expect(errorDePropuesta(tarifa, { precio: 650, minimo: 500 })).toBeNull()
  })
})
