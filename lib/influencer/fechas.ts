// Fechas del workspace: todo se compara por día (AAAA-MM-DD), sin horas ni zonas.

import { lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"

// Las de comparar por día son las mismas que usan filtros y vistas: viven en `lib/filtros/fechas`.
export { diasEntre, lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"

/** Las 42 casillas (6 semanas, de lunes a domingo) del mes al que pertenece la fecha. */
export function casillasDelMes(fecha: string) {
  const primero = `${fecha.slice(0, 7)}-01`
  const inicio = lunesDe(primero)
  return Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i))
}

export function mismoMes(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function sumarMeses(fecha: string, meses: number) {
  const d = new Date(`${fecha.slice(0, 7)}-01T12:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

const mesLargo = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" })

/** «octubre de 2026». */
export function nombreMes(fecha: string) {
  return mesLargo.format(new Date(`${fecha.slice(0, 7)}-01T12:00:00`))
}

const diaSemana = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" })

/** «martes, 6 de octubre». */
export function diaLargo(fecha: string) {
  return diaSemana.format(new Date(`${soloFecha(fecha)}T12:00:00`))
}
