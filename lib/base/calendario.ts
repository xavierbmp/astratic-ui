// Los calendarios del kit (el de la base, la agenda, el calendario de un periodo y el Gantt): las
// semanas de un mes (de lunes a domingo, con los días del mes de antes y de después para
// completarlas), pasar de mes o de semana, los nombres y el rango de un cronograma. Puro, con días
// ISO (AAAA-MM-DD).
import { diasEntre, lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"

/** Un mes como «2026-10». */
export type Mes = string

const DIA_MS = 86_400_000

const aDia = (d: Date) => d.toISOString().slice(0, 10)
const deMes = (mes: Mes) => {
  const [a, m] = mes.split("-").map(Number)
  return { a, m }
}

/** El mes de un día: «2026-10-13» → «2026-10». */
export const mesDe = (dia: string): Mes => dia.slice(0, 7)

/** El mes `n` meses antes o después. */
export function sumarMeses(mes: Mes, n: number): Mes {
  const { a, m } = deMes(mes)
  return aDia(new Date(Date.UTC(a, m - 1 + n, 1))).slice(0, 7)
}

/** Las semanas que pinta el mes, de lunes a domingo: cuatro, cinco o seis. */
export function semanasDelMes(mes: Mes): string[][] {
  const { a, m } = deMes(mes)
  const primero = new Date(Date.UTC(a, m - 1, 1))
  const ultimo = new Date(Date.UTC(a, m, 0))
  // Lunes = 0 … domingo = 6.
  const desde = primero.getTime() - ((primero.getUTCDay() + 6) % 7) * DIA_MS
  const hasta = ultimo.getTime() + (6 - ((ultimo.getUTCDay() + 6) % 7)) * DIA_MS
  const semanas: string[][] = []
  for (let t = desde; t <= hasta; t += 7 * DIA_MS) semanas.push(Array.from({ length: 7 }, (_, i) => aDia(new Date(t + i * DIA_MS))))
  return semanas
}

/** Las 42 casillas (seis semanas fijas, de lunes a domingo) del mes de un día: el calendario no cambia de alto al pasar de mes. */
export function casillasDelMes(dia: string): string[] {
  const inicio = lunesDe(`${mesDe(dia)}-01`)
  return Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i))
}

export const mismoMes = (a: string, b: string) => mesDe(a) === mesDe(b)

const formatoMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })

/** «octubre de 2026», de un mes o de cualquier día suyo. */
export const nombreMes = (mesODia: string) => formatoMes.format(new Date(`${mesDe(mesODia)}-01T12:00:00Z`))

const formatoDia = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })

/** «martes, 6 de octubre». */
export const diaLargo = (dia: string) => formatoDia.format(new Date(`${soloFecha(dia)}T12:00:00Z`))

export const DIAS_SEMANA = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]

/** La inicial de cada día, para las cabeceras estrechas. */
export const INICIALES_SEMANA = ["L", "M", "X", "J", "V", "S", "D"]

export type ModoPeriodo = "mes" | "semana"

/** Los días que enseña un calendario (las seis semanas del mes o los siete de la semana), con su título. */
export function periodoCalendario(ancla: string, modo: ModoPeriodo) {
  const dias = modo === "mes" ? casillasDelMes(ancla) : Array.from({ length: 7 }, (_, i) => sumarDias(lunesDe(ancla), i))
  const titulo = modo === "mes" ? nombreMes(ancla) : `Semana del ${diaLargo(lunesDe(ancla)).replace(/^lunes, /, "")}`
  return { dias, titulo, desde: dias[0], hasta: dias[dias.length - 1] }
}

/** Un día del mes o la semana `n` periodos más allá (o más acá, con `n` negativo). Al cambiar de mes, su día 1. */
export function moverPeriodo(ancla: string, modo: ModoPeriodo, n: number) {
  return modo === "mes" ? `${sumarMeses(mesDe(ancla), n)}-01` : sumarDias(ancla, 7 * n)
}

/** De qué día a qué día se pinta un cronograma: todas las fechas con un margen, y siempre con hoy dentro. */
export function rangoDeFechas(fechas: string[], hoy: string, margen = 3) {
  const todas = [...fechas, hoy].sort()
  const desde = sumarDias(todas[0], -margen)
  const hasta = sumarDias(todas[todas.length - 1], margen)
  return { desde, hasta, dias: diasEntre(desde, hasta) + 1 }
}
