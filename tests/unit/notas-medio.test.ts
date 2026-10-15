import { describe, expect, it } from "vitest"
import { cajaJuntoA, notasEnFotograma, puntoEnCaja, segundoDeNota } from "@/lib/notas-medio"

describe("notas sobre el vídeo", () => {
  it("el segundo se guarda con décimas y nunca negativo", () => {
    expect(segundoDeNota(12.347)).toBe(12.3)
    expect(segundoDeNota(-1)).toBe(0)
  })

  it("el punto pulsado va en % de la caja, sin salirse", () => {
    const caja = { left: 100, top: 50, width: 200, height: 400 }
    expect(puntoEnCaja(caja, 150, 250)).toEqual({ x: 25, y: 50 })
    expect(puntoEnCaja(caja, 400, 10)).toEqual({ x: 100, y: 0 })
  })

  it("parado en un segundo se ven las notas de ese fotograma", () => {
    const notas = [{ id: "a", segundo: 3 }, { id: "b", segundo: 3.4 }, { id: "c", segundo: 8 }]
    expect(notasEnFotograma(notas, 3.1).map((n) => n.id)).toEqual(["a", "b"])
    expect(notasEnFotograma(notas, 5)).toEqual([])
  })

  it("la caja de la nota no se sale del fotograma y sube si abajo no cabe", () => {
    const fotograma = { ancho: 300, alto: 500 }
    const caja = { ancho: 240, alto: 120 }
    expect(cajaJuntoA({ x: 50, y: 20 }, fotograma, caja)).toEqual({ left: 30, ancho: 240, top: 118, debajo: true })
    expect(cajaJuntoA({ x: 95, y: 90 }, fotograma, caja)).toMatchObject({ left: 52, debajo: false, top: 432 })
    expect(cajaJuntoA({ x: 0, y: 50 }, { ancho: 200, alto: 400 }, caja)).toMatchObject({ left: 8, ancho: 184 })
  })
})
