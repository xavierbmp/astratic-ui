// Carpetas en árbol: carpetas dentro de carpetas, en el orden que les da quien las usa. Se guardan
// en una lista plana: cada una sabe quién es su madre y su `orden` entre sus hermanas. Pura: sin
// datos ni React. Lo pinta `ArbolCarpetas`.

/** Lo mínimo de una carpeta; cada portal añade lo suyo (un color, un icono). */
export type CarpetaArbol = { id: string; nombre: string; padreId?: string; orden: number }

/** Las que cuelgan directamente de una carpeta (o las de arriba del todo, sin `padreId`), en su orden. */
export function hijasDe<C extends CarpetaArbol>(carpetas: C[], padreId?: string): C[] {
  return carpetas.filter((c) => c.padreId === padreId).sort((a, b) => a.orden - b.orden)
}

/** El `orden` de una carpeta nueva al final de las hijas de `padreId`. */
export function siguienteOrden<C extends CarpetaArbol>(carpetas: C[], padreId?: string): number {
  return Math.max(-1, ...hijasDe(carpetas, padreId).map((c) => c.orden)) + 1
}

/** Las carpetas con `orden` puesto según las listas dadas (madre → hijas en orden); las que no cambian, las mismas. */
function conOrden<C extends CarpetaArbol>(carpetas: C[], grupos: C[][], cambiada?: C): C[] {
  const orden = new Map(grupos.flatMap((g) => g.map((c, n) => [c.id, n] as const)))
  return carpetas.map((c) => {
    const base = c.id === cambiada?.id ? cambiada : c
    const o = orden.get(c.id)
    return o === undefined || o === base.orden ? base : { ...base, orden: o }
  })
}

/** La carpeta y todas las que lleva dentro, a cualquier profundidad. */
export function conDescendientes<C extends CarpetaArbol>(carpetas: C[], id: string): Set<string> {
  const ids = new Set([id])
  // Cada vuelta baja un nivel; para cuando un nivel ya no añade ninguna.
  for (let tamano = 0; tamano !== ids.size; ) {
    tamano = ids.size
    for (const c of carpetas) if (c.padreId && ids.has(c.padreId)) ids.add(c.id)
  }
  return ids
}

/** El camino desde arriba hasta la carpeta: [Navidad, Regalos]. Vacío si no existe. */
export function rutaDeCarpeta<C extends CarpetaArbol>(carpetas: C[], id: string): C[] {
  const ruta: C[] = []
  let actual = carpetas.find((c) => c.id === id)
  while (actual && !ruta.includes(actual)) {
    ruta.unshift(actual)
    const padreId = actual.padreId
    actual = padreId ? carpetas.find((c) => c.id === padreId) : undefined
  }
  return ruta
}

/** «Navidad / Regalos»: el nombre con sus madres, para los selectores y los filtros. */
export function nombreCompleto<C extends CarpetaArbol>(carpetas: C[], id: string): string {
  return rutaDeCarpeta(carpetas, id)
    .map((c) => c.nombre)
    .join(" / ")
}

/** Todas en el orden del árbol (cada madre seguida de sus hijas), con su nivel: para pintar el árbol o un selector. */
export function carpetasEnArbol<C extends CarpetaArbol>(carpetas: C[], abiertas?: Set<string>): { carpeta: C; nivel: number; tieneHijas: boolean }[] {
  const lista: { carpeta: C; nivel: number; tieneHijas: boolean }[] = []
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
export function opcionesDeCarpetas<C extends CarpetaArbol>(carpetas: C[]): { value: string; label: string }[] {
  return carpetasEnArbol(carpetas).map(({ carpeta }) => ({ value: carpeta.id, label: nombreCompleto(carpetas, carpeta.id) }))
}

/** Dónde se suelta una carpeta: dentro de otra (al final de sus hijas) o justo antes de una hermana. */
export type DestinoCarpeta = { padreId?: string; antesDe?: string }

/**
 * Mover una carpeta (con todo lo que lleva dentro) a otra madre o a otro sitio entre sus hermanas.
 * Renumera el `orden` de las hermanas que cambian. Devuelve la lista nueva, o `null` si el destino
 * está dentro de ella misma.
 */
export function moverCarpeta<C extends CarpetaArbol>(carpetas: C[], id: string, destino: DestinoCarpeta): C[] | null {
  const carpeta = carpetas.find((c) => c.id === id)
  if (!carpeta) return null
  if (destino.padreId && conDescendientes(carpetas, id).has(destino.padreId)) return null
  if (destino.antesDe === id) return carpetas
  const movida = { ...carpeta, padreId: destino.padreId }
  const nuevas = hijasDe(carpetas, destino.padreId).filter((c) => c.id !== id)
  const antes = destino.antesDe ? nuevas.findIndex((c) => c.id === destino.antesDe) : -1
  nuevas.splice(antes >= 0 ? antes : nuevas.length, 0, movida)
  const viejas = carpeta.padreId === destino.padreId ? [] : hijasDe(carpetas, carpeta.padreId).filter((c) => c.id !== id)
  return conOrden(carpetas, [nuevas, viejas], movida)
}

/** Al borrar una carpeta, lo que llevaba dentro (carpetas y apuntes) sube a su madre (al final de sus hijas), o arriba del todo. */
export function borrarCarpeta<C extends CarpetaArbol>(carpetas: C[], id: string): { carpetas: C[]; destino?: string } {
  const destino = carpetas.find((c) => c.id === id)?.padreId
  const quedan = carpetas.filter((c) => c.id !== id)
  const suben = hijasDe(quedan, id).map((c) => ({ ...c, padreId: destino }))
  const subidas = new Map(suben.map((c) => [c.id, c]))
  const resultado = quedan.map((c) => subidas.get(c.id) ?? c)
  return { carpetas: conOrden(resultado, [[...hijasDe(quedan, destino), ...suben]]), destino }
}
