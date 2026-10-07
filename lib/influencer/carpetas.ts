// Las carpetas del directorio de Contenidos como un árbol: carpetas dentro de carpetas, en el orden
// que ella les da. Se guardan en una lista plana (cada una sabe quién es su madre) y el orden entre
// hermanas es el de la lista. Pura: sin datos ni React.
import type { Carpeta } from "@/lib/influencer/modelo"

/** Las que cuelgan directamente de una carpeta (o las de arriba del todo, sin `padreId`), en su orden. */
export function hijasDe(carpetas: Carpeta[], padreId?: string): Carpeta[] {
  return carpetas.filter((c) => c.padreId === padreId)
}

/** La carpeta y todas las que lleva dentro, a cualquier profundidad. */
export function conDescendientes(carpetas: Carpeta[], id: string): Set<string> {
  const ids = new Set([id])
  // Cada vuelta baja un nivel; para cuando un nivel ya no añade ninguna.
  for (let tamano = 0; tamano !== ids.size; ) {
    tamano = ids.size
    for (const c of carpetas) if (c.padreId && ids.has(c.padreId)) ids.add(c.id)
  }
  return ids
}

/** El camino desde arriba hasta la carpeta: [Navidad, Regalos]. Vacío si no existe. */
export function rutaDeCarpeta(carpetas: Carpeta[], id: string): Carpeta[] {
  const ruta: Carpeta[] = []
  let actual = carpetas.find((c) => c.id === id)
  while (actual && !ruta.includes(actual)) {
    ruta.unshift(actual)
    const padreId = actual.padreId
    actual = padreId ? carpetas.find((c) => c.id === padreId) : undefined
  }
  return ruta
}

/** «Navidad / Regalos»: el nombre con sus madres, para los selectores y los filtros. */
export function nombreCompleto(carpetas: Carpeta[], id: string): string {
  return rutaDeCarpeta(carpetas, id)
    .map((c) => c.nombre)
    .join(" / ")
}

/** Todas en el orden del árbol (cada madre seguida de sus hijas), con su nivel: para pintar el árbol o un selector. */
export function carpetasEnArbol(carpetas: Carpeta[], abiertas?: Set<string>): { carpeta: Carpeta; nivel: number; tieneHijas: boolean }[] {
  const lista: { carpeta: Carpeta; nivel: number; tieneHijas: boolean }[] = []
  const bajar = (padreId: string | undefined, nivel: number) => {
    for (const c of hijasDe(carpetas, padreId)) {
      const tieneHijas = carpetas.some((h) => h.padreId === c.id)
      lista.push({ carpeta: c, nivel, tieneHijas })
      if (tieneHijas && (!abiertas || abiertas.has(c.id))) bajar(c.id, nivel + 1)
    }
  }
  bajar(undefined, 0)
  return lista
}

/** Las carpetas para un selector o un filtro, en orden de árbol y con su nombre completo. */
export function opcionesDeCarpetas(carpetas: Carpeta[]): { value: string; label: string }[] {
  return carpetasEnArbol(carpetas).map(({ carpeta }) => ({ value: carpeta.id, label: nombreCompleto(carpetas, carpeta.id) }))
}

/** Dónde se suelta una carpeta: dentro de otra (al final de sus hijas) o justo antes de una hermana. */
export type DestinoCarpeta = { padreId?: string; antesDe?: string }

/**
 * Mover una carpeta (con todo lo que lleva dentro) a otra madre o a otro sitio entre sus hermanas.
 * Devuelve la lista nueva, o `null` si el destino está dentro de ella misma.
 */
export function moverCarpeta(carpetas: Carpeta[], id: string, destino: DestinoCarpeta): Carpeta[] | null {
  const carpeta = carpetas.find((c) => c.id === id)
  if (!carpeta) return null
  if (destino.padreId && conDescendientes(carpetas, id).has(destino.padreId)) return null
  if (destino.antesDe === id) return carpetas
  const movida = { ...carpeta, padreId: destino.padreId }
  const resto = carpetas.filter((c) => c.id !== id)
  const antes = destino.antesDe ? resto.findIndex((c) => c.id === destino.antesDe && c.padreId === destino.padreId) : -1
  if (antes >= 0) return [...resto.slice(0, antes), movida, ...resto.slice(antes)]
  return [...resto, movida]
}

/** Al borrar una carpeta, lo que llevaba dentro (carpetas y apuntes) sube a su madre, o arriba del todo. */
export function borrarCarpeta(carpetas: Carpeta[], id: string): { carpetas: Carpeta[]; destino?: string } {
  const destino = carpetas.find((c) => c.id === id)?.padreId
  return { carpetas: carpetas.filter((c) => c.id !== id).map((c) => (c.padreId === id ? { ...c, padreId: destino } : c)), destino }
}
