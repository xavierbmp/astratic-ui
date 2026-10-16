import { describe, expect, it } from "vitest"
import { bandejaDe, bandejaRevision, filasDePiezas, ordenarPiezas, recordatorioDeRevision } from "@/lib/influencer/biblioteca"
import type { Pieza, Version } from "@/lib/influencer/modelo"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { demoMarcas } from "@/lib/influencer/demo-data"

const HOY = "2026-10-06"
const filas = filasDePiezas(demoCollabs, HOY).sort(ordenarPiezas)

describe("biblioteca de contenidos", () => {
  it("una fila por pieza, con lo que le toca a ella primero y lo publicado al final", () => {
    expect(filas.length).toBe(demoCollabs.filter((c) => c.estado !== "cancelada").reduce((a, c) => a + c.piezas.length, 0))
    const grupos = filas.map((f) => f.grupo)
    expect(grupos.indexOf("publicado")).toBeGreaterThan(grupos.lastIndexOf("te-toca"))
  })
  it("lo que está en revisión espera a la marca, con los días que lleva", () => {
    const enRevision = filas.filter((f) => f.turno === "marca")
    expect(enRevision.length).toBeGreaterThan(0)
    expect(enRevision.every((f) => f.esperando >= 0)).toBe(true)
  })
  it("el recordatorio agrupa por marca y lleva un enlace por versión", () => {
    const texto = recordatorioDeRevision({ filas, marcas: demoMarcas, origen: "https://ws.test" })
    expect(texto).toContain("https://ws.test/revisar/")
    expect(recordatorioDeRevision({ filas: filas.filter((f) => f.turno !== "marca"), marcas: demoMarcas, origen: "x" })).toBeNull()
  })
})

describe("bandeja de revisión", () => {
  const v = (numero: number, estado: Version["estado"], notas = 0): Version => ({
    id: `v${numero}`,
    tipo: "guion",
    numero,
    estado,
    creadaEl: HOY,
    notas: Array.from({ length: notas }, (_, i) => ({ id: `n${i}`, autor: "Marca", el: HOY, texto: "Cambia esto", resuelta: false, respuestas: [] })),
    mensajes: [],
  })
  const pieza = (guion: Version[], extra: Partial<Pieza> = {}): Pieza => ({ id: "p", collabId: "c", tipo: "texto", unidades: 1, titulo: "Post", publicacion: HOY, estado: "borrador", guion, media: [], rondaActual: 1, ...extra })

  it("sin nada enviado, por hacer; enviado y sin notas, en revisión", () => {
    expect(bandejaDe(pieza([]))?.bandeja).toBe("por-hacer")
    expect(bandejaDe(pieza([v(1, "borrador")]))?.bandeja).toBe("por-hacer")
    expect(bandejaDe(pieza([v(1, "en-revision")]))?.bandeja).toBe("en-revision")
  })
  it("con cambios pedidos o notas abiertas, nuevo feedback, también mientras prepara la siguiente", () => {
    expect(bandejaDe(pieza([v(1, "cambios", 2)]))).toEqual({ bandeja: "feedback", parte: "guion", notas: 2 })
    expect(bandejaDe(pieza([v(1, "en-revision", 1)]))?.bandeja).toBe("feedback")
    expect(bandejaDe(pieza([v(1, "cambios", 1), v(2, "borrador")]))?.bandeja).toBe("feedback")
    expect(bandejaDe(pieza([v(1, "cambios", 1), v(2, "en-revision")]))?.bandeja).toBe("en-revision")
  })
  it("lo aprobado o publicado no entra", () => {
    expect(bandejaDe(pieza([v(1, "aprobada")]))).toBeNull()
    expect(bandejaDe(pieza([v(1, "aprobada")], { estado: "publicado" }))).toBeNull()
  })
  it("en la demo, cada pieza pendiente en un solo montón", () => {
    const montones = bandejaRevision(demoCollabs, HOY)
    const ids = [...montones.feedback, ...montones["en-revision"], ...montones["por-hacer"]].map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(montones["en-revision"].every((f, i, a) => i === 0 || a[i - 1].esperando >= f.esperando)).toBe(true)
  })
})
