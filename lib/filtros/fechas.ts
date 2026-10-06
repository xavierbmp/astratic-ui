// Fechas por día (AAAA-MM-DD) para filtrar y agrupar: «hoy», «esta semana», «los próximos 7 días».
// Sin horas ni zonas: dos días se comparan como texto. La semana va de lunes a domingo, como en España.

/** «2026-10-06T11:30:00» → «2026-10-06». */
export function soloFecha(iso: string) {
  return iso.slice(0, 10)
}

export function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${soloFecha(fecha)}T12:00:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** Días de `a` a `b` (positivo si `b` es después). */
export function diasEntre(a: string, b: string) {
  const ms = new Date(`${soloFecha(b)}T12:00:00`).getTime() - new Date(`${soloFecha(a)}T12:00:00`).getTime()
  return Math.round(ms / 86_400_000)
}

/** Lunes de la semana de una fecha. */
export function lunesDe(fecha: string) {
  const d = new Date(`${soloFecha(fecha)}T12:00:00`)
  const desplazamiento = (d.getDay() + 6) % 7
  return sumarDias(fecha, -desplazamiento)
}

/** Domingo de la semana de una fecha. */
export function domingoDe(fecha: string) {
  return sumarDias(lunesDe(fecha), 6)
}

/** Día de la semana: 0 domingo … 6 sábado. */
export function diaDeLaSemana(fecha: string) {
  return new Date(`${soloFecha(fecha)}T12:00:00`).getDay()
}

/** Tramos en los que cae un día respecto a hoy, sin solaparse: lo que sale en «Hoy» no sale en «Esta semana». */
export type TramoFecha = "pasado" | "hoy" | "manana" | "semana" | "proxima" | "despues"

export const TRAMOS_FECHA: { id: TramoFecha; label: string }[] = [
  { id: "pasado", label: "Antes" },
  { id: "hoy", label: "Hoy" },
  { id: "manana", label: "Mañana" },
  { id: "semana", label: "Esta semana" },
  { id: "proxima", label: "Semana que viene" },
  { id: "despues", label: "Más adelante" },
]

export function tramoDeFecha(dia: string, hoy: string): TramoFecha {
  const d = soloFecha(dia)
  const h = soloFecha(hoy)
  if (d < h) return "pasado"
  if (d === h) return "hoy"
  if (d === sumarDias(h, 1)) return "manana"
  const domingo = domingoDe(h)
  if (d <= domingo) return "semana"
  if (d <= sumarDias(domingo, 7)) return "proxima"
  return "despues"
}

/** Días entre dos fechas incluidas, de la primera a la última. */
export function estaEntre(dia: string, desde: string, hasta: string) {
  const d = soloFecha(dia)
  return d >= soloFecha(desde) && d <= soloFecha(hasta)
}

/** Hoy en la zona del navegador o del servidor, solo para cuando la página no pasa su `hoy`. */
export function hoyLocal() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mes}-${dia}`
}
