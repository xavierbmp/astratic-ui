import { describe, expect, it } from "vitest"
import type { CampoTarea, Tarea } from "@/lib/influencer/modelo"
import { asignarCampo, camposTarea } from "@/lib/influencer/campos-tareas"
import { cambiarTipo, cuandoDe, migasDonde, nuevaTarea, ordenarHoy, perteneceA, siguienteFecha, siguienteRepeticion, tareasDeHoy, textoDonde, describirRepeticion } from "@/lib/influencer/tareas"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoContactos, demoMarcas, demoPropuestas, demoTareas, demoEtiquetasTarea } from "@/lib/influencer/demo-data"
import { SIN_VALOR, agruparFilas } from "@/lib/vistas/core"

const HOY = "2026-10-06"
const ref = { hoy: HOY, ahora: "2026-10-06T12:00:00" }
const ctx = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos }
const t = (datos: Partial<Tarea>): Tarea => ({ id: "x", titulo: "Tarea", estado: "por-hacer", prioridad: "normal", donde: { tipo: "sin-tipo" }, etiquetas: [], orden: 0, origen: "manual", actividad: [], creadaEl: HOY, ...datos })

describe("cuándo toca", () => {
  it("la fecha que manda es la primera entre la planeada y la límite", () => {
    expect(cuandoDe(t({ fecha: "2026-10-08", fechaLimite: "2026-10-07" }), HOY)).toBe("manana")
    expect(cuandoDe(t({ fecha: "2026-10-06T10:00" }), HOY)).toBe("hoy")
    expect(cuandoDe(t({ fechaLimite: "2026-10-09" }), HOY)).toBe("semana")
    expect(cuandoDe(t({}), HOY)).toBe("sin-fecha")
  })
  it("vencida si pasó su día o su límite; cerrada, nunca", () => {
    expect(cuandoDe(t({ fecha: "2026-10-05", fechaLimite: "2026-10-08" }), HOY)).toBe("vencidas")
    expect(cuandoDe(t({ fecha: "2026-10-05", estado: "hecha" }), HOY)).toBe("hechas")
    expect(cuandoDe(t({ fecha: "2026-10-05", estado: "cancelada" }), HOY)).toBe("hechas")
  })
  it("una de varios días que ya empezó es de hoy hasta que acaba", () => {
    expect(cuandoDe(t({ fecha: "2026-10-05", fechaFin: "2026-10-07" }), HOY)).toBe("hoy")
    expect(cuandoDe(t({ fecha: "2026-10-03", fechaFin: "2026-10-05" }), HOY)).toBe("vencidas")
  })
  it("en la demo, Hoy tiene vencidas y las de hoy", () => {
    const { vencidas, hoy } = tareasDeHoy(demoTareas, HOY)
    expect(vencidas.map((x) => x.id)).toEqual(["t1", "t24"])
    expect(hoy.map((x) => x.id).sort()).toEqual(["t15", "t2", "t21", "t3", "t32"].sort())
  })
})

describe("orden de Hoy, por importancia", () => {
  const tareas = [
    t({ id: "baja", prioridad: "baja", fecha: HOY }),
    t({ id: "alta-limite-lejos", prioridad: "alta", fecha: HOY, fechaLimite: "2026-10-12" }),
    t({ id: "alta-limite-cerca", prioridad: "alta", fecha: HOY, fechaLimite: "2026-10-07" }),
    t({ id: "urgente-tarde", prioridad: "urgente", fecha: `${HOY}T18:00` }),
    t({ id: "urgente-manana", prioridad: "urgente", fecha: `${HOY}T09:00` }),
    t({ id: "alta-con-hora", prioridad: "alta", fecha: `${HOY}T11:00` }),
  ]
  it("prioridad, luego hora, luego lo que vence antes", () => {
    expect(ordenarHoy(tareas).map((x) => x.id)).toEqual(["urgente-manana", "urgente-tarde", "alta-con-hora", "alta-limite-cerca", "alta-limite-lejos", "baja"])
  })
  it("si ella reordena, manda su orden y lo nuevo va detrás", () => {
    expect(ordenarHoy(tareas, ["baja", "alta-con-hora"]).map((x) => x.id)).toEqual(["baja", "alta-con-hora", "urgente-manana", "urgente-tarde", "alta-limite-cerca", "alta-limite-lejos"])
  })
})

describe("repetir", () => {
  it("días, laborables, semanas con días, meses e intervalos", () => {
    expect(siguienteFecha("2026-10-06", { frecuencia: "diaria" })).toBe("2026-10-07")
    expect(siguienteFecha("2026-10-09", { frecuencia: "laborables" })).toBe("2026-10-12")
    expect(siguienteFecha("2026-10-06", { frecuencia: "semanal", dias: [1, 4] })).toBe("2026-10-08")
    expect(siguienteFecha("2026-10-08", { frecuencia: "semanal", dias: [1, 4] })).toBe("2026-10-12")
    expect(siguienteFecha("2026-10-08", { frecuencia: "semanal", dias: [1, 4], cada: 2 })).toBe("2026-10-19")
    expect(siguienteFecha("2026-01-31", { frecuencia: "mensual" })).toBe("2026-02-28")
    expect(siguienteFecha("2026-10-15", { frecuencia: "trimestral" })).toBe("2027-01-15")
    expect(describirRepeticion({ frecuencia: "semanal", dias: [4, 1] })).toBe("Cada semana: lunes y jueves")
  })
  it("la siguiente mueve fecha y límite juntas y no nace vencida", () => {
    const s = siguienteRepeticion(t({ fecha: "2026-09-28T09:00", fechaLimite: "2026-09-30", repetir: { frecuencia: "semanal" }, estado: "hecha" }), HOY, "nueva")
    expect(s).toMatchObject({ id: "nueva", estado: "por-hacer", origen: "repetida", fecha: "2026-10-12T09:00", fechaLimite: "2026-10-14" })
  })
})

describe("nueva", () => {
  it("lo que llega vacío no pisa lo de por defecto", () => {
    const n = nuevaTarea({ titulo: "Llamar", donde: { tipo: "sin-tipo" }, estado: undefined, prioridad: undefined, fecha: HOY }, "n1", "2026-10-06T10:00:00")
    expect(n).toMatchObject({ estado: "por-hacer", prioridad: "normal", etiquetas: [], origen: "manual", fecha: HOY, creadaEl: "2026-10-06T10:00:00" })
  })
})

describe("tipo y de qué es", () => {
  it("se lee corto y se filtra por tipo, campaña o ficha del CRM", () => {
    const factura = t({ donde: { tipo: "cobros", collabId: "lumea" } })
    expect(textoDonde(factura.donde, ctx)).toBe("Lumea Skin · Cobros")
    expect(perteneceA(factura, { collabId: "lumea", tipo: "cobros" })).toBe(true)
    expect(perteneceA(factura, { collabId: "lumea", tipo: "collabs" })).toBe(false)
    expect(perteneceA(factura, { collabId: "lumea" })).toBe(true)
    const crm = t({ donde: { tipo: "crm", registro: { tipo: "propuesta", id: "p-nuura" } } })
    expect(perteneceA(crm, { registro: { tipo: "propuesta", id: "p-nuura" } })).toBe(true)
    expect(perteneceA(crm, { registro: { tipo: "marca", id: "p-nuura" } })).toBe(false)
  })
  it("sin tipo no dice nada; con tipo y sin campaña, solo el tipo", () => {
    expect(textoDonde({ tipo: "sin-tipo" }, ctx)).toBe("")
    expect(migasDonde({ tipo: "sin-tipo" }, ctx)).toEqual([])
    expect(textoDonde({ tipo: "cobros" }, ctx)).toBe("Cobros")
    expect(migasDonde({ tipo: "collabs", collabId: "lumea" }, ctx).map((m) => m.label)[0]).toBe("Collabs")
  })
  it("al cambiar de tipo, la campaña pasa entre Collabs y Cobros y lo demás se quita", () => {
    expect(cambiarTipo({ tipo: "collabs", collabId: "lumea", piezaId: "lumea-reel" }, "cobros")).toEqual({ tipo: "cobros", collabId: "lumea" })
    expect(cambiarTipo({ tipo: "cobros", collabId: "lumea" }, "crm")).toEqual({ tipo: "crm" })
    expect(cambiarTipo({ tipo: "crm", registro: { tipo: "marca", id: "brote" } }, "sin-tipo")).toEqual({ tipo: "sin-tipo" })
  })
})

describe("dar un valor al soltar en un grupo o al crear en él", () => {
  it("estado, prioridad y etiquetas", () => {
    expect(asignarCampo(t({}), { campo: "estado", valor: "esperando" }, ref)).toMatchObject({ estado: "esperando", esperandoDesde: HOY })
    expect(asignarCampo(t({}), { campo: "estado", valor: "hecha" }, ref)).toMatchObject({ estado: "hecha", hechaEl: ref.ahora })
    expect(asignarCampo(t({ etiquetas: ["a", "b"] }), { campo: "etiquetas", valor: "c", desde: "a" }, ref)?.etiquetas).toEqual(["b", "c"])
  })
  it("los tramos de «Cuándo» que dicen un día, y los que no", () => {
    expect(asignarCampo(t({ fecha: "2026-10-01T10:00" }), { campo: "cuando", valor: "manana" }, ref)?.fecha).toBe("2026-10-07T10:00")
    expect(asignarCampo(t({}), { campo: "cuando", valor: "proxima" }, ref)?.fecha).toBe("2026-10-12")
    expect(asignarCampo(t({}), { campo: "cuando", valor: "semana" }, ref)).toBeNull()
    expect(asignarCampo(t({ fecha: HOY, fechaLimite: "2026-10-09" }), { campo: "cuando", valor: "sin-fecha" }, ref)).toBeNull()
  })
  it("a una campaña, sin perder Cobros si ya lo era; la marca no se asigna", () => {
    expect(asignarCampo(t({}), { campo: "campana", valor: "vero" }, ref)?.donde).toEqual({ tipo: "collabs", collabId: "vero" })
    expect(asignarCampo(t({ donde: { tipo: "cobros" } }), { campo: "campana", valor: "vero" }, ref)?.donde).toEqual({ tipo: "cobros", collabId: "vero" })
    expect(asignarCampo(t({ donde: { tipo: "cobros", collabId: "vero" } }), { campo: "campana", valor: SIN_VALOR }, ref)?.donde).toEqual({ tipo: "cobros" })
    expect(asignarCampo(t({}), { campo: "proyecto", valor: "propuesta:p-nuura" }, ref)?.donde).toEqual({ tipo: "crm", registro: { tipo: "propuesta", id: "p-nuura" } })
    expect(asignarCampo(t({}), { campo: "marca", valor: "lumea" }, ref)).toBeNull()
    expect(asignarCampo(t({}), { campo: "tipo", valor: "cobros" }, ref)?.donde).toEqual({ tipo: "cobros" })
  })
  it("los campos propios: cada tipo con su valor", () => {
    const propios: CampoTarea[] = [
      { id: "red", nombre: "Red", tipo: "select", opciones: [{ id: "ig", label: "Instagram" }] },
      { id: "horas", nombre: "Horas", tipo: "numero" },
      { id: "temas", nombre: "Temas", tipo: "multiselect", opciones: [{ id: "a", label: "A" }, { id: "b", label: "B" }] },
      { id: "ok", nombre: "Revisada", tipo: "casilla" },
    ]
    const r = { ...ref, propios }
    expect(asignarCampo(t({}), { campo: "propio:red", valor: "ig" }, r)?.valores).toEqual({ red: "ig" })
    expect(asignarCampo(t({}), { campo: "propio:horas", valor: "3" }, r)?.valores).toEqual({ horas: 3 })
    expect(asignarCampo(t({ valores: { temas: ["a"] } }), { campo: "propio:temas", valor: "b", desde: "a" }, r)?.valores).toEqual({ temas: ["b"] })
    expect(asignarCampo(t({}), { campo: "propio:ok", valor: "true" }, r)?.valores).toEqual({ ok: true })
    expect(asignarCampo(t({ valores: { red: "ig" } }), { campo: "propio:red", valor: SIN_VALOR }, r)?.valores).toEqual({})
    expect(asignarCampo(t({}), { campo: "propio:otro", valor: "x" }, r)).toBeNull()
    const campos = camposTarea({ ctx, etiquetas: [], hoy: HOY, tareas: [], propios })
    expect(campos.find((c) => c.id === "propio:ok")?.valor(t({}))).toBe(false)
  })
})

describe("los campos de tareas agrupan bien la demo", () => {
  it("por cuándo, en orden de tramos", () => {
    const campos = camposTarea({ ctx, etiquetas: demoEtiquetasTarea, hoy: HOY, tareas: demoTareas })
    const grupos = agruparFilas(demoTareas.filter((x) => !x.padreId), { campo: "cuando", ocultarVacios: true }, campos, { hoy: HOY })
    expect(grupos.map((g) => g.id)).toEqual(["vencidas", "hoy", "manana", "semana", "proxima", "despues", "sin-fecha", "hechas"])
  })
})
