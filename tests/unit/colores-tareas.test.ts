import { describe, expect, it } from "vitest"
import type { Tarea } from "@/lib/influencer/modelo"
import { COLORES_TAREAS_DE_SERIE, colorDeTarea, conColoresDeSerie, tramoDeDia, tramoDeTarea } from "@/lib/influencer/colores-tareas"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoContactos, demoMarcas, demoPropuestas } from "@/lib/influencer/demo-data"

const HOY = "2026-10-06"
const ctx = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos }
const t = (datos: Partial<Tarea>): Tarea => ({ id: "x", titulo: "Tarea", estado: "por-hacer", prioridad: "normal", donde: { tipo: "sin-tipo" }, etiquetas: [], orden: 0, origen: "manual", actividad: [], creadaEl: HOY, ...datos })
const datos = { hoy: HOY, ctx, etiquetas: [{ id: "e1", nombre: "Grabar", tint: "rose" as const }] }

describe("colores de las tareas", () => {
  it("tramos de urgencia: vencida, hoy, los próximos N días, después y sin fecha", () => {
    expect(tramoDeDia("2026-10-05", HOY, 3)).toBe("vencida")
    expect(tramoDeDia("2026-10-06T10:00", HOY, 3)).toBe("hoy")
    expect(tramoDeDia("2026-10-09", HOY, 3)).toBe("proximos")
    expect(tramoDeDia("2026-10-10", HOY, 3)).toBe("despues")
    expect(tramoDeDia(undefined, HOY, 3)).toBe("sin-fecha")
    // Empezó ayer y dura hasta mañana: no está vencida, toca hoy.
    expect(tramoDeTarea(t({ fecha: "2026-10-05", fechaFin: "2026-10-07" }), HOY, 3)).toBe("hoy")
  })
  it("de serie, vencida en rojo y lo cercano en verde; lo hecho sin color", () => {
    const c = COLORES_TAREAS_DE_SERIE
    expect(colorDeTarea(t({ fecha: "2026-10-01" }), c, datos)).toEqual({ color: "rojo" })
    expect(colorDeTarea(t({ fecha: "2026-10-08" }), c, datos)).toEqual({ color: "verde" })
    expect(colorDeTarea(t({ fecha: "2026-10-30" }), c, datos)).toEqual({ color: "ninguno" })
    expect(colorDeTarea(t({ fecha: "2026-10-01", estado: "hecha" }), c, datos)).toEqual({ color: "ninguno" })
  })
  it("por prioridad, por etiqueta o sin color", () => {
    const c = COLORES_TAREAS_DE_SERIE
    expect(colorDeTarea(t({ prioridad: "urgente" }), { ...c, por: "prioridad" }, datos)).toEqual({ color: "rojo" })
    expect(colorDeTarea(t({ etiquetas: ["e1"] }), { ...c, por: "etiqueta" }, datos)).toEqual({ tinte: "rose" })
    expect(colorDeTarea(t({ fecha: "2026-10-01" }), { ...c, por: "ninguno" }, datos)).toEqual({ color: "ninguno" })
  })
  it("lo guardado se completa con lo de serie y descarta lo que no vale", () => {
    expect(conColoresDeSerie({ urgencia: { hoy: "azul" } as never, diasProximos: 99, por: "otra" as never })).toEqual({
      ...COLORES_TAREAS_DE_SERIE,
      urgencia: { ...COLORES_TAREAS_DE_SERIE.urgencia, hoy: "azul" },
    })
  })
})
