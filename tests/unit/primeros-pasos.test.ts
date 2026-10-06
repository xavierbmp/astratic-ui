import { describe, expect, it } from "vitest"
import { primerosPasos } from "@/lib/influencer/primeros-pasos"
import { demoPerfil } from "@/lib/influencer/demo-data"
import { demoAcuerdo, demoDatosFiscales } from "@/lib/influencer/demo-documentos"
import { demoCapitulosBiblia, demoLecturasBiblia } from "@/lib/influencer/demo-biblia"

describe("primeros pasos", () => {
  it("cada paso sale hecho o no de los datos", () => {
    const pasos = primerosPasos({ perfil: demoPerfil, acuerdo: demoAcuerdo, fiscales: demoDatosFiscales, capitulos: demoCapitulosBiblia, lecturas: demoLecturasBiblia })
    expect(Object.fromEntries(pasos.map((p) => [p.id, p.hecho]))).toEqual({ perfil: true, bio: true, fiscales: true, biblia: false, autocontrol: false })
  })
  it("sin datos fiscales ni mención, quedan pendientes", () => {
    const pasos = primerosPasos({ perfil: demoPerfil, acuerdo: { ...demoAcuerdo, mencionComprobadaEl: undefined }, fiscales: { ...demoDatosFiscales, iban: "" }, capitulos: [], lecturas: {} })
    expect(pasos.filter((p) => !p.hecho).map((p) => p.id)).toEqual(["bio", "fiscales", "autocontrol"])
  })
})
