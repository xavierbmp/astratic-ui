// La planificación de lo que publica: sus contenidos propios y las piezas de sus collabs en un mismo
// calendario (con lo demás que tiene ese día, si quiere el general), la etapa en que va cada uno, lo
// que falta para publicar un contenido y el caption de cada red. Pura: sin datos ni React.
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { fmt } from "@/lib/format"
import type { StatusTone } from "@/lib/status"
import {
  ESTADOS_CONTENIDO,
  ESTADOS_PIEZA,
  FORMATOS,
  estadoDe,
  type Apunte,
  type Collab,
  type Contenido,
  type EstadoContenido,
  type FechaClave,
  type Formato,
  type Marca,
  type Pieza,
  type Pilar,
  type Tarea,
  type TipoPieza,
} from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"
import { soloFecha } from "@/lib/influencer/fechas"
import { marcaDePublicidad, textoPlano } from "@/lib/influencer/guion"
import { hitosDePieza, marcaDe, redDePieza, tituloCorto } from "@/lib/influencer/collabs"
import { collabIdDe, diaDeTarea, estaCerrada, horaDeTarea, hrefDonde } from "@/lib/influencer/tareas"
import { eventosDeCollabs } from "@/lib/influencer/agenda"

// ───────────────────────── Crear y reciclar ─────────────────────────

/** Los formatos de lo que publica por su cuenta (el UGC no se publica). */
export const FORMATOS_PROPIOS: Formato[] = ["reel", "tiktok", "post", "story", "youtube"]

/** Lo que se graba o se hace con cada formato; un post puede ser foto o carrusel. */
export const TIPO_POR_FORMATO: Record<Formato, TipoPieza> = { reel: "video", story: "video", post: "foto", tiktok: "video", youtube: "video", ugc: "video" }

/** Un contenido nuevo con lo que se sabe: empieza por el guion y se publica en la red de su formato. */
export function nuevoContenido(datos: Pick<Contenido, "titulo" | "formato"> & Partial<Contenido>, id: string, ahora: string): Contenido {
  const red = FORMATOS[datos.formato].red
  return {
    tipo: TIPO_POR_FORMATO[datos.formato],
    estado: "guion",
    guion: "",
    caption: "",
    publicidad: false,
    redes: red ? [{ red }] : [],
    ...datos,
    id,
    creadoEl: ahora,
    actualizadoEl: ahora,
  }
}

/** Planificar una idea: el contenido nace con su título, su pilar y sus redes, y queda unido a ella. */
export function contenidoDesdeIdea(idea: Apunte, datos: { formato?: Formato; fecha?: string }, id: string, ahora: string): Contenido {
  const formato = datos.formato ?? idea.formato ?? "reel"
  const red = FORMATOS[formato].red
  const redes = [...(red ? [red] : []), ...idea.redes.filter((r) => r !== red)].map((r) => ({ red: r }))
  return nuevoContenido({ titulo: idea.titulo, formato, fecha: datos.fecha, pilarId: idea.pilarId, ideaId: idea.id, redes }, id, ahora)
}

/** El mismo contenido para otro formato (un reel que va también a TikTok): todo copiado y sin fecha. */
export function reciclarContenido(c: Contenido, formato: Formato, id: string, ahora: string): Contenido {
  const red = FORMATOS[formato].red
  const estado: EstadoContenido = c.estado === "programado" || c.estado === "publicado" ? "listo" : c.estado
  return { ...c, id, formato, tipo: TIPO_POR_FORMATO[formato], titulo: `${c.titulo} · ${FORMATOS[formato].label}`, fecha: undefined, estado, redes: red ? [{ red }] : [], creadoEl: ahora, actualizadoEl: ahora }
}

/** La red principal de un contenido: la primera que tiene o la de su formato. */
export function redDeContenido(c: Pick<Contenido, "formato" | "redes">): SocialNetwork | undefined {
  return c.redes[0]?.red ?? FORMATOS[c.formato].red
}

// ───────────────────────── Avanzar por el trabajo ─────────────────────────

export const ORDEN_CONTENIDO: EstadoContenido[] = ESTADOS_CONTENIDO.map((e) => e.id)

export function siguienteEstado(e: EstadoContenido): EstadoContenido | null {
  return ORDEN_CONTENIDO[ORDEN_CONTENIDO.indexOf(e) + 1] ?? null
}

/** El botón que lo pasa a la siguiente etapa, dicho como lo diría ella. */
export const ACCION_AVANZAR: Record<EstadoContenido, string | null> = {
  guion: "Guion listo",
  grabar: "Ya está grabado",
  editar: "Ya está editado",
  listo: "Lo he programado",
  programado: "Ya está publicado",
  publicado: null,
}

/** Lo que toca hacer ahora con el contenido, en pocas palabras. */
export function queToca(c: Pick<Contenido, "estado">): string {
  switch (c.estado) {
    case "guion":
      return "Escribir el guion"
    case "grabar":
      return "Grabar"
    case "editar":
      return "Editar"
    case "listo":
      return "Programar o publicar"
    case "programado":
      return "Programado"
    case "publicado":
      return "Publicado"
  }
}

// ───────────────────────── Caption ─────────────────────────

/** Lo que admite cada red en el texto: el máximo, lo que se ve antes de «más» y cuántos hashtags (Instagram, 5 desde diciembre de 2025). */
export const LIMITES_CAPTION: Partial<Record<SocialNetwork, { max: number; visibles: number; hashtags?: number }>> = {
  instagram: { max: 2200, visibles: 125, hashtags: 5 },
  tiktok: { max: 4000, visibles: 80 },
  youtube: { max: 5000, visibles: 100 },
}

/** Los hashtags que hay escritos dentro de un texto. */
export function hashtagsDeTexto(texto: string): string[] {
  return [...new Set(texto.match(/#[\p{L}\p{N}_]+/gu) ?? [])]
}

/** Lo que se ve en una red antes del «más»: el gancho del caption tiene que caber ahí. */
export function previsualizacion(c: Pick<Contenido, "caption">, red: SocialNetwork): { visible: string; cortado: boolean } {
  const texto = c.caption.trim()
  const limite = LIMITES_CAPTION[red]?.visibles ?? texto.length
  return { visible: texto.slice(0, limite), cortado: texto.length > limite }
}

export type AvisoCaption = { id: string; texto: string }

/** Lo que no pasaría al publicar: textos largos, más hashtags de los que admite la red o la publicidad sin marcar. */
export function revisarCaption(c: Pick<Contenido, "caption" | "redes" | "publicidad">): AvisoCaption[] {
  const texto = c.caption.trim()
  const hashtags = hashtagsDeTexto(texto).length
  const avisos: AvisoCaption[] = []
  for (const { red } of c.redes) {
    const limite = LIMITES_CAPTION[red]
    if (!limite) continue
    if (texto.length > limite.max) avisos.push({ id: `max-${red}`, texto: `${socialLabel[red]} admite ${fmt.num(limite.max)} caracteres y llevas ${fmt.num(texto.length)}` })
    if (limite.hashtags && hashtags > limite.hashtags) avisos.push({ id: `hashtags-${red}`, texto: `${socialLabel[red]} admite ${limite.hashtags} hashtags y llevas ${hashtags}` })
  }
  if (c.publicidad) {
    const { ok, soloAd } = marcaDePublicidad(texto)
    if (!ok) avisos.push({ id: "publi", texto: soloAd ? "«#ad» no vale en español: pon #publi o «publicidad»" : "Es publicidad (regalo o afiliado): pon #publi o «publicidad»" })
  }
  return avisos
}

// ───────────────────────── Antes de publicar ─────────────────────────

export type SeccionContenido = "guion" | "caption" | "publicacion"

export type PasoPublicar = { id: string; label: string; hecho: boolean; seccion: SeccionContenido }

/** Lo que conviene tener antes de publicar, cada cosa con la parte de la página donde se hace. Poco y útil, no un formulario. */
export function antesDePublicar(c: Contenido): PasoPublicar[] {
  const avisos = revisarCaption(c)
  const pasos: PasoPublicar[] = []
  if (c.tipo === "video") pasos.push({ id: "guion", label: "Guion", hecho: textoPlano(c.guion) !== "", seccion: "guion" })
  pasos.push({ id: "caption", label: "Caption", hecho: c.caption.trim() !== "", seccion: "caption" })
  pasos.push({ id: "limites", label: "Dentro de lo que admite cada red", hecho: !avisos.some((a) => a.id !== "publi"), seccion: "caption" })
  if (c.publicidad) pasos.push({ id: "publi", label: "Marcado como publicidad", hecho: !avisos.some((a) => a.id === "publi"), seccion: "caption" })
  pasos.push({ id: "fecha", label: "Día y hora", hecho: !!c.fecha && c.fecha.length > 10, seccion: "publicacion" })
  return pasos
}

// ───────────────────────── Calendario ─────────────────────────

/** General: todo lo que tiene fecha. Solo contenido: lo que publica. */
export type AlcanceCalendario = "general" | "contenido"
export type OrigenCalendario = "todo" | "collabs" | "organico"

export const ALCANCES_CALENDARIO: { id: AlcanceCalendario; label: string }[] = [
  { id: "contenido", label: "Solo contenido" },
  { id: "general", label: "General" },
]

export const ORIGENES_CALENDARIO: { id: OrigenCalendario; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "collabs", label: "Collabs" },
  { id: "organico", label: "Orgánico" },
]

export type ClaseEntrada = "contenido" | "hito" | "tarea" | "cobro" | "fecha-clave"

/** Las columnas del tablero de producción: las del contenido propio y la revisión, que solo tienen las collabs. */
export type EtapaProduccion = EstadoContenido | "revision"

export const ETAPAS_PRODUCCION: { id: EtapaProduccion; label: string }[] = [
  { id: "guion", label: "Guion" },
  { id: "grabar", label: "Por grabar" },
  { id: "editar", label: "Por editar" },
  { id: "revision", label: "Con la marca" },
  { id: "listo", label: "Listo" },
  { id: "programado", label: "Programado" },
  { id: "publicado", label: "Publicado" },
]

export type RefEntrada =
  | { tipo: "contenido"; id: string }
  | { tipo: "pieza"; collabId: string; piezaId: string }
  | { tipo: "tarea"; id: string }
  | { tipo: "evento"; id: string }
  | { tipo: "fecha-clave"; id: string }

/** Una cosa del calendario, sea lo que sea por dentro, con lo que hace falta para pintarla y abrirla. */
export type EntradaCalendario = {
  id: string
  clase: ClaseEntrada
  /** De una collab o propio; lo general sin collab (sus tareas) no tiene. */
  origen?: "collab" | "organico"
  dia: string
  hora?: string
  titulo: string
  /** La campaña, el pilar o de qué es. */
  contexto?: string
  red?: SocialNetwork
  tint?: Tint
  estado?: { label: string; tone: StatusTone }
  etapa?: EtapaProduccion
  portadaUrl?: string
  /** Pactada con la marca: se mueve en la collab, no aquí. */
  fija: boolean
  hecha: boolean
  href?: string
  ref: RefEntrada
}

/** En qué etapa va una pieza de collab, con los hitos de su brief. */
export function etapaDePieza(p: Pieza): EtapaProduccion {
  if (p.estado === "en-revision" || p.estado === "cambios") return "revision"
  if (p.estado === "aprobado") return "listo"
  if (p.estado === "programado") return "programado"
  if (p.estado === "publicado" || p.estado === "resultados") return "publicado"
  const pendiente = (tipo: string) => hitosDePieza(p).some((h) => h.tipo === tipo && !h.hecho)
  if (pendiente("guion")) return "guion"
  if (pendiente("grabacion")) return "grabar"
  return "editar"
}

const horaDe = (fecha: string) => (fecha.length > 10 ? fecha.slice(11, 16) : undefined)

export function entradasDeContenidos(contenidos: Contenido[], pilares: Pilar[]): EntradaCalendario[] {
  return contenidos.flatMap((c) => {
    if (!c.fecha) return []
    const pilar = pilares.find((p) => p.id === c.pilarId)
    const estado = estadoDe(ESTADOS_CONTENIDO, c.estado)
    return [
      {
        id: `contenido-${c.id}`,
        clase: "contenido",
        origen: "organico",
        dia: soloFecha(c.fecha),
        hora: horaDe(c.fecha),
        titulo: c.titulo,
        contexto: pilar?.nombre,
        red: redDeContenido(c),
        tint: pilar?.tint,
        estado: { label: estado.label, tone: estado.tone },
        etapa: c.estado,
        portadaUrl: c.portadaUrl,
        fija: false,
        hecha: c.estado === "publicado",
        href: `/workspace/contenidos/${c.id}`,
        ref: { tipo: "contenido", id: c.id },
      },
    ]
  })
}

/** La publicación de cada pieza de sus collabs: la fecha la pactó con la marca. */
export function entradasDePiezas(collabs: Collab[], marcas: Marca[]): EntradaCalendario[] {
  return collabs
    .filter((c) => c.estado !== "cancelada")
    .flatMap((c) => {
      const marca = marcaDe(c, marcas)
      return c.piezas.map<EntradaCalendario>((p) => {
        const estado = estadoDe(ESTADOS_PIEZA, p.estado)
        return {
          id: `pieza-${p.id}`,
          clase: "contenido",
          origen: "collab",
          dia: soloFecha(p.publicacion),
          hora: horaDe(p.publicacion),
          titulo: `${marca.nombre} · ${tituloCorto(p)}`,
          contexto: c.campana,
          red: redDePieza(p),
          tint: c.tint,
          estado: { label: estado.label, tone: estado.tone },
          etapa: etapaDePieza(p),
          portadaUrl: p.portadaUrl ?? c.coverUrl,
          fija: true,
          hecha: p.estado === "publicado" || p.estado === "resultados",
          href: `/workspace/collabs/${c.id}/contenidos/${p.id}`,
          ref: { tipo: "pieza", collabId: c.id, piezaId: p.id },
        }
      })
    })
}

/** Lo demás del calendario general: los hitos de cada pieza (sin la publicación, que ya sale), los cobros y sus tareas con fecha. */
export function entradasGenerales({ collabs, marcas, tareas }: { collabs: Collab[]; marcas: Marca[]; tareas: Tarea[] }): EntradaCalendario[] {
  const activas = collabs.filter((c) => c.estado !== "cancelada")
  const hitos = eventosDeCollabs(activas, marcas)
    .filter((e) => e.tipo !== "publicacion")
    .map<EntradaCalendario>((e) => ({
      id: `evento-${e.id}`,
      clase: e.tipo === "cobro" ? "cobro" : "hito",
      origen: "collab",
      dia: e.fecha,
      titulo: e.titulo,
      contexto: e.contexto,
      tint: e.tint,
      fija: true,
      hecha: e.hecho,
      href: e.href,
      ref: { tipo: "evento", id: e.id },
    }))
  const deTareas = tareas.flatMap<EntradaCalendario>((t) => {
    const dia = diaDeTarea(t)
    // Las automáticas son los hitos del brief, que ya salen arriba.
    if (!dia || t.origen === "auto") return []
    const collab = activas.find((c) => c.id === collabIdDe(t.donde))
    return [{ id: `tarea-${t.id}`, clase: "tarea", origen: collab ? "collab" : undefined, dia, hora: horaDeTarea(t), titulo: t.titulo, contexto: collab?.campana, tint: collab?.tint, fija: false, hecha: estaCerrada(t), href: hrefDonde(t.donde), ref: { tipo: "tarea", id: t.id } }]
  })
  return [...hitos, ...deTareas]
}

export function entradasDeFechasClave(fechas: FechaClave[]): EntradaCalendario[] {
  return fechas.map((f) => ({ id: `fecha-${f.id}`, clase: "fecha-clave", dia: f.fecha, titulo: f.nombre, contexto: f.descripcion, fija: true, hecha: false, ref: { tipo: "fecha-clave", id: f.id } }))
}

/**
 * Lo que enseña el calendario. Solo contenido deja lo que se publica; Collabs, solo lo de las
 * collabs; Orgánico, todo lo que no es de una collab. Las fechas clave salen siempre.
 */
export function filtrarEntradas(entradas: EntradaCalendario[], { alcance, origen }: { alcance: AlcanceCalendario; origen: OrigenCalendario }): EntradaCalendario[] {
  return entradas.filter((e) => {
    if (e.clase === "fecha-clave") return true
    if (alcance === "contenido" && e.clase !== "contenido") return false
    if (origen === "collabs") return e.origen === "collab"
    if (origen === "organico") return e.origen !== "collab"
    return true
  })
}

const ORDEN_CLASE: Record<ClaseEntrada, number> = { "fecha-clave": 0, contenido: 1, hito: 2, tarea: 3, cobro: 4 }

/** Las entradas de cada día, en el orden en que se leen: fechas clave, lo que se publica por hora y lo demás. */
export function entradasPorDia(entradas: EntradaCalendario[]): Map<string, EntradaCalendario[]> {
  const dias = new Map<string, EntradaCalendario[]>()
  for (const e of entradas) dias.set(e.dia, [...(dias.get(e.dia) ?? []), e])
  for (const lista of dias.values())
    lista.sort((a, b) => ORDEN_CLASE[a.clase] - ORDEN_CLASE[b.clase] || (a.hora ?? "99").localeCompare(b.hora ?? "99") || a.titulo.localeCompare(b.titulo))
  return dias
}

/** Lo que se publica entre dos días (incluidos), de collabs y propio: el resumen de la cabecera del calendario. */
export function cuentaDePublicaciones(entradas: EntradaCalendario[], desde: string, hasta: string) {
  const enRango = entradas.filter((e) => e.clase === "contenido" && e.dia >= desde && e.dia <= hasta)
  return { collabs: enRango.filter((e) => e.origen === "collab").length, organico: enRango.filter((e) => e.origen === "organico").length }
}
