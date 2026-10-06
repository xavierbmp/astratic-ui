// El CRM de la influencer: cuánto vale cada propuesta, qué pide atención, las cifras del pipeline
// y cómo va la relación con cada marca. Sin React: las vistas llaman aquí.
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"
import { ESTADOS_ABIERTOS, type Collab, type Contacto, type EstadoPropuesta, type Interaccion, type Marca, type Propuesta, type RelacionMarca, type Tarifa } from "@/lib/influencer/modelo"
import { calcularPresupuesto, minimoDe } from "@/lib/influencer/presupuesto"
import { diasEntre, soloFecha, sumarDias } from "@/lib/influencer/fechas"

/** Días sin noticias de la marca tras enviar la propuesta para darla por fría. */
export const DIAS_SIN_RESPUESTA = 7
/** Días antes de que caduque la atribución de una marca propia para avisar. */
export const DIAS_AVISO_ATRIBUCION = 60

export const esAbierta = (p: Propuesta) => ESTADOS_ABIERTOS.includes(p.estado)

/** Lo que vale la propuesta: lo presupuestado si lo hay; si no, lo que ofrece la marca. */
export function importeDe(p: Propuesta, tarifas: Tarifa[]) {
  if (p.presupuesto) return calcularPresupuesto(p.presupuesto, tarifas).total
  return p.ofrecen ?? 0
}

/** Lo que ofrece la marca o lo presupuestado queda por debajo del mínimo pactado con Astratic. */
export function bajoMinimo(p: Propuesta, tarifas: Tarifa[]) {
  const minimo = minimoDe(p.piezas, tarifas)
  if (p.presupuesto) return calcularPresupuesto(p.presupuesto, tarifas).bajoMinimo
  return p.ofrecen !== undefined && p.ofrecen > 0 && p.ofrecen < minimo
}

/** La fase siguiente del tablero; de «Negociando» se pasa a ganada. */
export function siguienteEstado(estado: EstadoPropuesta): EstadoPropuesta | null {
  const i = ESTADOS_ABIERTOS.indexOf(estado)
  if (i === -1) return null
  return ESTADOS_ABIERTOS[i + 1] ?? "ganada"
}

export function diasSinRespuesta(p: Propuesta, hoy: string) {
  return diasEntre(soloFecha(p.ultimoContacto), soloFecha(hoy))
}

export type Recordatorio = { label: string; tone: StatusTone }

/** Lo que pide atención de una propuesta abierta: el paso vencido o de hoy, o que la marca no contesta. */
export function recordatorioDe(p: Propuesta, hoy: string): Recordatorio | null {
  if (!esAbierta(p)) return null
  const paso = p.siguientePaso ?? "Siguiente paso"
  if (p.siguienteFecha) {
    const dias = diasEntre(soloFecha(hoy), p.siguienteFecha)
    if (dias < 0) return { label: `${paso} · venció el ${fmt.date(p.siguienteFecha)}`, tone: "danger" }
    if (dias === 0) return { label: `${paso} · hoy`, tone: "warning" }
  }
  const sinRespuesta = diasSinRespuesta(p, hoy)
  if (p.estado === "enviada" && sinRespuesta > DIAS_SIN_RESPUESTA) return { label: `Sin respuesta desde hace ${sinRespuesta} días`, tone: "warning" }
  if (!p.siguientePaso) return { label: "Sin siguiente paso", tone: "neutral" }
  return { label: p.siguienteFecha ? `${paso} · ${fmt.date(p.siguienteFecha)}` : paso, tone: "neutral" }
}

/** Las cuatro cifras de arriba del pipeline. */
export function cifrasPipeline(propuestas: Propuesta[], tarifas: Tarifa[], hoy: string) {
  const hoyFecha = soloFecha(hoy)
  const abiertas = propuestas.filter(esAbierta)
  const hace30 = sumarDias(hoyFecha, -30)
  const ganadas = propuestas.filter((p) => p.estado === "ganada")
  const perdidas = propuestas.filter((p) => p.estado === "perdida")
  const ganadas30 = ganadas.filter((p) => soloFecha(p.ultimoContacto) >= hace30)
  const pasos = abiertas.filter((p) => p.siguienteFecha && p.siguienteFecha <= hoyFecha)
  return {
    abiertas: abiertas.length,
    valorAbierto: abiertas.reduce((a, p) => a + importeDe(p, tarifas), 0),
    ganado30: ganadas30.reduce((a, p) => a + importeDe(p, tarifas), 0),
    ganadas30: ganadas30.length,
    tasaCierre: ganadas.length + perdidas.length ? Math.round((ganadas.length / (ganadas.length + perdidas.length)) * 100) : 0,
    pasosHoy: pasos.length,
    pasosVencidos: pasos.filter((p) => (p.siguienteFecha ?? "") < hoyFecha).length,
    sinRespuesta: abiertas.filter((p) => p.estado === "enviada" && diasSinRespuesta(p, hoy) > DIAS_SIN_RESPUESTA).length,
  }
}

export type ResumenMarca = {
  relacion: RelacionMarca
  propuestasAbiertas: number
  valorAbierto: number
  collabs: number
  /** Suma de las collabs que no se cancelaron. */
  facturado: number
  contactos: number
  principal: Contacto | null
  ultimoContacto?: string
}

export type DatosCrm = {
  propuestas: Propuesta[]
  collabs: Collab[]
  contactos: Contacto[]
  interacciones: Interaccion[]
  tarifas: Tarifa[]
}

/** Cómo va una marca, calculado de sus propuestas, collabs, contactos y seguimiento. */
export function resumenMarca(marca: Marca, datos: DatosCrm): ResumenMarca {
  const propuestas = datos.propuestas.filter((p) => p.marcaId === marca.id)
  const abiertas = propuestas.filter(esAbierta)
  const collabs = datos.collabs.filter((c) => c.marcaId === marca.id && c.estado !== "cancelada")
  const contactos = datos.contactos.filter((c) => c.marcaId === marca.id)
  const fechas = [...datos.interacciones.filter((i) => i.marcaId === marca.id).map((i) => i.el), ...propuestas.map((p) => p.ultimoContacto)].sort()
  const relacion: RelacionMarca = collabs.length ? "cliente" : abiertas.length ? "en-conversacion" : propuestas.length ? "perdida" : "sin-propuestas"
  return {
    relacion,
    propuestasAbiertas: abiertas.length,
    valorAbierto: abiertas.reduce((a, p) => a + importeDe(p, datos.tarifas), 0),
    collabs: collabs.length,
    facturado: collabs.reduce((a, c) => a + c.importe, 0),
    contactos: contactos.length,
    principal: contactos.find((c) => c.principal) ?? contactos[0] ?? null,
    ultimoContacto: fechas.at(-1),
  }
}

export function resumenesDeMarcas(marcas: Marca[], datos: DatosCrm) {
  return new Map(marcas.map((m) => [m.id, resumenMarca(m, datos)]))
}

/** Días que le quedan como marca suya; `null` si es de la red o no tiene fecha. */
export function diasDeAtribucion(marca: Marca, hoy: string) {
  if (marca.atribucion !== "propia" || !marca.atribucionHasta) return null
  return diasEntre(soloFecha(hoy), marca.atribucionHasta)
}

export function textoAtribucion(marca: Marca) {
  if (marca.atribucion === "red") return "Marca de la red"
  return marca.atribucionHasta ? `Tuya hasta el ${fmt.date(marca.atribucionHasta)}` : "Tuya durante 12 meses"
}

/** El último email, mensaje o llamada con esa persona. */
export function ultimoContactoDe(contactoId: string, interacciones: Interaccion[]) {
  return interacciones.filter((i) => i.contactoId === contactoId).map((i) => i.el).sort().at(-1)
}

/** El contacto de una propuesta: el elegido o, si no, el principal de la marca. */
export function contactoDePropuesta(p: Propuesta, contactos: Contacto[]) {
  const deLaMarca = contactos.filter((c) => c.marcaId === p.marcaId)
  return deLaMarca.find((c) => c.id === p.contactoId) ?? deLaMarca.find((c) => c.principal) ?? deLaMarca[0] ?? null
}

/** «Clara Benet» → «Clara», para los saludos. */
export function nombreDePila(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? nombre
}
