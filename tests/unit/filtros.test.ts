import { describe, expect, it } from "vitest"
import { contarCondiciones, filtrarFilas, grupoVacio, parseGrupo, serializarGrupo, type CampoFiltrable, type GrupoCondiciones } from "@/lib/filtros/core"
import { tramoDeFecha } from "@/lib/filtros/fechas"

type Fila = { id: string; marca: string; hecha: boolean; dia: string | null }
const filas: Fila[] = [
  { id: "a", marca: "lumea", hecha: false, dia: "2026-10-06" },
  { id: "b", marca: "nuura", hecha: false, dia: "2026-10-09" },
  { id: "c", marca: "lumea", hecha: true, dia: "2026-10-12" },
  { id: "d", marca: "vero", hecha: false, dia: "2026-10-01" },
  { id: "e", marca: "vero", hecha: false, dia: null },
]
const campos: CampoFiltrable<Fila>[] = [
  { id: "marca", label: "Marca", tipo: "select", opciones: [{ value: "lumea", label: "Lumea" }, { value: "nuura", label: "Nuura" }, { value: "vero", label: "Vero" }], valor: (f) => f.marca },
  { id: "hecha", label: "Hecha", tipo: "booleano", valor: (f) => f.hecha },
  { id: "dia", label: "Día", tipo: "fecha", valor: (f) => f.dia },
]
const ids = (g: GrupoCondiciones) => filtrarFilas(filas, g, campos, { hoy: "2026-10-06" }).map((f) => f.id)

describe("filtros con grupos anidados", () => {
  it("(Lumea o Nuura) y sin hacer", () => {
    const g: GrupoCondiciones = {
      union: "y",
      condiciones: [{ campo: "hecha", op: "falso" }],
      grupos: [{ union: "o", condiciones: [{ campo: "marca", op: "alguno", valor: ["lumea"] }, { campo: "marca", op: "alguno", valor: ["nuura"] }] }],
    }
    expect(ids(g)).toEqual(["a", "b"])
    expect(contarCondiciones(g)).toBe(3)
  })

  it("un grupo vacío dentro de un O no deja pasar todo", () => {
    const g: GrupoCondiciones = { union: "o", condiciones: [{ campo: "marca", op: "alguno", valor: ["nuura"] }], grupos: [{ union: "y", condiciones: [] }] }
    expect(ids(g)).toEqual(["b"])
  })

  it("se guarda en la URL y se lee igual, y sin condiciones desaparece", () => {
    const g: GrupoCondiciones = { union: "y", condiciones: [{ campo: "hecha", op: "falso" }], grupos: [{ union: "o", condiciones: [{ campo: "marca", op: "alguno", valor: ["vero"] }] }] }
    expect(parseGrupo(serializarGrupo(g))).toEqual(g)
    expect(serializarGrupo({ union: "y", condiciones: [], grupos: [{ union: "o", condiciones: [] }] })).toBe("")
    expect(grupoVacio(parseGrupo("{roto"))).toBe(true)
  })

  it("no pasa de tres niveles", () => {
    const hondo = JSON.stringify({ u: "y", c: [], g: [{ u: "y", c: [], g: [{ u: "y", c: [], g: [{ u: "o", c: [{ campo: "hecha", op: "verdadero" }] }] }] }] })
    const g = parseGrupo(hondo)
    expect(g.grupos?.[0].grupos?.[0].grupos).toBeUndefined()
  })
})

describe("fechas relativas a hoy (martes 6 de octubre de 2026)", () => {
  const con = (op: string, valor?: string): GrupoCondiciones => ({ union: "y", condiciones: [{ campo: "dia", op: op as never, valor }] })
  it("hoy, mañana, ayer", () => {
    expect(ids(con("es_hoy"))).toEqual(["a"])
    expect(ids(con("es_manana"))).toEqual([])
    expect(ids(con("pasada"))).toEqual(["d"])
  })
  it("esta semana es de lunes 5 a domingo 11", () => {
    expect(ids(con("esta_semana"))).toEqual(["a", "b"])
    expect(ids(con("semana_que_viene"))).toEqual(["c"])
  })
  it("próximos y últimos N días, y un número a medio escribir no filtra", () => {
    expect(ids(con("proximos_dias", "3"))).toEqual(["a", "b"])
    expect(ids(con("ultimos_dias", "7"))).toEqual(["a", "d"])
    expect(ids(con("proximos_dias", ""))).toEqual(["a", "b", "c", "d", "e"])
  })
  it("los tramos no se pisan", () => {
    expect(tramoDeFecha("2026-10-05", "2026-10-06")).toBe("pasado")
    expect(tramoDeFecha("2026-10-07", "2026-10-06")).toBe("manana")
    expect(tramoDeFecha("2026-10-08", "2026-10-06")).toBe("semana")
    expect(tramoDeFecha("2026-10-11", "2026-10-06")).toBe("semana")
    expect(tramoDeFecha("2026-10-12", "2026-10-06")).toBe("proxima")
    expect(tramoDeFecha("2026-10-19", "2026-10-06")).toBe("despues")
  })
})
