// Contratos: las variables que rellena el portal con los datos de la collab, su valor para una collab
// concreta y la revisión de las cláusulas que más vigilan las creadoras. Sin React: el editor las usa.
import type { Collab, DatosFiscales, Marca, Perfil } from "@/lib/influencer/modelo"
import type { StatusTone } from "@/lib/status"
import { fmt } from "@/lib/format"
import { describirEntregables } from "@/lib/influencer/collabs"
import { diasDePago } from "@/lib/influencer/facturacion"

export type GrupoVariable = "Marca" | "Influencer" | "Collab" | "Condiciones"

export type VariableContrato = { clave: string; label: string; grupo: GrupoVariable }

/** Las variables que se pueden poner en un contrato o una plantilla: `{{marca.nombre}}`. */
export const VARIABLES_CONTRATO: VariableContrato[] = [
  { clave: "marca.nombre", label: "Nombre de la marca", grupo: "Marca" },
  { clave: "marca.razon_social", label: "Razón social", grupo: "Marca" },
  { clave: "marca.nif", label: "NIF de la marca", grupo: "Marca" },
  { clave: "marca.direccion", label: "Dirección de la marca", grupo: "Marca" },
  { clave: "marca.contacto", label: "Persona de contacto", grupo: "Marca" },
  { clave: "influencer.nombre", label: "Tu nombre o razón social", grupo: "Influencer" },
  { clave: "influencer.nif", label: "Tu NIF", grupo: "Influencer" },
  { clave: "influencer.direccion", label: "Tu dirección", grupo: "Influencer" },
  { clave: "influencer.cuenta", label: "Tu cuenta (@)", grupo: "Influencer" },
  { clave: "collab.campana", label: "Campaña", grupo: "Collab" },
  { clave: "collab.entregables", label: "Entregables", grupo: "Collab" },
  { clave: "collab.desde", label: "Publicación desde", grupo: "Collab" },
  { clave: "collab.hasta", label: "Publicación hasta", grupo: "Collab" },
  { clave: "collab.importe", label: "Importe", grupo: "Condiciones" },
  { clave: "collab.pago", label: "Condiciones de pago", grupo: "Condiciones" },
  { clave: "brief.rondas", label: "Rondas de cambios", grupo: "Condiciones" },
  { clave: "brief.exclusividad", label: "Exclusividad", grupo: "Condiciones" },
  { clave: "brief.derechos", label: "Derechos de uso", grupo: "Condiciones" },
  { clave: "hoy", label: "Fecha de hoy", grupo: "Collab" },
]

export const GRUPOS_VARIABLE: GrupoVariable[] = ["Marca", "Influencer", "Collab", "Condiciones"]

export function variableDe(clave: string) {
  return VARIABLES_CONTRATO.find((v) => v.clave === clave)
}

/** El valor de cada variable para esta collab; sin dato, la variable no aparece (se pide rellenarlo). */
export function valoresDeContrato({ collab, marca, perfil, fiscales, hoy }: { collab: Collab; marca: Marca; perfil: Perfil; fiscales: DatosFiscales; hoy: string }): Record<string, string | undefined> {
  const { brief, facturacion } = collab
  return {
    "marca.nombre": marca.nombre,
    "marca.razon_social": facturacion?.razonSocial,
    "marca.nif": facturacion?.nif,
    "marca.direccion": facturacion?.direccion,
    "marca.contacto": brief.contacto.nombre || undefined,
    "influencer.nombre": fiscales.nombre,
    "influencer.nif": fiscales.nif,
    "influencer.direccion": fiscales.direccion,
    "influencer.cuenta": perfil.handle,
    "collab.campana": collab.campana,
    "collab.entregables": describirEntregables(collab),
    "collab.desde": fmt.dateLong(collab.desde),
    "collab.hasta": fmt.dateLong(collab.hasta),
    "collab.importe": `${fmt.eur(collab.importe)} más IVA`,
    "collab.pago": brief.condicionesPago || undefined,
    "brief.rondas": brief.rondasIncluidas > 0 ? `${brief.rondasIncluidas} ${brief.rondasIncluidas === 1 ? "ronda" : "rondas"} de cambios por pieza` : undefined,
    "brief.exclusividad": brief.exclusividad,
    "brief.derechos": brief.derechosUso,
    hoy: fmt.dateLong(hoy),
  }
}

const PATRON_VARIABLE = /data-variable="([a-z_.]+)"/g

/** Las variables que usa un contrato (HTML del editor), sin repetir. */
export function variablesDelTexto(html: string) {
  return Array.from(new Set(Array.from(html.matchAll(PATRON_VARIABLE), (m) => m[1])))
}

export type Aviso = { id: string; titulo: string; detalle: string; tone: StatusTone }

/** Lo que hay que mirar en un contrato que manda la marca antes de firmarlo. */
export const CLAUSULAS_A_VIGILAR = [
  { id: "rondas", titulo: "Rondas de cambios limitadas", detalle: "Un número por pieza; las demás, aparte." },
  { id: "derechos", titulo: "Derechos de uso con plazo y canales", detalle: "Nada de «a perpetuidad» ni «en todos los medios»." },
  { id: "paid", titulo: "Uso en anuncios pagado aparte", detalle: "Paid o whitelisting, solo con acuerdo y precio." },
  { id: "exclusividad", titulo: "Exclusividad corta o pagada", detalle: "Categoría concreta y meses contados." },
  { id: "pago", titulo: "Pago a 60 días o menos", detalle: "Es el máximo de la ley de morosidad." },
  { id: "cancelacion", titulo: "Cancelación con pago de lo hecho", detalle: "Si cancelan tarde, se cobra lo trabajado." },
  { id: "publicidad", titulo: "Contenido marcado como publicidad", detalle: "Obligatorio con el Código de Autocontrol." },
] as const

/** «Skincare · 3 meses» → 3; «1 año» → 12. Sin plazo, `null`. */
export function mesesDe(texto?: string) {
  if (!texto) return null
  const meses = texto.match(/(\d+)\s*mes/i)
  if (meses) return Number(meses[1])
  const anos = texto.match(/(\d+)\s*a[ñn]o/i)
  return anos ? Number(anos[1]) * 12 : null
}

/** Meses de exclusividad a partir de los cuales conviene cobrarla aparte o recortarla. */
const EXCLUSIVIDAD_LARGA = 3
/** Días de pago a partir de los cuales el plazo es abusivo (la ley de morosidad fija 60). */
const PAGO_LARGO = 60

/**
 * Las cláusulas que más vigilan las herramientas para creadoras (rondas ilimitadas, derechos sin
 * plazo, exclusividad larga, pago a más de 60 días), los datos que faltan y la publicidad marcada.
 */
export function revisarContrato({ collab, texto, valores }: { collab: Collab; texto: string; valores: Record<string, string | undefined> }): Aviso[] {
  const avisos: Aviso[] = []
  const plano = texto.toLowerCase()
  const faltan = variablesDelTexto(texto).filter((clave) => !valores[clave])
  if (faltan.length > 0) {
    avisos.push({ id: "faltan", titulo: `Faltan ${faltan.length} ${faltan.length === 1 ? "dato" : "datos"}`, detalle: faltan.map((c) => variableDe(c)?.label ?? c).join(", "), tone: "warning" })
  }
  if (/ilimitad|sin l[ií]mite de (rondas|cambios)/.test(plano) || collab.brief.rondasIncluidas === 0) {
    avisos.push({ id: "rondas", titulo: "Rondas de cambios sin límite", detalle: "Pon un número de rondas por pieza; las demás se cobran aparte.", tone: "danger" })
  }
  const derechos = collab.brief.derechosUso
  if (/perpetu|indefinid|a perpetuidad/.test(plano) || (derechos && mesesDe(derechos) === null)) {
    avisos.push({ id: "derechos", titulo: "Derechos de uso sin plazo", detalle: "La cesión debe tener meses y canales concretos.", tone: "danger" })
  }
  const exclusividad = mesesDe(collab.brief.exclusividad)
  if (exclusividad !== null && exclusividad > EXCLUSIVIDAD_LARGA) {
    avisos.push({ id: "exclusividad", titulo: `Exclusividad de ${exclusividad} meses`, detalle: `Más de ${EXCLUSIVIDAD_LARGA} meses debería pagarse aparte.`, tone: "warning" })
  }
  if (diasDePago(collab.brief.condicionesPago) > PAGO_LARGO) {
    avisos.push({ id: "pago", titulo: `Pago a más de ${PAGO_LARGO} días`, detalle: "La ley de morosidad fija un máximo de 60 días.", tone: "danger" })
  }
  if (!/publicidad|#publi/.test(plano)) {
    avisos.push({ id: "publicidad", titulo: "Sin cláusula de publicidad", detalle: "Añade que el contenido irá marcado como publicidad (Código de Autocontrol).", tone: "info" })
  }
  return avisos
}
