// Lógica de las collabs y sus piezas: hitos que salen de la fecha de publicación, progreso y
// siguiente paso. Pura: sin datos ni React, para poder probarla sola y reutilizarla en el portal.
import { FORMATOS, TIPOS_PIEZA, type Collab, type Marca, type Pieza, type TipoVersion, type Version } from "@/lib/influencer/modelo"
import type { SocialNetwork } from "@/components/app/social-icons"
import { diasEntre, sumarDias } from "@/lib/influencer/fechas"

export type TipoHito = "guion" | "grabacion" | "v1" | "publicacion" | "resultados"

/** Los hitos de una pieza y a cuántos días de la publicación caen. Regla del brief: guion 10 días antes, V1 5 días antes, resultados 7 después. */
export const HITOS: { tipo: TipoHito; label: string; verbo: string; dias: number }[] = [
  { tipo: "guion", label: "Guion", verbo: "Enviar el guion", dias: -10 },
  { tipo: "grabacion", label: "Grabación", verbo: "Grabar", dias: -7 },
  { tipo: "v1", label: "V1", verbo: "Entregar la V1", dias: -5 },
  { tipo: "publicacion", label: "Publicación", verbo: "Publicar", dias: 0 },
  { tipo: "resultados", label: "Resultados", verbo: "Enviar los resultados", dias: 7 },
]

export type Hito = { tipo: TipoHito; label: string; verbo: string; fecha: string; hecho: boolean }

const ESTADOS_HECHOS = new Set(["aprobado", "programado", "publicado", "resultados"])

/** Una pieza de solo texto no se graba ni tiene V1: se escribe, se aprueba y se publica. */
const tieneMedia = (p: Pieza) => TIPOS_PIEZA[p.tipo].media !== undefined

function hitoHecho(p: Pieza, tipo: TipoHito) {
  switch (tipo) {
    case "guion":
      return p.guion.some((v) => v.estado === "aprobada") || p.media.length > 0 || ESTADOS_HECHOS.has(p.estado)
    case "grabacion":
    case "v1":
      return p.media.length > 0 || ESTADOS_HECHOS.has(p.estado)
    case "publicacion":
      return !!p.publicada
    case "resultados":
      return p.estado === "resultados"
  }
}

/** El verbo de cada hito según lo que se entrega: las fotos no se graban. */
function verboDe(p: Pieza, tipo: TipoHito, verbo: string) {
  if (tipo === "grabacion" && TIPOS_PIEZA[p.tipo].media === "imagen") return "Hacer las fotos"
  if (tipo === "guion" && p.tipo === "texto") return "Enviar el texto"
  return verbo
}

export function hitosDePieza(p: Pieza): Hito[] {
  return HITOS.filter((h) => tieneMedia(p) || (h.tipo !== "grabacion" && h.tipo !== "v1")).map((h) => ({
    tipo: h.tipo,
    label: h.label,
    verbo: verboDe(p, h.tipo, h.verbo),
    fecha: sumarDias(p.publicacion, h.dias),
    hecho: hitoHecho(p, h.tipo),
  }))
}

/** «Reel», «3 stories», «Reel 1»: lo que va antes del punto medio del título. */
export function tituloCorto(p: Pieza) {
  return p.titulo.split(" · ")[0]
}

/** «Reel» si se pactó el formato; si no, el tipo («Vídeo», «Carrusel»). */
export function etiquetaDePieza(p: Pieza) {
  return p.formato ? FORMATOS[p.formato].label : TIPOS_PIEZA[p.tipo].label
}

/** Dónde se publica: lo que diga la pieza o, si no, la red de su formato. */
export function redDePieza(p: Pieza): SocialNetwork | undefined {
  return p.red ?? (p.formato ? FORMATOS[p.formato].red : undefined)
}

/** Las partes que se revisan: guion y contenido final, o solo el texto. */
export function partesDePieza(p: Pieza): TipoVersion[] {
  return tieneMedia(p) ? ["guion", "media"] : ["guion"]
}

/** La parte que se abre al entrar en una pieza: el contenido si ya hay versiones o el guion está aprobado; si no, el guion. */
export function parteInicial(p: Pieza): TipoVersion {
  if (!tieneMedia(p)) return "guion"
  return p.media.length > 0 || p.guion.some((v) => v.estado === "aprobada") ? "media" : "guion"
}

/** Cómo se llama cada parte en pantalla: «Guion», «Vídeo», «Fotos» o «Texto». */
export function nombreDeParte(p: Pieza, parte: TipoVersion) {
  if (parte === "guion") return p.tipo === "texto" ? "Texto" : "Guion"
  return TIPOS_PIEZA[p.tipo].media === "video" ? "Vídeo" : p.tipo === "carrusel" ? "Carrusel" : "Foto"
}

/** El primer hito pendiente de la collab, el más cercano (aunque ya haya pasado). */
export function siguienteHito(c: Collab): { label: string; fecha: string; piezaId: string } | null {
  const pendientes = c.piezas
    .flatMap((p) => hitosDePieza(p).filter((h) => !h.hecho).map((h) => ({ label: `${h.verbo} · ${tituloCorto(p)}`, fecha: h.fecha, piezaId: p.id })))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
  return pendientes[0] ?? null
}

/** Las piezas en el orden en que se publican. */
export function piezasPorFecha(piezas: Pieza[]) {
  return [...piezas].sort((a, b) => a.publicacion.localeCompare(b.publicacion))
}

export function unidadesTotales(c: Collab) {
  return c.piezas.reduce((a, p) => a + p.unidades, 0)
}

export function unidadesHechas(c: Collab) {
  return c.piezas.filter((p) => ESTADOS_HECHOS.has(p.estado)).reduce((a, p) => a + p.unidades, 0)
}

/** «1 reel + 3 stories» si se pactaron formatos; si no, por tipo: «2 vídeos + 1 carrusel». */
export function describirEntregables(c: Collab) {
  const grupos = new Map<string, { singular: string; plural: string; cantidad: number }>()
  for (const p of c.piezas) {
    const clave = p.formato ?? p.tipo
    const nombres = p.formato ? { singular: FORMATOS[p.formato].singular, plural: FORMATOS[p.formato].plural } : { singular: TIPOS_PIEZA[p.tipo].label.toLowerCase(), plural: TIPOS_PIEZA[p.tipo].plural }
    const previo = grupos.get(clave)
    grupos.set(clave, { ...nombres, cantidad: (previo?.cantidad ?? 0) + p.unidades })
  }
  if (grupos.size === 0) return "Sin piezas"
  return Array.from(grupos.values())
    .map((g) => `${g.cantidad} ${g.cantidad === 1 ? g.singular : g.plural}`)
    .join(" + ")
}

export function marcaDe(c: { marcaId: string }, marcas: Marca[]) {
  const m = marcas.find((x) => x.id === c.marcaId)
  if (!m) throw new Error(`Marca desconocida: ${c.marcaId}`)
  return m
}

/** La última versión de un tipo, o nada si aún no hay. */
export function ultimaVersion(versiones: Version[]) {
  return versiones.length ? versiones[versiones.length - 1] : null
}

/** Días que lleva una versión esperando a la marca. */
export function diasEsperando(v: Version, hoy: string) {
  return v.estado === "en-revision" ? Math.max(0, diasEntre(v.creadaEl, hoy)) : 0
}

/** Qué le toca a la pieza ahora mismo, en una frase corta para tarjetas y listas. */
export function siguientePasoDePieza(p: Pieza): string {
  if (p.publicada) return p.estado === "resultados" ? "Resultados enviados" : "Enviar los resultados"
  const guion = ultimaVersion(p.guion)
  const media = ultimaVersion(p.media)
  const texto = nombreDeParte(p, "guion")
  if (media) {
    const version = `${nombreDeParte(p, "media")} v${media.numero}`
    switch (media.estado) {
      case "aprobada":
        return p.estado === "programado" ? "Programado: publicar" : "Aprobado: programar"
      case "cambios":
        return `Cambios pedidos en la v${media.numero}: subir la v${media.numero + 1}`
      case "en-revision":
        return `${version} esperando a la marca`
      case "borrador":
        return `${version} sin enviar`
    }
  }
  if (guion?.estado === "aprobada") {
    if (!tieneMedia(p)) return "Texto aprobado: publicar"
    return TIPOS_PIEZA[p.tipo].media === "video" ? "Guion aprobado: grabar y subir la v1" : "Guion aprobado: hacer las fotos"
  }
  if (guion?.estado === "cambios") return `Cambios pedidos en el ${texto.toLowerCase()}`
  if (guion?.estado === "en-revision") return `${texto} esperando a la marca`
  if (guion?.estado === "borrador") return `${texto} sin enviar`
  return `Escribir el ${texto.toLowerCase()}`
}

/** Lo que cobra ella en una collab de la red. */
export const PARTE_RED = 0.8
