// Los formatos con los que se añaden piezas: los de serie y los que cada influencer se crea o cambia
// («Mención en la bio», «Newsletter»). Ninguna forma de trabajar se queda fuera: si no está, se crea
// desde el propio formulario. El mismo esquema valida en el formulario y en la acción que los guarda.
import { z } from "zod"
import { LISTA_TIPOS_PIEZA, type FormatoPieza } from "@/lib/influencer/modelo"
import type { PiezaPedidaForm } from "@/lib/influencer/formularios"

export const FORMATOS_PIEZA_DE_SERIE: FormatoPieza[] = [
  { id: "reel", nombre: "Reel", tipo: "video", red: "instagram" },
  { id: "story", nombre: "Story", tipo: "video", red: "instagram" },
  { id: "post", nombre: "Post", tipo: "foto", red: "instagram" },
  { id: "carrusel", nombre: "Carrusel", tipo: "carrusel", red: "instagram" },
  { id: "tiktok", nombre: "TikTok", tipo: "video", red: "tiktok" },
  { id: "youtube", nombre: "Vídeo de YouTube", tipo: "video", red: "youtube" },
  { id: "ugc", nombre: "Vídeo UGC", tipo: "video" },
  { id: "texto", nombre: "Texto", tipo: "texto" },
]

/** Cuántos formatos caben en la lista de una influencer. */
export const MAXIMO_FORMATOS = 40

export const esquemaFormatoPieza = z.object({
  id: z.string().min(1).max(60),
  nombre: z.string().trim().min(1, "Ponle nombre").max(40, "Máximo 40 caracteres"),
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  red: z.enum(["instagram", "tiktok", "youtube", "linkedin"]).optional(),
})

const mismoNombre = (a: string, b: string) => a.trim().toLocaleLowerCase("es") === b.trim().toLocaleLowerCase("es")

export const esquemaFormatosPieza = z
  .array(esquemaFormatoPieza)
  .max(MAXIMO_FORMATOS, `Caben ${MAXIMO_FORMATOS} formatos`)
  .refine((lista) => lista.every((f, i) => lista.findIndex((g) => mismoNombre(g.nombre, f.nombre)) === i), "Hay dos formatos que se llaman igual")

/** Los de una influencer: los suyos si ya ha tocado la lista; si no (`null`), los de serie. */
export function formatosDe(propios: FormatoPieza[] | null | undefined): FormatoPieza[] {
  return propios ?? FORMATOS_PIEZA_DE_SERIE
}

/** El error si ya hay otro formato con ese nombre (sin contar `exceptoId`, el que se está cambiando). */
export function nombreRepetido(formatos: FormatoPieza[], nombre: string, exceptoId?: string): string | undefined {
  return formatos.some((f) => f.id !== exceptoId && mismoNombre(f.nombre, nombre)) ? "Ya tienes un formato que se llama así" : undefined
}

/** La lista con `formato` añadido al final o, si ya estaba, cambiado en su sitio. */
export function guardarFormato(formatos: FormatoPieza[], formato: FormatoPieza): FormatoPieza[] {
  const limpio = { ...formato, nombre: formato.nombre.trim() }
  return formatos.some((f) => f.id === formato.id) ? formatos.map((f) => (f.id === formato.id ? limpio : f)) : [...formatos, limpio]
}

export function quitarFormato(formatos: FormatoPieza[], id: string): FormatoPieza[] {
  return formatos.filter((f) => f.id !== id)
}

/** Una pieza nueva del formulario hecha con un formato: su tipo, su red y, de nombre, el del formato. */
export function piezaDeFormato(formato: FormatoPieza, publicacion: string): PiezaPedidaForm {
  return { formato: formato.id, tipo: formato.tipo, red: formato.red, titulo: formato.nombre, publicacion, indicaciones: "" }
}

/**
 * Cambiar el formato de una pieza ya añadida: toma su tipo y su red y, si el nombre seguía siendo el
 * del formato anterior (o estaba vacío), también el nombre. Lo que ella haya escrito no se pisa.
 */
export function cambiarFormatoDePieza(pieza: PiezaPedidaForm, formato: FormatoPieza, anterior: FormatoPieza | undefined): PiezaPedidaForm {
  const nombreDeSerie = !pieza.titulo.trim() || (anterior !== undefined && mismoNombre(pieza.titulo, anterior.nombre))
  return { ...pieza, formato: formato.id, tipo: formato.tipo, red: formato.red, titulo: nombreDeSerie ? formato.nombre : pieza.titulo }
}
