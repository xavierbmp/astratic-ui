import { describe, expect, it } from "vitest"
import {
  contarCondiciones,
  describirValorFecha,
  fechaDeValor,
  filtrarFilas,
  grupoVacio,
  parseGrupo,
  serializarGrupo,
  tramoDeValor,
  type CampoFiltrable,
  type GrupoCondiciones,
  type Operador,
} from "@/lib/filtros/core"
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

describe("fechas relativas a hoy, como en Airtable (martes 6 de octubre de 2026)", () => {
  const con = (op: Operador, valor?: string): GrupoCondiciones => ({ union: "y", condiciones: [{ campo: "dia", op, valor }] })
  it("es hoy, mañana, hace N días; es antes de hoy; no es hoy (incluye las vacías)", () => {
    expect(ids(con("es", "hoy"))).toEqual(["a"])
    expect(ids(con("es", "manana"))).toEqual([])
    expect(ids(con("es", "hace_dias:5"))).toEqual(["d"])
    expect(ids(con("antes", "hoy"))).toEqual(["d"])
    expect(ids(con("no_es", "hoy"))).toEqual(["b", "c", "d", "e"])
    expect(ids(con("en_o_despues", "2026-10-09"))).toEqual(["b", "c"])
  })
  it("está dentro de: esta semana es de lunes 5 a domingo 11; la próxima semana, los 7 días desde hoy", () => {
    expect(ids(con("dentro_de", "esta_semana"))).toEqual(["a", "b"])
    expect(ids(con("dentro_de", "semana_proxima"))).toEqual(["a", "b", "c"])
  })
  it("los próximos y los últimos N días, y un número a medio escribir no filtra", () => {
    expect(ids(con("dentro_de", "proximos_dias:3"))).toEqual(["a", "b"])
    expect(ids(con("dentro_de", "ultimos_dias:7"))).toEqual(["a", "d"])
    expect(ids(con("dentro_de", "proximos_dias"))).toEqual(["a", "b", "c", "d", "e"])
    expect(ids(con("es", "hace_dias"))).toEqual(["a", "b", "c", "d", "e"])
  })
  it("se describe como se lee", () => {
    expect(describirValorFecha("hace_dias:3", false)).toBe("hace 3 días")
    expect(describirValorFecha("ultimos_dias:7", true)).toBe("los últimos 7 días")
    expect(fechaDeValor("hace_mes", "2026-10-06")).toBe("2026-09-06")
    expect(tramoDeValor("este_mes", "2026-02-10")).toEqual(["2026-02-01", "2026-02-28"])
  })
  it("los tramos de agrupar no se pisan", () => {
    expect(tramoDeFecha("2026-10-05", "2026-10-06")).toBe("pasado")
    expect(tramoDeFecha("2026-10-07", "2026-10-06")).toBe("manana")
    expect(tramoDeFecha("2026-10-08", "2026-10-06")).toBe("semana")
    expect(tramoDeFecha("2026-10-11", "2026-10-06")).toBe("semana")
    expect(tramoDeFecha("2026-10-12", "2026-10-06")).toBe("proxima")
    expect(tramoDeFecha("2026-10-19", "2026-10-06")).toBe("despues")
  })
})

describe("listas, como en Airtable", () => {
  type F = { id: string; plataformas: string[]; estado: string | null }
  const fs: F[] = [
    { id: "1", plataformas: ["ig", "tt"], estado: "activo" },
    { id: "2", plataformas: ["ig"], estado: "pausa" },
    { id: "3", plataformas: [], estado: null },
  ]
  const cs: CampoFiltrable<F>[] = [
    { id: "plataformas", label: "Plataformas", tipo: "multiselect", valor: (f) => f.plataformas },
    { id: "estado", label: "Estado", tipo: "select", valor: (f) => f.estado },
  ]
  const de = (campo: string, op: Operador, valor: string | string[]) => filtrarFilas(fs, { union: "y", condiciones: [{ campo, op, valor }] }, cs).map((f) => f.id)
  it("selección única: es, no es (incluye las vacías), es cualquiera de", () => {
    expect(de("estado", "es", "activo")).toEqual(["1"])
    expect(de("estado", "no_es", "activo")).toEqual(["2", "3"])
    expect(de("estado", "alguno", ["activo", "pausa"])).toEqual(["1", "2"])
  })
  it("selección múltiple: tiene cualquiera de, tiene todos los, es exactamente, no tiene ninguno de", () => {
    expect(de("plataformas", "alguno", ["tt"])).toEqual(["1"])
    expect(de("plataformas", "todos", ["ig", "tt"])).toEqual(["1"])
    expect(de("plataformas", "exactamente", ["ig"])).toEqual(["2"])
    expect(de("plataformas", "ninguno", ["tt"])).toEqual(["2", "3"])
  })
})
