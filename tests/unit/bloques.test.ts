import { describe, expect, it } from "vitest"
import { bloquesVisibles, conBloque, conDato, moverBloque, seVe, type AjustesBloques } from "@/lib/bloques"

const ajustes: AjustesBloques<"a" | "b" | "c"> = {
  bloques: [
    { id: "a", visible: true },
    { id: "b", visible: false },
    { id: "c", visible: true },
  ],
}

describe("ajustes de bloques", () => {
  it("enseña los visibles en su orden", () => {
    expect(bloquesVisibles(ajustes)).toEqual(["a", "c"])
    expect(bloquesVisibles(conBloque(ajustes, "b", true))).toEqual(["a", "b", "c"])
  })

  it("mover un bloque lo pone en el sitio del otro y lo que no existe no cambia nada", () => {
    expect(moverBloque(ajustes, "c", "a").bloques.map((b) => b.id)).toEqual(["c", "a", "b"])
    expect(moverBloque(ajustes, "a", "c").bloques.map((b) => b.id)).toEqual(["b", "c", "a"])
    expect(moverBloque(ajustes, "x", "a")).toBe(ajustes)
  })

  it("esconder un dato dos veces no lo repite y enseñarlo lo quita", () => {
    const sin = conDato(conDato(ajustes, "a.uno", false), "a.uno", false)
    expect(sin.ocultos).toEqual(["a.uno"])
    expect(seVe(sin, "a.uno")).toBe(false)
    expect(seVe(conDato(sin, "a.uno", true), "a.uno")).toBe(true)
  })
})
