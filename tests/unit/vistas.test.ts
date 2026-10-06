import { describe, expect, it } from "vitest"
import type { CampoFiltrable } from "@/lib/filtros/core"
import { SIN_VALOR, agruparFilas, calcular, mezclarVistas, ordenarFilas, valoresDeFiltro, type Vista } from "@/lib/vistas/core"

type Fila = { id: string; prioridad: string; etiquetas: string[]; dia: string | null; horas: number | null; hecha: boolean; titulo: string }
const filas: Fila[] = [
  { id: "a", prioridad: "baja", etiquetas: ["grabar"], dia: "2026-10-06", horas: 2, hecha: false, titulo: "Árbol" },
  { id: "b", prioridad: "urgente", etiquetas: ["grabar", "editar"], dia: "2026-10-12", horas: null, hecha: true, titulo: "bote" },
  { id: "c", prioridad: "alta", etiquetas: [], dia: null, horas: 1.5, hecha: false, titulo: "Casa" },
  { id: "d", prioridad: "urgente", etiquetas: ["editar"], dia: "2026-10-01", horas: 3, hecha: false, titulo: "abeja" },
]
const campos: CampoFiltrable<Fila>[] = [
  { id: "prioridad", label: "Prioridad", tipo: "select", opciones: ["urgente", "alta", "normal", "baja"].map((v) => ({ value: v, label: v })), valor: (f) => f.prioridad },
  { id: "etiquetas", label: "Etiquetas", tipo: "multiselect", opciones: [{ value: "grabar", label: "Grabar" }, { value: "editar", label: "Editar" }], valor: (f) => f.etiquetas },
  { id: "dia", label: "Fecha", tipo: "fecha", valor: (f) => f.dia },
  { id: "horas", label: "Horas", tipo: "numero", valor: (f) => f.horas },
  { id: "hecha", label: "Hecha", tipo: "booleano", valor: (f) => f.hecha },
  { id: "titulo", label: "Título", tipo: "texto", valor: (f) => f.titulo },
]
const hoy = { hoy: "2026-10-06" }

describe("ordenar", () => {
  it("las listas ordenan por sus opciones y desempata el segundo criterio", () => {
    const r = ordenarFilas(filas, [{ campo: "prioridad", dir: "asc" }, { campo: "dia", dir: "asc" }], campos)
    expect(r.map((f) => f.id)).toEqual(["d", "b", "c", "a"])
  })
  it("lo vacío va al final en los dos sentidos", () => {
    expect(ordenarFilas(filas, [{ campo: "dia", dir: "desc" }], campos).map((f) => f.id)).toEqual(["b", "a", "d", "c"])
    expect(ordenarFilas(filas, [{ campo: "dia", dir: "asc" }], campos).map((f) => f.id)).toEqual(["d", "a", "b", "c"])
  })
  it("el texto sin mayúsculas ni acentos", () => {
    expect(ordenarFilas(filas, [{ campo: "titulo", dir: "asc" }], campos).map((f) => f.id)).toEqual(["d", "a", "b", "c"])
  })
})

describe("agrupar", () => {
  it("una lista da un grupo por opción, también vacío, y «Sin …» al final", () => {
    const g = agruparFilas(filas, { campo: "prioridad" }, campos, hoy)
    expect(g.map((x) => [x.id, x.filas.length])).toEqual([["urgente", 2], ["alta", 1], ["normal", 0], ["baja", 1]])
    expect(agruparFilas(filas, { campo: "prioridad", ocultarVacios: true }, campos, hoy).map((x) => x.id)).toEqual(["urgente", "alta", "baja"])
  })
  it("con varias etiquetas, la fila sale en cada grupo", () => {
    const g = agruparFilas(filas, { campo: "etiquetas" }, campos, hoy)
    expect(g.map((x) => [x.id, x.filas.map((f) => f.id)])).toEqual([["grabar", ["a", "b"]], ["editar", ["b", "d"]], [SIN_VALOR, ["c"]]])
  })
  it("fechas relativas, por día y por mes", () => {
    const rel = agruparFilas(filas, { campo: "dia", ocultarVacios: true }, campos, hoy)
    expect(rel.map((x) => x.label)).toEqual(["Antes", "Hoy", "Semana que viene", "Sin fecha"])
    const dia = agruparFilas(filas, { campo: "dia", modoFecha: "dia" }, campos, hoy)
    expect(dia.map((x) => x.id)).toEqual(["2026-10-01", "2026-10-06", "2026-10-12", SIN_VALOR])
    expect(agruparFilas(filas, { campo: "dia", modoFecha: "mes" }, campos, hoy)[0].label).toBe("octubre de 2026")
  })
  it("grupos ocultos y orden alfabético", () => {
    const g = agruparFilas(filas, { campo: "prioridad", ocultos: ["urgente"], ordenGrupos: "asc" }, campos, hoy)
    expect(g.map((x) => x.id)).toEqual(["alta", "baja", "normal"])
  })
  it("sí y no", () => {
    expect(agruparFilas(filas, { campo: "hecha" }, campos, hoy).map((x) => [x.label, x.filas.length])).toEqual([["Sí", 1], ["No", 3]])
  })
})

describe("calcular", () => {
  it("cuenta, porcentajes, sumas y fechas", () => {
    const campo = (id: string) => campos.find((c) => c.id === id)
    expect(calcular(filas, undefined, "contar")).toBe("4")
    expect(calcular(filas, campo("dia"), "vacios")).toBe("1")
    expect(calcular(filas, campo("hecha"), "pct_si")).toBe("25 %")
    expect(calcular(filas, campo("horas"), "suma")).toBe("6,5")
    expect(calcular(filas, campo("dia"), "mas_temprana")).toBe("1 oct")
  })
})

describe("lo que hereda una fila nueva del filtro", () => {
  it("solo los valores fijos de un grupo con Y", () => {
    expect(valoresDeFiltro({ union: "y", condiciones: [{ campo: "prioridad", op: "alguno", valor: ["alta"] }, { campo: "dia", op: "antes", valor: "2026-10-10" }, { campo: "hecha", op: "falso" }] })).toEqual([
      { campo: "prioridad", valor: "alta" },
      { campo: "hecha", valor: "false" },
    ])
    expect(valoresDeFiltro({ union: "o", condiciones: [{ campo: "prioridad", op: "alguno", valor: ["alta"] }, { campo: "prioridad", op: "alguno", valor: ["baja"] }] })).toEqual([])
  })
})

describe("vistas guardadas", () => {
  const base = { filtro: { union: "y" as const, condiciones: [] }, orden: [], propiedades: [], ajustes: {} }
  const deSerie: Vista[] = [
    { ...base, id: "fecha", nombre: "Por fecha", diseno: "lista" },
    { ...base, id: "tablero", nombre: "Tablero", diseno: "tablero" },
  ]
  it("las de serie con sus cambios, las propias detrás y el orden elegido", () => {
    const propia: Vista = { ...base, id: "v-1", nombre: "Mía", diseno: "tabla" }
    const r = mezclarVistas(deSerie, { propias: [propia], editadas: { fecha: { nombre: "Por día" } }, borradas: ["tablero"], orden: ["v-1"] })
    expect(r.map((v) => [v.id, v.nombre])).toEqual([["v-1", "Mía"], ["fecha", "Por día"]])
  })
})
