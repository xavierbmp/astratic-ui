// La agenda: los hitos de cada pieza, los cobros y las tareas con fecha, como eventos de un día.
import type { Collab, Marca, Tarea } from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"
import { hitosDePieza, marcaDe, tituloCorto, type TipoHito } from "@/lib/influencer/collabs"

export type TipoEvento = TipoHito | "cobro" | "tarea"

export type Evento = {
  id: string
  fecha: string
  titulo: string
  /** La marca, para saber de quién es de un vistazo. */
  contexto?: string
  tipo: TipoEvento
  tint?: Tint
  href: string
  hecho: boolean
}

export const TIPOS_EVENTO: Record<TipoEvento, string> = {
  guion: "Guion",
  grabacion: "Grabación",
  v1: "Entrega",
  publicacion: "Publicación",
  resultados: "Resultados",
  cobro: "Cobro",
  tarea: "Tarea",
}

export function eventosDeCollabs(collabs: Collab[], marcas: Marca[]): Evento[] {
  return collabs.flatMap((c) => {
    const marca = marcaDe(c, marcas)
    const hitos = c.piezas.flatMap((p) =>
      hitosDePieza(p).map<Evento>((h) => ({
        id: `${p.id}-${h.tipo}`,
        fecha: h.fecha,
        titulo: `${h.verbo} · ${tituloCorto(p)}`,
        contexto: marca.nombre,
        tipo: h.tipo,
        tint: c.tint,
        href: `/workspace/collabs/${c.id}/contenidos/${p.id}`,
        hecho: h.hecho,
      })),
    )
    const cobro: Evento[] = c.cobro.vencimiento
      ? [{ id: `${c.id}-cobro`, fecha: c.cobro.vencimiento, titulo: `Cobro · ${c.campana}`, contexto: marca.nombre, tipo: "cobro", tint: c.tint, href: `/workspace/collabs/${c.id}`, hecho: c.cobro.estado === "cobrado" }]
      : []
    return [...hitos, ...cobro]
  })
}

/** Las tareas manuales con fecha: las automáticas ya están como hitos. */
export function eventosDeTareas(tareas: Tarea[], collabs: Collab[]): Evento[] {
  return tareas
    .filter((t) => t.fechaLimite && t.origen === "manual")
    .map((t) => {
      const collab = t.relacion?.tipo === "collab" ? collabs.find((c) => c.id === t.relacion?.id) : undefined
      return {
        id: `tarea-${t.id}`,
        fecha: t.fechaLimite ?? "",
        titulo: t.titulo,
        tipo: "tarea",
        tint: collab?.tint,
        href: collab ? `/workspace/collabs/${collab.id}/tareas` : "/workspace/tareas",
        hecho: t.hecha,
      }
    })
}

export function eventosDelDia(eventos: Evento[], fecha: string) {
  return eventos.filter((e) => e.fecha === fecha).sort((a, b) => Number(a.hecho) - Number(b.hecho))
}
