// El calendario de una base: las semanas de un mes (de lunes a domingo, con los días del mes de
// antes y de después para completarlas), pasar de mes y su nombre. Puro, con días ISO (AAAA-MM-DD).

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

const formatoMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })

/** «octubre de 2026». */
export const nombreMes = (mes: Mes) => formatoMes.format(new Date(`${mes}-01T12:00:00Z`))

export const DIAS_SEMANA = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
