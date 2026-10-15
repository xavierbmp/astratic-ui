// Notas puestas sobre un vídeo o una foto, como en Frame.io: en qué punto del fotograma (en %) y en
// qué segundo, qué notas se ven en el fotograma parado y dónde cabe la caja de escribir o de leer una
// nota sin salirse del fotograma.

/** Lo que dura un fotograma de nota: parado a menos de esto de su segundo, la nota se ve encima. */
export const VENTANA_NOTA = 0.5

/** El segundo de una nota, con décimas: lo justo para volver al mismo fotograma. */
export function segundoDeNota(s: number) {
  return Math.max(0, Math.round(s * 10) / 10)
}

/** Dónde se ha pulsado dentro de una caja, en % de su ancho y su alto (con una décima, sin salirse). */
export function puntoEnCaja(caja: { left: number; top: number; width: number; height: number }, x: number, y: number) {
  const pct = (v: number, desde: number, largo: number) => Math.min(100, Math.max(0, Math.round(((v - desde) / largo) * 1000) / 10))
  return { x: pct(x, caja.left, caja.width), y: pct(y, caja.top, caja.height) }
}

/** Las notas que se ven en el fotograma de este segundo. */
export function notasEnFotograma<N extends { segundo: number }>(notas: N[], segundo: number) {
  return notas.filter((n) => Math.abs(n.segundo - segundo) < VENTANA_NOTA)
}

/**
 * Dónde va una caja (la de escribir una nota o la que la enseña) junto a su chincheta, en px desde la
 * esquina del fotograma: centrada en la chincheta sin salirse por los lados, y debajo de ella o, si no
 * cabe, encima.
 */
export function cajaJuntoA(punto: { x: number; y: number }, fotograma: { ancho: number; alto: number }, caja: { ancho: number; alto: number }) {
  const MARGEN = 8
  const SEPARACION = 18
  const px = (punto.x / 100) * fotograma.ancho
  const py = (punto.y / 100) * fotograma.alto
  const ancho = Math.min(caja.ancho, fotograma.ancho - MARGEN * 2)
  const left = Math.min(Math.max(px - ancho / 2, MARGEN), fotograma.ancho - ancho - MARGEN)
  const debajo = py + SEPARACION + caja.alto <= fotograma.alto - MARGEN || py < fotograma.alto / 2
  return { left, ancho, top: debajo ? py + SEPARACION : py - SEPARACION, debajo }
}
