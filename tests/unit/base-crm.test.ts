import { describe, expect, it } from "vitest"
import type { Contacto, Marca, Plantilla, Propuesta } from "@/lib/influencer/modelo"
import { camposBaseMarcas, camposBasePlantillas, camposBasePropuestas, escribirEnMarca, escribirEnPlantilla, escribirEnPropuesta, vistasDeSeriePropuestas } from "@/lib/influencer/base-crm"

const marcas: Marca[] = [
  { id: "m1", nombre: "Lumea", sector: "Skincare", tint: "rose", atribucion: "propia", atribucionHasta: "2027-01-01", creadaEl: "2026-09-01" },
  { id: "m2", nombre: "Nuura", sector: "Moda", tint: "sky", atribucion: "red", creadaEl: "2026-09-02" },
]
const contactos: Contacto[] = [{ id: "c1", nombre: "Ana", marcaId: "m1", principal: true, creadoEl: "2026-09-03" }]
const propuesta: Propuesta = { id: "p1", marcaId: "m1", campana: "Otoño", estado: "hablando", origen: "marca", piezas: [{ formato: "reel", cantidad: 2 }], ultimoContacto: "2026-10-01", creadaEl: "2026-09-20" }
const plantilla: Plantilla = { id: "t1", nombre: "Hola", uso: "primer-contacto", canal: "email", cuerpo: "Hola {{contacto.nombre}}", favorita: false, usos: 0, creadaEl: "2026-09-01", actualizadaEl: "2026-09-01" }

describe("bases del CRM", () => {
  const camposMarca = camposBaseMarcas({ marcas, contactos, resumenes: new Map(), propios: [{ id: "f1", nombre: "Prioridad", tipo: "numero" }] })
  const cm = (id: string) => camposMarca.find((c) => c.id === id)!

  it("marcas: pasar a la red quita el «tuya hasta»; volver a tuya lo pone desde hoy", () => {
    const red = escribirEnMarca(marcas[0], cm("atribucion"), "red", "2026-10-13T10:00:00")
    expect(red).toMatchObject({ atribucion: "red", atribucionHasta: undefined })
    expect(escribirEnMarca(marcas[1], cm("atribucion"), "propia", "2026-10-13T10:00:00")).toMatchObject({ atribucion: "propia", atribucionHasta: "2026-10-13" })
    expect(escribirEnMarca(marcas[0], cm("relacion"), "cliente", "2026-10-13")).toBe(marcas[0])
    expect(escribirEnMarca(marcas[0], cm("f1"), 3, "2026-10-13").valores).toEqual({ f1: 3 })
  })

  it("propuestas: la marca y el contacto son vínculos, y el pipeline es un kanban por estado", () => {
    const campos = camposBasePropuestas({ marcas, contactos, tarifas: [], propios: [] })
    const c = (id: string) => campos.find((x) => x.id === id)!
    expect(c("marca").tipo).toBe("vinculo")
    expect(c("contacto").valor(propuesta)).toBe("c1")
    expect(c("estado").opciones?.[0]).toMatchObject({ id: "nueva", tono: "neutral" })
    expect(escribirEnPropuesta(propuesta, c("contacto"), null).contactoId).toBeUndefined()
    expect(escribirEnPropuesta(propuesta, c("origen"), "otra cosa")).toBe(propuesta)
    const [pipeline, , pasos] = vistasDeSeriePropuestas(campos)
    expect(pipeline).toMatchObject({ tipo: "kanban", apilar: "estado" })
    expect(pipeline.campos.find((x) => x.id === "marca")?.visible).toBe(true)
    expect(pasos).toMatchObject({ tipo: "calendario", fecha: "siguienteFecha" })
  })

  it("plantillas: cambiar el texto pone al día la fecha de edición", () => {
    const campos = camposBasePlantillas({ propios: [] })
    const cuerpo = campos.find((x) => x.id === "cuerpo")!
    expect(escribirEnPlantilla(plantilla, cuerpo, "Buenas", "2026-10-13T12:00:00")).toMatchObject({ cuerpo: "Buenas", actualizadaEl: "2026-10-13T12:00:00" })
  })
})
