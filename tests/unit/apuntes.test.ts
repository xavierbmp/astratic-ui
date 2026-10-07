import { describe, expect, it } from "vitest"
import {
  CARPETA_FAVORITOS,
  CARPETA_SIN,
  CARPETA_TODO,
  apunteDesdeTexto,
  apuntesDeCarpeta,
  caducaPronto,
  contarPorCarpeta,
  estadoDeIdea,
  ideasParaPlanificar,
  portadaDeApunte,
  redDeEnlace,
  resumenDeApunte,
  textoCaducidad,
} from "@/lib/influencer/apuntes"
import { demoApuntes, demoContenidos } from "@/lib/influencer/demo-contenidos"
import type { Apunte } from "@/lib/influencer/modelo"

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
  it("un documento no tiene estado", () => {
    expect(estadoDeIdea(idea({ tipo: "documento" }), demoContenidos)).toBeNull()
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
  it("cuenta por carpeta, sin carpeta y favoritos", () => {
    const cuentas = contarPorCarpeta([idea({ carpetaId: "k1" }), idea({ carpetaId: "k1", favorito: true }), idea()])
    expect(cuentas[CARPETA_TODO]).toBe(3)
    expect(cuentas.k1).toBe(2)
    expect(cuentas[CARPETA_SIN]).toBe(1)
    expect(cuentas[CARPETA_FAVORITOS]).toBe(1)
  })
  it("filtra por carpeta y por las especiales", () => {
    const lista = [idea({ id: "a", carpetaId: "k1" }), idea({ id: "b", favorito: true }), idea({ id: "c" })]
    expect(apuntesDeCarpeta(lista, "k1").map((a) => a.id)).toEqual(["a"])
    expect(apuntesDeCarpeta(lista, CARPETA_FAVORITOS).map((a) => a.id)).toEqual(["b"])
    expect(apuntesDeCarpeta(lista, CARPETA_SIN).map((a) => a.id)).toEqual(["b", "c"])
    expect(apuntesDeCarpeta(lista, CARPETA_TODO)).toHaveLength(3)
  })
  it("la portada es la primera imagen y el resumen, el texto sin etiquetas", () => {
    const a = idea({ texto: "<p>Hola <strong>mundo</strong></p>", referencias: [{ id: "1", tipo: "enlace", url: "https://x.com" }, { id: "2", tipo: "imagen", url: "https://img/1.jpg" }] })
    expect(portadaDeApunte(a)).toBe("https://img/1.jpg")
    expect(resumenDeApunte(a)).toBe("Hola mundo")
    expect(resumenDeApunte(idea({ texto: `<p>${"a".repeat(200)}</p>` }), 10)).toHaveLength(10)
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
