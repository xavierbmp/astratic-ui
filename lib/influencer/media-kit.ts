// El media kit: sus cifras, qué bloques se enseñan y cómo se reparten en hojas A4.
import { FORMATOS, nombrePlataforma, type BloqueMediaKit, type MediaKit, type Perfil } from "@/lib/influencer/modelo"

/**
 * Alto aproximado de cada bloque en la hoja (px a tamaño real, con su título). Sirve para repartir
 * los bloques en hojas sin que ninguno quede cortado: si no cabe, pasa entero a la siguiente.
 */
const ALTO_BLOQUE: Record<BloqueMediaKit, number> = {
  portada: 330,
  cifras: 110,
  redes: 220,
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

/** Algo que se enseña o se esconde dentro de un bloque: su clave «bloque.dato» y su nombre. */
export type DatoMediaKit = { clave: string; label: string }

/**
 * Lo que se puede esconder dentro de cada bloque (Xavier, 2026-10-14: «cada bloque ocultable y dentro de cada bloque,
 * info específica»): los datos fijos y, en redes, destacados, marcas y tarifas, cada elemento suyo.
 */
export function datosDelBloque(bloque: BloqueMediaKit, perfil: Perfil, kit: MediaKit, marcasTrabajadas: string[]): DatoMediaKit[] {
  switch (bloque) {
    case "portada":
      return [
        { clave: "portada.imagen", label: "Imagen de portada" },
        { clave: "portada.foto", label: "Foto de perfil" },
        { clave: "portada.usuario", label: "Usuario" },
        { clave: "portada.nicho", label: "Nicho" },
        { clave: "portada.ciudad", label: "Ciudad" },
        { clave: "portada.titular", label: "Titular" },
        { clave: "portada.bio", label: "Bio" },
      ]
    case "cifras":
      return [
        { clave: "cifras.seguidores", label: "Seguidores" },
        { clave: "cifras.visualizaciones", label: "Visualizaciones medias" },
        { clave: "cifras.interaccion", label: "Interacción media" },
        { clave: "cifras.espana", label: "Audiencia en España" },
      ]
    case "redes":
      return [
        ...perfil.cuentas.map((c) => ({ clave: `redes.${c.red}`, label: nombrePlataforma(c.red) })),
        { clave: "redes.visualizaciones", label: "Visualizaciones medias de cada red" },
        { clave: "redes.interaccion", label: "Interacción de cada red" },
      ]
    case "audiencia":
      return [
        { clave: "audiencia.mujeres", label: "Mujeres" },
        { clave: "audiencia.espana", label: "En España" },
        { clave: "audiencia.edades", label: "Edad principal" },
      ]
    case "destacados":
      return kit.destacados.slice(0, 3).map((d) => ({ clave: `destacados.${d.id}`, label: d.titulo }))
    case "marcas":
      return marcasTrabajadas.map((m) => ({ clave: `marcas.${m}`, label: m }))
    case "tarifas":
      return [...perfil.tarifas.map((t) => ({ clave: `tarifas.${t.formato}`, label: FORMATOS[t.formato].label })), { clave: "tarifas.nota", label: "Nota del IVA y los extras" }]
    case "contacto":
      return [
        { clave: "contacto.email", label: "Email" },
        { clave: "contacto.sello", label: "Sello de Astratic" },
      ]
  }
}

/** Si un dato de un bloque se enseña. */
export const seVe = (kit: MediaKit, clave: string) => !kit.ocultos?.includes(clave)

/** El kit con un dato enseñado o escondido. */
export function conDato(kit: MediaKit, clave: string, visible: boolean): MediaKit {
  const ocultos = (kit.ocultos ?? []).filter((c) => c !== clave)
  return { ...kit, ocultos: visible ? ocultos : [...ocultos, clave] }
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
