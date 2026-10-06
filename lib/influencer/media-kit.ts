// El media kit: sus cifras, qué bloques se enseñan y cómo se reparten en hojas A4.
import type { BloqueMediaKit, MediaKit, Perfil } from "@/lib/influencer/modelo"

/**
 * Alto aproximado de cada bloque en la hoja (px a tamaño real, con su título). Sirve para repartir
 * los bloques en hojas sin que ninguno quede cortado: si no cabe, pasa entero a la siguiente.
 */
const ALTO_BLOQUE: Record<BloqueMediaKit, number> = {
  portada: 210,
  cifras: 110,
  redes: 170,
  audiencia: 150,
  destacados: 290,
  marcas: 100,
  tarifas: 270,
  contacto: 110,
}

/** Lo que cabe en una hoja entre la cabecera y el pie. */
const ALTO_HOJA = 960

/** Los bloques visibles en su orden; sin tarifas si la propuesta va sin precios. */
export function bloquesVisibles(kit: MediaKit, opciones?: { conPrecios?: boolean }) {
  return kit.bloques.filter((b) => b.visible && !(b.id === "tarifas" && opciones?.conPrecios === false)).map((b) => b.id)
}

/** Los bloques repartidos en hojas, en orden y sin partir ninguno. */
export function hojasDelMediaKit(bloques: BloqueMediaKit[]): BloqueMediaKit[][] {
  const hojas: BloqueMediaKit[][] = [[]]
  let ocupado = 0
  for (const b of bloques) {
    const alto = ALTO_BLOQUE[b]
    if (ocupado + alto > ALTO_HOJA && hojas[hojas.length - 1].length > 0) {
      hojas.push([])
      ocupado = 0
    }
    hojas[hojas.length - 1].push(b)
    ocupado += alto
  }
  return hojas
}

/** Las cifras de todas sus redes juntas. */
export function cifrasDelPerfil(perfil: Perfil) {
  const n = perfil.cuentas.length || 1
  return {
    seguidores: perfil.cuentas.reduce((a, c) => a + c.seguidores, 0),
    visualizaciones: perfil.cuentas.reduce((a, c) => a + c.visualizacionesMedias, 0),
    interaccion: Math.round((perfil.cuentas.reduce((a, c) => a + c.interaccion, 0) / n) * 10) / 10,
  }
}

/** Mueve un bloque de sitio (arrastrar en el editor). */
export function moverBloque(kit: MediaKit, desde: BloqueMediaKit, hasta: BloqueMediaKit): MediaKit {
  const i = kit.bloques.findIndex((b) => b.id === desde)
  const j = kit.bloques.findIndex((b) => b.id === hasta)
  if (i === -1 || j === -1 || i === j) return kit
  const bloques = [...kit.bloques]
  const [movido] = bloques.splice(i, 1)
  bloques.splice(j, 0, movido)
  return { ...kit, bloques }
}
