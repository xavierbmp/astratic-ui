const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
})

const eurDecimals = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always",
})

const num = new Intl.NumberFormat("es-ES", { useGrouping: "always" })
const num1 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, useGrouping: "always" })

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const longDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" })
const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" })
const relative = new Intl.RelativeTimeFormat("es-ES", { numeric: "always" })

export const fmt = {
  eur: (v: number) => eur.format(v),
  eurDecimals: (v: number) => eurDecimals.format(v),
  num: (v: number) => num.format(v),
  pct: (points: number) => `${num1.format(points)} %`,
  delta: (points: number) => `${points > 0 ? "+" : ""}${num1.format(points)} %`,
  compact: (v: number) =>
    v >= 1_000_000
      ? `${num1.format(v / 1_000_000)} M`
      : v >= 1000
        ? `${Math.round(v / 1000)} k`
        : num.format(v),
  date: (d: Date | string) => {
    const x = new Date(d)
    return `${x.getDate()} ${months[x.getMonth()]}`
  },
  dateLong: (d: Date | string) => longDate.format(new Date(d)),
  time: (d: Date | string) => time.format(new Date(d)),
  relative: (d: Date | string, now: Date = new Date()) => {
    const diff = (new Date(d).getTime() - now.getTime()) / 1000
    const abs = Math.abs(diff)
    if (abs < 60) return "ahora"
    if (abs < 3600) return relative.format(Math.round(diff / 60), "minute")
    if (abs < 86400) return relative.format(Math.round(diff / 3600), "hour")
    if (abs < 86400 * 30) return relative.format(Math.round(diff / 86400), "day")
    return fmt.date(d)
  },
}

export function initials(name: string) {
  const [first = "", second = ""] = name.split(/\s+/).filter(Boolean)
  const tail = /^\d+$/.test(second) ? second.slice(0, 2) : second.slice(0, 1)
  return (first.slice(0, 1) + tail).toUpperCase()
}
