// El directorio de Contenidos: ideas y notas. El estado que se ve de cada idea (lo pone su contenido
// si ya lo hay), apuntar una al vuelo desde un texto con enlace, lo que caduca pronto, lo que enseña
// su tarjeta, lo que se le adjunta y con qué notas está enlazada. Pura: sin datos ni React.
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { ESTADOS_IDEA_A_MANO, FORMATOS, type Apunte, type Carpeta, type Contenido, type EstadoIdea, type EstadoIdeaManual, type Formato, type Referencia, type VinculoApunte } from "@/lib/influencer/modelo"
import { SIN_VALOR } from "@/lib/vistas/core"
import { diasEntre } from "@/lib/influencer/fechas"
import { textoPlano } from "@/lib/influencer/guion"
import { conDescendientes } from "@/lib/influencer/carpetas"

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

/** El estado que se ve: planificada o publicada si ya tiene contenido; si no, el que puso ella. Una nota no tiene. */
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

/** Un apunte nuevo con lo que se sabe; el resto, vacío. Si nace con una captura, es su portada. */
export function nuevoApunte(datos: Pick<Apunte, "tipo" | "titulo"> & Partial<Apunte>, id: string, ahora: string): Apunte {
  const referencias = datos.referencias ?? []
  const portadaUrl = datos.portadaUrl ?? referencias.find((r) => r.tipo === "imagen")?.url
  return { texto: "", favorito: false, estado: "apuntada", redes: [], ...datos, referencias, portadaUrl, id, creadoEl: ahora, actualizadoEl: ahora }
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

/** La imagen de su tarjeta, si tiene. */
export function portadaDeApunte(a: Pick<Apunte, "portadaUrl">): string | undefined {
  return a.portadaUrl
}

/** Añadir enlaces, capturas o archivos. La primera captura de un apunte sin portada pasa a serlo. */
export function conReferencias(a: Apunte, nuevas: Referencia[]): Apunte {
  const portadaUrl = a.portadaUrl ?? nuevas.find((r) => r.tipo === "imagen")?.url
  return { ...a, referencias: [...a.referencias, ...nuevas], portadaUrl }
}

/** Quitar una referencia; si su imagen era la portada, el apunte se queda sin portada. */
export function sinReferencia(a: Apunte, id: string): Apunte {
  const quitada = a.referencias.find((r) => r.id === id)
  return { ...a, referencias: a.referencias.filter((r) => r.id !== id), portadaUrl: quitada && quitada.url === a.portadaUrl ? undefined : a.portadaUrl }
}

/** El principio del texto, para la tarjeta de una nota o de una idea sin imagen. */
export function resumenDeApunte(a: Pick<Apunte, "texto">, max = 140): string {
  const texto = textoPlano(a.texto).replace(/\s+/g, " ").trim()
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto
}

/**
 * Cuántos apuntes hay en cada carpeta, contando los de las carpetas que lleva dentro, además de
 * todos, los que no tienen carpeta y los favoritos.
 */
export function contarPorCarpeta(apuntes: Pick<Apunte, "carpetaId" | "favorito">[], carpetas: Carpeta[]): Record<string, number> {
  const cuentas: Record<string, number> = { [CARPETA_TODO]: apuntes.length, [CARPETA_SIN]: 0, [CARPETA_FAVORITOS]: 0 }
  for (const a of apuntes) {
    if (a.favorito) cuentas[CARPETA_FAVORITOS] += 1
    if (!a.carpetaId) cuentas[CARPETA_SIN] += 1
  }
  for (const c of carpetas) {
    const dentro = conDescendientes(carpetas, c.id)
    cuentas[c.id] = apuntes.filter((a) => a.carpetaId && dentro.has(a.carpetaId)).length
  }
  return cuentas
}

/** Los de una carpeta y las que lleva dentro (o los de las especiales: todo, sin carpeta, favoritos). */
export function apuntesDeCarpeta<T extends Pick<Apunte, "carpetaId" | "favorito">>(apuntes: T[], carpeta: string, carpetas: Carpeta[]): T[] {
  if (carpeta === CARPETA_TODO) return apuntes
  if (carpeta === CARPETA_FAVORITOS) return apuntes.filter((a) => a.favorito)
  if (carpeta === CARPETA_SIN) return apuntes.filter((a) => !a.carpetaId)
  const dentro = conDescendientes(carpetas, carpeta)
  return apuntes.filter((a) => a.carpetaId && dentro.has(a.carpetaId))
}

// ── Notas enlazadas con ideas ──

const esVinculo = (v: VinculoApunte, x: string, y: string) => (v.desde === x && v.hasta === y) || (v.desde === y && v.hasta === x)

/** Los ids de los apuntes enlazados con uno, en el orden en que se enlazaron. */
export function enlazadosDe(id: string, vinculos: VinculoApunte[]): string[] {
  return vinculos.flatMap((v) => (v.desde === id ? [v.hasta] : v.hasta === id ? [v.desde] : []))
}

/** Enlazar dos apuntes; si ya lo están (o son el mismo), nada cambia. */
export function enlazar(vinculos: VinculoApunte[], desde: string, hasta: string): VinculoApunte[] {
  if (desde === hasta || vinculos.some((v) => esVinculo(v, desde, hasta))) return vinculos
  return [...vinculos, { desde, hasta }]
}

export function desenlazar(vinculos: VinculoApunte[], x: string, y: string): VinculoApunte[] {
  return vinculos.filter((v) => !esVinculo(v, x, y))
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

const esEstadoManual = (v: string): v is EstadoIdeaManual => ESTADOS_IDEA_A_MANO.some((e) => e === v)
const esFormato = (v: string): v is Formato => v in FORMATOS

/**
 * Darle a un apunte el valor de un campo: al soltarlo en otra columna o grupo, o al crearlo dentro
 * de uno. Nada si ese valor no se pone a mano (planificada y publicada las pone su contenido).
 */
export function asignarCampoApunte(a: Apunte, campo: string, valor: string): Apunte | null {
  const vacio = valor === SIN_VALOR
  switch (campo) {
    case "estado":
      return a.tipo === "idea" && esEstadoManual(valor) ? { ...a, estado: valor } : null
    case "tipo":
      return valor === "idea" || valor === "nota" ? { ...a, tipo: valor } : null
    case "pilar":
      return { ...a, pilarId: vacio ? undefined : valor }
    case "carpeta":
      return { ...a, carpetaId: vacio ? undefined : valor }
    case "formato":
      return vacio ? { ...a, formato: undefined } : esFormato(valor) ? { ...a, formato: valor } : null
    case "marca":
      return { ...a, marcaId: vacio ? undefined : valor }
    case "fechaClave":
      return { ...a, fechaClaveId: vacio ? undefined : valor }
    case "favorito":
      return { ...a, favorito: valor === "true" }
    default:
      return null
  }
}
