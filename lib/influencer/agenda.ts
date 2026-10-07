// La agenda: los hitos de cada pieza, los cobros y las tareas con fecha, como eventos de un día.
import { ESTADOS_ABIERTOS, type Collab, type Marca, type Propuesta, type Tarea } from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"
import { hitosDePieza, marcaDe, tituloCorto, type TipoHito } from "@/lib/influencer/collabs"
import { collabIdDe, diaDeTarea, estaCerrada, hrefDonde } from "@/lib/influencer/tareas"

export type TipoEvento = TipoHito | "cobro" | "tarea" | "paso" | "ventana"

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
  paso: "Siguiente paso",
  ventana: "Empieza la ventana de publicación",
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
      ? [{ id: `${c.id}-cobro`, fecha: c.cobro.vencimiento, titulo: `Cobro · ${c.campana}`, contexto: marca.nombre, tipo: "cobro", tint: c.tint, href: `/workspace/collabs/${c.id}/facturacion`, hecho: c.cobro.estado === "cobrado" }]
      : []
    return [...hitos, ...cobro]
  })
}

/** Las tareas con fecha que no son hitos del brief (esos ya salen como hitos de cada pieza). */
export function eventosDeTareas(tareas: Tarea[], collabs: Collab[]): Evento[] {
  return tareas
    .filter((t) => t.origen !== "auto" && diaDeTarea(t))
    .map((t) => {
      const collabId = collabIdDe(t.donde)
      const collab = collabId ? collabs.find((c) => c.id === collabId) : undefined
      return {
        id: `tarea-${t.id}`,
        fecha: diaDeTarea(t) ?? "",
        titulo: t.titulo,
        tipo: "tarea",
        tint: collab?.tint,
        href: hrefDonde(t.donde) ?? "/workspace/tareas",
        hecho: estaCerrada(t),
      }
    })
}

/** Del pipeline: el siguiente paso de cada propuesta abierta y cuándo quiere publicar la marca. */
export function eventosDePropuestas(propuestas: Propuesta[], marcas: Marca[]): Evento[] {
  return propuestas
    .filter((p) => ESTADOS_ABIERTOS.includes(p.estado))
    .flatMap((p) => {
      const marca = marcaDe(p, marcas)
      const href = `/workspace/crm?registro=${p.id}`
      const paso: Evento[] = p.siguienteFecha ? [{ id: `${p.id}-paso`, fecha: p.siguienteFecha, titulo: `${marca.nombre} · ${p.siguientePaso ?? "Siguiente paso"}`, contexto: p.campana, tipo: "paso", tint: marca.tint, href, hecho: false }] : []
      const ventana: Evento[] = p.desde ? [{ id: `${p.id}-ventana`, fecha: p.desde, titulo: `${marca.nombre} · publicar`, contexto: p.campana, tipo: "ventana", tint: marca.tint, href, hecho: false }] : []
      return [...paso, ...ventana]
    })
}

export function eventosDelDia(eventos: Evento[], fecha: string) {
  return eventos.filter((e) => e.fecha === fecha).sort((a, b) => Number(a.hecho) - Number(b.hecho))
}
