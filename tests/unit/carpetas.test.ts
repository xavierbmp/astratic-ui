import { describe, expect, it } from "vitest"
import { borrarCarpeta, carpetasEnArbol, conDescendientes, hijasDe, moverCarpeta, nombreCompleto, opcionesDeCarpetas, rutaDeCarpeta } from "@/lib/influencer/carpetas"
import type { Carpeta } from "@/lib/influencer/modelo"

const k = (id: string, padreId?: string): Carpeta => ({ id, nombre: id.toUpperCase(), tint: "mint", padreId })
// a ─ b ─ c   ·   d
const ARBOL = [k("a"), k("b", "a"), k("c", "b"), k("d")]
const ids = (lista: Carpeta[]) => lista.map((c) => c.id)

describe("árbol de carpetas", () => {
  it("hijas, descendientes y ruta", () => {
    expect(ids(hijasDe(ARBOL))).toEqual(["a", "d"])
    expect(ids(hijasDe(ARBOL, "a"))).toEqual(["b"])
    expect([...conDescendientes(ARBOL, "a")].sort()).toEqual(["a", "b", "c"])
    expect(ids(rutaDeCarpeta(ARBOL, "c"))).toEqual(["a", "b", "c"])
    expect(nombreCompleto(ARBOL, "c")).toBe("A / B / C")
  })
  it("en orden de árbol con su nivel; las plegadas no enseñan sus hijas", () => {
    expect(carpetasEnArbol(ARBOL).map((f) => `${f.carpeta.id}${f.nivel}`)).toEqual(["a0", "b1", "c2", "d0"])
    expect(carpetasEnArbol(ARBOL, new Set(["a"])).map((f) => f.carpeta.id)).toEqual(["a", "b", "d"])
    expect(carpetasEnArbol(ARBOL).find((f) => f.carpeta.id === "b")?.tieneHijas).toBe(true)
  })
  it("las opciones de un selector llevan el nombre completo", () => {
    expect(opcionesDeCarpetas(ARBOL).map((o) => o.label)).toEqual(["A", "A / B", "A / B / C", "D"])
  })
})

describe("mover una carpeta", () => {
  it("dentro de otra, al final de sus hijas", () => {
    const r = moverCarpeta(ARBOL, "d", { padreId: "a" })
    expect(r && ids(hijasDe(r, "a"))).toEqual(["b", "d"])
  })
  it("antes de una hermana, y arriba del todo", () => {
    const r = moverCarpeta(ARBOL, "c", { antesDe: "a" })
    expect(r && ids(hijasDe(r))).toEqual(["c", "a", "d"])
  })
  it("nunca dentro de sí misma ni de las suyas", () => {
    expect(moverCarpeta(ARBOL, "a", { padreId: "c" })).toBeNull()
    expect(moverCarpeta(ARBOL, "a", { padreId: "a" })).toBeNull()
  })
})

describe("borrar una carpeta", () => {
  it("lo que llevaba dentro sube a su madre", () => {
    const { carpetas, destino } = borrarCarpeta(ARBOL, "b")
    expect(destino).toBe("a")
    expect(carpetas.find((c) => c.id === "c")?.padreId).toBe("a")
    expect(borrarCarpeta(ARBOL, "a").destino).toBeUndefined()
  })
})
