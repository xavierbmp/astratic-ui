// Los ajustes de la tabla de collabs que cambia cada influencer: sus formatos de pieza, sus
// condiciones, cuántos días antes de publicar va el guion y qué apartados le pide a la marca. Y lo
// que se rellena solo en el alta a partir de ellos (el nombre de cada pieza, la fecha del guion, las
// fechas de la collab). El mismo esquema valida en el formulario y en la acción que los guarda.
import { z } from "zod"
import { LISTA_CAMPOS_BRIEF, LISTA_TIPOS_PIEZA, type AjustesCollabs, type CampoBrief, type FormatoPieza, type TipoCondicion } from "@/lib/influencer/modelo"
import { type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { sumarDias } from "@/lib/influencer/fechas"

export const FORMATOS_PIEZA_DE_SERIE: FormatoPieza[] = [
  { id: "reel", nombre: "Reel", tipo: "video", red: "instagram", conGuion: true },
  { id: "story", nombre: "Story", tipo: "video", red: "instagram", conGuion: false },
  { id: "post", nombre: "Post", tipo: "foto", red: "instagram", conGuion: false },
  { id: "carrusel", nombre: "Carrusel", tipo: "carrusel", red: "instagram", conGuion: false },
  { id: "tiktok", nombre: "TikTok", tipo: "video", red: "tiktok", conGuion: true },
  { id: "youtube", nombre: "Vídeo de YouTube", tipo: "video", red: "youtube", conGuion: true },
  { id: "ugc", nombre: "Vídeo UGC", tipo: "video", conGuion: true },
]

export const CONDICIONES_DE_SERIE: TipoCondicion[] = [
  { id: "exclusividad", nombre: "Exclusividad", conDias: true },
  { id: "derechos", nombre: "Derechos de uso", conDias: true },
  { id: "paid", nombre: "Publicidad pagada", conDias: true },
  { id: "enlace-bio", nombre: "Enlace en la bio", conDias: true },
  { id: "destacada", nombre: "Story destacada", conDias: true },
]

export const AJUSTES_COLLABS_DE_SERIE: AjustesCollabs = {
  formatos: FORMATOS_PIEZA_DE_SERIE,
  condiciones: CONDICIONES_DE_SERIE,
  diasGuion: 7,
  camposBrief: ["contacto", "campana", "fechas", "piezas", "materiales"],
}

/** Cuántos formatos o condiciones caben en la lista de una influencer. */
export const MAXIMO_EN_LISTA = 40

const mismoNombre = (a: string, b: string) => a.trim().toLocaleLowerCase("es") === b.trim().toLocaleLowerCase("es")
const sinRepetidos = <T extends { nombre: string }>(lista: T[]) => lista.every((x, i) => lista.findIndex((y) => mismoNombre(y.nombre, x.nombre)) === i)
const nombre = z.string().trim().min(1, "Ponle nombre").max(40, "Máximo 40 caracteres")

export const esquemaFormatoPieza = z.object({
  id: z.string().min(1).max(60),
  nombre,
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  red: z.enum(["instagram", "tiktok", "youtube", "linkedin"]).optional(),
  conGuion: z.boolean(),
})

export const esquemaTipoCondicion = z.object({ id: z.string().min(1).max(60), nombre, conDias: z.boolean() })

export const esquemaAjustesCollabs = z.object({
  formatos: z.array(esquemaFormatoPieza).max(MAXIMO_EN_LISTA, `Caben ${MAXIMO_EN_LISTA} formatos`).refine(sinRepetidos, "Hay dos formatos que se llaman igual"),
  condiciones: z.array(esquemaTipoCondicion).max(MAXIMO_EN_LISTA, `Caben ${MAXIMO_EN_LISTA} condiciones`).refine(sinRepetidos, "Hay dos condiciones que se llaman igual"),
  diasGuion: z.number().int().min(0, "Pon 0 o más días").max(90, "Como mucho, 90 días"),
  camposBrief: z.array(z.enum(LISTA_CAMPOS_BRIEF)).max(LISTA_CAMPOS_BRIEF.length),
})

/** Los de una influencer: lo que ha cambiado ella y, en lo que no ha tocado (`null`), lo de serie. */
export function ajustesDe(propios: Partial<AjustesCollabs> | null | undefined): AjustesCollabs {
  return { ...AJUSTES_COLLABS_DE_SERIE, ...propios }
}

/** El error si ya hay otro con ese nombre (sin contar `exceptoId`, el que se está cambiando). */
export function nombreRepetido(lista: { id: string; nombre: string }[], nombre: string, exceptoId?: string): string | undefined {
  return lista.some((x) => x.id !== exceptoId && mismoNombre(x.nombre, nombre)) ? "Ya hay uno que se llama así" : undefined
}

/** La lista con `elemento` añadido al final o, si ya estaba, cambiado en su sitio. */
export function guardarEnLista<T extends { id: string; nombre: string }>(lista: T[], elemento: T): T[] {
  const limpio = { ...elemento, nombre: elemento.nombre.trim() }
  return lista.some((x) => x.id === elemento.id) ? lista.map((x) => (x.id === elemento.id ? limpio : x)) : [...lista, limpio]
}

/** «Reel · Lanzamiento de otoño»: el contenido que es y, si ya tiene nombre, la campaña. */
export function nombreDePieza(formato: string, campana: string) {
  return campana.trim() ? `${formato} · ${campana.trim()}` : formato
}

/**
 * Cuándo va el guion de una pieza: `dias` antes de publicarla. Si ese día ya ha pasado (no da tiempo)
 * o la pieza aún no tiene día, ninguno: se pone a mano.
 */
export function fechaGuionPorDefecto(publicacion: string, dias: number, hoy: string) {
  if (!publicacion) return ""
  const fecha = sumarDias(publicacion, -dias)
  return fecha >= hoy.slice(0, 10) ? fecha : ""
}

type Contexto = { campana: string; diasGuion: number; hoy: string }

/** Una pieza nueva del formulario hecha con un formato: su tipo, su red, si pide guion y su nombre. */
export function piezaDeFormato(formato: FormatoPieza, publicacion: string, ctx: Contexto): PiezaPedidaForm {
  const requiereGuion = formato.tipo !== "texto" && formato.conGuion
  return {
    formato: formato.id,
    tipo: formato.tipo,
    red: formato.red,
    titulo: nombreDePieza(formato.nombre, ctx.campana),
    publicacion,
    indicaciones: "",
    requiereGuion,
    fechaGuion: requiereGuion ? fechaGuionPorDefecto(publicacion, ctx.diasGuion, ctx.hoy) : "",
    condiciones: [],
  }
}

/** Cambiar el formato de una pieza ya añadida: toma su tipo, su red y si pide guion; el nombre, solo si no lo escribió ella. */
export function cambiarFormatoDePieza(pieza: PiezaPedidaForm, formato: FormatoPieza, ctx: Contexto): PiezaPedidaForm {
  const nueva = piezaDeFormato(formato, pieza.publicacion, ctx)
  return { ...pieza, formato: formato.id, tipo: formato.tipo, red: formato.red, requiereGuion: nueva.requiereGuion, fechaGuion: nueva.fechaGuion, titulo: pieza.nombreManual ? pieza.titulo : nueva.titulo }
}

/** Cambiar el día de publicación: la fecha del guion le sigue mientras sea la de serie. */
export function cambiarPublicacion(pieza: PiezaPedidaForm, publicacion: string, ctx: Contexto): PiezaPedidaForm {
  const deSerie = !pieza.fechaGuion || pieza.fechaGuion === fechaGuionPorDefecto(pieza.publicacion, ctx.diasGuion, ctx.hoy)
  return { ...pieza, publicacion, fechaGuion: pieza.requiereGuion && deSerie ? fechaGuionPorDefecto(publicacion, ctx.diasGuion, ctx.hoy) : pieza.fechaGuion }
}

/** Al cambiar el nombre de la campaña, las piezas con el nombre de serie lo llevan. */
export function conCampana(piezas: PiezaPedidaForm[], formatos: FormatoPieza[], campana: string): PiezaPedidaForm[] {
  return piezas.map((p) => {
    const formato = formatos.find((f) => f.id === p.formato)
    return p.nombreManual || !formato ? p : { ...p, titulo: nombreDePieza(formato.nombre, campana) }
  })
}

/** Las fechas de la collab que salen de sus piezas: desde la primera entrega (guion o publicación) hasta la última publicación. */
export function fechasDeLasPiezas(piezas: PiezaPedidaForm[]): { desde: string; hasta: string } | null {
  const publicaciones = piezas.map((p) => p.publicacion).filter(Boolean).sort()
  if (!publicaciones.length) return null
  const guiones = piezas.flatMap((p) => (p.requiereGuion && p.fechaGuion ? [p.fechaGuion] : []))
  const desde = [...guiones, ...publicaciones].sort()[0]
  return { desde, hasta: publicaciones[publicaciones.length - 1] }
}

/** Los apartados del brief en su orden, sin repetir. */
export function camposEnOrden(campos: CampoBrief[]): CampoBrief[] {
  return LISTA_CAMPOS_BRIEF.filter((c) => campos.includes(c))
}
