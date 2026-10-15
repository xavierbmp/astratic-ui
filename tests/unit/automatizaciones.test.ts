import { describe, expect, it } from "vitest"
import type { Propuesta, Tarea } from "@/lib/influencer/modelo"
import { AJUSTES_COLLABS_DE_SERIE } from "@/lib/influencer/ajustes-collabs"
import { collabDePropuesta, valoresAltaDePropuesta } from "@/lib/influencer/alta-collab"
import {
  AUTOMATIZACIONES_DE_SERIE,
  BLOQUES_AUTOMATIZABLES,
  EVENTOS,
  LISTA_EVENTOS,
  aplicarPlan,
  describirAccion,
  difiereDeSerie,
  esquemaAjustesAutomatizaciones,
  planificar,
  reglasDe,
  restaurarDeSerie,
  type Automatizacion,
  type Ocurrido,
} from "@/lib/influencer/automatizaciones"
import { demoMarcas } from "@/lib/influencer/demo-data"

const HOY = "2026-10-15T10:00"
let n = 0
const reloj = { hoy: HOY, ahora: "2026-10-15T10:00:00", id: (p: string) => `${p}${(n += 1)}` }

const collab: Extract<Ocurrido, { objeto: "collab" }>["collab"] = {
  id: "c1",
  campana: "Sérum",
  desde: "2026-10-16",
  hasta: "2026-10-30",
  piezas: [
    { id: "pz1", titulo: "Reel · Sérum", publicacion: "2026-10-28", fechaGuion: "2026-10-21" },
    { id: "pz2", titulo: "Story · Sérum", publicacion: "2026-10-30", sinGuion: true },
  ],
}

const feedback = (comentario: string, version = { id: "v1", numero: 1 }): Ocurrido => ({ objeto: "version", evento: "marca:feedback", collab: { id: "c1", campana: "Sérum" }, pieza: { id: "pz1", titulo: "Reel · Sérum" }, parte: "media", version, comentario, marca: "Lumea" })

describe("el catálogo", () => {
  it("cada evento es de un bloque que existe y las de serie pasan su esquema", () => {
    const bloques = new Set(BLOQUES_AUTOMATIZABLES.map((b) => b.id))
    expect(LISTA_EVENTOS.every((e) => bloques.has(EVENTOS[e].bloque))).toBe(true)
    expect(EVENTOS["propuesta:ganada"].label).toBe("Una propuesta pasa a «Ganada»")
    expect(esquemaAjustesAutomatizaciones.safeParse({ reglas: AUTOMATIZACIONES_DE_SERIE }).success).toBe(true)
    expect(new Set(AUTOMATIZACIONES_DE_SERIE.map((r) => r.id)).size).toBe(AUTOMATIZACIONES_DE_SERIE.length)
  })
  it("sin nada guardado valen las de serie", () => {
    expect(reglasDe(null)).toBe(AUTOMATIZACIONES_DE_SERIE)
    expect(reglasDe({ reglas: [] })).toEqual([])
  })
  it("se leen en una frase", () => {
    const factura = AUTOMATIZACIONES_DE_SERIE.find((r) => r.id === "serie-collab-factura")
    expect(factura && describirAccion(factura.accion)).toBe("Crea la tarea «Mandar la factura a {marca}» el día de la última publicación")
    expect(describirAccion({ tipo: "registro", registro: "collab" })).toBe("Crea la collab")
  })
})

describe("planificar", () => {
  it("una propuesta ganada crea la collab y una enviada, el seguimiento a los 3 días", () => {
    const propuesta = { id: "p1", campana: "Otoño" }
    expect(planificar({ objeto: "propuesta", evento: "propuesta:ganada", propuesta, marca: "Nuura" }, AUTOMATIZACIONES_DE_SERIE, HOY)).toEqual({ tareas: [], registros: ["collab"] })
    const { tareas } = planificar({ objeto: "propuesta", evento: "propuesta:enviada", propuesta, marca: "Nuura" }, AUTOMATIZACIONES_DE_SERIE, HOY)
    expect(tareas).toEqual([expect.objectContaining({ titulo: "Hacer seguimiento de la propuesta a Nuura", fecha: "2026-10-18", donde: { tipo: "crm", registro: { tipo: "propuesta", id: "p1" } } })])
  })
  it("una collab nueva: una tarea por contenido en su día, el guion solo si lo lleva, el contrato y la factura el día de la última publicación", () => {
    const plan = planificar({ objeto: "collab", evento: "collab:creada", collab, marca: "Lumea" }, AUTOMATIZACIONES_DE_SERIE, HOY)
    expect(plan.registros).toEqual(["contrato"])
    const titulos = plan.tareas.map((t) => [t.titulo, t.fecha])
    expect(titulos).toEqual([
      ["Publicar Reel · Sérum", "2026-10-28"],
      ["Publicar Story · Sérum", "2026-10-30"],
      ["Mandar el guion de Reel · Sérum", "2026-10-21"],
      ["Preparar y mandar el contrato de Sérum", "2026-10-16"],
      ["Mandar la factura a Lumea", "2026-10-30"],
    ])
    expect(plan.tareas.find((t) => t.titulo.startsWith("Mandar la factura"))?.donde).toEqual({ tipo: "cobros", collabId: "c1" })
    expect(plan.tareas[0].donde).toEqual({ tipo: "collabs", collabId: "c1", piezaId: "pz1" })
  })
  it("las apagadas no hacen nada", () => {
    const apagadas = AUTOMATIZACIONES_DE_SERIE.map((r) => ({ ...r, activa: false }))
    expect(planificar({ objeto: "collab", evento: "collab:creada", collab }, apagadas, HOY)).toEqual({ tareas: [], registros: [] })
  })
})

describe("aplicar el plan", () => {
  const plan = (o: Ocurrido) => planificar(o, AUTOMATIZACIONES_DE_SERIE, HOY).tareas
  it("el feedback de una versión va a una sola tarea para hoy, con un comentario por subtarea", () => {
    let r = aplicarPlan([], plan(feedback("Más luz al principio")), reloj)
    expect(r.creadas.map((t) => [t.titulo, t.padreId ? "hija" : "madre"])).toEqual([
      ["Nuevo feedback: Reel · Sérum", "madre"],
      ["Más luz al principio", "hija"],
    ])
    const madre = r.creadas[0]
    expect(madre).toMatchObject({ fecha: "2026-10-15", prioridad: "alta", origen: "auto", donde: { tipo: "collabs", collabId: "c1", piezaId: "pz1" } })
    r = aplicarPlan(r.tareas, plan(feedback("Quitar la música")), reloj)
    expect(r.tareas.filter((t) => !t.padreId)).toHaveLength(1)
    expect(r.tareas.filter((t) => t.padreId === madre.id).map((t) => t.titulo)).toEqual(["Más luz al principio", "Quitar la música"])
  })
  it("si ya la había hecho, el comentario nuevo la reabre", () => {
    const r = aplicarPlan([], plan(feedback("Uno")), reloj)
    const hecha = r.tareas.map((t): Tarea => (t.padreId ? t : { ...t, estado: "hecha", hechaEl: reloj.ahora }))
    const despues = aplicarPlan(hecha, plan(feedback("Dos")), reloj)
    expect(despues.cambiadas).toHaveLength(1)
    expect(despues.tareas.find((t) => !t.padreId)?.estado).toBe("por-hacer")
  })
  it("el feedback de la v2 es otra tarea, con la versión en el título", () => {
    const r1 = aplicarPlan([], plan(feedback("Uno")), reloj)
    const r2 = aplicarPlan(r1.tareas, plan(feedback("Otra cosa", { id: "v2", numero: 2 })), reloj)
    expect(r2.tareas.filter((t) => !t.padreId).map((t) => t.titulo)).toEqual(["Nuevo feedback: Reel · Sérum", "Nuevo feedback: Reel · Sérum (v2)"])
  })
  it("lo que ya existe por su clave no se duplica", () => {
    const o: Ocurrido = { objeto: "collab", evento: "collab:creada", collab }
    const r1 = aplicarPlan([], plan(o), reloj)
    const r2 = aplicarPlan(r1.tareas, plan(o), reloj)
    expect(r2.creadas).toHaveLength(0)
    expect(r2.tareas).toHaveLength(r1.tareas.length)
    // La del contrato nace con sus dos subtareas.
    expect(r1.tareas.filter((t) => t.padreId === r1.tareas.find((x) => x.titulo.startsWith("Preparar"))?.id)).toHaveLength(2)
  })
})

describe("restaurar por defecto", () => {
  it("lo que vuelve de la base con las claves en otro orden sigue siendo lo de serie", () => {
    const desordenadas = AUTOMATIZACIONES_DE_SERIE.map((r) => JSON.parse(JSON.stringify({ activa: r.activa, accion: Object.fromEntries(Object.entries(r.accion).reverse()), evento: r.evento, id: r.id })) as Automatizacion)
    expect(difiereDeSerie(desordenadas, "crm-pipeline")).toBe(false)
    expect(difiereDeSerie(desordenadas, "collab-contenidos")).toBe(false)
  })
  it("vuelven las de serie del bloque (también las borradas o cambiadas) y las del resto se quedan", () => {
    const propia: Automatizacion = { id: "mia", evento: "propuesta:hablando", activa: true, accion: { tipo: "tarea", titulo: "Mandar el media kit", cuando: { dias: 0, desde: "hoy" }, prioridad: "normal", subtareas: [] } }
    const tocadas = [...AUTOMATIZACIONES_DE_SERIE.filter((r) => r.id !== "serie-propuesta-nueva" && r.id !== "serie-collab-factura").map((r) => (r.id === "serie-propuesta-enviada" ? { ...r, activa: false } : r)), propia]
    expect(difiereDeSerie(tocadas, "crm-pipeline")).toBe(true)
    const restauradas = restaurarDeSerie(tocadas, "crm-pipeline")
    expect(difiereDeSerie(restauradas, "crm-pipeline")).toBe(false)
    expect(restauradas.some((r) => r.id === "mia")).toBe(false)
    // El otro bloque sigue como lo dejó: sin la de la factura.
    expect(restauradas.some((r) => r.id === "serie-collab-factura")).toBe(false)
    expect(difiereDeSerie(restauradas, "collabs-directorio")).toBe(true)
  })
})

describe("de propuesta a collab", () => {
  const marca = demoMarcas[0]
  const propuesta: Propuesta = {
    id: "p1",
    marcaId: marca.id,
    campana: "Otoño",
    estado: "ganada",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }],
    hasta: "2026-11-10",
    ultimoContacto: "2026-10-10",
    creadaEl: "2026-10-01",
    presupuesto: { lineas: [{ formato: "reel", cantidad: 1, precio: 800 }, { formato: "story", cantidad: 2, precio: 150 }], extras: ["derechos", "urgencia"], conPrecios: true, rondas: 3, validez: 15, pago: "A 60 días", generadoEl: "2026-10-05" },
  }
  it("los entregables, el importe, las condiciones, las rondas y el pago salen del presupuesto", () => {
    const v = valoresAltaDePropuesta(propuesta, AJUSTES_COLLABS_DE_SERIE, HOY)
    expect(v.piezas.map((p) => [p.titulo, p.publicacion, p.importe])).toEqual([
      ["Reel · Otoño", "2026-11-10", "800"],
      ["Story · Otoño 1", "2026-11-10", "150"],
      ["Story · Otoño 2", "2026-11-10", "150"],
    ])
    // 1.100 € más un 20 % de derechos y un 15 % de urgencia.
    expect(v.importe).toBe(1485)
    expect(v.condiciones.map((c) => c.id)).toEqual(["derechos"])
    expect(v.plataformas).toEqual(["instagram"])
    const c = collabDePropuesta(propuesta, { marca, ajustes: AJUSTES_COLLABS_DE_SERIE, hoy: HOY })
    expect(c).toMatchObject({ campana: "Otoño", importe: 1485, marcaId: marca.id, brief: { rondasIncluidas: 3, condicionesPago: "A 60 días" } })
    expect(c.piezas).toHaveLength(3)
  })
  it("sin presupuesto, las piezas pedidas y lo que ofrece la marca", () => {
    const v = valoresAltaDePropuesta({ ...propuesta, presupuesto: undefined, ofrecen: 600 }, AJUSTES_COLLABS_DE_SERIE, HOY)
    expect(v.piezas.map((p) => [p.titulo, p.importe])).toEqual([["Reel · Otoño", undefined]])
    expect(v.importe).toBe(600)
  })
})
