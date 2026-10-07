// El directorio de Contenidos: ideas y documentos. El estado que se ve de cada idea (lo pone su
// contenido si ya lo hay), apuntar una al vuelo desde un texto con enlace, lo que caduca pronto y lo
// que enseña su tarjeta. Pura: sin datos ni React.
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import type { Apunte, Contenido, EstadoIdea } from "@/lib/influencer/modelo"
import { diasEntre } from "@/lib/influencer/fechas"
import { textoPlano } from "@/lib/influencer/guion"

/** Con cuántos días de margen se avisa de que una idea caduca. */
export const DIAS_AVISO_CADUCA = 3

/** Las carpetas que no son carpetas: todo, lo que no tiene carpeta y las favoritas. */
export const CARPETA_TODO = "todo"
export const CARPETA_SIN = "sin-carpeta"
export const CARPETA_FAVORITOS = "favoritos"

/** El contenido que nació de una idea, si lo hay: el último que se planificó. */
export function contenidoDeIdea(a: Pick<Apunte, "id">, contenidos: Contenido[]): Contenido | undefined {
  return contenidos.filter((c) => c.ideaId === a.id).sort((x, y) => y.creadoEl.localeCompare(x.creadoEl))[0]
}

/** El estado que se ve: planificada o publicada si ya tiene contenido; si no, el que puso ella. Un documento no tiene. */
export function estadoDeIdea(a: Apunte, contenidos: Contenido[]): EstadoIdea | null {
  if (a.tipo !== "idea") return null
  const c = contenidoDeIdea(a, contenidos)
  if (c) return c.estado === "publicado" ? "publicada" : "planificada"
  return a.estado
}

const ENLACE = /https?:\/\/\S+/i
const REDES_POR_DOMINIO: [RegExp, SocialNetwork][] = [
  [/(^|\.)instagram\.com$/i, "instagram"],
  [/(^|\.)tiktok\.com$/i, "tiktok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/i, "youtube"],
]

/** La red de un enlace (un reel, un TikTok, un short), o nada si es de otra web. */
export function redDeEnlace(url: string): SocialNetwork | undefined {
  const dominio = url.match(/^https?:\/\/([^/?#:]+)/i)?.[1]
  if (!dominio) return undefined
  return REDES_POR_DOMINIO.find(([patron]) => patron.test(dominio))?.[1]
}

/** Un apunte nuevo con lo que se sabe; el resto, vacío. */
export function nuevoApunte(datos: Pick<Apunte, "tipo" | "titulo"> & Partial<Apunte>, id: string, ahora: string): Apunte {
  return { texto: "", favorito: false, estado: "apuntada", redes: [], referencias: [], ...datos, id, creadoEl: ahora, actualizadoEl: ahora }
}

/**
 * Apuntar al vuelo lo que escribe en el campo de arriba. Si lleva un enlace, se guarda como
 * referencia con su red; el título es el texto sin el enlace o, si solo hay enlace, «Idea de TikTok».
 */
export function apunteDesdeTexto(texto: string, base: { id: string; idReferencia: string; ahora: string; carpetaId?: string }): Apunte {
  const url = texto.match(ENLACE)?.[0]
  const sinEnlace = texto.replace(ENLACE, " ").replace(/\s+/g, " ").trim()
  const red = url ? redDeEnlace(url) : undefined
  const titulo = sinEnlace || (red ? `Idea de ${socialLabel[red]}` : "Idea con enlace")
  return nuevoApunte(
    {
      tipo: "idea",
      titulo,
      carpetaId: base.carpetaId,
      redes: red ? [red] : [],
      referencias: url ? [{ id: base.idReferencia, tipo: "enlace", url, titulo: red ? socialLabel[red] : undefined }] : [],
    },
    base.id,
    base.ahora,
  )
}

/** Días que le quedan a una idea con caducidad (negativo si ya pasó), o nada si no caduca. */
export function diasParaCaducar(a: Pick<Apunte, "caducaEl">, hoy: string): number | null {
  return a.caducaEl ? diasEntre(hoy, a.caducaEl) : null
}

export function caducaPronto(a: Pick<Apunte, "caducaEl">, hoy: string, dias = DIAS_AVISO_CADUCA) {
  const d = diasParaCaducar(a, hoy)
  return d !== null && d >= 0 && d <= dias
}

/** «Caduca hoy», «Caduca en 3 días» o «Caducó»: lo que dice su tarjeta. */
export function textoCaducidad(a: Pick<Apunte, "caducaEl">, hoy: string): string | null {
  const d = diasParaCaducar(a, hoy)
  if (d === null) return null
  if (d < 0) return "Caducó"
  if (d === 0) return "Caduca hoy"
  return d === 1 ? "Caduca mañana" : `Caduca en ${d} días`
}

/** La imagen de su tarjeta: la primera captura que tenga. */
export function portadaDeApunte(a: Pick<Apunte, "referencias">): string | undefined {
  return a.referencias.find((r) => r.tipo === "imagen")?.url
}

/** El principio del texto, para la tarjeta de un documento o de una idea sin imagen. */
export function resumenDeApunte(a: Pick<Apunte, "texto">, max = 140): string {
  const texto = textoPlano(a.texto).replace(/\s+/g, " ").trim()
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto
}

/** Cuántos apuntes hay en cada carpeta, además de todos, los que no tienen carpeta y los favoritos. */
export function contarPorCarpeta(apuntes: Pick<Apunte, "carpetaId" | "favorito">[]): Record<string, number> {
  const cuentas: Record<string, number> = { [CARPETA_TODO]: apuntes.length, [CARPETA_SIN]: 0, [CARPETA_FAVORITOS]: 0 }
  for (const a of apuntes) {
    const clave = a.carpetaId ?? CARPETA_SIN
    cuentas[clave] = (cuentas[clave] ?? 0) + 1
    if (a.favorito) cuentas[CARPETA_FAVORITOS] += 1
  }
  return cuentas
}

/** Los de una carpeta (o de las especiales: todo, sin carpeta, favoritos). */
export function apuntesDeCarpeta<T extends Pick<Apunte, "carpetaId" | "favorito">>(apuntes: T[], carpeta: string): T[] {
  if (carpeta === CARPETA_TODO) return apuntes
  if (carpeta === CARPETA_FAVORITOS) return apuntes.filter((a) => a.favorito)
  if (carpeta === CARPETA_SIN) return apuntes.filter((a) => !a.carpetaId)
  return apuntes.filter((a) => a.carpetaId === carpeta)
}

/**
 * Las ideas que tiene a mano para planificar: las que aún no tienen contenido y no están
 * descartadas. Primero las que caducan, después las favoritas y las «para hacer», y las más nuevas.
 */
export function ideasParaPlanificar(apuntes: Apunte[], contenidos: Contenido[], hoy: string): Apunte[] {
  const peso = (a: Apunte) => (caducaPronto(a, hoy) ? 0 : a.favorito ? 1 : a.estado === "para-hacer" ? 2 : 3)
  return apuntes
    .filter((a) => a.tipo === "idea" && a.estado !== "descartada" && !contenidoDeIdea(a, contenidos))
    .filter((a) => (diasParaCaducar(a, hoy) ?? 0) >= 0)
    .sort((a, b) => peso(a) - peso(b) || b.actualizadoEl.localeCompare(a.actualizadoEl))
}
