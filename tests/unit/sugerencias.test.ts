import { describe, expect, it } from "vitest"
import type { Nota, Version } from "@/lib/influencer/modelo"
import { aceptadasDe, borradorSiguiente, cambioDeNota, copySiguiente, decidirSugerencia, marcasDeCitas, marcasDeSugerencias, sugerenciaAbierta } from "@/lib/influencer/sugerencias"

const nota = (datos: Partial<Nota>): Nota => ({ id: "n", autor: "Ana", el: "2026-10-15T10:00", texto: "", resuelta: false, respuestas: [], ...datos })
const version = (datos: Partial<Version>): Version => ({ id: "v1", tipo: "media", numero: 1, estado: "en-revision", creadaEl: "2026-10-14T10:00", notas: [], mensajes: [], ...datos })

const sugerencia = nota({ id: "s1", ancla: { tipo: "texto", cita: "#ad", antes: "Mi rutina ", despues: " @lumea" }, sugerencia: { poner: "#publi" } })
const comentario = nota({ id: "c1", texto: "¿Se puede decir así?", ancla: { tipo: "texto", cita: "Mi rutina" } })

describe("sugerencias de la marca", () => {
  it("una nota con sugerencia propone su cambio; un comentario no", () => {
    expect(cambioDeNota(sugerencia)).toEqual({ cita: "#ad", antes: "Mi rutina ", despues: " @lumea", poner: "#publi" })
    expect(cambioDeNota(comentario)).toBeNull()
    expect(sugerenciaAbierta(sugerencia)).toBe(true)
    expect(sugerenciaAbierta(decidirSugerencia(sugerencia, "rechazada"))).toBe(false)
  })

  it("las marcas del texto separan comentarios y sugerencias, con el número de la conversación", () => {
    const notas = [comentario, sugerencia]
    expect(marcasDeCitas(notas).map((m) => [m.id, m.numero])).toEqual([["c1", 1]])
    expect(marcasDeSugerencias(notas)).toEqual([{ id: "s1", numero: 2, cambio: expect.objectContaining({ poner: "#publi" }), estado: "pendiente" }])
  })

  it("decidir deja la nota resuelta con su decisión", () => {
    expect(decidirSugerencia(sugerencia, "aceptada")).toMatchObject({ resuelta: true, sugerencia: { poner: "#publi", decision: "aceptada" } })
    expect(decidirSugerencia(comentario, "aceptada")).toBe(comentario)
  })

  it("el copy siguiente lleva solo lo aceptado", () => {
    const otra = nota({ id: "s2", ancla: { tipo: "texto", cita: "rutina" }, sugerencia: { poner: "noche", decision: "rechazada" } })
    const v = version({ copy: "Mi rutina #ad @lumea", notas: [decidirSugerencia(sugerencia, "aceptada"), otra] })
    expect(aceptadasDe(v)).toHaveLength(1)
    expect(copySiguiente(v)).toBe("Mi rutina #publi @lumea")
  })

  it("los cambios aceptados caen en el borrador que sigue, si hay", () => {
    const v1 = version({})
    const v2 = version({ id: "v2", numero: 2, estado: "borrador" })
    expect(borradorSiguiente([v1, v2], v1)).toBe(v2)
    expect(borradorSiguiente([v1], v1)).toBeNull()
    expect(borradorSiguiente([v1, { ...v2, estado: "en-revision" }], v1)).toBeNull()
  })
})
