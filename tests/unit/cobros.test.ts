import { describe, expect, it } from "vitest"
import type { Collab, Factura } from "@/lib/influencer/modelo"
import { cifrasCobros, cobradoPorTrimestre, impuestosDelTrimestre, lineasDeCobro, ordenarLineas, previsionCobros, siguientePasoDe, trimestreDe } from "@/lib/influencer/cobros"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoFacturas } from "@/lib/influencer/demo-documentos"

const HOY = "2026-10-06"
const impuestos = { ivaPct: 21, irpfPct: 15 }

const collab = (datos: Partial<Collab>): Collab => ({
  id: "c",
  marcaId: "lumea",
  campana: "Campaña",
  tipo: "directa",
  estado: "en-curso",
  importe: 1000,
  tint: "rose",
  desde: "2026-10-01",
  hasta: "2026-10-20",
  brief: { texto: "", menciones: [], hashtags: [], rondasIncluidas: 2, contacto: { nombre: "Ana", email: "ana@example.com" }, condicionesPago: "30 días tras publicar" },
  piezas: [],
  cobro: { estado: "por-facturar" },
  plazos: [{ id: "p1", concepto: "Al firmar", porcentaje: 50 }, { id: "p2", concepto: "Al publicar", porcentaje: 50 }],
  creadaEl: "2026-10-01T10:00:00",
  ...datos,
})

const factura = (datos: Partial<Factura>): Factura => ({ id: "f", collabId: "c", numero: "2026-001", destinatario: "marca", concepto: "Campaña", base: 500, ivaPct: 21, irpfPct: 15, emitidaEl: "2026-09-01", vencimiento: "2026-10-01", ...datos })

const lineas = (collabs: Collab[], facturas: Factura[]) => lineasDeCobro({ collabs, facturas, hoy: HOY, impuestos })

describe("líneas de cobro", () => {
  it("una por plazo, con la factura que lo cubre o por facturar", () => {
    const ls = lineas([collab({})], [factura({ plazoId: "p1", enviadaEl: "2026-09-01", vencimiento: "2026-10-30" })])
    expect(ls.map((l) => [l.id, l.estado, l.base])).toEqual([["p1", "enviada", 500], ["p2", "por-facturar", 500]])
  })
  it("sin factura, el total lleva su IVA y su retención, y el previsto es el fin de la collab más los días de pago", () => {
    const [, segunda] = lineas([collab({})], [])
    expect(segunda.total).toBe(530)
    expect(segunda.previsto).toBe("2026-11-19")
  })
  it("una factura sin plazo es una línea más (un extra)", () => {
    const ls = lineas([collab({ plazos: [] })], [factura({ id: "extra", plazoId: undefined })])
    expect(ls.map((l) => l.id)).toEqual(["extra"])
  })
  it("una collab sin plan ni facturas cuenta como un plazo del 100 %", () => {
    expect(lineas([collab({ plazos: [] })], []).map((l) => [l.id, l.base])).toEqual([["c-total", 1000]])
  })
  it("en las de la red cobra su 80 %", () => {
    const [l] = lineas([collab({ tipo: "red", importe: 1000, importeNeto: 800, plazos: [{ id: "p", concepto: "Todo", porcentaje: 100 }] })], [])
    expect(l.base).toBe(800)
  })
  it("los regalos y las canceladas no se cobran", () => {
    expect(lineas([collab({ tipo: "regalo" }), collab({ id: "x", estado: "cancelada" })], [])).toEqual([])
  })
  it("toca facturar cuando el contenido ya está publicado", () => {
    expect(lineas([collab({ estado: "publicada" })], []).every((l) => l.tocaFacturar)).toBe(true)
    expect(lineas([collab({})], []).some((l) => l.tocaFacturar)).toBe(false)
  })
  it("vencida con sus días, y lo que pide cada una", () => {
    const [vencida] = lineas([collab({})], [factura({ plazoId: "p1", enviadaEl: "2026-09-01" })])
    expect(vencida).toMatchObject({ estado: "vencida", diasVencida: 5 })
    expect(siguientePasoDe(vencida)).toBe("Reclamar el pago")
    expect(siguientePasoDe({ ...vencida, factura: { ...factura({}), reclamaciones: ["2026-10-02"] } })).toBe("Volver a reclamar")
  })
})

describe("orden", () => {
  it("vencidas, sin enviar, lo que toca facturar, lo que se espera y lo cobrado", () => {
    const c = collab({ estado: "publicada", plazos: [{ id: "a", concepto: "A", porcentaje: 25 }, { id: "b", concepto: "B", porcentaje: 25 }, { id: "d", concepto: "D", porcentaje: 25 }, { id: "e", concepto: "E", porcentaje: 25 }] })
    const ls = lineas([c], [
      factura({ id: "cobrada", plazoId: "a", enviadaEl: "2026-08-01", cobradaEl: "2026-09-01" }),
      factura({ id: "enviada", plazoId: "b", enviadaEl: "2026-09-01", vencimiento: "2026-11-01" }),
      factura({ id: "vencida", plazoId: "d", enviadaEl: "2026-09-01" }),
    ]).sort(ordenarLineas)
    expect(ls.map((l) => l.estado)).toEqual(["vencida", "por-facturar", "enviada", "cobrada"])
  })
})

describe("cifras", () => {
  it("cuadran con las facturas de la demo: lo cobrado este año es lo que enseña el Inicio", () => {
    const cifras = cifrasCobros(lineasDeCobro({ collabs: demoCollabs, facturas: demoFacturas, hoy: HOY, impuestos }), HOY)
    expect(cifras.cobradoAno).toBe(18_650)
    expect(cifras).toMatchObject({ vencido: 760, vencidas: 1, porCobrar: 1725, sinEnviar: 1 })
  })
  it("la previsión incluye lo vencido y lo que vence en 30 días, no lo cobrado", () => {
    const ls = lineas([collab({})], [factura({ plazoId: "p1", enviadaEl: "2026-09-01" }), factura({ id: "g", plazoId: "p2", vencimiento: "2026-12-31" })])
    expect(previsionCobros(ls, HOY).lineas.map((l) => l.id)).toEqual(["p1"])
  })
})

describe("trimestres e impuestos", () => {
  it("el trimestre de una fecha, con sus límites", () => {
    expect(trimestreDe("2026-10-06")).toEqual({ ano: "2026", numero: 4, desde: "2026-10-01", hasta: "2026-12-31" })
    expect(trimestreDe("2026-03-31")).toMatchObject({ numero: 1, hasta: "2026-03-31" })
  })
  it("IVA repercutido y retención de lo emitido en el trimestre", () => {
    const t = trimestreDe(HOY)
    const r = impuestosDelTrimestre([factura({ emitidaEl: "2026-10-02", base: 1000 }), factura({ id: "vieja", emitidaEl: "2026-09-30", base: 999 })], t)
    expect(r).toEqual({ facturas: 1, base: 1000, iva: 210, irpf: 150, total: 1060 })
  })
  it("lo cobrado por trimestre va por la fecha de cobro", () => {
    const r = cobradoPorTrimestre([factura({ cobradaEl: "2026-02-10", base: 100 }), factura({ id: "b", cobradaEl: "2026-10-01", base: 300 })], "2026")
    expect(r.map((x) => x.cobrado)).toEqual([100, 0, 0, 300])
  })
})
