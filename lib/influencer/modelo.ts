// Modelo del workspace de la influencer: los tipos del dominio, sus estados y las etiquetas que se
// enseñan. Hoy lo alimentan los datos de ejemplo (demo-data.ts); en el Portal Astratic saldrán de
// Prisma con estos mismos nombres, así que las vistas no cambian.
import type { StatusTone } from "@/lib/status"
import type { Tint } from "@/lib/influencer/tints"
import type { SocialNetwork } from "@/components/app/social-icons"

/** Un estado con su etiqueta y el tono de `StatusBadge`. */
export type Estado<T extends string> = { id: T; label: string; tone: StatusTone }

export function estadoDe<T extends string>(lista: Estado<T>[], id: T): Estado<T> {
  const e = lista.find((x) => x.id === id)
  if (!e) throw new Error(`Estado desconocido: ${id}`)
  return e
}

// ───────────────────────── Formatos y tarifas ─────────────────────────

export type Formato = "reel" | "story" | "post" | "tiktok" | "youtube" | "ugc"

export const FORMATOS: Record<Formato, { label: string; plural: string; red?: SocialNetwork }> = {
  reel: { label: "Reel", plural: "reels", red: "instagram" },
  story: { label: "Story", plural: "stories", red: "instagram" },
  post: { label: "Post", plural: "posts", red: "instagram" },
  tiktok: { label: "TikTok", plural: "TikToks", red: "tiktok" },
  youtube: { label: "Vídeo de YouTube", plural: "vídeos de YouTube", red: "youtube" },
  ugc: { label: "Vídeo UGC", plural: "vídeos UGC" },
}

export const LISTA_FORMATOS = Object.keys(FORMATOS) as Formato[]

/** Precio de salida y mínimo pactados con Astratic, por formato. */
export type Tarifa = { formato: Formato; precio: number; minimo: number }

export type PiezaPedida = { formato: Formato; cantidad: number }

/** «1 reel + 3 stories». */
export function describirPiezas(piezas: PiezaPedida[]) {
  return piezas.map((p) => `${p.cantidad} ${p.cantidad === 1 ? FORMATOS[p.formato].label.toLowerCase() : FORMATOS[p.formato].plural}`).join(" + ")
}

/**
 * Extras que suben el fee (Libro Blanco de IAB): derechos de uso, exclusividad, paid y urgencia.
 * Los porcentajes son de ejemplo; los fija Astratic en el modelo de tarifas.
 */
export type ExtraId = "derechos" | "exclusividad" | "paid" | "urgencia"

export const EXTRAS: { id: ExtraId; label: string; descripcion: string; recargo: number }[] = [
  { id: "derechos", label: "Derechos de uso · 6 meses", descripcion: "La marca puede usar el contenido en sus canales", recargo: 0.2 },
  { id: "exclusividad", label: "Exclusividad de categoría · 3 meses", descripcion: "Sin trabajar con marcas de la competencia", recargo: 0.25 },
  { id: "paid", label: "Paid o whitelisting", descripcion: "La marca invierte en anuncios con el contenido", recargo: 0.3 },
  { id: "urgencia", label: "Urgencia · menos de 7 días", descripcion: "Grabar y entregar en menos de una semana", recargo: 0.15 },
]

// ───────────────────────── Marcas ─────────────────────────

export type Contacto = { id: string; nombre: string; cargo?: string; email?: string }

export type Marca = {
  id: string
  nombre: string
  sector: string
  web?: string
  tint: Tint
  /** Marca que trajo ella (suya durante 12 meses) o de la red de Astratic. */
  atribucion: "propia" | "red"
  atribucionHasta?: string
  contactos: Contacto[]
  /** Notas privadas: «pagan tarde», «piden muchas rondas». */
  notas?: string
}

// ───────────────────────── Propuestas (su CRM) ─────────────────────────

export type EstadoPropuesta = "nueva" | "hablando" | "enviada" | "negociando" | "ganada" | "perdida"

export const ESTADOS_PROPUESTA: Estado<EstadoPropuesta>[] = [
  { id: "nueva", label: "Nueva", tone: "neutral" },
  { id: "hablando", label: "Hablando", tone: "info" },
  { id: "enviada", label: "Enviada", tone: "info" },
  { id: "negociando", label: "Negociando", tone: "warning" },
  { id: "ganada", label: "Ganada", tone: "success" },
  { id: "perdida", label: "Perdida", tone: "danger" },
]

export const ESTADOS_ABIERTOS: EstadoPropuesta[] = ["nueva", "hablando", "enviada", "negociando"]

export type OrigenPropuesta = "marca" | "red" | "mediakit"

export const ORIGENES: Record<OrigenPropuesta, string> = {
  marca: "Me escribió la marca",
  red: "Red Astratic",
  mediakit: "Formulario del media kit",
}

export type MotivoPerdida = "precio" | "fechas" | "no-encaja" | "sin-respuesta"

export const MOTIVOS_PERDIDA: Record<MotivoPerdida, string> = {
  precio: "Precio",
  fechas: "Fechas",
  "no-encaja": "No encaja",
  "sin-respuesta": "Sin respuesta",
}

export type LineaPresupuesto = { formato: Formato; cantidad: number; precio: number }

/** Lo que sale de «Preparar propuesta»: las líneas, los extras y el media kit con o sin precios. */
export type Presupuesto = {
  lineas: LineaPresupuesto[]
  extras: ExtraId[]
  conPrecios: boolean
  generadoEl: string
}

export type Propuesta = {
  id: string
  marcaId: string
  campana: string
  estado: EstadoPropuesta
  origen: OrigenPropuesta
  piezas: PiezaPedida[]
  /** Lo que ofrece la marca, si lo ha dicho. */
  ofrecen?: number
  presupuesto?: Presupuesto
  /** Ventana de publicación que pide la marca. */
  desde?: string
  hasta?: string
  ultimoContacto: string
  siguientePaso?: string
  siguienteFecha?: string
  notas?: string
  motivoPerdida?: MotivoPerdida
  /** La collab que nació al ganarla. */
  collabId?: string
  creadaEl: string
}

// ───────────────────────── Collabs ─────────────────────────

export type TipoCollab = "directa" | "red" | "regalo" | "ugc"

export const TIPOS_COLLAB: Record<TipoCollab, { label: string; descripcion: string }> = {
  directa: { label: "Directa", descripcion: "La trae ella y factura ella" },
  red: { label: "De la red", descripcion: "La vende Astratic: factura Astratic y ella cobra el 80 %" },
  regalo: { label: "Regalo", descripcion: "Producto sin fee; si lo publica, también es publicidad" },
  ugc: { label: "UGC", descripcion: "Entrega los archivos y no publica" },
}

export type EstadoCollab = "por-empezar" | "en-curso" | "publicada" | "por-cobrar" | "cerrada" | "cancelada"

export const ESTADOS_COLLAB: Estado<EstadoCollab>[] = [
  { id: "por-empezar", label: "Por empezar", tone: "neutral" },
  { id: "en-curso", label: "En curso", tone: "info" },
  { id: "publicada", label: "Publicada", tone: "success" },
  { id: "por-cobrar", label: "Por cobrar", tone: "warning" },
  { id: "cerrada", label: "Cerrada", tone: "neutral" },
  { id: "cancelada", label: "Cancelada", tone: "danger" },
]

export const COLLABS_ACTIVAS: EstadoCollab[] = ["por-empezar", "en-curso", "publicada", "por-cobrar"]

export type EstadoCobro = "por-facturar" | "facturado" | "vencido" | "cobrado"

export const ESTADOS_COBRO: Estado<EstadoCobro>[] = [
  { id: "por-facturar", label: "Por facturar", tone: "neutral" },
  { id: "facturado", label: "Facturado", tone: "info" },
  { id: "vencido", label: "Vencido", tone: "danger" },
  { id: "cobrado", label: "Cobrado", tone: "success" },
]

export type EstadoProducto = "pendiente" | "enviado" | "recibido"

export const ESTADOS_PRODUCTO: Estado<EstadoProducto>[] = [
  { id: "pendiente", label: "Por enviar", tone: "neutral" },
  { id: "enviado", label: "Enviado", tone: "info" },
  { id: "recibido", label: "Recibido", tone: "success" },
]

/** El brief de la marca: lo que hay que cumplir. Se edita en el sitio desde la ficha de la collab. */
export type Brief = {
  objetivo: string
  mensajesClave: string[]
  menciones: string[]
  hashtags: string[]
  enlace?: string
  codigo?: string
  /** «Skincare · 3 meses». */
  exclusividad?: string
  /** «Orgánico · 6 meses» o «Paid · 3 meses». */
  derechosUso?: string
  rondasIncluidas: number
  claimsPermitidos: string[]
  claimsProhibidos: string[]
  hacer: string[]
  evitar: string[]
  producto?: { estado: EstadoProducto; detalle?: string }
  contacto: { nombre: string; email: string }
  condicionesPago: string
}

export type Collab = {
  id: string
  marcaId: string
  campana: string
  tipo: TipoCollab
  estado: EstadoCollab
  importe: number
  /** Lo que cobra ella si es de la red (80 %). */
  importeNeto?: number
  tint: Tint
  coverUrl?: string
  /** Ventana de publicación. */
  desde: string
  hasta: string
  brief: Brief
  piezas: Pieza[]
  cobro: { estado: EstadoCobro; vencimiento?: string; factura?: string }
  propuestaId?: string
  creadaEl: string
}

// ───────────────────────── Piezas, versiones y notas ─────────────────────────

export type EstadoPieza = "borrador" | "en-revision" | "cambios" | "aprobado" | "programado" | "publicado" | "resultados"

export const ESTADOS_PIEZA: Estado<EstadoPieza>[] = [
  { id: "borrador", label: "En preparación", tone: "neutral" },
  { id: "en-revision", label: "En revisión", tone: "info" },
  { id: "cambios", label: "Cambios pedidos", tone: "warning" },
  { id: "aprobado", label: "Aprobado", tone: "success" },
  { id: "programado", label: "Programado", tone: "info" },
  { id: "publicado", label: "Publicado", tone: "success" },
  { id: "resultados", label: "Con resultados", tone: "neutral" },
]

export type TipoVersion = "guion" | "video"

export type EstadoVersion = "borrador" | "en-revision" | "cambios" | "aprobada"

export const ESTADOS_VERSION: Estado<EstadoVersion>[] = [
  { id: "borrador", label: "Borrador", tone: "neutral" },
  { id: "en-revision", label: "En revisión", tone: "info" },
  { id: "cambios", label: "Cambios pedidos", tone: "warning" },
  { id: "aprobada", label: "Aprobada", tone: "success" },
]

/** Dónde va una nota: una cita del guion o un segundo del vídeo. */
export type AnclaNota = { tipo: "texto"; cita: string } | { tipo: "segundo"; segundo: number }

export type Nota = {
  id: string
  autor: string
  el: string
  texto: string
  ancla?: AnclaNota
  resuelta: boolean
  /** Lo que ella contestó, si contestó. */
  respuesta?: string
}

export type Version = {
  id: string
  tipo: TipoVersion
  numero: number
  estado: EstadoVersion
  creadaEl: string
  /** Guion: el texto, en párrafos. */
  texto?: string
  /** Vídeo: el archivo subido. */
  archivo?: { nombre: string; tamano: number; duracion: number; posterUrl?: string }
  notas: Nota[]
  /** Enlace de revisión para la marca, sin cuenta: imposible de adivinar y con caducidad. */
  enlace?: { token: string; caduca: string }
  aprobada?: { por: string; el: string }
}

export type Pieza = {
  id: string
  collabId: string
  formato: Formato
  /** Cuántas unidades cuenta en la collab (3 stories son una pieza de 3). */
  unidades: number
  titulo: string
  /** Fecha prevista de publicación: de ella salen el resto de fechas. */
  publicacion: string
  estado: EstadoPieza
  guion: Version[]
  video: Version[]
  rondaActual: number
  publicada?: { url: string; fecha: string; marcadaPubli: boolean }
  portadaUrl?: string
}

// ───────────────────────── Materiales ─────────────────────────

export type TipoMaterial = "imagen" | "video" | "pdf" | "documento" | "enlace" | "zip"

export const TIPOS_MATERIAL: Record<TipoMaterial, string> = {
  imagen: "Imagen",
  video: "Vídeo",
  pdf: "PDF",
  documento: "Documento",
  enlace: "Enlace",
  zip: "Carpeta comprimida",
}

export type Material = {
  id: string
  collabId: string
  nombre: string
  tipo: TipoMaterial
  /** De la marca (brief, logos, producto) o suyo (contrato firmado, referencias). */
  origen: "marca" | "mia"
  tamano?: number
  url: string
  previewUrl?: string
  subidoEl: string
  descripcion?: string
}

// ───────────────────────── Tareas ─────────────────────────

export type RelacionTarea = { tipo: "collab" | "propuesta"; id: string }

export type Tarea = {
  id: string
  titulo: string
  hecha: boolean
  fechaLimite?: string
  /** La collab o propuesta a la que pertenece; sin relación es una tarea general. */
  relacion?: RelacionTarea
  /** Las automáticas salen de las fechas del brief; las manuales las añade ella. */
  origen: "auto" | "manual"
  notas?: string
  hechaEl?: string
}

// ───────────────────────── Avisos, enlaces, actividad y perfil ─────────────────────────

export type TipoAviso = "oportunidad" | "cambios" | "aprobado" | "cobro" | "astratic"

export type Aviso = {
  id: string
  tipo: TipoAviso
  titulo: string
  descripcion?: string
  el: string
  leido: boolean
  href?: string
}

export type Enlace = { id: string; etiqueta: string; url: string }

export type Actividad = {
  id: string
  /** Quién lo hizo: ella, alguien de la marca, Astratic o el sistema. */
  quien: string
  que: string
  el: string
  collabId?: string
  propuestaId?: string
}

export type CuentaRed = {
  red: SocialNetwork
  handle: string
  url: string
  seguidores: number
  /** Visualizaciones medias de las últimas publicaciones (reels, vídeos). */
  visualizacionesMedias: number
  interaccion: number
}

export type Perfil = {
  nombre: string
  nombrePila: string
  handle: string
  fotoUrl: string
  nicho: string
  tramo: string
  ciudad: string
  bio: string
  cuentas: CuentaRed[]
  audiencia: { espana: number; mujeres: number; edades: string }
  tarifas: Tarifa[]
}
