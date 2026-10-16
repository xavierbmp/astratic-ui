import { describe, expect, it } from "vitest"
import { datosDelBloque, hojasDelMediaKit, presupuestoDelKit } from "@/lib/influencer/media-kit"
import { conDato, seVe } from "@/lib/bloques"
import { demoMediaKit, demoPerfil } from "@/lib/influencer/demo-data"

describe("media kit", () => {
  it("cada red, destacado, marca y tarifa se puede esconder por separado", () => {
    expect(datosDelBloque("redes", demoPerfil, demoMediaKit, []).map((d) => d.clave)).toEqual(expect.arrayContaining(demoPerfil.cuentas.map((c) => `redes.${c.red}`)))
    expect(datosDelBloque("marcas", demoPerfil, demoMediaKit, ["Lumea", "Glow"]).map((d) => d.clave)).toEqual(["marcas.Lumea", "marcas.Glow"])
    expect(datosDelBloque("tarifas", demoPerfil, demoMediaKit, []).at(-1)?.clave).toBe("tarifas.nota")
  })

  it("esconder y volver a enseñar un dato no deja repetidos", () => {
    const sinBio = conDato(conDato(demoMediaKit, "portada.bio", false), "portada.bio", false)
    expect(sinBio.ocultos).toEqual(["portada.bio"])
    expect(seVe(sinBio, "portada.bio")).toBe(false)
    expect(seVe(conDato(sinBio, "portada.bio", true), "portada.bio")).toBe(true)
  })

  it("ningún bloque se parte entre hojas", () => {
    const hojas = hojasDelMediaKit(["portada", "cifras", "redes", "audiencia", "destacados", "marcas", "tarifas", "contacto"], { perfil: demoPerfil, kit: demoMediaKit, marcasTrabajadas: [] })
    expect(hojas.flat()).toHaveLength(8)
    expect(hojas.length).toBeGreaterThan(1)
  })

  it("con muchas marcas, lo que no cabe pasa a la hoja siguiente", () => {
    const ctx = (n: number) => ({ perfil: demoPerfil, kit: demoMediaKit, marcasTrabajadas: Array.from({ length: n }, (_, i) => `Marca ${i}`) })
    const bloques = ["destacados", "marcas", "tarifas", "contacto"] as const
    expect(hojasDelMediaKit([...bloques], ctx(2))).toHaveLength(1)
    expect(hojasDelMediaKit([...bloques], ctx(13))).toHaveLength(2)
  })

  it("el presupuesto parte de las tarifas, con lo cambiado, el pack y el descuento", () => {
    const kit = { ...demoMediaKit, ocultos: ["presupuesto.story"], presupuesto: { precios: { reel: 500 }, pack: { nombre: "Lanzamiento", precio: 900 }, descuento: 10 } }
    const { lineas, pack, descuento } = presupuestoDelKit(kit, demoPerfil)
    expect(lineas.find((l) => l.formato === "reel")).toMatchObject({ precio: 500, final: 450 })
    expect(lineas.some((l) => l.formato === "story")).toBe(false)
    expect(pack).toMatchObject({ precio: 900, final: 810 })
    expect(descuento).toBe(10)
    expect(presupuestoDelKit({ ...kit, presupuesto: { ...kit.presupuesto, soloPack: true } }, demoPerfil).lineas).toHaveLength(0)
  })
})
