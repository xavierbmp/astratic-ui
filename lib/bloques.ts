// Ajustes de los bloques de una página o un documento: en qué orden van, cuáles se enseñan y qué
// datos se esconden dentro de cada uno. Puro: sin datos ni React. Lo pinta `ListaBloques`.

/** Un bloque en su sitio: su id y si se enseña. El orden es el de la lista. */
export type BloqueAjustable<Id extends string = string> = { id: Id; visible: boolean }

/**
 * Lo que se guarda por persona: los bloques en su orden y los datos escondidos, cada uno con su
 * clave «bloque.dato» (un dato escondido de un bloque que se esconde entero vuelve a salir igual).
 */
export type AjustesBloques<Id extends string = string> = { bloques: BloqueAjustable<Id>[]; ocultos?: string[] }

/** Un dato de un bloque que se enseña o se esconde: su clave «bloque.dato» y su nombre. */
export type DatoBloque = { clave: string; label: string }

/** Los ids de los bloques que se enseñan, en su orden. */
export function bloquesVisibles<Id extends string>(ajustes: AjustesBloques<Id>): Id[] {
  return ajustes.bloques.filter((b) => b.visible).map((b) => b.id)
}

/** Los ajustes con un bloque enseñado o escondido. */
export function conBloque<A extends AjustesBloques>(ajustes: A, id: string, visible: boolean): A {
  return { ...ajustes, bloques: ajustes.bloques.map((b) => (b.id === id ? { ...b, visible } : b)) }
}

/** Mueve un bloque al sitio de otro (arrastrar en la lista). Si alguno no existe, todo sigue igual. */
export function moverBloque<A extends AjustesBloques>(ajustes: A, desde: string, hasta: string): A {
  const i = ajustes.bloques.findIndex((b) => b.id === desde)
  const j = ajustes.bloques.findIndex((b) => b.id === hasta)
  if (i === -1 || j === -1 || i === j) return ajustes
  const bloques = [...ajustes.bloques]
  const [movido] = bloques.splice(i, 1)
  bloques.splice(j, 0, movido)
  return { ...ajustes, bloques }
}

/** Si un dato de un bloque se enseña. */
export const seVe = (ajustes: AjustesBloques, clave: string) => !ajustes.ocultos?.includes(clave)

/** Los ajustes con un dato enseñado o escondido, sin repetidos. */
export function conDato<A extends AjustesBloques>(ajustes: A, clave: string, visible: boolean): A {
  const ocultos = (ajustes.ocultos ?? []).filter((c) => c !== clave)
  return { ...ajustes, ocultos: visible ? ocultos : [...ocultos, clave] }
}
