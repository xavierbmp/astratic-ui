// Cómo se escriben las cifras y las fechas en la ficha de página: «86,4K», «2 sep 2026». Siempre en hora de Madrid, para
// que el servidor y el navegador pinten lo mismo. Puro.

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const partes = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Madrid" })
const miles = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, useGrouping: "always" })

/** 86400 → «86,4K»; 1300000 → «1,30M». */
export function cifraCorta(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(".", ",")}M`
  if (n >= 1000) return `${miles.format(n / 1000)}K`
  return miles.format(n)
}

function leer(d: string | Date) {
  // Un día suelto («2026-10-28») es ese día, no su medianoche en otra zona.
  const fecha = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00Z`) : new Date(d)
  const p = Object.fromEntries(partes.formatToParts(fecha).map((x) => [x.type, x.value]))
  return { dia: Number(p.day), mes: MESES[Number(p.month) - 1], ano: Number(p.year), hora: `${p.hour}:${p.minute}` }
}

/** «2 sep». */
export function fechaCorta(d: string | Date): string {
  const f = leer(d)
  return `${f.dia} ${f.mes}`
}

/** «2 sep 2026». */
export function fechaConAno(d: string | Date): string {
  const f = leer(d)
  return `${f.dia} ${f.mes} ${f.ano}`
}

/** «2 sep 2026, 18:20». */
export function fechaConHora(d: string | Date): string {
  const f = leer(d)
  return `${f.dia} ${f.mes} ${f.ano}, ${f.hora}`
}

/** «5 nov a las 10:00». */
export function diaYHora(d: string | Date): string {
  const f = leer(d)
  return `${f.dia} ${f.mes} a las ${f.hora}`
}

const DIA_MS = 86_400_000
const diaDe = (d: string) => Date.parse(`${d.slice(0, 10)}T12:00:00Z`)

/** Días entre dos fechas (`desde` antes que `hasta`, positivo). */
export const diasEntre = (desde: string, hasta: string) => Math.round((diaDe(hasta) - diaDe(desde)) / DIA_MS)

/** «Hoy», «Ayer», «Hace 2 días», «Hace 3 meses». */
export function haceTiempo(desde: string, hoy: string): string {
  const n = diasEntre(desde, hoy)
  if (n <= 0) return "Hoy"
  if (n === 1) return "Ayer"
  if (n < 60) return `Hace ${n} días`
  return `Hace ${Math.round(n / 30)} meses`
}

/** «en 30 días», «hoy», «hace 3 días». */
export function dentroDe(dia: string, hoy: string): string {
  const n = diasEntre(hoy, dia)
  if (n === 0) return "hoy"
  if (n === 1) return "mañana"
  return n > 0 ? `en ${n} días` : `hace ${-n} días`
}

/** Una fila de datos numéricos: «1.100 €». */
const euros = new Intl.NumberFormat("es-ES", { useGrouping: "always", maximumFractionDigits: 0 })
export const eurosFicha = (n: number) => `${euros.format(n)} €`
