import { describe, expect, it } from "vitest"
import { aplicarCambiosContactos, anadirContacto, camposBaseContactos, contactoDeFormulario, escribirEnContacto } from "@/lib/influencer/base-contactos"
import type { Contacto, Marca } from "@/lib/influencer/modelo"

const marcas: Marca[] = [
  { id: "m1", nombre: "Lumea", sector: "Belleza", tint: "rose", atribucion: "propia", creadaEl: "2026-09-01" },
  { id: "m2", nombre: "Nuura", sector: "Moda", tint: "sky", atribucion: "red", creadaEl: "2026-09-02" },
]
const contactos: Contacto[] = [
  { id: "c1", nombre: "Ana", marcaId: "m1", principal: true, creadoEl: "2026-09-03" },
  { id: "c2", nombre: "Bea", marcaId: "m1", creadoEl: "2026-09-04" },
]
const campos = camposBaseContactos({ marcas, interacciones: [], propios: [{ id: "f1", nombre: "Presupuesto", tipo: "moneda" }] })
const campo = (id: string) => campos.find((c) => c.id === id)!

describe("base de contactos", () => {
  it("las marcas son opciones con el color de su tinte, y los campos propios van al final", () => {
    expect(campo("marca").opciones).toEqual([{ id: "m1", label: "Lumea", color: "rosa" }, { id: "m2", label: "Nuura", color: "azul" }])
    expect(campos.at(-1)?.id).toBe("f1")
  })
  it("cada campo se escribe en su sitio: la marca en marcaId, Instagram sin @, los propios en valores", () => {
    expect(escribirEnContacto(contactos[1], campo("marca"), "m2").marcaId).toBe("m2")
    expect(escribirEnContacto(contactos[1], campo("instagram"), "@bea").instagram).toBe("bea")
    expect(escribirEnContacto(contactos[1], campo("f1"), 1200).valores).toEqual({ f1: 1200 })
    expect(escribirEnContacto({ ...contactos[1], valores: { f1: 3 } }, campo("f1"), null).valores).toEqual({})
    expect(escribirEnContacto(contactos[1], campo("ultimoContacto"), "2026-10-01")).toBe(contactos[1])
    expect(escribirEnContacto(contactos[1], campo("nombre"), "  ").nombre).toBe("Bea")
  })
  it("hay un principal por marca: marcar a otro se lo quita al anterior", () => {
    const despues = aplicarCambiosContactos(contactos, [{ id: "c2", campo: campo("principal"), valor: true }])
    expect(despues.map((c) => [c.id, !!c.principal])).toEqual([["c1", false], ["c2", true]])
  })
  it("la marca es un registro vinculado; quitarla deja al contacto suelto y sin ser principal", () => {
    expect(campo("marca")).toMatchObject({ tipo: "vinculo", vinculo: { objeto: "marca" } })
    expect(campo("marca").obligatorio).toBeFalsy()
    expect(escribirEnContacto(contactos[0], campo("marca"), null)).toMatchObject({ marcaId: undefined, principal: false })
  })
  it("del formulario: pide el nombre; la marca es opcional y el primero de una marca es su principal", () => {
    expect(contactoDeFormulario({}, campos, { id: "c3", hoy: "2026-10-13", contactos })).toBe("Escribe el nombre")
    const suelto = contactoDeFormulario({ nombre: "Carla" }, campos, { id: "c3", hoy: "2026-10-13", contactos })
    expect(suelto).toEqual({ id: "c3", nombre: "Carla", creadoEl: "2026-10-13" })
    const nuevo = contactoDeFormulario({ nombre: "Carla", marca: "m2", email: "carla@nuura.es", f1: 50 }, campos, { id: "c3", hoy: "2026-10-13", contactos })
    expect(nuevo).toMatchObject({ id: "c3", nombre: "Carla", marcaId: "m2", email: "carla@nuura.es", principal: true, valores: { f1: 50 } })
    if (typeof nuevo === "string") throw new Error(nuevo)
    expect(anadirContacto(contactos, { ...nuevo, marcaId: "m1" }).filter((c) => c.principal).map((c) => c.id)).toEqual(["c3"])
  })
})
