// Las bases del workspace al estilo Airtable, más allá del CRM: tareas, collabs, ideas y notas,
// revisión de contenido y cobros. Lo que se comprueba es que se escriban con las reglas de siempre.
import { describe, expect, it } from "vitest"
import { HOY, demoCamposTarea, demoContactos, demoEtiquetasTarea, demoMarcas, demoPropuestas, demoTareas } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoApuntes, demoCarpetas, demoContenidos, demoFechasClave, demoPilares } from "@/lib/influencer/demo-contenidos"
import { camposBaseTareas, escribirEnTarea, vistasDeSerieTareas } from "@/lib/influencer/base-tareas"
import { camposBaseCollabs, escribirEnCollab } from "@/lib/influencer/base-collabs"
import { camposBaseApuntes, escribirEnApunte, vistasDeSerieApuntes } from "@/lib/influencer/base-apuntes"
import { camposBasePiezas } from "@/lib/influencer/base-piezas"
import { camposBaseCobros, nombreDeLinea } from "@/lib/influencer/base-cobros"
import { filasDePiezas } from "@/lib/influencer/biblioteca"
import { soloFecha } from "@/lib/influencer/fechas"

const dia = soloFecha(HOY)
const ctx = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos }

describe("base de tareas", () => {
  const campos = camposBaseTareas({ ctx, etiquetas: demoEtiquetasTarea, hoy: HOY, tareas: demoTareas, propios: demoCamposTarea })
  const campo = (id: string) => campos.find((c) => c.id === id)!
  const ref = { hoy: HOY, ahora: HOY, propios: demoCamposTarea }
  const abierta = demoTareas.find((t) => t.estado === "por-hacer" && !t.padreId)!

  it("marcar «Hecha» la cierra con su fecha; ponerla en «Hoy» le da el día de hoy", () => {
    expect(escribirEnTarea(abierta, campo("hecha"), true, ref)).toMatchObject({ estado: "hecha" })
    expect(soloFecha(escribirEnTarea(abierta, campo("cuando"), "hoy", ref).fecha ?? "")).toBe(dia)
  })

  it("lo que no se puede poner así no cambia la tarea", () => {
    expect(escribirEnTarea(abierta, campo("cuando"), "semana", ref)).toBe(abierta)
    expect(escribirEnTarea(abierta, campo("subtareas"), "3 de 4", ref)).toBe(abierta)
  })

  it("las vistas de serie dejan fuera las subtareas y la primera va por cuándo", () => {
    const [porCuando] = vistasDeSerieTareas(campos)
    expect(porCuando.grupos[0]?.campo).toBe("cuando")
    expect(porCuando.filtro.condiciones).toEqual([{ campo: "esSubtarea", op: "falso" }])
  })
})

describe("base de collabs", () => {
  const campos = camposBaseCollabs({ marcas: demoMarcas, formularios: [], propios: [] })
  const campo = (id: string) => campos.find((c) => c.id === id)!
  it("el estado se cambia; el importe y el cobro, en su página", () => {
    const c = demoCollabs[0]
    expect(escribirEnCollab(c, campo("estado"), "cerrada").estado).toBe("cerrada")
    expect(escribirEnCollab(c, campo("estado"), "inventado")).toBe(c)
    expect(escribirEnCollab(c, campo("importe"), 1)).toBe(c)
  })
})

describe("base de ideas y notas", () => {
  const campos = camposBaseApuntes({ contenidos: demoContenidos, pilares: demoPilares, carpetas: demoCarpetas, marcas: demoMarcas, fechasClave: demoFechasClave, hoy: dia })
  const campo = (id: string) => campos.find((c) => c.id === id)!
  it("el estado de una idea se pone a mano; planificada no (la pone su contenido)", () => {
    const idea = demoApuntes.find((a) => a.tipo === "idea" && a.estado === "apuntada")!
    expect(escribirEnApunte(idea, campo("estado"), "para-hacer").estado).toBe("para-hacer")
    expect(escribirEnApunte(idea, campo("estado"), "planificada")).toBe(idea)
  })
  it("las ideas salen en tarjetas y las notas en su vista", () => {
    const [ideas, notas] = vistasDeSerieApuntes(campos)
    expect(ideas).toMatchObject({ tipo: "galeria", filtro: { condiciones: [{ campo: "tipo", valor: "idea" }] } })
    expect(notas.filtro.condiciones[0]).toMatchObject({ valor: "nota" })
  })
})

describe("revisión de contenido y cobros", () => {
  it("las piezas van por momento del trabajo y todo es de lectura", () => {
    const campos = camposBasePiezas({ marcas: demoMarcas })
    expect(campos.every((c) => c.soloLectura)).toBe(true)
    const fila = filasDePiezas(demoCollabs, dia)[0]
    expect(campos.find((c) => c.id === "momento")?.valor(fila)).toBe(fila.grupo)
  })
  it("en cobros solo el estado se mueve (con las acciones de la factura)", () => {
    const campos = camposBaseCobros({ marcas: demoMarcas })
    expect(campos.filter((c) => !c.soloLectura).map((c) => c.id)).toEqual(["estado"])
    const linea = { id: "p", collab: demoCollabs[0], plazo: { id: "p", concepto: "50 % al firmar", porcentaje: 50 }, estado: "por-facturar" as const, base: 0, total: 0, previsto: dia, tocaFacturar: false, diasVencida: 0 }
    expect(nombreDeLinea(linea)).toBe(`${demoCollabs[0].campana} · 50 % al firmar`)
  })
})
