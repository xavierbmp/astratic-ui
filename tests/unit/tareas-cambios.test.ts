import { describe, expect, it } from "vitest"
import type { Tarea } from "@/lib/influencer/modelo"
import { alternarHecha, borrarTareas, colocarTarea, conSubtareas, duplicarTarea, guardarTarea, restaurarTareas } from "@/lib/influencer/tareas-cambios"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoContactos, demoMarcas, demoPropuestas } from "@/lib/influencer/demo-data"

const ctx = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos }
let n = 0
const reloj = { hoy: "2026-10-06", ahora: "2026-10-06T12:00:00", id: (p: string) => `${p}${(n += 1)}` }
const t = (datos: Partial<Tarea>): Tarea => ({ id: "x", titulo: "Tarea", estado: "por-hacer", prioridad: "normal", donde: { tipo: "sin-tipo" }, etiquetas: [], orden: 1, origen: "manual", actividad: [], creadaEl: "2026-10-01", ...datos })

describe("guardar", () => {
  it("apunta los cambios en la actividad", () => {
    const { tareas } = guardarTarea([t({})], t({ estado: "en-curso", prioridad: "alta" }), ctx, reloj)
    expect(tareas[0].actividad.map((a) => a.texto)).toEqual(["Estado: Por hacer → En curso", "Prioridad: Normal → Alta"])
    expect(tareas[0].editadaEl).toBe(reloj.ahora)
  })
  it("al hacer una que se repite sale la siguiente, y la hecha deja de repetirse", () => {
    const repetida = t({ id: "r", fecha: "2026-10-06", repetir: { frecuencia: "laborables" } })
    const { tareas, siguiente } = alternarHecha([repetida], "r", ctx, reloj)
    expect(tareas).toHaveLength(2)
    expect(tareas[0]).toMatchObject({ estado: "hecha", repetir: undefined })
    expect(siguiente).toMatchObject({ estado: "por-hacer", fecha: "2026-10-07", repetir: { frecuencia: "laborables" }, origen: "repetida" })
  })
  it("reabrir no crea otra", () => {
    const hecha = t({ id: "h", estado: "hecha", fecha: "2026-10-06" })
    expect(alternarHecha([hecha], "h", ctx, reloj).tareas).toHaveLength(1)
  })
})

describe("borrar, deshacer, duplicar y colocar", () => {
  const madre = t({ id: "m", orden: 1 })
  const lista = [madre, t({ id: "h1", padreId: "m", orden: 2 }), t({ id: "n1", padreId: "h1", orden: 3 }), t({ id: "otra", orden: 4 })]
  it("borrar se lleva las subtareas a cualquier profundidad y deshacer las devuelve en su sitio", () => {
    const { tareas, borradas } = borrarTareas(lista, ["m"])
    expect(tareas.map((x) => x.id)).toEqual(["otra"])
    expect(restaurarTareas(tareas, borradas).map((x) => x.id)).toEqual(["m", "h1", "n1", "otra"])
  })
  it("duplicar copia las subtareas sin hacer", () => {
    const { tareas, copia } = duplicarTarea([t({ id: "a", estado: "hecha" }), t({ id: "b", padreId: "a", estado: "hecha" })], "a", reloj)
    expect(copia?.estado).toBe("por-hacer")
    expect(tareas.filter((x) => x.padreId === copia?.id)).toHaveLength(1)
  })
  it("colocar a mano queda entre sus vecinos", () => {
    const r = colocarTarea(lista, "otra", ["m", "otra", "h1"])
    expect(r.find((x) => x.id === "otra")?.orden).toBe(1.5)
  })
  it("una con subtareas nace con todas en su sitio", () => {
    const hijas = conSubtareas(t({ id: "f", donde: { tipo: "cobros", collabId: "lumea" } }), ["Hacer", "Enviar"], reloj)
    expect(hijas.slice(1).every((h) => h.padreId === "f" && h.donde.tipo === "cobros")).toBe(true)
  })
})
