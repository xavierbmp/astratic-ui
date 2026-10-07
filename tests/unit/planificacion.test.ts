import { describe, expect, it } from "vitest"
import {
  antesDePublicar,
  contenidoDesdeIdea,
  cuentaDePublicaciones,
  entradasDeContenidos,
  entradasDeFechasClave,
  entradasDePiezas,
  entradasGenerales,
  entradasPorDia,
  etapaDePieza,
  filtrarEntradas,
  nuevoContenido,
  previsualizacion,
  queToca,
  reciclarContenido,
  revisarCaption,
  siguienteEstado,
  textoParaPublicar,
} from "@/lib/influencer/planificacion"
import { demoApuntes, demoContenidos, demoFechasClave, demoPilares } from "@/lib/influencer/demo-contenidos"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoMarcas, demoTareas } from "@/lib/influencer/demo-data"
import type { Contenido, Pieza } from "@/lib/influencer/modelo"

const AHORA = "2026-10-06T11:30:00"
const contenido = (cambios: Partial<Contenido> = {}) => ({ ...nuevoContenido({ titulo: "Reel", formato: "reel" }, "c", AHORA), ...cambios })

describe("crear un contenido", () => {
  it("empieza por el guion y se publica en la red de su formato", () => {
    const c = nuevoContenido({ titulo: "Mi TikTok", formato: "tiktok" }, "c1", AHORA)
    expect(c.estado).toBe("guion")
    expect(c.tipo).toBe("video")
    expect(c.redes).toEqual([{ red: "tiktok" }])
  })
  it("desde una idea: su título, su pilar, sus redes y unido a ella", () => {
    const idea = demoApuntes.find((a) => a.id === "a-dupes-serums")
    if (!idea) throw new Error("falta la idea")
    const c = contenidoDesdeIdea(idea, { fecha: "2026-10-20T19:00" }, "c2", AHORA)
    expect(c).toMatchObject({ titulo: idea.titulo, pilarId: idea.pilarId, ideaId: idea.id, formato: "reel", fecha: "2026-10-20T19:00" })
    expect(c.redes.map((r) => r.red)).toEqual(["instagram", "tiktok"])
  })
  it("reciclar para otro formato lo copia todo, sin fecha y sin darlo por publicado", () => {
    const publicado = contenido({ estado: "publicado", fecha: "2026-10-03T19:00", caption: "Hola" })
    const r = reciclarContenido(publicado, "tiktok", "c3", AHORA)
    expect(r).toMatchObject({ id: "c3", formato: "tiktok", fecha: undefined, estado: "listo", caption: "Hola", redes: [{ red: "tiktok" }] })
  })
})

describe("avanzar", () => {
  it("guion → grabar → editar → listo → programado → publicado", () => {
    expect(siguienteEstado("guion")).toBe("grabar")
    expect(siguienteEstado("programado")).toBe("publicado")
    expect(siguienteEstado("publicado")).toBeNull()
  })
  it("lo que toca dice las tomas que faltan", () => {
    expect(queToca({ estado: "grabar", tomas: [{ id: "1", texto: "a", hecha: true }, { id: "2", texto: "b", hecha: false }] })).toBe("Grabar · 1 de 2 tomas")
    expect(queToca({ estado: "guion", tomas: [] })).toBe("Escribir el guion")
  })
})

describe("caption", () => {
  it("el texto que se pega lleva los hashtags debajo, con su almohadilla", () => {
    expect(textoParaPublicar({ caption: "Hola ", hashtags: ["skincare", "#rutina"] })).toBe("Hola\n\n#skincare #rutina")
  })
  it("Instagram admite 5 hashtags", () => {
    const avisos = revisarCaption(contenido({ hashtags: ["a", "b", "c", "d", "e", "f"] }))
    expect(avisos.map((a) => a.id)).toEqual(["hashtags-instagram"])
    expect(revisarCaption(contenido({ hashtags: ["a", "b", "c", "d", "e"] }))).toEqual([])
  })
  it("cuenta también los hashtags escritos en el caption", () => {
    expect(revisarCaption(contenido({ caption: "#uno #dos #tres", hashtags: ["cuatro", "cinco", "seis"] })).map((a) => a.id)).toEqual(["hashtags-instagram"])
  })
  it("avisa si pasa del máximo de la red", () => {
    expect(revisarCaption(contenido({ caption: "a".repeat(2300) })).map((a) => a.id)).toEqual(["max-instagram"])
    expect(revisarCaption(contenido({ caption: "a".repeat(2300), redes: [{ red: "tiktok" }] }))).toEqual([])
  })
  it("con regalo o afiliado pide marcarlo como publicidad, y «#ad» no vale", () => {
    expect(revisarCaption(contenido({ publicidad: true, caption: "Me encanta" })).map((a) => a.id)).toEqual(["publi"])
    expect(revisarCaption(contenido({ publicidad: true, caption: "Me encanta #ad" }))[0].texto).toContain("#ad")
    expect(revisarCaption(contenido({ publicidad: true, caption: "Me encanta", hashtags: ["publi"] }))).toEqual([])
  })
  it("lo que se ve antes del «más» en cada red", () => {
    const c = { caption: "a".repeat(150), hashtags: [] }
    expect(previsualizacion(c, "instagram")).toEqual({ visible: "a".repeat(125), cortado: true })
    expect(previsualizacion({ caption: "corto", hashtags: [] }, "tiktok")).toEqual({ visible: "corto", cortado: false })
  })
})

describe("antes de publicar", () => {
  it("un reel vacío tiene todo por hacer", () => {
    const pasos = antesDePublicar(contenido())
    expect(pasos.map((p) => p.id)).toEqual(["gancho", "guion", "tomas", "caption", "limites", "portada", "fecha"])
    expect(pasos.filter((p) => p.hecho).map((p) => p.id)).toEqual(["limites"])
  })
  it("una story no pide portada y una foto no pide guion", () => {
    expect(antesDePublicar(contenido({ formato: "story" })).some((p) => p.id === "portada")).toBe(false)
    expect(antesDePublicar(contenido({ formato: "post", tipo: "foto" })).some((p) => p.id === "guion")).toBe(false)
  })
  it("con publicidad, el paso de marcarla", () => {
    expect(antesDePublicar(contenido({ publicidad: true })).find((p) => p.id === "publi")?.hecho).toBe(false)
  })
  it("el de los datos de ejemplo listo tiene todo hecho", () => {
    const listo = demoContenidos.find((c) => c.id === "c-neceser")
    if (!listo) throw new Error("falta el contenido")
    expect(antesDePublicar(listo).every((p) => p.hecho)).toBe(true)
  })
})

describe("calendario", () => {
  const propias = entradasDeContenidos(demoContenidos, demoPilares)
  const deCollabs = entradasDePiezas(demoCollabs, demoMarcas)
  const generales = entradasGenerales({ collabs: demoCollabs, marcas: demoMarcas, tareas: demoTareas })
  const fechas = entradasDeFechasClave(demoFechasClave)
  const todas = [...propias, ...deCollabs, ...generales, ...fechas]

  it("los contenidos sin fecha no salen y los de las collabs van fijos", () => {
    expect(propias.some((e) => e.ref.tipo === "contenido" && e.ref.id === "c-retinal")).toBe(false)
    expect(deCollabs.length).toBeGreaterThan(0)
    expect(deCollabs.every((e) => e.fija && e.origen === "collab" && e.clase === "contenido")).toBe(true)
    expect(propias.every((e) => !e.fija && e.origen === "organico")).toBe(true)
  })
  it("la hora sale de la fecha y el tinte, de su pilar", () => {
    const rutina = propias.find((e) => e.id === "contenido-c-rutina-noche")
    expect(rutina).toMatchObject({ dia: "2026-10-07", hora: "19:00", contexto: "Rutinas", tint: "lavender", red: "instagram" })
  })
  it("el general no repite la publicación de las piezas", () => {
    expect(generales.some((e) => e.ref.tipo === "evento" && e.ref.id.endsWith("-publicacion"))).toBe(false)
  })
  it("solo contenido deja lo que se publica y las fechas clave", () => {
    const lista = filtrarEntradas(todas, { alcance: "contenido", origen: "todo" })
    expect(lista.every((e) => e.clase === "contenido" || e.clase === "fecha-clave")).toBe(true)
  })
  it("collabs u orgánico, con las fechas clave siempre", () => {
    const collabs = filtrarEntradas(todas, { alcance: "general", origen: "collabs" })
    expect(collabs.every((e) => e.origen === "collab" || e.clase === "fecha-clave")).toBe(true)
    const organico = filtrarEntradas(todas, { alcance: "general", origen: "organico" })
    expect(organico.some((e) => e.origen === "collab")).toBe(false)
    expect(organico.some((e) => e.clase === "fecha-clave")).toBe(true)
  })
  it("cada día en orden: fechas clave, lo que se publica por hora y lo demás", () => {
    const orden = ["fecha-clave", "contenido", "hito", "tarea", "cobro"]
    for (const lista of entradasPorDia(todas).values()) {
      const posiciones = lista.map((e) => orden.indexOf(e.clase))
      expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b))
    }
  })
  it("cuenta lo que se publica en una semana, de collabs y propio", () => {
    const cuenta = cuentaDePublicaciones(todas, "2026-10-05", "2026-10-11")
    expect(cuenta.organico).toBe(propias.filter((e) => e.dia >= "2026-10-05" && e.dia <= "2026-10-11").length)
  })
})

describe("etapa de una pieza de collab", () => {
  const pieza = (cambios: Partial<Pieza>): Pieza => ({ id: "p", collabId: "c", tipo: "video", unidades: 1, titulo: "Reel", publicacion: "2026-10-20", estado: "borrador", guion: [], media: [], rondaActual: 1, ...cambios })
  it("la revisión de la marca es su propia columna; lo aprobado está listo", () => {
    expect(etapaDePieza(pieza({ estado: "en-revision" }))).toBe("revision")
    expect(etapaDePieza(pieza({ estado: "cambios" }))).toBe("revision")
    expect(etapaDePieza(pieza({ estado: "aprobado" }))).toBe("listo")
    expect(etapaDePieza(pieza({ estado: "resultados" }))).toBe("publicado")
  })
  it("en preparación: guion si no está aprobado; si lo está, a grabar", () => {
    expect(etapaDePieza(pieza({}))).toBe("guion")
    const guionAprobado = pieza({ guion: [{ id: "v1", tipo: "guion", numero: 1, estado: "aprobada", creadaEl: AHORA, notas: [], mensajes: [] }] })
    expect(etapaDePieza(guionAprobado)).toBe("grabar")
  })
})
