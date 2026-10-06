// Datos de ejemplo del historial: las collabs de este año ya entregadas, con sus facturas. Todo
// inventado (el repo es público). Las facturas siguen una sola serie por fechas (2026-003, 005…),
// con huecos de las que hizo fuera del portal, como pasa en la realidad.
import type { Collab, DatosFacturacion, Factura, Formato, Pieza, TipoCollab } from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"

const FACTURACION: Record<string, DatosFacturacion> = {
  lumea: { razonSocial: "Lumea Cosmetics S.L.", nif: "B00000001", direccion: "Calle Ejemplo 12, 46001 Valencia", email: "facturas@example.com" },
  vero: { razonSocial: "Maison Vero Beauty S.L.", nif: "B00000002", direccion: "Calle Ejemplo 5, 08001 Barcelona", email: "administracion@example.com" },
  bloom: { razonSocial: "Bloom Beauty Brands S.L.", nif: "B00000005", direccion: "Calle Ejemplo 21, 28004 Madrid", email: "facturas@example.com", pedido: "PO-2026-118" },
  dermanova: { razonSocial: "Derma Nova Laboratorios S.A.", nif: "A00000006", direccion: "Calle Ejemplo 8, 41001 Sevilla", email: "proveedores@example.com" },
  brisa: { razonSocial: "Brisa Nails S.L.", nif: "B00000007", direccion: "Calle Ejemplo 30, 03001 Alicante", email: "hola@example.com" },
}

type Historica = {
  id: string
  marcaId: string
  campana: string
  tipo?: TipoCollab
  estado?: Collab["estado"]
  importe: number
  tint: Tint
  desde: string
  hasta: string
  pieza: { titulo: string; formato: Formato; unidades?: number; publicada?: boolean }
  contacto: Collab["brief"]["contacto"]
  factura?: Omit<Factura, "id" | "collabId" | "destinatario" | "ivaPct" | "irpfPct" | "plazoId">
}

/** Lo que cobra ella: en las de la red, el 80 %. */
const base = (h: Historica) => (h.tipo === "red" ? Math.round(h.importe * 0.8) : h.importe)

function collab(h: Historica): Collab {
  const publicada = h.pieza.publicada ?? true
  const pieza: Pieza = {
    id: `${h.id}-pieza`,
    collabId: h.id,
    tipo: "video",
    formato: h.pieza.formato,
    unidades: h.pieza.unidades ?? 1,
    titulo: h.pieza.titulo,
    publicacion: h.hasta,
    estado: publicada ? "resultados" : "aprobado",
    rondaActual: 1,
    guion: [],
    media: [],
    publicada: publicada ? { url: "https://instagram.com", fecha: h.hasta, marcadaPubli: true } : undefined,
  }
  const cobrada = !!h.factura?.cobradaEl
  return {
    id: h.id,
    marcaId: h.marcaId,
    campana: h.campana,
    tipo: h.tipo ?? "directa",
    estado: h.estado ?? "cerrada",
    importe: h.importe,
    importeNeto: h.tipo === "red" ? base(h) : undefined,
    tint: h.tint,
    desde: h.desde,
    hasta: h.hasta,
    brief: { texto: `<h3>Objetivo</h3><p>${h.pieza.titulo}.</p>`, menciones: [], hashtags: ["#publi"], rondasIncluidas: 2, contacto: h.contacto, condicionesPago: "30 días" },
    piezas: [pieza],
    cobro: h.factura ? { estado: cobrada ? "cobrado" : "facturado", vencimiento: h.factura.vencimiento, factura: h.factura.numero } : { estado: "por-facturar" },
    plazos: [{ id: `${h.id}-p1`, concepto: "A 30 días", porcentaje: 100 }],
    facturacion: h.tipo === "red" ? undefined : FACTURACION[h.marcaId],
    creadaEl: `${h.desde}T10:00:00`,
  }
}

function factura(h: Historica): Factura[] {
  if (!h.factura) return []
  return [{ ...h.factura, id: `fa-${h.id}`, collabId: h.id, destinatario: h.tipo === "red" ? "astratic" : "marca", ivaPct: 21, irpfPct: 15, plazoId: `${h.id}-p1` }]
}

const pdf = (numero: string) => ({ nombre: `Factura ${numero}.pdf`, tamano: 80_000 })

const HISTORIAL: Historica[] = [
  { id: "vero-invierno", marcaId: "vero", campana: "Labiales de invierno", importe: 1900, tint: "peach", desde: "2026-02-02", hasta: "2026-02-15", pieza: { titulo: "Reel · Tres labiales, tres looks", formato: "reel" }, contacto: { nombre: "Inés Roldán", email: "ines@example.com" }, factura: { numero: "2026-003", concepto: "Campaña «Labiales de invierno»: 1 reel", base: 1900, emitidaEl: "2026-02-16", vencimiento: "2026-03-18", enviadaEl: "2026-02-16", cobradaEl: "2026-03-16", pdf: pdf("2026-003") } },
  { id: "lumea-limpiador", marcaId: "lumea", campana: "Limpiador en espuma", importe: 2400, tint: "rose", desde: "2026-03-16", hasta: "2026-03-31", pieza: { titulo: "Reel + 3 stories · Doble limpieza", formato: "reel" }, contacto: { nombre: "Clara Benet", email: "clara@example.com" }, factura: { numero: "2026-005", concepto: "Campaña «Limpiador en espuma»: 1 reel + 3 stories", base: 2400, emitidaEl: "2026-04-01", vencimiento: "2026-05-01", enviadaEl: "2026-04-01", cobradaEl: "2026-04-29", pdf: pdf("2026-005") } },
  { id: "lumea-contorno", marcaId: "lumea", campana: "Contorno de ojos", importe: 1250, tint: "rose", desde: "2026-05-04", hasta: "2026-05-20", pieza: { titulo: "Reel · Ojeras fuera", formato: "reel" }, contacto: { nombre: "Clara Benet", email: "clara@example.com" }, factura: { numero: "2026-007", concepto: "Campaña «Contorno de ojos»: 1 reel", base: 1250, emitidaEl: "2026-05-21", vencimiento: "2026-06-20", enviadaEl: "2026-05-21", cobradaEl: "2026-06-22", reclamaciones: ["2026-06-21"], pdf: pdf("2026-007") } },
  { id: "botanica-aceite", marcaId: "botanica", campana: "Aceite corporal", tipo: "red", importe: 2250, tint: "mint", desde: "2026-06-01", hasta: "2026-06-12", pieza: { titulo: "Reel · Piel de verano", formato: "reel" }, contacto: { nombre: "Pau Ribes", email: "pau@example.com" }, factura: { numero: "2026-008", concepto: "Campaña «Aceite corporal»: 1 reel (80 % de la red)", base: 1800, emitidaEl: "2026-06-13", vencimiento: "2026-07-13", enviadaEl: "2026-06-13", cobradaEl: "2026-07-10", pdf: pdf("2026-008") } },
  { id: "bloom-mascara", marcaId: "bloom", campana: "Máscara de pestañas", importe: 2100, tint: "mint", desde: "2026-07-06", hasta: "2026-07-17", pieza: { titulo: "Reel + TikTok · Pestañas en un paso", formato: "reel" }, contacto: { nombre: "Álex Ferrer", email: "alex@example.com" }, factura: { numero: "2026-010", concepto: "Campaña «Máscara de pestañas»: 1 reel + 1 TikTok", base: 2100, emitidaEl: "2026-07-18", vencimiento: "2026-08-17", enviadaEl: "2026-07-18", cobradaEl: "2026-08-14", pdf: pdf("2026-010") } },
  { id: "vero-verano", marcaId: "vero", campana: "Iluminadores de verano", importe: 1500, tint: "peach", desde: "2026-07-20", hasta: "2026-07-31", pieza: { titulo: "Reel · Glow de verano", formato: "reel" }, contacto: { nombre: "Inés Roldán", email: "ines@example.com" }, factura: { numero: "2026-011", concepto: "Campaña «Iluminadores de verano»: 1 reel", base: 1500, emitidaEl: "2026-08-01", vencimiento: "2026-08-31", enviadaEl: "2026-08-01", cobradaEl: "2026-09-02", pdf: pdf("2026-011") } },
  { id: "dermanova-serum", marcaId: "dermanova", campana: "Sérum reparador", importe: 1650, tint: "lavender", desde: "2026-08-10", hasta: "2026-08-22", pieza: { titulo: "Reel · Barrera de la piel", formato: "reel" }, contacto: { nombre: "Rocío Peña", email: "rocio@example.com" }, factura: { numero: "2026-012", concepto: "Campaña «Sérum reparador»: 1 reel", base: 1650, emitidaEl: "2026-08-24", vencimiento: "2026-09-23", enviadaEl: "2026-08-24", cobradaEl: "2026-09-21", pdf: pdf("2026-012") } },
  { id: "brisa-verano", marcaId: "brisa", campana: "Esmaltes de verano", importe: 1700, tint: "sky", desde: "2026-08-26", hasta: "2026-08-28", pieza: { titulo: "4 stories · Colores de verano", formato: "story", unidades: 4 }, contacto: { nombre: "Vera Costa", email: "vera@example.com" }, factura: { numero: "2026-013", concepto: "Campaña «Esmaltes de verano»: 4 stories", base: 1700, emitidaEl: "2026-08-29", vencimiento: "2026-09-28", enviadaEl: "2026-08-29", cobradaEl: "2026-09-26", pdf: pdf("2026-013") } },
  { id: "bloom-delineador", marcaId: "bloom", campana: "Delineador líquido", importe: 1800, tint: "mint", desde: "2026-09-07", hasta: "2026-09-18", pieza: { titulo: "Reel · El trazo perfecto", formato: "reel" }, contacto: { nombre: "Álex Ferrer", email: "alex@example.com" }, factura: { numero: "2026-015", concepto: "Campaña «Delineador líquido»: 1 reel", base: 1800, emitidaEl: "2026-09-19", vencimiento: "2026-10-19", enviadaEl: "2026-09-19", cobradaEl: "2026-10-05", pdf: pdf("2026-015") } },
  // Las dos últimas aún no están cobradas: una factura sin enviar y unos vídeos entregados sin facturar.
  { id: "brisa-otono", marcaId: "brisa", campana: "Manicura de otoño", estado: "por-cobrar", importe: 900, tint: "sky", desde: "2026-09-22", hasta: "2026-10-03", pieza: { titulo: "Reel · Manicura en casa", formato: "reel" }, contacto: { nombre: "Vera Costa", email: "vera@example.com" }, factura: { numero: "2026-018", concepto: "Campaña «Manicura de otoño»: 1 reel", base: 900, emitidaEl: "2026-10-05", vencimiento: "2026-11-04", pdf: pdf("2026-018") } },
  { id: "dermanova-ugc", marcaId: "dermanova", campana: "Vídeos para anuncios", tipo: "ugc", estado: "publicada", importe: 1200, tint: "lavender", desde: "2026-09-15", hasta: "2026-10-02", pieza: { titulo: "3 vídeos UGC · Antes y después", formato: "ugc", unidades: 3, publicada: false }, contacto: { nombre: "Rocío Peña", email: "rocio@example.com" } },
]

export const historialCollabs: Collab[] = HISTORIAL.map(collab)
export const historialFacturas: Factura[] = HISTORIAL.flatMap(factura)
