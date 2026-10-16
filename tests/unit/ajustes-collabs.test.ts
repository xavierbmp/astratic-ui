import { describe, expect, it } from "vitest"
import {
  AJUSTES_COLLABS_DE_SERIE,
  CONDICIONES_DE_SERIE,
  FORMATOS_PIEZA_DE_SERIE,
  ajustesDe,
  cambiarFormatoDePieza,
  cambiarPublicacion,
  describirPack,
  pluralDeFormato,
  conCampana,
  condicionDeTipo,
  condicionesDeLasPiezas,
  esquemaAjustesCollabs,
  formatosDePlataformas,
  fechaGuionPorDefecto,
  fechasDeLasPiezas,
  guardarEnLista,
  iconoSugerido,
  importeDeLasPiezas,
  nombreDePieza,
  nombreRepetido,
  piezaDeFormato,
  piezasDePack,
} from "@/lib/influencer/ajustes-collabs"
import { aplicarFormulario, numeroDeImporte, piezaDeFormulario, type FormularioBrief } from "@/lib/influencer/formularios"
import { hitosDePieza, partesDePieza, siguientePasoDePieza } from "@/lib/influencer/collabs"
import { collabDeAlta, mensajeParaLaMarca } from "@/lib/influencer/alta-collab"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import type { FormatoPieza } from "@/lib/influencer/modelo"

const HOY = "2026-10-14T18:30"
const reel = FORMATOS_PIEZA_DE_SERIE[0]
const story = FORMATOS_PIEZA_DE_SERIE[1]
const mencion: FormatoPieza = { id: "fp-1", nombre: "Mención en la bio", tipo: "texto", plataforma: "instagram", conGuion: false }
const ctx = { campana: "Otoño", diasGuion: 7, hoy: HOY }

describe("ajustes de las collabs", () => {
  it("los atajos son los formatos de las plataformas elegidas y los que valen para todas", () => {
    const deTwitch = formatosDePlataformas(FORMATOS_PIEZA_DE_SERIE, ["twitch"]).map((f) => f.id)
    expect(deTwitch).toEqual(["directo", "ugc"])
    expect(formatosDePlataformas(FORMATOS_PIEZA_DE_SERIE, []).some((f) => f.plataforma === "youtube")).toBe(true)
    expect(formatosDePlataformas(FORMATOS_PIEZA_DE_SERIE, []).some((f) => f.plataforma === "twitch")).toBe(false)
  })

  it("lo que no ha tocado sale de serie", () => {
    expect(ajustesDe(null)).toEqual(AJUSTES_COLLABS_DE_SERIE)
    expect(ajustesDe({ diasGuion: 3 })).toEqual({ ...AJUSTES_COLLABS_DE_SERIE, diasGuion: 3 })
  })

  it("no deja dos con el mismo nombre, sin mirar mayúsculas", () => {
    expect(nombreRepetido(FORMATOS_PIEZA_DE_SERIE, "reel")).toBe("Ya hay uno que se llama así")
    expect(nombreRepetido(FORMATOS_PIEZA_DE_SERIE, " Reel ", "reel")).toBeUndefined()
    expect(esquemaAjustesCollabs.safeParse({ ...AJUSTES_COLLABS_DE_SERIE, formatos: [reel, { ...mencion, nombre: "REEL" }] }).success).toBe(false)
  })

  it("añade al final o cambia en su sitio", () => {
    const con = guardarEnLista(FORMATOS_PIEZA_DE_SERIE, { ...mencion, nombre: "  Mención en la bio " })
    expect(con.at(-1)).toEqual(mencion)
    expect(guardarEnLista(con, { ...reel, nombre: "Reel largo" })[0].nombre).toBe("Reel largo")
  })
})

describe("lo que se rellena solo en el alta", () => {
  it("el nombre de serie es el contenido y la campaña", () => {
    expect(nombreDePieza("Reel", "Otoño")).toBe("Reel · Otoño")
    expect(nombreDePieza("Reel", " ")).toBe("Reel")
  })

  it("el guion va N días antes de publicar, y nada si ya no da tiempo o no hay día", () => {
    expect(fechaGuionPorDefecto("2026-10-30", 7, HOY)).toBe("2026-10-23")
    expect(fechaGuionPorDefecto("2026-10-18", 7, HOY)).toBe("")
    expect(fechaGuionPorDefecto("", 7, HOY)).toBe("")
  })

  it("una pieza nueva toma del formato el tipo, la red y si pide guion", () => {
    expect(piezaDeFormato(reel, "2026-10-30", ctx)).toMatchObject({ formato: "reel", tipo: "video", titulo: "Reel · Otoño", requiereGuion: true, fechaGuion: "2026-10-23" })
    expect(piezaDeFormato(story, "2026-10-30", ctx)).toMatchObject({ requiereGuion: false, fechaGuion: "" })
    expect(piezaDeFormato(mencion, "2026-10-30", ctx)).toMatchObject({ tipo: "texto", requiereGuion: false })
  })

  it("al cambiar de formato o de campaña, el nombre escrito a mano no se pisa", () => {
    const pieza = piezaDeFormato(reel, "2026-10-30", ctx)
    expect(cambiarFormatoDePieza(pieza, story, ctx).titulo).toBe("Story · Otoño")
    expect(cambiarFormatoDePieza({ ...pieza, titulo: "El de la rutina", nombreManual: true }, story, ctx).titulo).toBe("El de la rutina")
    expect(conCampana([pieza], FORMATOS_PIEZA_DE_SERIE, "Navidad")[0].titulo).toBe("Reel · Navidad")
  })

  it("la fecha del guion sigue a la publicación mientras sea la de serie", () => {
    const pieza = piezaDeFormato(reel, "2026-10-30", ctx)
    expect(cambiarPublicacion(pieza, "2026-11-10", ctx).fechaGuion).toBe("2026-11-03")
    expect(cambiarPublicacion({ ...pieza, fechaGuion: "2026-10-20" }, "2026-11-10", ctx).fechaGuion).toBe("2026-10-20")
  })

  it("las fechas de la collab salen de sus piezas: del primer guion a la última publicación", () => {
    const piezas = [piezaDeFormato(reel, "2026-10-30", ctx), piezaDeFormato(story, "2026-11-04", ctx), piezaDeFormato(reel, "", ctx)]
    expect(fechasDeLasPiezas(piezas)).toEqual({ desde: "2026-10-23", hasta: "2026-11-04" })
    expect(fechasDeLasPiezas([piezaDeFormato(reel, "", ctx)])).toBeNull()
  })
})

describe("piezas sin guion", () => {
  const conGuion = piezaDeFormulario(piezaDeFormato(reel, "2026-10-30", ctx), "c-1", "2026-10-30")
  const sinGuion = piezaDeFormulario({ ...piezaDeFormato(reel, "2026-10-30", ctx), requiereGuion: false }, "c-1", "2026-10-30")

  it("no tienen hito ni parte de guion; con fecha de guion, el hito va ese día", () => {
    expect(hitosDePieza(conGuion).find((h) => h.tipo === "guion")?.fecha).toBe("2026-10-23")
    expect(hitosDePieza(sinGuion).some((h) => h.tipo === "guion")).toBe(false)
    expect(partesDePieza(sinGuion)).toEqual(["media"])
    expect(partesDePieza(conGuion)).toEqual(["guion", "media"])
  })

  it("lo siguiente que toca es grabar, no escribir el guion", () => {
    expect(siguientePasoDePieza(conGuion)).toBe("Escribir el guion")
    expect(siguientePasoDePieza(sinGuion)).toBe("Grabar y subir la v1")
  })
})

describe("el brief de la marca", () => {
  const collab = demoCollabs[0]
  const enviado: FormularioBrief = {
    contacto: { nombre: "Pau", email: "pau@example.com" },
    campana: "Otra campaña",
    texto: "Texto nuevo",
    desde: "2026-11-01",
    hasta: "2026-11-30",
    piezas: [piezaDeFormato(reel, "2026-11-20", ctx)],
    menciones: "@marca",
    hashtags: "",
    enlace: "",
    codigo: "",
    derechosUso: "",
    exclusividad: "",
    facturacion: { razonSocial: "", nif: "", direccion: "", email: "", pedido: "" },
  }

  it("solo cambia los apartados que se le pidieron", () => {
    const soloMateriales = aplicarFormulario(collab, enviado, ["contacto", "materiales"])
    expect(soloMateriales.campana).toBe(collab.campana)
    expect(soloMateriales.piezas).toHaveLength(collab.piezas.length)
    expect(soloMateriales.brief.texto).toBe(collab.brief.texto)
    const todo = aplicarFormulario(collab, enviado, ["campana", "fechas", "piezas"])
    expect(todo.campana).toBe("Otra campaña")
    expect(todo.hasta).toBe("2026-11-30")
    expect(todo.piezas).toHaveLength(collab.piezas.length + 1)
  })
})

describe("el alta de una collab", () => {
  const marca = { id: "m-1", nombre: "Lumea", sector: "", tint: "rose" as const, atribucion: "propia" as const, creadaEl: HOY }
  const vacio = { modo: "yo" as const, campana: "", plataformas: [], brief: "", briefAdjunto: null, coverUrl: "", importe: Number.NaN, desde: "", hasta: "", piezas: [], condiciones: [], para: { nombre: "", email: "" }, campos: [], mensaje: "" }

  it("sin nada rellenado, sale con sus valores de serie", () => {
    const { collab, formulario, materiales } = collabDeAlta(vacio, { marca, hoy: HOY })
    expect(collab).toMatchObject({ campana: "Collab con Lumea", importe: 0, desde: "2026-10-14", hasta: "2026-10-14", piezas: [] })
    expect(formulario).toBeUndefined()
    expect(materiales).toEqual([])
  })

  it("con piezas, termina en la última publicación y cada una guarda su importe", () => {
    const piezas = [{ ...piezaDeFormato(reel, "2026-10-30", ctx), importe: "300" }, piezaDeFormato(story, "2026-11-04", ctx)]
    const { collab } = collabDeAlta({ ...vacio, piezas, condiciones: [{ id: "exclusividad", nombre: "Exclusividad", dias: 30 }] }, { marca, hoy: HOY })
    expect(collab.hasta).toBe("2026-11-04")
    expect(collab.piezas.map((p) => p.titulo)).toEqual(["Reel · Otoño", "Story · Otoño"])
    expect(collab.piezas[1].sinGuion).toBe(true)
    expect(collab.piezas[0]).toMatchObject({ red: "instagram", plataforma: "instagram" })
    expect(collab.brief.condiciones).toEqual([{ id: "exclusividad", nombre: "Exclusividad", dias: 30 }])
    expect(collab.piezas.map((p) => p.importe)).toEqual([300, undefined])
  })

  it("el brief escrito va al texto y el del PDF, el primero de los materiales", () => {
    const pdf = { nombre: "brief.pdf", tamano: 10, tipo: "application/pdf", url: "https://r2/brief.pdf" }
    const { collab, materiales } = collabDeAlta({ ...vacio, brief: "Objetivo: ventas", briefAdjunto: pdf, plataformas: ["instagram", "Mi podcast"] }, { marca, hoy: HOY })
    expect(collab.brief.texto).toContain("Objetivo: ventas")
    expect(collab.brief.plataformas).toEqual(["instagram", "Mi podcast"])
    expect(materiales).toHaveLength(1)
    expect(materiales[0]).toMatchObject({ collabId: collab.id, nombre: "brief.pdf", tipo: "pdf", origen: "mia", descripcion: "El brief de la campaña" })
  })

  it("pidiendo el brief, el enlace lleva los apartados en su orden", () => {
    const { formulario } = collabDeAlta({ ...vacio, modo: "marca", campos: ["piezas", "contacto"] }, { marca, hoy: HOY })
    expect(formulario?.campos).toEqual(["contacto", "piezas"])
    expect(mensajeParaLaMarca("Clara Benet", ["contacto", "materiales"])).toContain("Hola Clara: ¿me subes aquí los materiales")
  })

  it("el mensaje para la marca cambia con lo que se le pide, en el orden del formulario", () => {
    expect(mensajeParaLaMarca("", ["facturacion"])).toBe("Hola: ¿me dejas aquí los datos para la factura (razón social, NIF, dirección y email)?")
    expect(mensajeParaLaMarca("Clara", ["materiales", "fechas", "contacto"])).toBe("Hola Clara: te dejo aquí un formulario para que me pases las fechas y los materiales. Así lo tengo todo en un sitio.")
    expect(mensajeParaLaMarca("Clara", ["facturacion", "campana", "piezas"])).toBe(
      "Hola Clara: te dejo aquí un formulario para que me pases la campaña y lo que buscáis con ella, los contenidos que queréis y los datos para la factura. Así lo tengo todo en un sitio."
    )
    expect(mensajeParaLaMarca("Clara", ["contacto"])).toBe("Hola Clara: ¿me dejas aquí tus datos de contacto? Así lo tengo todo en un sitio.")
  })
})

describe("lo que sale solo de los entregables", () => {
  const exclusividad = condicionDeTipo(CONDICIONES_DE_SERIE[0])

  it("las condiciones guardadas sin icono toman el suyo y sus días de serie", () => {
    const viejas = ajustesDe({ condiciones: [{ id: "exclusividad", nombre: "Exclusividad", conDias: true }, { id: "cd-1", nombre: "Código de descuento", conDias: false }] }).condiciones
    expect(viejas).toEqual([
      { id: "exclusividad", nombre: "Exclusividad", conDias: true, icono: "candado", dias: 30 },
      { id: "cd-1", nombre: "Código de descuento", conDias: false, icono: "porcentaje" },
    ])
  })

  it("una condición se añade con su icono y sus días de serie", () => {
    expect(exclusividad).toEqual({ id: "exclusividad", nombre: "Exclusividad", icono: "candado", dias: 30 })
    expect(condicionDeTipo({ id: "x", nombre: "Mención", conDias: false, dias: 5 }).dias).toBeUndefined()
    expect(iconoSugerido("Exclusividad en cosmética")).toBe("candado")
    expect(iconoSugerido("Código de descuento")).toBe("porcentaje")
    expect(iconoSugerido("Algo raro")).toBe("documento")
  })

  it("las condiciones generales son las de las piezas, una vez y con los días más largos", () => {
    const enlace = condicionDeTipo(CONDICIONES_DE_SERIE[3])
    const piezas = [
      { ...piezaDeFormato(reel, "2026-10-30", ctx), condiciones: [exclusividad, enlace] },
      { ...piezaDeFormato(story, "2026-11-04", ctx), condiciones: [{ ...exclusividad, dias: 60 }] },
      piezaDeFormato(story, "2026-11-05", ctx),
    ]
    expect(condicionesDeLasPiezas(piezas)).toEqual([{ ...exclusividad, dias: 60 }, enlace])
    expect(condicionesDeLasPiezas([])).toEqual([])
  })

  it("el importe total suma los de las piezas que lo tienen", () => {
    const piezas = [{ ...piezaDeFormato(reel, "", ctx), importe: "300" }, { ...piezaDeFormato(story, "", ctx), importe: "99,5" }, piezaDeFormato(story, "", ctx)]
    expect(importeDeLasPiezas(piezas)).toBe(399.5)
    expect(importeDeLasPiezas([piezaDeFormato(story, "", ctx)])).toBeUndefined()
    expect(numeroDeImporte("abc")).toBeUndefined()
  })
})

describe("packs de contenido", () => {
  const ctx = { campana: "Otoño", diasGuion: 7, hoy: "2026-10-14" }
  const pack = { id: "p", nombre: "Lanzamiento", formatos: ["reel", "story", "story", "ya-no-existe"] }

  it("un pack añade una pieza por formato, en su orden, y se salta los que ya no existen", () => {
    const piezas = piezasDePack(pack, FORMATOS_PIEZA_DE_SERIE, "", ctx)
    expect(piezas.map((p) => p.formato)).toEqual(["reel", "story", "story"])
    expect(piezas[0].titulo).toBe("Reel · Otoño")
  })

  it("se describe contando cada formato", () => {
    expect(describirPack(pack, FORMATOS_PIEZA_DE_SERIE)).toBe("1 reel · 2 stories")
  })

  it("los ajustes guardados antes de los packs traen los de serie, y un pack vacío no vale", () => {
    expect(ajustesDe({ diasGuion: 3 }).packs.length).toBeGreaterThan(0)
    expect(esquemaAjustesCollabs.safeParse({ ...AJUSTES_COLLABS_DE_SERIE, packs: [{ id: "x", nombre: "Vacío", formatos: [] }] }).success).toBe(false)
  })
})

describe("plural de un formato", () => {
  it("las inglesas a su manera y las españolas por la última letra de la primera palabra", () => {
    expect(["Story", "Reel", "Vídeo de TikTok", "Carrusel", "Mención en el podcast", "Short"].map(pluralDeFormato)).toEqual(["stories", "reels", "Vídeos de TikTok", "Carruseles", "Menciones en el podcast", "shorts"])
  })
})
