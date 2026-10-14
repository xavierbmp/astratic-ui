// Lo que rellena la marca por enlace, sin cuenta: el brief con sus piezas, sus materiales y sus datos
// de facturación, o solo los materiales. El mismo esquema valida en la página y, en el portal, en la
// server action que lo guarda. También crea piezas nuevas con sus valores por defecto.
import { z } from "zod"
import { LISTA_TIPOS_PIEZA, type CampoBrief, type Collab, type Condicion, type Formato, type Pieza, type TipoPieza } from "@/lib/influencer/modelo"
import type { SocialNetwork } from "@/components/app/social-icons"
import { textoAHtml } from "@/lib/influencer/guion"
import { sumarDias } from "@/lib/influencer/fechas"
import { idNuevo } from "@/lib/influencer/tareas"

/** Días que vale un enlace para la marca. */
export const DIAS_ENLACE = 30

/** Redes en las que se publica una pieza. */
export const REDES_PIEZA: SocialNetwork[] = ["instagram", "tiktok", "youtube", "linkedin"]

/** Una pieza nueva con sus valores por defecto: en preparación, sin versiones y en la primera ronda. */
export function piezaNueva(datos: { collabId: string; tipo: TipoPieza; titulo: string; publicacion: string; red?: SocialNetwork; plataforma?: string; formato?: Formato; unidades?: number; indicaciones?: string; sinGuion?: boolean; fechaGuion?: string; condiciones?: Condicion[]; importe?: number }): Pieza {
  return {
    id: idNuevo("pz"),
    collabId: datos.collabId,
    tipo: datos.tipo,
    formato: datos.formato,
    red: datos.red,
    plataforma: datos.plataforma || datos.red,
    unidades: datos.unidades ?? 1,
    titulo: datos.titulo,
    publicacion: datos.publicacion,
    sinGuion: datos.sinGuion || undefined,
    fechaGuion: datos.fechaGuion || undefined,
    condiciones: datos.condiciones?.length ? datos.condiciones : undefined,
    importe: datos.importe,
    estado: "borrador",
    guion: [],
    media: [],
    rondaActual: 1,
    indicaciones: datos.indicaciones || undefined,
  }
}

/** Una condición pactada (exclusividad, derechos…) con sus días si los tiene. */
export const esquemaCondicion = z.object({ id: z.string().min(1).max(60), nombre: z.string().trim().min(1).max(60), dias: z.number().int().min(1).max(3650).optional(), icono: z.string().max(40).optional() })

/** «450», «99,90» o vacío → el número, o nada si no es un importe (como el importe de la collab). */
export function numeroDeImporte(texto: string | undefined) {
  const limpio = (texto ?? "").trim().replace(",", ".")
  if (!limpio) return undefined
  const n = Number(limpio)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export const esquemaPiezaPedida = z.object({
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  /** Vacío, se queda con el nombre de su formato. */
  titulo: z.string().trim().max(120),
  /** Vacío si la marca aún no lo sabe: se pone la fecha final de la ventana. */
  publicacion: z.string(),
  red: z.enum(["instagram", "tiktok", "youtube", "linkedin"]).optional(),
  /** Dónde se publica, sea o no una red que se conecta. */
  plataforma: z.string().trim().max(40).optional(),
  indicaciones: z.string().max(600),
  /** El formato con el que se añadió (`FormatoPieza.id`): solo ayuda a rellenarla, la pieza no lo guarda. */
  formato: z.string().max(60).optional(),
  /** Si se revisa un guion antes; en las de solo texto no aplica (el texto es la pieza). */
  requiereGuion: z.boolean().optional(),
  /** Cuándo se manda el guion; vacío, 10 días antes de publicar. */
  fechaGuion: z.string().optional(),
  condiciones: z.array(esquemaCondicion).max(20).optional(),
  /** Lo que se cobra por ella, tal como se escribe («450», «99,90»); vacío o sin número, sin importe propio. */
  importe: z.string().max(20).optional(),
  /** El nombre lo ha escrito ella: ya no se rellena solo con el formato y la campaña. */
  nombreManual: z.boolean().optional(),
  /** Solo para la pantalla: distingue cada pieza mientras se rellena (para quitar una sin mover las demás). */
  clave: z.string().max(80).optional(),
})

export type PiezaPedidaForm = z.infer<typeof esquemaPiezaPedida>

export const PIEZA_VACIA: PiezaPedidaForm = { formato: "reel", tipo: "video", titulo: "", publicacion: "", red: "instagram", indicaciones: "", requiereGuion: true, fechaGuion: "" }

/** La pieza de la collab a partir de la del formulario: sin nombre, el del tipo; sin día, `porDefecto`. */
export function piezaDeFormulario(p: PiezaPedidaForm, collabId: string, porDefecto: string): Pieza {
  return piezaNueva({
    collabId,
    tipo: p.tipo,
    titulo: p.titulo.trim() || TITULO_POR_TIPO[p.tipo],
    publicacion: p.publicacion || porDefecto,
    red: p.red,
    plataforma: p.plataforma,
    indicaciones: p.indicaciones.trim(),
    sinGuion: p.tipo !== "texto" && p.requiereGuion === false,
    fechaGuion: p.requiereGuion === false ? undefined : p.fechaGuion,
    condiciones: p.condiciones,
    importe: numeroDeImporte(p.importe),
  })
}

const TITULO_POR_TIPO: Record<TipoPieza, string> = { video: "Vídeo", foto: "Foto", carrusel: "Carrusel", texto: "Texto" }

const opcional = z.string().trim().max(200)

/** Lo que manda la marca. Nada es obligatorio: lo que deja vacío se queda como estaba en la collab. */
export const esquemaFormularioBrief = z.object({
  contacto: z.object({
    nombre: z.string().trim().max(80),
    email: z.string().trim().email("Revisa el email").or(z.literal("")),
  }),
  campana: z.string().trim().max(80),
  texto: z.string().max(6000),
  desde: z.string(),
  hasta: z.string(),
  piezas: z.array(esquemaPiezaPedida).max(50),
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
 * La collab con lo que ha mandado la marca, solo de los apartados que se le pidieron (`campos`): lo
 * que no se le pidió o deja vacío se queda como estaba. Las piezas se añaden a las que ya hubiera;
 * sin día, se publican al final de la ventana.
 */
export function aplicarFormulario(collab: Collab, v: FormularioBrief, campos: CampoBrief[]): Collab {
  const pide = (c: CampoBrief) => campos.includes(c)
  const desde = (pide("fechas") && v.desde) || collab.desde
  const hasta = (pide("fechas") && v.hasta) || collab.hasta
  const nuevas = pide("piezas") ? v.piezas.map((p) => piezaDeFormulario(p, collab.id, hasta)) : []
  const f = v.facturacion
  const brief = collab.brief
  return {
    ...collab,
    campana: (pide("campana") && v.campana) || collab.campana,
    desde,
    hasta,
    piezas: [...collab.piezas, ...nuevas],
    brief: {
      ...brief,
      texto: pide("campana") && v.texto.trim() ? textoAHtml(v.texto) : brief.texto,
      ...(pide("publicar") && {
        menciones: partirEtiquetas(v.menciones),
        hashtags: partirEtiquetas(v.hashtags),
        enlace: v.enlace || undefined,
        codigo: v.codigo || undefined,
        derechosUso: v.derechosUso || undefined,
        exclusividad: v.exclusividad || undefined,
      }),
      contacto: pide("contacto") && v.contacto.nombre ? { nombre: v.contacto.nombre, email: v.contacto.email } : brief.contacto,
    },
    facturacion: pide("facturacion") && f.razonSocial ? { razonSocial: f.razonSocial, nif: f.nif, direccion: f.direccion, email: f.email, pedido: f.pedido || undefined } : collab.facturacion,
  }
}

/** Cómo es un token de enlace para la marca: el prefijo de lo que abre y 32 bytes aleatorios. */
export const FORMATO_TOKEN = /^[a-z]{2,4}-[A-Za-z0-9_-]{43}$/

/** Token de un enlace para la marca, sin cuenta: 32 bytes aleatorios, imposible de adivinar. */
export function tokenNuevo(prefijo: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const base64 = btoa(String.fromCharCode(...bytes))
  return `${prefijo}-${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`
}

/** Hasta cuándo vale un enlace que se crea hoy. */
export function caducidad(hoy: string) {
  return sumarDias(hoy, DIAS_ENLACE)
}
