// La revisión de un contenido por alguien de fuera (un cliente, una marca), como en Feedback: las
// versiones con sus archivos, las notas ancladas a un sitio de la pieza y la conversación. Solo
// tipos y formato; lo pintan `Conversacion` y `VisorMedia`.

/**
 * Dónde va una nota: una cita del texto con lo que la rodea (para encontrarla aunque se repita), un
 * segundo del vídeo (y el punto del fotograma, en %) o un punto de una foto (en %).
 */
export type Ancla =
  | { tipo: "texto"; cita: string; antes?: string; despues?: string }
  | { tipo: "segundo"; segundo: number; x?: number; y?: number }
  | { tipo: "punto"; x: number; y: number; /** Qué foto del carrusel, desde 0. */ imagen: number }

/** Un mensaje del hilo, de un lado o del otro (`L`: quien hace la pieza y quien la revisa). */
export type Mensaje<L extends string = string> = { id: string; autor: string; lado: L; el: string; texto: string }

/** Lo que pide quien revisa sobre una versión: se resuelve en la siguiente. */
export type NotaRevision<L extends string = string> = {
  id: string
  autor: string
  el: string
  texto: string
  ancla?: Ancla
  resuelta: boolean
  /** Lo que se contestan sobre esta nota. */
  respuestas: Mensaje<L>[]
}

/** Un archivo de una versión: el vídeo o cada foto de un carrusel. */
export type ArchivoRevision = {
  nombre: string
  tamano: number
  /** La foto o la portada del vídeo. En un portal, un enlace firmado que caduca. */
  url?: string
  /** El vídeo para reproducirlo. */
  videoUrl?: string
  /** Solo vídeo, en segundos. */
  duracion?: number
}

/** Lo que el visor necesita de una versión: su número, su fecha, sus archivos y sus notas. */
export type VersionRevision = { id: string; numero: number; creadaEl: string; archivos?: ArchivoRevision[]; notas: NotaRevision[] }

/** Un segundo como «1:05». */
export function segundos(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
}
