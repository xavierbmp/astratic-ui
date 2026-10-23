import { describe, expect, it } from "vitest"
import { datosDeCobroCompletos, primerosPasos, siguientePaso, type DatosPrimerosPasos } from "@/lib/influencer/primeros-pasos"
import { demoPerfil } from "@/lib/influencer/demo-data"
import { demoAcuerdo, demoDatosFiscales, demoDatosPersonales } from "@/lib/influencer/demo-documentos"
import { demoCapitulosBiblia, demoLecturasBiblia } from "@/lib/influencer/demo-biblia"

const base: DatosPrimerosPasos = {
  perfil: demoPerfil,
  acuerdo: demoAcuerdo,
  fiscales: demoDatosFiscales,
  envio: demoDatosPersonales.envio,
  capitulos: demoCapitulosBiblia,
  lecturas: demoLecturasBiblia,
  tieneTarifas: true,
  marcasPropias: 3,
  instagramConectado: true,
  trabajoContado: true,
}

describe("completar el perfil", () => {
  it("cada paso sale hecho o no de los datos", () => {
    const hechos = Object.fromEntries(primerosPasos(base).map((p) => [p.id, p.hecho]))
    expect(hechos).toEqual({ perfil: true, trabajo: true, tarifas: true, marcas: true, cobros: true, instagram: true, biblia: false, autocontrol: false, bio: true })
  })

  it("una cuenta recién creada lo tiene todo pendiente y empieza por el perfil", () => {
    const nueva: DatosPrimerosPasos = {
      ...base,
      perfil: { ...demoPerfil, bio: "", fotoUrl: "", cuentas: [], autocontrol: undefined },
      acuerdo: { ...demoAcuerdo, mencionComprobadaEl: undefined },
      fiscales: { ...demoDatosFiscales, nif: "", iban: "" },
      envio: { direccion: "", cp: "", ciudad: "", provincia: "" },
      lecturas: {},
      tieneTarifas: false,
      marcasPropias: 0,
      instagramConectado: false,
      trabajoContado: false,
    }
    const pasos = primerosPasos(nueva)
    expect(pasos.every((p) => !p.hecho)).toBe(true)
    expect(siguientePaso(pasos)?.id).toBe("perfil")
  })

  it("los pasos de la bienvenida llevan a su paso; el resto, a su página", () => {
    const enlaces = Object.fromEntries(primerosPasos(base).map((p) => [p.id, p.href]))
    expect(enlaces.tarifas).toBe("/bienvenida?paso=tarifas")
    expect(enlaces.instagram).toBe("/bienvenida?paso=conexiones")
    expect(enlaces.autocontrol).toBe("/workspace/academia/autocontrol")
  })

  it("para cobrar hacen falta los datos fiscales y la dirección de envío", () => {
    expect(datosDeCobroCompletos(demoDatosFiscales, demoDatosPersonales.envio)).toBe(true)
    expect(datosDeCobroCompletos(demoDatosFiscales, { ...demoDatosPersonales.envio, cp: "" })).toBe(false)
    expect(datosDeCobroCompletos({ ...demoDatosFiscales, iban: " " }, demoDatosPersonales.envio)).toBe(false)
  })

  it("con todo hecho no queda siguiente paso", () => {
    expect(siguientePaso(primerosPasos(base).map((p) => ({ ...p, hecho: true })))).toBeNull()
  })
})
