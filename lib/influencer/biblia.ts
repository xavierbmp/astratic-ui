// La Biblia: cuánto lleva leído, qué esenciales le faltan antes de su primera collab y el capítulo
// anterior y el siguiente para leerla de corrido.
import type { BloqueBiblia, CapituloBiblia, LecturasBiblia } from "@/lib/influencer/modelo"

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

/** Todo el texto de un bloque, sea del tipo que sea: para buscar y para revisar la redacción. */
export function textosDeBloque(b: BloqueBiblia): string[] {
  if (b.tipo === "lista") return [...(b.titulo ? [b.titulo] : []), ...b.items]
  if (b.tipo === "tabla") return [...b.cabecera, ...b.filas.flat()]
  return [...("titulo" in b && b.titulo ? [b.titulo] : []), b.texto]
}

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

/**
 * Las lecciones que hablan de lo que busca, de la que más a la que menos: cuenta más estar en el título y en sus palabras
 * clave que en el texto. Busca cada palabra por separado y sin acentos.
 */
export function buscarLecciones(capitulos: CapituloBiblia[], q: string): CapituloBiblia[] {
  const palabras = sinAcentos(q).split(/\s+/).filter((p) => p.length > 1)
  if (!palabras.length) return capitulos
  const puntos = (c: CapituloBiblia) => {
    const titulo = sinAcentos(`${c.titulo} ${(c.claves ?? []).join(" ")}`)
    const texto = sinAcentos([c.resumen, ...c.secciones.flatMap((s) => [s.titulo, ...s.bloques.flatMap(textosDeBloque)])].join(" "))
    return palabras.every((p) => titulo.includes(p) || texto.includes(p)) ? palabras.reduce((n, p) => n + (titulo.includes(p) ? 3 : 1), 0) : 0
  }
  return capitulos
    .map((c) => ({ c, n: puntos(c) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.c)
}
