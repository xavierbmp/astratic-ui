import { describe, expect, it } from "vitest"
import { conDato, datosDelBloque, hojasDelMediaKit, seVe } from "@/lib/influencer/media-kit"
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
    const hojas = hojasDelMediaKit(["portada", "cifras", "redes", "audiencia", "destacados", "marcas", "tarifas", "contacto"])
    expect(hojas.flat()).toHaveLength(8)
    expect(hojas.length).toBeGreaterThan(1)
  })
})
