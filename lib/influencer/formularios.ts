// Lo que rellena la marca por enlace, sin cuenta: el brief con sus piezas, sus materiales y sus datos
// de facturación, o solo los materiales. El mismo esquema valida en la página y, en el portal, en la
// server action que lo guarda. También crea piezas nuevas con sus valores por defecto.
import { z } from "zod"
import { LISTA_TIPOS_PIEZA, type Collab, type Formato, type Pieza, type TipoPieza } from "@/lib/influencer/modelo"
import type { SocialNetwork } from "@/components/app/social-icons"
import { textoAHtml } from "@/lib/influencer/guion"
import { sumarDias } from "@/lib/influencer/fechas"
import { idNuevo } from "@/lib/influencer/tareas"

/** Días que vale un enlace para la marca. */
export const DIAS_ENLACE = 30

/** Redes en las que se publica una pieza. */
export const REDES_PIEZA: SocialNetwork[] = ["instagram", "tiktok", "youtube", "linkedin"]

/** Una pieza nueva con sus valores por defecto: en preparación, sin versiones y en la primera ronda. */
export function piezaNueva(datos: { collabId: string; tipo: TipoPieza; titulo: string; publicacion: string; red?: SocialNetwork; formato?: Formato; unidades?: number; indicaciones?: string }): Pieza {
  return {
    id: idNuevo("pz"),
    collabId: datos.collabId,
    tipo: datos.tipo,
    formato: datos.formato,
    red: datos.red,
    unidades: datos.unidades ?? 1,
    titulo: datos.titulo,
    publicacion: datos.publicacion,
    estado: "borrador",
    guion: [],
    media: [],
    rondaActual: 1,
    indicaciones: datos.indicaciones || undefined,
  }
}

export const esquemaPiezaPedida = z.object({
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  titulo: z.string().trim().min(1, "Ponle nombre").max(80),
  /** Vacío si la marca aún no lo sabe: se pone la fecha final de la ventana. */
  publicacion: z.string(),
  red: z.enum(["instagram", "tiktok", "youtube", "linkedin"]).optional(),
  indicaciones: z.string().max(600),
})

export type PiezaPedidaForm = z.infer<typeof esquemaPiezaPedida>

export const PIEZA_VACIA: PiezaPedidaForm = { tipo: "video", titulo: "", publicacion: "", red: "instagram", indicaciones: "" }

const opcional = z.string().trim().max(200)

export const esquemaFormularioBrief = z.object({
  contacto: z.object({
    nombre: z.string().trim().min(1, "Dinos tu nombre").max(80),
    email: z.string().trim().email("Revisa el email"),
  }),
  campana: z.string().trim().min(1, "Ponle nombre a la campaña").max(80),
  texto: z.string().max(6000),
  desde: z.string(),
  hasta: z.string(),
  piezas: z.array(esquemaPiezaPedida).min(1, "Añade al menos una pieza"),
  menciones: opcional,
  hashtags: opcional,
  enlace: z.string().trim().url("Pon la dirección completa, con https://").or(z.literal("")),
  codigo: opcional,
  derechosUso: opcional,
  exclusividad: opcional,
  facturacion: z.object({ razonSocial: opcional, nif: opcional, direccion: opcional, email: z.string().trim().email("Revisa el email").or(z.literal("")), pedido: opcional }),
})

export type FormularioBrief = z.infer<typeof esquemaFormularioBrief>

/** «@marca, #publi #skincare» → ["@marca", "#publi", "#skincare"]. */
export function partirEtiquetas(texto: string) {
  return texto
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * La collab con lo que ha mandado la marca: brief, fechas, piezas y facturación. Las piezas se añaden
 * a las que ya hubiera; sin fecha, se publican al final de la ventana.
 */
export function aplicarFormulario(collab: Collab, v: FormularioBrief): Collab {
  const desde = v.desde || collab.desde
  const hasta = v.hasta || collab.hasta
  const nuevas = v.piezas.map((p) => piezaNueva({ collabId: collab.id, tipo: p.tipo, titulo: p.titulo, publicacion: p.publicacion || hasta, red: p.red, indicaciones: p.indicaciones }))
  const f = v.facturacion
  return {
    ...collab,
    campana: v.campana,
    desde,
    hasta,
    piezas: [...collab.piezas, ...nuevas],
    brief: {
      ...collab.brief,
      texto: v.texto.trim() ? textoAHtml(v.texto) : collab.brief.texto,
      menciones: partirEtiquetas(v.menciones),
      hashtags: partirEtiquetas(v.hashtags),
      enlace: v.enlace || undefined,
      codigo: v.codigo || undefined,
      derechosUso: v.derechosUso || undefined,
      exclusividad: v.exclusividad || undefined,
      contacto: { nombre: v.contacto.nombre, email: v.contacto.email },
    },
    facturacion: f.razonSocial ? { razonSocial: f.razonSocial, nif: f.nif, direccion: f.direccion, email: f.email, pedido: f.pedido || undefined } : collab.facturacion,
  }
}

/** El token de un enlace nuevo para la marca: imposible de adivinar en el portal (aquí, único). */
export function tokenNuevo(prefijo: string) {
  return idNuevo(prefijo)
}

export function caducidad(hoy: string) {
  return sumarDias(hoy, DIAS_ENLACE)
}
