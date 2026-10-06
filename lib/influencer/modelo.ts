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

export const FORMATOS: Record<Formato, { label: string; singular: string; plural: string; red?: SocialNetwork }> = {
  reel: { label: "Reel", singular: "reel", plural: "reels", red: "instagram" },
  story: { label: "Story", singular: "story", plural: "stories", red: "instagram" },
  post: { label: "Post", singular: "post", plural: "posts", red: "instagram" },
  tiktok: { label: "TikTok", singular: "TikTok", plural: "TikToks", red: "tiktok" },
  youtube: { label: "Vídeo de YouTube", singular: "vídeo de YouTube", plural: "vídeos de YouTube", red: "youtube" },
  ugc: { label: "Vídeo UGC", singular: "vídeo UGC", plural: "vídeos UGC" },
}

export const LISTA_FORMATOS = Object.keys(FORMATOS) as Formato[]

/** Precio de salida y mínimo pactados con Astratic, por formato. */
export type Tarifa = { formato: Formato; precio: number; minimo: number }

export type PiezaPedida = { formato: Formato; cantidad: number }

/** «1 reel + 3 stories». */
export function describirPiezas(piezas: PiezaPedida[]) {
  return piezas.map((p) => `${p.cantidad} ${p.cantidad === 1 ? FORMATOS[p.formato].singular : FORMATOS[p.formato].plural}`).join(" + ")
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

// ───────────────────────── Marcas y contactos (su CRM) ─────────────────────────

export type Marca = {
  id: string
  nombre: string
  sector: string
  web?: string
  instagram?: string
  tint: Tint
  /** Marca que trajo ella (suya durante 12 meses) o de la red de Astratic. */
  atribucion: "propia" | "red"
  atribucionHasta?: string
  /** Notas privadas: «pagan tarde», «piden muchas rondas». */
  notas?: string
  creadaEl: string
}

/** Cómo va la relación con una marca: sale de sus propuestas y collabs, no se escribe a mano. */
export type RelacionMarca = "cliente" | "en-conversacion" | "perdida" | "sin-propuestas"

export const RELACIONES_MARCA: Estado<RelacionMarca>[] = [
  { id: "cliente", label: "Cliente", tone: "success" },
  { id: "en-conversacion", label: "En conversación", tone: "info" },
  { id: "perdida", label: "Sin acuerdo", tone: "neutral" },
  { id: "sin-propuestas", label: "Sin propuestas", tone: "neutral" },
]

export type Contacto = {
  id: string
  marcaId: string
  nombre: string
  cargo?: string
  email?: string
  telefono?: string
  instagram?: string
  /** Quien lleva la relación: sale primero y es a quien se escribe por defecto. */
  principal?: boolean
  notas?: string
  creadoEl: string
}

/** Lo que se apunta en el seguimiento: cada email, mensaje o llamada con la marca. */
export type TipoInteraccion = "email" | "dm" | "whatsapp" | "llamada" | "reunion" | "nota"

export const TIPOS_INTERACCION: Record<TipoInteraccion, string> = {
  email: "Email",
  dm: "Mensaje directo",
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  reunion: "Reunión",
  nota: "Nota",
}

export type Interaccion = {
  id: string
  tipo: TipoInteraccion
  /** Enviado por ella o recibido de la marca. */
  sentido: "enviado" | "recibido"
  el: string
  nota?: string
  marcaId: string
  contactoId?: string
  propuestaId?: string
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

export type OrigenPropuesta = "marca" | "propia" | "red" | "mediakit"

export const ORIGENES: Record<OrigenPropuesta, string> = {
  marca: "Me escribió la marca",
  propia: "La busqué yo",
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

/** Lo que sale de «Preparar propuesta»: las líneas, los extras, las condiciones y el media kit con o sin precios. */
export type Presupuesto = {
  lineas: LineaPresupuesto[]
  extras: ExtraId[]
  conPrecios: boolean
  /** Rondas de cambios incluidas por pieza. */
  rondas: number
  /** Días que vale el presupuesto. */
  validez: number
  /** Cuándo y cómo se cobra. */
  pago: string
  /** Condiciones propias para esta marca, una por línea. */
  condiciones?: string
  generadoEl: string
}

export const CONDICIONES_POR_DEFECTO = { rondas: 2, validez: 15, pago: "30 días tras publicar" }

export type Propuesta = {
  id: string
  marcaId: string
  /** Con quién se habla; por defecto, el contacto principal de la marca. */
  contactoId?: string
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

/**
 * El brief de la marca. Lo que se lee (objetivo, mensajes clave, claims permitidos y prohibidos, qué
 * hacer y qué evitar) va en un solo texto; lo que se usa suelto al publicar o al cobrar, en campos.
 */
export type Brief = {
  /** El documento del brief (HTML del editor). */
  texto: string
  menciones: string[]
  hashtags: string[]
  enlace?: string
  codigo?: string
  /** «Skincare · 3 meses». */
  exclusividad?: string
  /** «Orgánico · 6 meses» o «Paid · 3 meses». */
  derechosUso?: string
  rondasIncluidas: number
  producto?: { estado: EstadoProducto; detalle?: string }
  contacto: { nombre: string; email: string }
  condicionesPago: string
}

/** Datos de la marca para facturarle: los pone ella o la marca en su formulario. */
export type DatosFacturacion = {
  razonSocial: string
  nif: string
  direccion: string
  /** A dónde se manda la factura. */
  email: string
  /** Número de pedido que algunas marcas exigen en la factura. */
  pedido?: string
}

/** Un plazo de cobro pactado («50 % al aprobar el guion»); cada factura cubre uno. */
export type PlazoCobro = { id: string; concepto: string; porcentaje: number }

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
  /** Cómo va el cobro, en resumen: lo actualizan las facturas de la collab. */
  cobro: { estado: EstadoCobro; vencimiento?: string; factura?: string }
  /** Cómo se cobra: un plazo o varios que suman el 100 %. */
  plazos: PlazoCobro[]
  facturacion?: DatosFacturacion
  propuestaId?: string
  creadaEl: string
}

// ───────────────────────── Piezas, versiones y notas ─────────────────────────

/** Lo que se entrega. El nombre lo pone quien la pide («Reel de la rutina»); el tipo decide qué se revisa. */
export type TipoPieza = "video" | "foto" | "carrusel" | "texto"

export const TIPOS_PIEZA: Record<TipoPieza, { label: string; plural: string; /** Lo que se revisa después del guion. */ media?: "video" | "imagen" }> = {
  video: { label: "Vídeo", plural: "vídeos", media: "video" },
  foto: { label: "Foto", plural: "fotos", media: "imagen" },
  carrusel: { label: "Carrusel", plural: "carruseles", media: "imagen" },
  texto: { label: "Texto", plural: "textos" },
}

export const LISTA_TIPOS_PIEZA = Object.keys(TIPOS_PIEZA) as TipoPieza[]

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

/** Las dos partes de una pieza que se revisan: el guion (texto) y el contenido final (vídeo o fotos). */
export type TipoVersion = "guion" | "media"

export type EstadoVersion = "borrador" | "en-revision" | "cambios" | "aprobada"

export const ESTADOS_VERSION: Estado<EstadoVersion>[] = [
  { id: "borrador", label: "Borrador", tone: "neutral" },
  { id: "en-revision", label: "En revisión", tone: "info" },
  { id: "cambios", label: "Cambios pedidos", tone: "warning" },
  { id: "aprobada", label: "Aprobada", tone: "success" },
]

/** Dónde va una nota: una cita del guion, un segundo del vídeo o un punto de una foto (en %). */
export type AnclaNota =
  | { tipo: "texto"; cita: string }
  | { tipo: "segundo"; segundo: number }
  | { tipo: "punto"; x: number; y: number; /** Qué foto del carrusel, desde 0. */ imagen: number }

/** Un mensaje del hilo de una versión, de ella o de la marca. */
export type Comentario = { id: string; autor: string; lado: "influencer" | "marca"; el: string; texto: string }

/** Lo que pide la marca sobre una versión: se resuelve en la siguiente. */
export type Nota = {
  id: string
  autor: string
  el: string
  texto: string
  ancla?: AnclaNota
  resuelta: boolean
  /** Lo que se contestan sobre esta nota. */
  respuestas: Comentario[]
}

/** Un archivo de una versión: el vídeo o cada foto de un carrusel. */
export type ArchivoVersion = {
  nombre: string
  tamano: number
  /** La foto o la portada del vídeo. En el portal, un enlace firmado que caduca. */
  url?: string
  /** El vídeo para reproducirlo (en el portal, enlace firmado de R2). */
  videoUrl?: string
  /** Solo vídeo, en segundos. */
  duracion?: number
}

export type Version = {
  id: string
  tipo: TipoVersion
  numero: number
  estado: EstadoVersion
  creadaEl: string
  /** Guion: el documento (HTML del editor). */
  texto?: string
  /** Vídeo o fotos: un archivo, o varios en un carrusel. */
  archivos?: ArchivoVersion[]
  /** El copy de la publicación, que se aprueba junto al contenido. */
  copy?: string
  notas: Nota[]
  /** Lo que se dicen sobre esta versión fuera de las notas. */
  mensajes: Comentario[]
  /** Enlace de revisión para la marca, sin cuenta: imposible de adivinar y con caducidad. */
  enlace?: { token: string; caduca: string }
  aprobada?: { por: string; el: string }
}

export type Pieza = {
  id: string
  collabId: string
  tipo: TipoPieza
  /** El formato pactado en la propuesta (reel, story…), si lo hay; lo que pide la marca en su formulario va sin él. */
  formato?: Formato
  /** Dónde se publica. */
  red?: SocialNetwork
  /** Cuántas unidades cuenta en la collab (3 stories son una pieza de 3). */
  unidades: number
  titulo: string
  /** Fecha prevista de publicación: de ella salen el resto de fechas. */
  publicacion: string
  estado: EstadoPieza
  guion: Version[]
  /** El vídeo o las fotos, versión a versión. */
  media: Version[]
  rondaActual: number
  publicada?: { url: string; fecha: string; marcadaPubli: boolean }
  portadaUrl?: string
  /** Lo que pide la marca para esta pieza. */
  indicaciones?: string
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

// ───────────────────────── Facturación ─────────────────────────

/** Sus datos para facturar: salen en cada factura y en el contrato. */
export type DatosFiscales = {
  /** Nombre y apellidos o razón social. */
  nombre: string
  nif: string
  direccion: string
  iban: string
  forma: "autonoma" | "sociedad"
  /** IVA que repercute (21 % en general). */
  ivaPct: number
  /** Retención de IRPF: 15 %, 7 % los primeros años de autónoma, 0 en sociedad. */
  irpfPct: number
}

/** Una factura de la collab. La hace ella con su programa; aquí se apunta, se adjunta y se sigue hasta cobrarla. */
export type Factura = {
  id: string
  collabId: string
  /** El número de su programa de facturación: «2026-017». */
  numero: string
  /** A quién se factura: la marca o, en las collabs de la red, Astratic. */
  destinatario: "marca" | "astratic"
  concepto: string
  /** Base imponible, en euros. */
  base: number
  ivaPct: number
  irpfPct: number
  emitidaEl: string
  vencimiento: string
  enviadaEl?: string
  cobradaEl?: string
  /** El plazo de cobro que cubre. */
  plazoId?: string
  /** El PDF que hizo con su programa. */
  pdf?: { nombre: string; tamano: number }
}

/** Cómo va una factura. «Vencida» no se guarda: sale de la fecha. */
export type EstadoFactura = "emitida" | "enviada" | "vencida" | "cobrada"

export const ESTADOS_FACTURA: Estado<EstadoFactura>[] = [
  { id: "emitida", label: "Sin enviar", tone: "neutral" },
  { id: "enviada", label: "Enviada", tone: "info" },
  { id: "vencida", label: "Vencida", tone: "danger" },
  { id: "cobrada", label: "Cobrada", tone: "success" },
]

// ───────────────────────── Contratos ─────────────────────────

export type EstadoContrato = "borrador" | "enviado" | "firmado"

export const ESTADOS_CONTRATO: Estado<EstadoContrato>[] = [
  { id: "borrador", label: "Borrador", tone: "neutral" },
  { id: "enviado", label: "Esperando la firma", tone: "info" },
  { id: "firmado", label: "Firmado", tone: "success" },
]

/** Aceptación con registro: quién, cuándo y desde qué enlace. Es firma electrónica simple. */
export type Firma = { lado: "influencer" | "marca"; nombre: string; el: string }

export type Contrato = {
  id: string
  collabId: string
  titulo: string
  /** El contrato con sus variables ({{collab.importe}}), en HTML del editor. */
  texto: string
  plantillaId?: string
  estado: EstadoContrato
  /** Enlace para que la marca lo lea y lo firme, sin cuenta. */
  enlace?: { token: string; caduca: string }
  firmas: Firma[]
  /** Si se firma el contrato de la marca en vez del suyo: su PDF. */
  externo?: { nombre: string; tamano: number }
  actualizadoEl: string
}

export type PlantillaContrato = { id: string; nombre: string; descripcion: string; texto: string; actualizadaEl: string }

/** Una cláusula tipo para insertar en cualquier contrato (HTML con variables). */
export type Clausula = { id: string; titulo: string; texto: string }

// ───────────────────────── Resultados ─────────────────────────

export type Metrica = "visualizaciones" | "alcance" | "meGusta" | "comentarios" | "guardados" | "compartidos" | "clics" | "ventas"

export const METRICAS: Record<Metrica, string> = {
  visualizaciones: "Visualizaciones",
  alcance: "Alcance",
  meGusta: "Me gusta",
  comentarios: "Comentarios",
  guardados: "Guardados",
  compartidos: "Compartidos",
  clics: "Clics en el enlace",
  ventas: "Usos del código",
}

export const LISTA_METRICAS = Object.keys(METRICAS) as Metrica[]

/** Lo que dio una pieza publicada: sus cifras a mano y las capturas de sus estadísticas. */
export type Resultado = {
  id: string
  piezaId: string
  medidoEl: string
  metricas: Partial<Record<Metrica, number>>
  capturas: { id: string; nombre: string; url: string }[]
  nota?: string
}

/** El informe de resultados de la collab: lo que se manda a la marca por enlace. */
export type Informe = {
  collabId: string
  resultados: Resultado[]
  /** Lo que ella cuenta: qué funcionó y qué haría distinto. */
  conclusiones: string
  enlace?: { token: string; caduca: string }
  enviadoEl?: string
}

// ───────────────────────── Formularios para la marca ─────────────────────────

/** Qué se le pide a la marca: el brief entero (con piezas, materiales y facturación) o solo los materiales. */
export type AlcanceFormulario = "brief" | "materiales"

export type FormularioMarca = {
  id: string
  /** Enlace sin cuenta, imposible de adivinar y con caducidad. */
  token: string
  collabId: string
  alcance: AlcanceFormulario
  para: { nombre: string; email: string }
  mensaje?: string
  creadoEl: string
  caduca: string
  respondidoEl?: string
}

// ───────────────────────── Plantillas de guion ─────────────────────────

export type PlantillaGuion = { id: string; nombre: string; descripcion: string; texto: string }

// ───────────────────────── Tareas ─────────────────────────

/** A qué pertenece una tarea: una collab, una propuesta o una marca a la que quiere escribir. */
export type RelacionTarea = { tipo: "collab" | "propuesta" | "marca"; id: string }

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
  /** A dónde le escriben las marcas. */
  email: string
}

// ───────────────────────── Plantillas ─────────────────────────

export type CanalPlantilla = "email" | "dm" | "whatsapp"

export const CANALES_PLANTILLA: Record<CanalPlantilla, string> = {
  email: "Email",
  dm: "Mensaje directo",
  whatsapp: "WhatsApp",
}

/** Para qué momento del trato es: ordena el directorio y sugiere la plantilla en cada sitio. */
export type UsoPlantilla = "primer-contacto" | "tarifas" | "propuesta" | "seguimiento" | "negociacion" | "cierre" | "agradecimiento"

export const USOS_PLANTILLA: Record<UsoPlantilla, string> = {
  "primer-contacto": "Primer contacto",
  tarifas: "Tarifas y media kit",
  propuesta: "Enviar propuesta",
  seguimiento: "Seguimiento",
  negociacion: "Negociación",
  cierre: "Cierre",
  agradecimiento: "Agradecimiento",
}

export type Plantilla = {
  id: string
  nombre: string
  uso: UsoPlantilla
  canal: CanalPlantilla
  /** Solo en los emails. */
  asunto?: string
  /** Texto con variables entre llaves dobles: «Hola {{contacto.nombre}}». */
  cuerpo: string
  favorita: boolean
  /** Veces que se ha copiado o enviado. */
  usos: number
  ultimoUso?: string
  creadaEl: string
  actualizadaEl: string
}

// ───────────────────────── Media kit ─────────────────────────

/** Las partes del media kit: se ordenan arrastrando y cada una se enseña o se esconde. */
export type BloqueMediaKit = "portada" | "cifras" | "redes" | "audiencia" | "destacados" | "marcas" | "tarifas" | "contacto"

export const BLOQUES_MEDIA_KIT: Record<BloqueMediaKit, { label: string; descripcion: string }> = {
  portada: { label: "Portada", descripcion: "Foto, nombre, titular y bio" },
  cifras: { label: "Cifras clave", descripcion: "Seguidores, visualizaciones, interacción y España" },
  redes: { label: "Mis redes", descripcion: "Cada cuenta con sus números" },
  audiencia: { label: "Audiencia", descripcion: "Género, edades y países" },
  destacados: { label: "Contenidos destacados", descripcion: "Tus tres mejores publicaciones" },
  marcas: { label: "Marcas con las que he trabajado", descripcion: "Salen solas de tus collabs" },
  tarifas: { label: "Tarifas", descripcion: "Precio de salida por formato" },
  contacto: { label: "Contacto", descripcion: "Cómo escribirte" },
}

export type Destacado = {
  id: string
  titulo: string
  red: SocialNetwork
  url: string
  imagenUrl: string
  visualizaciones: number
  /** La marca, si fue una collab. */
  marca?: string
}

export type MediaKit = {
  bloques: { id: BloqueMediaKit; visible: boolean }[]
  /** La frase de la portada: qué haces y para quién. */
  titular: string
  bio: string
  destacados: Destacado[]
  actualizadoEl: string
}
