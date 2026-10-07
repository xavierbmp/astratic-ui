import { describe, expect, it } from "vitest"
import { borrarCarpeta, carpetasEnArbol, conDescendientes, hijasDe, moverCarpeta, nombreCompleto, opcionesDeCarpetas, rutaDeCarpeta, siguienteOrden } from "@/lib/influencer/carpetas"
import type { Carpeta } from "@/lib/influencer/modelo"

const k = (id: string, orden: number, padreId?: string): Carpeta => ({ id, nombre: id.toUpperCase(), tint: "mint", padreId, orden })
// a ─ b ─ c   ·   d   (en la lista, d va antes que a: manda `orden`)
const ARBOL = [k("d", 1), k("b", 0, "a"), k("a", 0), k("c", 0, "b")]
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
    expect(r?.map((c) => `${c.id}${c.orden}`).sort()).toEqual(["a1", "b0", "c0", "d2"])
  })
  it("solo cambian las que cambian de sitio (lo demás se guarda igual)", () => {
    const r = moverCarpeta(ARBOL, "d", { antesDe: "a" })
    expect(r?.find((c) => c.id === "b")).toBe(ARBOL.find((c) => c.id === "b"))
    expect(r && ids(hijasDe(r))).toEqual(["d", "a"])
  })
  it("una carpeta nueva va al final de sus hermanas", () => {
    expect(siguienteOrden(ARBOL)).toBe(2)
    expect(siguienteOrden(ARBOL, "c")).toBe(0)
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
    expect(ids(hijasDe(borrarCarpeta(ARBOL, "a").carpetas))).toEqual(["d", "b"])
    expect(borrarCarpeta(ARBOL, "a").destino).toBeUndefined()
  })
})
