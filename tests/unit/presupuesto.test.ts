import { describe, expect, it } from "vitest"
import { lineasDePropuesta } from "@/lib/influencer/presupuesto"
import type { Tarifa } from "@/lib/influencer/modelo"

const tarifas: Tarifa[] = [
  { formato: "reel", precio: 690, minimo: 500 },
  { formato: "story", precio: 150, minimo: 100 },
]
const entregable = (formato: string, importe?: string) => ({ clave: formato, formato, tipo: "video" as const, titulo: formato, publicacion: "", indicaciones: "", requiereGuion: false, fechaGuion: "", condiciones: [], importe })

describe("presupuesto de una propuesta", () => {
  it("sin borrador, a sus tarifas", () => {
    expect(lineasDePropuesta({ piezas: [{ formato: "reel", cantidad: 1 }] }, tarifas)).toEqual([{ formato: "reel", cantidad: 1, precio: 690 }])
  })
  it("con el formulario de collab, al importe que le puso a sus entregables (la media si son varios)", () => {
    const borrador = { plataformas: [], brief: "", piezas: [entregable("reel", "850"), entregable("story", "100"), entregable("story", "200")], condiciones: [] }
    expect(lineasDePropuesta({ piezas: [{ formato: "reel", cantidad: 1 }, { formato: "story", cantidad: 2 }], borrador }, tarifas)).toEqual([
      { formato: "reel", cantidad: 1, precio: 850 },
      { formato: "story", cantidad: 2, precio: 150 },
    ])
  })
})
