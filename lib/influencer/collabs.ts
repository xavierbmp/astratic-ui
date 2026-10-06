// Lógica de las collabs y sus piezas: hitos que salen de la fecha de publicación, progreso y
// siguiente paso. Pura: sin datos ni React, para poder probarla sola y reutilizarla en el portal.
import { describirPiezas, type Collab, type Marca, type Pieza, type PiezaPedida, type Version } from "@/lib/influencer/modelo"
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

function hitoHecho(p: Pieza, tipo: TipoHito) {
  switch (tipo) {
    case "guion":
      return p.guion.some((v) => v.estado === "aprobada") || p.video.length > 0 || ESTADOS_HECHOS.has(p.estado)
    case "grabacion":
    case "v1":
      return p.video.length > 0 || ESTADOS_HECHOS.has(p.estado)
    case "publicacion":
      return !!p.publicada
    case "resultados":
      return p.estado === "resultados"
  }
}

export function hitosDePieza(p: Pieza): Hito[] {
  return HITOS.map((h) => ({ tipo: h.tipo, label: h.label, verbo: h.verbo, fecha: sumarDias(p.publicacion, h.dias), hecho: hitoHecho(p, h.tipo) }))
}

/** «Reel», «3 stories», «Reel 1»: lo que va antes del punto medio del título. */
export function tituloCorto(p: Pieza) {
  return p.titulo.split(" · ")[0]
}

/** El primer hito pendiente de la collab, el más cercano (aunque ya haya pasado). */
export function siguienteHito(c: Collab): { label: string; fecha: string; piezaId: string } | null {
  const pendientes = c.piezas
    .flatMap((p) => hitosDePieza(p).filter((h) => !h.hecho).map((h) => ({ label: `${h.verbo} · ${tituloCorto(p)}`, fecha: h.fecha, piezaId: p.id })))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
  return pendientes[0] ?? null
}

export function unidadesTotales(c: Collab) {
  return c.piezas.reduce((a, p) => a + p.unidades, 0)
}

export function unidadesHechas(c: Collab) {
  return c.piezas.filter((p) => ESTADOS_HECHOS.has(p.estado)).reduce((a, p) => a + p.unidades, 0)
}

/** «1 reel + 3 stories», contando las piezas de la collab. */
export function describirEntregables(c: Collab) {
  const porFormato = new Map<PiezaPedida["formato"], number>()
  for (const p of c.piezas) porFormato.set(p.formato, (porFormato.get(p.formato) ?? 0) + p.unidades)
  return describirPiezas(Array.from(porFormato, ([formato, cantidad]) => ({ formato, cantidad })))
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
  const video = ultimaVersion(p.video)
  if (video?.estado === "aprobada") return p.estado === "programado" ? "Programado: publicar" : "Aprobado: programar"
  if (video?.estado === "cambios") return `Cambios pedidos en la V${video.numero}: subir la V${video.numero + 1}`
  if (video?.estado === "en-revision") return `V${video.numero} esperando a la marca`
  if (video?.estado === "borrador") return `V${video.numero} sin enviar`
  if (guion?.estado === "aprobada") return "Guion aprobado: grabar y subir la V1"
  if (guion?.estado === "cambios") return "Cambios pedidos en el guion"
  if (guion?.estado === "en-revision") return "Guion esperando a la marca"
  if (guion?.estado === "borrador") return "Guion sin enviar"
  return "Escribir el guion"
}

/** Lo que cobra ella en una collab de la red. */
export const PARTE_RED = 0.8
