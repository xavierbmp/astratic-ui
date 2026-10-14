import { describe, expect, it } from "vitest"
import { FORMATOS_PIEZA_DE_SERIE, cambiarFormatoDePieza, esquemaFormatosPieza, formatosDe, guardarFormato, nombreRepetido, piezaDeFormato, quitarFormato } from "@/lib/influencer/formatos-pieza"
import type { FormatoPieza } from "@/lib/influencer/modelo"

const reel = FORMATOS_PIEZA_DE_SERIE[0]
const mencion: FormatoPieza = { id: "fp-1", nombre: "Mención en la bio", tipo: "texto", red: "instagram" }

describe("formatos de pieza", () => {
  it("sin lista propia salen los de serie; con lista, la suya aunque esté vacía", () => {
    expect(formatosDe(null)).toBe(FORMATOS_PIEZA_DE_SERIE)
    expect(formatosDe([])).toEqual([])
    expect(formatosDe([mencion])).toEqual([mencion])
  })

  it("no deja dos formatos con el mismo nombre, sin mirar mayúsculas", () => {
    expect(nombreRepetido(FORMATOS_PIEZA_DE_SERIE, "reel")).toBe("Ya tienes un formato que se llama así")
    expect(nombreRepetido(FORMATOS_PIEZA_DE_SERIE, " Reel ", "reel")).toBeUndefined()
    expect(nombreRepetido(FORMATOS_PIEZA_DE_SERIE, "Mención en la bio")).toBeUndefined()
    expect(esquemaFormatosPieza.safeParse([reel, { ...mencion, nombre: "REEL" }]).success).toBe(false)
  })

  it("añade al final, cambia en su sitio y quita", () => {
    const con = guardarFormato(FORMATOS_PIEZA_DE_SERIE, { ...mencion, nombre: "  Mención en la bio " })
    expect(con.at(-1)).toEqual(mencion)
    const cambiada = guardarFormato(con, { ...reel, nombre: "Reel largo" })
    expect(cambiada[0].nombre).toBe("Reel largo")
    expect(cambiada).toHaveLength(con.length)
    expect(quitarFormato(cambiada, mencion.id)).toHaveLength(FORMATOS_PIEZA_DE_SERIE.length)
  })

  it("una pieza nueva toma el tipo, la red y el nombre del formato", () => {
    expect(piezaDeFormato(mencion, "2026-10-20")).toEqual({ formato: "fp-1", tipo: "texto", red: "instagram", titulo: "Mención en la bio", publicacion: "2026-10-20", indicaciones: "" })
  })

  it("al cambiar de formato, el nombre solo cambia si seguía siendo el del anterior", () => {
    const pieza = piezaDeFormato(reel, "")
    expect(cambiarFormatoDePieza(pieza, mencion, reel)).toMatchObject({ formato: "fp-1", tipo: "texto", titulo: "Mención en la bio" })
    const conNombre = { ...pieza, titulo: "Reel de la rutina" }
    expect(cambiarFormatoDePieza(conNombre, mencion, reel)).toMatchObject({ tipo: "texto", red: "instagram", titulo: "Reel de la rutina" })
    expect(cambiarFormatoDePieza({ ...pieza, titulo: " " }, mencion, undefined).titulo).toBe("Mención en la bio")
  })
})
