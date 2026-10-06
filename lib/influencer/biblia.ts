// La Biblia: cuánto lleva leído, qué esenciales le faltan antes de su primera collab y el capítulo
// anterior y el siguiente para leerla de corrido.
import type { CapituloBiblia, LecturasBiblia } from "@/lib/influencer/modelo"

export function progresoBiblia(capitulos: CapituloBiblia[], lecturas: LecturasBiblia) {
  const leidos = capitulos.filter((c) => lecturas[c.id]).length
  const esencialesPendientes = capitulos.filter((c) => c.esencial && !lecturas[c.id])
  const minutosPendientes = capitulos.filter((c) => !lecturas[c.id]).reduce((a, c) => a + c.minutos, 0)
  return { leidos, total: capitulos.length, pct: capitulos.length ? Math.round((leidos / capitulos.length) * 100) : 0, esencialesPendientes, minutosPendientes }
}

/** El capítulo que toca leer: el primer esencial sin leer o, si no queda ninguno, el primero sin leer. */
export function capituloRecomendado(capitulos: CapituloBiblia[], lecturas: LecturasBiblia) {
  return capitulos.find((c) => c.esencial && !lecturas[c.id]) ?? capitulos.find((c) => !lecturas[c.id]) ?? null
}

export function vecinosDe(capitulos: CapituloBiblia[], id: string) {
  const i = capitulos.findIndex((c) => c.id === id)
  return { anterior: i > 0 ? capitulos[i - 1] : null, siguiente: i >= 0 && i < capitulos.length - 1 ? capitulos[i + 1] : null, numero: i + 1 }
}
