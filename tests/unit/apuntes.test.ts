import { describe, expect, it } from "vitest"
import {
  CARPETA_FAVORITOS,
  CARPETA_SIN,
  CARPETA_TODO,
  apunteDesdeTexto,
  apuntesDeCarpeta,
  asignarCampoApunte,
  caducaPronto,
  conReferencias,
  contarPorCarpeta,
  desenlazar,
  enlazadosDe,
  enlazar,
  estadoDeIdea,
  ideasParaPlanificar,
  portadaDeApunte,
  redDeEnlace,
  resumenDeApunte,
  sinReferencia,
  textoCaducidad,
} from "@/lib/influencer/apuntes"
import { demoApuntes, demoContenidos } from "@/lib/influencer/demo-contenidos"
import { tipoDeArchivo } from "@/lib/influencer/materiales"
import type { Apunte, Carpeta } from "@/lib/influencer/modelo"

const HOY = "2026-10-06"
const AHORA = "2026-10-06T11:30:00"
const idea = (cambios: Partial<Apunte> = {}): Apunte => ({ id: "x", tipo: "idea", titulo: "Idea", texto: "", favorito: false, estado: "apuntada", redes: [], referencias: [], creadoEl: AHORA, actualizadoEl: AHORA, ...cambios })

describe("estado de una idea", () => {
  it("planificada o publicada según su contenido; si no tiene, el que puso ella", () => {
    const conContenido = demoApuntes.find((a) => a.id === "a-rutina-noche")
    const publicada = demoApuntes.find((a) => a.id === "a-favoritos-septiembre")
    const suelta = demoApuntes.find((a) => a.id === "a-dupes-serums")
    if (!conContenido || !publicada || !suelta) throw new Error("faltan datos de ejemplo")
    expect(estadoDeIdea(conContenido, demoContenidos)).toBe("planificada")
    expect(estadoDeIdea(publicada, demoContenidos)).toBe("publicada")
    expect(estadoDeIdea(suelta, demoContenidos)).toBe("para-hacer")
  })
  it("una nota no tiene estado", () => {
    expect(estadoDeIdea(idea({ tipo: "nota" }), demoContenidos)).toBeNull()
  })
})

describe("apuntar al vuelo", () => {
  it("un enlace de TikTok se guarda como referencia con su red y el resto es el título", () => {
    const a = apunteDesdeTexto("truco del colorete https://www.tiktok.com/@alguien/video/123", { id: "n", idReferencia: "r", ahora: AHORA })
    expect(a.titulo).toBe("truco del colorete")
    expect(a.redes).toEqual(["tiktok"])
    expect(a.referencias).toEqual([{ id: "r", tipo: "enlace", url: "https://www.tiktok.com/@alguien/video/123", titulo: "TikTok" }])
    expect(a.tipo).toBe("idea")
    expect(a.estado).toBe("apuntada")
  })
  it("solo un enlace: el título dice de qué red es", () => {
    expect(apunteDesdeTexto("https://youtu.be/abc", { id: "n", idReferencia: "r", ahora: AHORA }).titulo).toBe("Idea de YouTube")
    expect(apunteDesdeTexto("https://ejemplo.com/post", { id: "n", idReferencia: "r", ahora: AHORA }).titulo).toBe("Idea con enlace")
  })
  it("sin enlace no hay referencias y va a la carpeta que tiene abierta", () => {
    const a = apunteDesdeTexto("  Mi neceser   de viaje ", { id: "n", idReferencia: "r", ahora: AHORA, carpetaId: "k-probar" })
    expect(a.titulo).toBe("Mi neceser de viaje")
    expect(a.referencias).toEqual([])
    expect(a.carpetaId).toBe("k-probar")
  })
  it("reconoce las redes por el dominio, también con subdominio", () => {
    expect(redDeEnlace("https://www.instagram.com/reel/abc/")).toBe("instagram")
    expect(redDeEnlace("https://m.youtube.com/shorts/abc")).toBe("youtube")
    expect(redDeEnlace("https://noinstagram.com.example.org")).toBeUndefined()
    expect(redDeEnlace("no es un enlace")).toBeUndefined()
  })
})

describe("caducidad", () => {
  it("avisa en los tres días antes y el mismo día", () => {
    expect(caducaPronto(idea({ caducaEl: "2026-10-09" }), HOY)).toBe(true)
    expect(caducaPronto(idea({ caducaEl: "2026-10-10" }), HOY)).toBe(false)
    expect(caducaPronto(idea({ caducaEl: "2026-10-05" }), HOY)).toBe(false)
    expect(caducaPronto(idea(), HOY)).toBe(false)
  })
  it("lo dice en palabras", () => {
    expect(textoCaducidad(idea({ caducaEl: HOY }), HOY)).toBe("Caduca hoy")
    expect(textoCaducidad(idea({ caducaEl: "2026-10-07" }), HOY)).toBe("Caduca mañana")
    expect(textoCaducidad(idea({ caducaEl: "2026-10-09" }), HOY)).toBe("Caduca en 3 días")
    expect(textoCaducidad(idea({ caducaEl: "2026-10-01" }), HOY)).toBe("Caducó")
    expect(textoCaducidad(idea(), HOY)).toBeNull()
  })
})

describe("carpetas y tarjetas", () => {
  const carpetas: Carpeta[] = [
    { id: "k1", nombre: "Campañas", tint: "peach", orden: 0 },
    { id: "k2", nombre: "Navidad", tint: "rose", padreId: "k1", orden: 0 },
    { id: "k3", nombre: "Ganchos", tint: "mint", orden: 1 },
  ]
  it("cuenta por carpeta (con lo de sus subcarpetas), sin carpeta y favoritos", () => {
    const cuentas = contarPorCarpeta([idea({ carpetaId: "k1" }), idea({ carpetaId: "k2", favorito: true }), idea()], carpetas)
    expect(cuentas[CARPETA_TODO]).toBe(3)
    expect(cuentas.k1).toBe(2)
    expect(cuentas.k2).toBe(1)
    expect(cuentas.k3).toBe(0)
    expect(cuentas[CARPETA_SIN]).toBe(1)
    expect(cuentas[CARPETA_FAVORITOS]).toBe(1)
  })
  it("una carpeta enseña también lo de las que lleva dentro; las especiales, lo suyo", () => {
    const lista = [idea({ id: "a", carpetaId: "k1" }), idea({ id: "b", favorito: true }), idea({ id: "c" }), idea({ id: "d", carpetaId: "k2" })]
    expect(apuntesDeCarpeta(lista, "k1", carpetas).map((a) => a.id)).toEqual(["a", "d"])
    expect(apuntesDeCarpeta(lista, "k2", carpetas).map((a) => a.id)).toEqual(["d"])
    expect(apuntesDeCarpeta(lista, CARPETA_FAVORITOS, carpetas).map((a) => a.id)).toEqual(["b"])
    expect(apuntesDeCarpeta(lista, CARPETA_SIN, carpetas).map((a) => a.id)).toEqual(["b", "c"])
    expect(apuntesDeCarpeta(lista, CARPETA_TODO, carpetas)).toHaveLength(4)
  })
  it("la portada es la que tiene y el resumen, el texto sin etiquetas", () => {
    const a = idea({ texto: "<p>Hola <strong>mundo</strong></p>", portadaUrl: "https://img/1.jpg" })
    expect(portadaDeApunte(a)).toBe("https://img/1.jpg")
    expect(portadaDeApunte(idea())).toBeUndefined()
    expect(resumenDeApunte(a)).toBe("Hola mundo")
    expect(resumenDeApunte(idea({ texto: `<p>${"a".repeat(200)}</p>` }), 10)).toHaveLength(10)
  })
})

describe("portada y archivos", () => {
  const imagen = { id: "i", tipo: "imagen" as const, url: "https://img/1.jpg" }
  const pdf = { id: "p", tipo: "pdf" as const, url: "https://docs/brief.pdf", titulo: "brief.pdf", tamano: 1200 }
  it("una idea que nace con captura la tiene de portada", () => {
    expect(apunteDesdeTexto("algo", { id: "n", idReferencia: "r", ahora: AHORA }).portadaUrl).toBeUndefined()
    expect(conReferencias(idea(), [pdf, imagen]).portadaUrl).toBe(imagen.url)
  })
  it("una portada elegida no la cambia una captura nueva", () => {
    expect(conReferencias(idea({ portadaUrl: "https://img/mia.jpg" }), [imagen]).portadaUrl).toBe("https://img/mia.jpg")
  })
  it("cada archivo, con su tipo", () => {
    expect(["image/png", "video/mp4", "application/pdf", "application/zip", "text/plain"].map(tipoDeArchivo)).toEqual(["imagen", "video", "pdf", "zip", "documento"])
  })
  it("quitar la captura que era la portada la quita; quitar otra cosa, no", () => {
    const a = conReferencias(idea(), [imagen, pdf])
    expect(sinReferencia(a, "p").portadaUrl).toBe(imagen.url)
    expect(sinReferencia(a, "i")).toMatchObject({ portadaUrl: undefined, referencias: [pdf] })
  })
})

describe("notas enlazadas con ideas", () => {
  it("se enlazan una vez, en los dos sentidos, y nunca consigo mismas", () => {
    let v = enlazar([], { id: "1", desde: "nota", hasta: "idea1" })
    v = enlazar(v, { id: "2", desde: "idea2", hasta: "nota" })
    v = enlazar(v, { id: "3", desde: "idea1", hasta: "nota" })
    v = enlazar(v, { id: "4", desde: "nota", hasta: "nota" })
    expect(v).toHaveLength(2)
    expect(enlazadosDe("nota", v)).toEqual(["idea1", "idea2"])
    expect(enlazadosDe("idea1", v)).toEqual(["nota"])
  })
  it("se desenlazan da igual el orden", () => {
    const v = enlazar(enlazar([], { id: "1", desde: "nota", hasta: "idea1" }), { id: "2", desde: "nota", hasta: "idea2" })
    expect(enlazadosDe("nota", desenlazar(v, "idea1", "nota"))).toEqual(["idea2"])
  })
})

describe("ideas para planificar", () => {
  it("sin las que ya tienen contenido, las descartadas ni las caducadas; primero las que caducan", () => {
    const lista = ideasParaPlanificar(demoApuntes, demoContenidos, HOY)
    expect(lista.every((a) => a.tipo === "idea" && a.estado !== "descartada")).toBe(true)
    expect(lista.some((a) => a.id === "a-rutina-noche")).toBe(false)
    expect(lista[0].id).toBe("a-audio-grwm")
  })
})

describe("asignar un campo al soltar o crear en un grupo", () => {
  it("el estado solo a mano y solo en ideas", () => {
    expect(asignarCampoApunte(idea(), "estado", "para-hacer")?.estado).toBe("para-hacer")
    expect(asignarCampoApunte(idea(), "estado", "planificada")).toBeNull()
    expect(asignarCampoApunte(idea({ tipo: "nota" }), "estado", "para-hacer")).toBeNull()
  })
  it("el grupo sin valor lo deja vacío", () => {
    expect(asignarCampoApunte(idea({ pilarId: "p1" }), "pilar", "__vacio")?.pilarId).toBeUndefined()
    expect(asignarCampoApunte(idea(), "carpeta", "k1")?.carpetaId).toBe("k1")
  })
  it("formato válido o nada; favorita con sí o no", () => {
    expect(asignarCampoApunte(idea(), "formato", "tiktok")?.formato).toBe("tiktok")
    expect(asignarCampoApunte(idea(), "formato", "otro")).toBeNull()
    expect(asignarCampoApunte(idea(), "favorito", "true")?.favorito).toBe(true)
    expect(asignarCampoApunte(idea(), "redes", "tiktok")).toBeNull()
  })
})
