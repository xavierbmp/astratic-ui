// El alta de una collab a mano: de lo que se ha rellenado (nada es obligatorio) sale la collab con
// sus piezas, el enlace para la marca si se le pide algo y el brief adjunto en sus materiales. Lo que
// falta se completa con su valor de serie.
import { CONDICIONES_POR_DEFECTO, LISTA_FORMATOS, type AjustesCollabs, type BorradorCollab, type Formato, type OrigenPropuesta, type PiezaPedida, type CampoBrief, type Collab, type Condicion, type Contacto, type ExtraId, type FormularioMarca, type Marca, type Material, type Propuesta } from "@/lib/influencer/modelo"
import { caducidad, piezaDeFormulario, tokenNuevo, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { camposEnOrden, condicionDeTipo, fechasDeLasPiezas, nombreDePieza, piezaDeFormato } from "@/lib/influencer/ajustes-collabs"
import { calcularPresupuesto } from "@/lib/influencer/presupuesto"
import { tipoDeArchivo } from "@/lib/influencer/materiales"
import { textoAHtml } from "@/lib/influencer/guion"
import { soloFecha } from "@/lib/influencer/fechas"
import { idNuevo } from "@/lib/influencer/tareas"

/** Un archivo ya subido desde el alta (su enlace firmado para verlo). */
export type ArchivoAdjunto = { nombre: string; tamano: number; tipo: string; url: string }

export type ValoresAlta = {
  modo: "yo" | "marca"
  campana: string
  /** Dónde se publica la campaña. */
  plataformas: string[]
  /** El brief escrito tal cual (texto plano). */
  brief: string
  /** El brief en un archivo (un PDF): pasa a los materiales. */
  briefAdjunto: ArchivoAdjunto | null
  coverUrl: string
  /** NaN si se dejó vacío. */
  importe: number
  desde: string
  hasta: string
  piezas: PiezaPedidaForm[]
  condiciones: Condicion[]
  para: { nombre: string; email: string }
  campos: CampoBrief[]
  mensaje: string
  /** Rondas de cambios incluidas; sin ellas, las de serie. */
  rondas?: number
  /** Cuándo y cómo se cobra; sin él, el de serie. */
  pago?: string
}

export type Alta = { collab: Collab; formulario?: FormularioMarca; materiales: Material[] }

/** El nombre de la campaña si se dejó vacío. */
export const campanaPorDefecto = (marca: Marca) => `Collab con ${marca.nombre}`

type CampoPedido = Exclude<CampoBrief, "contacto">

/** Cómo se pide cada apartado: solo (con su detalle) o dentro de una lista. Sus datos no se nombran: los deja al rellenarlo. */
const PEDIDO_EN_MENSAJE: Record<CampoPedido, { solo: string; enLista: string }> = {
  campana: { solo: "aquí puedes contarme la campaña y lo que buscáis con ella.", enLista: "la campaña y lo que buscáis con ella" },
  fechas: { solo: "¿me dices aquí las fechas en las que se publica?", enLista: "las fechas" },
  piezas: { solo: "¿me cuentas aquí qué contenidos queréis, con su formato y su día?", enLista: "los contenidos que queréis" },
  materiales: { solo: "¿me subes aquí los materiales de la campaña (logos, fotos del producto, guía de claims)?", enLista: "los materiales" },
  publicar: { solo: "¿me dejas aquí lo que hay que poner al publicar (menciones, hashtags, enlace o código)?", enLista: "lo que hay que poner al publicar" },
  facturacion: { solo: "¿me dejas aquí los datos para la factura (razón social, NIF, dirección y email)?", enLista: "los datos para la factura" },
}

/** «a», «a y b», «a, b y c». */
const enumerar = (partes: string[]) => (partes.length < 2 ? partes.join("") : `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`)

/**
 * El mensaje de serie para la marca, según lo que se le pide: un apartado solo, con su detalle; varios,
 * en el orden del formulario. Sin nada más que sus datos, que los deje.
 */
export function mensajeParaLaMarca(nombre: string, campos: CampoBrief[]) {
  const hola = `Hola${nombre ? ` ${nombre.split(" ")[0]}` : ""}`
  const pedidos = camposEnOrden(campos).filter((c): c is CampoPedido => c !== "contacto")
  if (pedidos.length === 0) return `${hola}: ¿me dejas aquí tus datos de contacto? Así lo tengo todo en un sitio.`
  if (pedidos.length === 1) return `${hola}: ${PEDIDO_EN_MENSAJE[pedidos[0]].solo}`
  return `${hola}: te dejo aquí un formulario para que me pases ${enumerar(pedidos.map((c) => PEDIDO_EN_MENSAJE[c].enLista))}. Así lo tengo todo en un sitio.`
}

/**
 * La collab, su enlace para la marca (si se le pide el brief) y sus materiales (el brief en archivo). Sin campaña, «Collab con …»; sin fechas, de hoy a su última publicación; sin
 * importe, 0; sin apartados para la marca, sus datos.
 */
export function collabDeAlta(v: ValoresAlta, { marca, principal, hoy }: { marca: Marca; principal?: Contacto; hoy: string }): Alta {
  const id = idNuevo("c")
  const piezas = v.modo === "yo" ? v.piezas : []
  const ultima = piezas.map((p) => p.publicacion).filter(Boolean).sort().at(-1)
  const desde = v.desde || soloFecha(hoy)
  const hasta = v.hasta || (ultima && ultima > desde ? ultima : desde)
  const contacto = v.modo === "marca" ? v.para : { nombre: principal?.nombre ?? "", email: principal?.email ?? "" }
  const collab: Collab = {
    id,
    marcaId: marca.id,
    campana: v.campana.trim() || campanaPorDefecto(marca),
    tipo: "directa",
    estado: "por-empezar",
    importe: Number.isFinite(v.importe) && v.importe > 0 ? v.importe : 0,
    tint: marca.tint,
    coverUrl: v.coverUrl || undefined,
    desde,
    hasta,
    brief: {
      texto: v.brief.trim() ? textoAHtml(v.brief) : "",
      menciones: [],
      hashtags: [],
      rondasIncluidas: v.rondas ?? CONDICIONES_POR_DEFECTO.rondas,
      contacto,
      condiciones: v.condiciones.length ? v.condiciones : undefined,
      plataformas: v.plataformas.length ? v.plataformas : undefined,
      condicionesPago: v.pago?.trim() || CONDICIONES_POR_DEFECTO.pago,
    },
    piezas: piezas.map((p) => piezaDeFormulario(p, id, hasta)),
    cobro: { estado: "por-facturar" },
    plazos: [{ id: idNuevo("pl"), concepto: "A 30 días tras publicar", porcentaje: 100 }],
    creadaEl: hoy,
  }
  const formulario: FormularioMarca | undefined =
    v.modo === "marca" ? { id: idNuevo("fm"), token: tokenNuevo("fm"), collabId: id, campos: camposEnOrden(v.campos.length ? v.campos : ["contacto"]), para: v.para, mensaje: v.mensaje.trim() || undefined, creadoEl: hoy, caduca: caducidad(hoy) } : undefined
  const material = (a: ArchivoAdjunto, descripcion?: string): Material => ({ id: idNuevo("m"), collabId: id, nombre: a.nombre, tipo: tipoDeArchivo(a.tipo), origen: "mia", tamano: a.tamano, url: a.url, previewUrl: a.tipo.startsWith("image/") ? a.url : undefined, subidoEl: hoy, descripcion })
  const materiales = v.briefAdjunto ? [material(v.briefAdjunto, "El brief de la campaña")] : []
  return { collab, formulario, materiales }
}

/** Los extras de un presupuesto que son condiciones de la collab (la urgencia no lo es). */
const CONDICION_DE_EXTRA: Partial<Record<ExtraId, string>> = { derechos: "derechos", exclusividad: "exclusividad", paid: "paid" }

/**
 * Lo que se rellena en el alta de una collab al partir de una propuesta (Xavier, 2026-10-15: «que el
 * paso sea fácil»): la campaña, las fechas que pide la marca, un entregable por cada pieza pedida (con
 * su formato, su plataforma, su guion y su precio del presupuesto), el importe del presupuesto (o lo
 * que ofrece la marca), sus condiciones (los extras pactados) y sus rondas y su pago.
 */
export function valoresAltaDePropuesta(p: Propuesta, ajustes: AjustesCollabs, hoy: string): ValoresAlta {
  if (p.borrador) return valoresDeBorrador(p, p.borrador)
  const ctx = { campana: p.campana, diasGuion: ajustes.diasGuion, hoy }
  const lineas = p.presupuesto?.lineas.length ? p.presupuesto.lineas : p.piezas.map((x) => ({ ...x, precio: undefined }))
  const piezas = lineas.flatMap((linea) => {
    const formato = ajustes.formatos.find((f) => f.id === linea.formato)
    if (!formato) return []
    return Array.from({ length: linea.cantidad }, (_, i): PiezaPedidaForm => {
      const pieza = piezaDeFormato(formato, p.hasta ?? "", ctx)
      const titulo = linea.cantidad > 1 ? `${nombreDePieza(formato.nombre, p.campana)} ${i + 1}` : pieza.titulo
      return { ...pieza, titulo, nombreManual: linea.cantidad > 1 || undefined, importe: linea.precio ? String(linea.precio) : undefined }
    })
  })
  const condiciones = (p.presupuesto?.extras ?? []).flatMap((extra) => {
    const tipo = ajustes.condiciones.find((c) => c.id === CONDICION_DE_EXTRA[extra])
    return tipo ? [condicionDeTipo(tipo)] : []
  })
  const total = p.presupuesto ? calcularPresupuesto(p.presupuesto, []).total : (p.ofrecen ?? Number.NaN)
  const fechas = fechasDeLasPiezas(piezas)
  return {
    modo: "yo",
    campana: p.campana,
    plataformas: [...new Set(piezas.flatMap((x) => (x.plataforma ? [x.plataforma] : [])))],
    brief: "",
    briefAdjunto: null,
    coverUrl: "",
    importe: total > 0 ? total : Number.NaN,
    desde: p.desde ?? fechas?.desde ?? "",
    hasta: p.hasta ?? fechas?.hasta ?? "",
    piezas,
    condiciones,
    para: { nombre: "", email: "" },
    campos: [],
    mensaje: "",
    rondas: p.presupuesto?.rondas,
    pago: p.presupuesto?.pago,
  }
}

/** La collab que nace de una propuesta ganada, con lo de la propuesta (`valoresAltaDePropuesta`) y su persona de contacto. */
export function collabDePropuesta(p: Propuesta, { marca, contacto, ajustes, hoy }: { marca: Marca; contacto?: Contacto; ajustes: AjustesCollabs; hoy: string }): Collab {
  return collabDeAlta(valoresAltaDePropuesta(p, ajustes, hoy), { marca, principal: contacto, hoy }).collab
}

/** Lo que se cobra de una propuesta: su presupuesto si lo tiene; si no, lo que ofrece la marca. NaN si no hay nada. */
function importeDePropuesta(p: Propuesta) {
  const total = p.presupuesto ? calcularPresupuesto(p.presupuesto, []).total : (p.ofrecen ?? Number.NaN)
  return total > 0 ? total : Number.NaN
}

/** El alta de una propuesta que se rellenó con el formulario de collab: tal cual, con lo de la propuesta que pudo cambiar después. */
function valoresDeBorrador(p: Propuesta, b: BorradorCollab): ValoresAlta {
  return {
    modo: "yo",
    campana: p.campana,
    plataformas: b.plataformas,
    brief: b.brief,
    briefAdjunto: b.briefAdjunto ?? null,
    coverUrl: b.coverUrl ?? "",
    importe: importeDePropuesta(p),
    desde: p.desde ?? "",
    hasta: p.hasta ?? "",
    piezas: b.piezas,
    condiciones: b.condiciones,
    para: { nombre: "", email: "" },
    campos: [],
    mensaje: "",
    rondas: p.presupuesto?.rondas,
    pago: p.presupuesto?.pago,
  }
}

const esFormato = (id: string | undefined): id is Formato => LISTA_FORMATOS.some((f) => f === id)

/** «1 reel + 3 stories» de los entregables: los de los formatos de siempre, contados (los demás quedan solo en el borrador). */
function piezasPedidasDe(piezas: PiezaPedidaForm[]): PiezaPedida[] {
  const cuenta = new Map<Formato, number>()
  for (const p of piezas) if (esFormato(p.formato)) cuenta.set(p.formato, (cuenta.get(p.formato) ?? 0) + 1)
  return [...cuenta].map(([formato, cantidad]) => ({ formato, cantidad }))
}

/**
 * Una propuesta rellenada con el formulario de collab (Xavier, 2026-10-16): la misma forma de rellenarla siempre; lo que
 * no cabe en la propuesta va en su `borrador` y, al ganarla, la collab nace con todo. Sin campaña, «Campaña de …».
 */
export function propuestaDeAlta(
  v: ValoresAlta,
  { marca, contactoId, origen, hoy, antes }: { marca: Marca; contactoId?: string; origen: OrigenPropuesta; hoy: string; antes?: Propuesta },
): Propuesta {
  const borrador: BorradorCollab = {
    plataformas: v.plataformas,
    brief: v.brief,
    briefAdjunto: v.briefAdjunto ?? undefined,
    coverUrl: v.coverUrl || undefined,
    piezas: v.piezas,
    condiciones: v.condiciones,
  }
  return {
    ...antes,
    id: antes?.id ?? idNuevo("p"),
    marcaId: marca.id,
    contactoId,
    campana: v.campana.trim() || `Campaña de ${marca.nombre}`,
    estado: antes?.estado ?? "nueva",
    origen: antes?.origen ?? origen,
    piezas: piezasPedidasDe(v.piezas),
    ofrecen: Number.isFinite(v.importe) && v.importe > 0 ? v.importe : undefined,
    desde: v.desde || undefined,
    hasta: v.hasta || undefined,
    ultimoContacto: antes?.ultimoContacto ?? hoy,
    creadaEl: antes?.creadaEl ?? hoy,
    borrador,
  }
}
