// Las sugerencias de cambio de la marca sobre una versión (en el guion, sobre el texto; en el vídeo o
// las fotos, sobre el copy): cuáles hay, cómo se pintan, decidirlas y dónde caen las aceptadas, que
// van a la versión siguiente (la enviada no se edita).
import type { DecisionSugerencia, Nota, Version } from "@/lib/influencer/modelo"
import { aplicarCambios, type CambioTexto } from "@/lib/revision-sugerencias"

/** El cambio que propone una nota (su cita, con lo que la rodea, y lo que pone), o nada si solo comenta. */
export function cambioDeNota(n: Nota): CambioTexto | null {
  if (!n.sugerencia || n.ancla?.tipo !== "texto") return null
  return { cita: n.ancla.cita, antes: n.ancla.antes, despues: n.ancla.despues, poner: n.sugerencia.poner }
}

/** Una sugerencia que nadie ha decidido: quien revisa aún la puede cambiar o retirar. */
export const sugerenciaAbierta = (n: Nota) => Boolean(n.sugerencia && !n.sugerencia.decision)

/** Las sugerencias de una versión para pintarlas en el texto, con el número con el que salen en la conversación. */
export function marcasDeSugerencias(notas: Nota[]) {
  return notas.flatMap((n, i) => {
    const cambio = cambioDeNota(n)
    return cambio ? [{ id: n.id, numero: i + 1, cambio, estado: n.sugerencia?.decision ?? ("pendiente" as const) }] : []
  })
}

/** Las notas de comentario anclado al texto (no las sugerencias), para marcarlas en el texto. */
export function marcasDeCitas(notas: Nota[]) {
  return notas.flatMap((n, i) => (n.ancla?.tipo === "texto" && !n.sugerencia ? [{ id: n.id, numero: i + 1, cita: n.ancla.cita, antes: n.ancla.antes, despues: n.ancla.despues, resuelta: n.resuelta }] : []))
}

/** Las sugerencias aceptadas de una versión, en el orden en que se hicieron. */
export function aceptadasDe(v: Version): CambioTexto[] {
  return v.notas.flatMap((n) => {
    const cambio = n.sugerencia?.decision === "aceptada" ? cambioDeNota(n) : null
    return cambio ? [cambio] : []
  })
}

/** El copy de la versión siguiente: el de esta con lo aceptado de la marca. */
export function copySiguiente(v: Version) {
  return aplicarCambios(v.copy ?? "", aceptadasDe(v)).texto
}

/** El borrador que sigue a una versión, donde caen los cambios que se aceptan, si ya existe. */
export function borradorSiguiente(versiones: Version[], v: Version) {
  return versiones.filter((x) => x.numero > v.numero && x.estado === "borrador").at(-1) ?? null
}

/** Una sugerencia decidida queda resuelta con su decisión. */
export function decidirSugerencia(n: Nota, decision: DecisionSugerencia): Nota {
  return n.sugerencia ? { ...n, resuelta: true, sugerencia: { ...n.sugerencia, decision } } : n
}
