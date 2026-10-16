// La biblioteca de contenidos: todas las piezas de todas las collabs como filas, con lo que hace falta
// para agruparlas, filtrarlas y ordenarlas (a quién le toca, cuánto llevan esperando, si van tarde) y
// el recordatorio que se le manda a la marca con lo que tiene pendiente de revisar.
import type { Collab, Marca, Pieza, TipoVersion, Version } from "@/lib/influencer/modelo"
import type { Evento } from "@/lib/influencer/agenda"
import { diasEsperando, marcaDe, nombreDeParte, parteInicial, partesDePieza, tituloCorto, ultimaVersion } from "@/lib/influencer/collabs"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"

/** A quién le toca mover la pieza: a ella, a la marca (está revisando) o a nadie (ya tiene resultados). */
export type TurnoPieza = "ti" | "marca" | "nadie"

export const TURNOS_PIEZA: Record<TurnoPieza, string> = { ti: "Te toca", marca: "Esperando a la marca", nadie: "Terminada" }

/** Los grupos de la vista de tarjetas, en el orden del trabajo. */
export type GrupoBiblioteca = "te-toca" | "en-revision" | "listo" | "publicado"

export const GRUPOS_BIBLIOTECA: { id: GrupoBiblioteca; label: string; descripcion: string }[] = [
  { id: "te-toca", label: "Preparando", descripcion: "En preparación o con cambios pedidos" },
  { id: "en-revision", label: "Esperando a la marca", descripcion: "Enviado a revisar" },
  { id: "listo", label: "Listo para publicar", descripcion: "Aprobado o programado" },
  { id: "publicado", label: "Publicado", descripcion: "Con o sin resultados" },
]

export type FilaPieza = {
  /** El de la pieza: es única en todo el workspace. */
  id: string
  pieza: Pieza
  collab: Collab
  turno: TurnoPieza
  grupo: GrupoBiblioteca
  /** Lo que más lleva una de sus partes esperando a la marca, en días. */
  esperando: number
  /** La fecha que manda: la de publicación o, si ya salió, la del día que salió. */
  fecha: string
  /** Sin publicar y con la fecha de publicación pasada. */
  tarde: boolean
  href: string
}

function grupoDe(p: Pieza): GrupoBiblioteca {
  if (p.publicada || p.estado === "publicado" || p.estado === "resultados") return "publicado"
  if (p.estado === "aprobado" || p.estado === "programado") return "listo"
  if (p.estado === "en-revision") return "en-revision"
  return "te-toca"
}

function turnoDe(p: Pieza): TurnoPieza {
  if (p.estado === "resultados") return "nadie"
  return partesDePieza(p).some((parte) => ultimaVersion(p[parte])?.estado === "en-revision") ? "marca" : "ti"
}

/** Una fila por pieza de cada collab que no esté cancelada. */
export function filasDePiezas(collabs: Collab[], hoy: string): FilaPieza[] {
  const dia = soloFecha(hoy)
  return collabs
    .filter((c) => c.estado !== "cancelada")
    .flatMap((c) =>
      c.piezas.map((p) => {
        const esperando = Math.max(0, ...partesDePieza(p).map((parte) => {
          const v = ultimaVersion(p[parte])
          return v ? diasEsperando(v, dia) : 0
        }))
        return {
          id: p.id,
          pieza: p,
          collab: c,
          turno: turnoDe(p),
          grupo: grupoDe(p),
          esperando,
          fecha: p.publicada?.fecha ?? p.publicacion,
          tarde: !p.publicada && diasEntre(dia, p.publicacion) < 0,
          href: `/workspace/collabs/${c.id}/contenidos/${p.id}`,
        }
      }),
    )
}

const ORDEN_GRUPO: Record<GrupoBiblioteca, number> = { "te-toca": 0, "en-revision": 1, listo: 2, publicado: 3 }

/** Lo que le toca primero (lo que va tarde arriba, después por fecha), lo que espera a la marca (lo que más lleva primero), lo listo y lo publicado (lo último arriba). */
export function ordenarPiezas(a: FilaPieza, b: FilaPieza) {
  const grupo = ORDEN_GRUPO[a.grupo] - ORDEN_GRUPO[b.grupo]
  if (grupo !== 0) return grupo
  if (a.grupo === "en-revision") return b.esperando - a.esperando
  if (a.grupo === "publicado") return b.fecha.localeCompare(a.fecha)
  return a.fecha.localeCompare(b.fecha)
}

/** Cada pieza como evento de la agenda, el día que se publica (o se publicó). */
export function eventosDePiezas(filas: FilaPieza[], marcas: Marca[]): Evento[] {
  return filas.map((f) => ({ id: f.id, fecha: f.fecha, titulo: `Publicación · ${tituloCorto(f.pieza)}`, contexto: marcaDe(f.collab, marcas).nombre, tipo: "publicacion", tint: f.collab.tint, href: f.href, hecho: !!f.pieza.publicada }))
}

/** Las versiones de una pieza que la marca tiene por revisar, con su enlace. */
function pendientesDeRevisar(p: Pieza) {
  return (["guion", "media"] as TipoVersion[]).flatMap((parte) =>
    p[parte].filter((v) => v.estado === "en-revision" && v.enlace).map((v) => ({ nombre: `${nombreDeParte(p, parte)} v${v.numero}`, token: v.enlace?.token ?? "" })),
  )
}

/**
 * El recordatorio para la marca con lo que tiene pendiente de revisar, por marca y con un enlace por
 * versión. Nada si ninguna de las piezas espera a la marca.
 */
export function recordatorioDeRevision({ filas, marcas, origen }: { filas: FilaPieza[]; marcas: Marca[]; origen: string }) {
  const porMarca = new Map<string, string[]>()
  for (const f of filas) {
    const lineas = pendientesDeRevisar(f.pieza).map((v) => `· ${f.pieza.titulo} (${v.nombre}): ${origen}/revisar/${v.token}`)
    if (!lineas.length) continue
    const marca = marcaDe(f.collab, marcas).nombre
    porMarca.set(marca, [...(porMarca.get(marca) ?? []), ...lineas])
  }
  if (!porMarca.size) return null
  return [...porMarca.entries()].map(([marca, lineas]) => `${marca}\nHola, te recuerdo que tienes pendiente de revisar:\n${lineas.join("\n")}\n¡Gracias!`).join("\n\n")
}

// ───────────────────────── Bandeja de revisión ─────────────────────────

/**
 * La bandeja de la revisión de contenido (Xavier, 2026-10-16: «en un mismo lugar ves rápido lo que
 * requiere atención»): cada contenido sin aprobar, en uno de tres montones.
 */
export type BandejaRevision = "feedback" | "en-revision" | "por-hacer"

export const BANDEJAS_REVISION: { id: BandejaRevision; label: string; descripcion: string; vacio: string }[] = [
  { id: "feedback", label: "Nuevo feedback", descripcion: "La marca ha comentado o pedido cambios y aún no lo has resuelto", vacio: "Ningún feedback pendiente" },
  { id: "en-revision", label: "En revisión", descripcion: "Enviado a la marca, sin respuesta todavía", vacio: "Nada esperando a la marca" },
  { id: "por-hacer", label: "Por hacer", descripcion: "Aún sin contenido enviado", vacio: "Nada por empezar" },
]

const notasAbiertas = (v: Version | null | undefined) => (v ? v.notas.filter((n) => !n.resuelta).length : 0)

/**
 * En qué montón va una pieza, mirando la parte que toca (el guion o el vídeo o las fotos) y su última
 * versión: con cambios pedidos o notas sin resolver, «Nuevo feedback» (también mientras prepara la
 * versión que los resuelve); enviada y sin notas, «En revisión»; sin nada enviado, «Por hacer». Nada
 * si ya está aprobada o publicada.
 */
export function bandejaDe(p: Pieza): { bandeja: BandejaRevision; parte: TipoVersion; notas: number } | null {
  if (p.publicada || p.estado === "aprobado" || p.estado === "programado" || p.estado === "publicado" || p.estado === "resultados") return null
  const parte = parteInicial(p)
  const versiones = p[parte]
  const v = ultimaVersion(versiones)
  const anterior = versiones.length > 1 ? versiones[versiones.length - 2] : null
  if (!v) return { bandeja: "por-hacer", parte, notas: 0 }
  if (v.estado === "aprobada") return null
  if (v.estado === "cambios" || (v.estado === "en-revision" && notasAbiertas(v) > 0)) return { bandeja: "feedback", parte, notas: notasAbiertas(v) }
  if (v.estado === "borrador" && anterior?.estado === "cambios") return { bandeja: "feedback", parte, notas: notasAbiertas(anterior) }
  if (v.estado === "en-revision") return { bandeja: "en-revision", parte, notas: 0 }
  return { bandeja: "por-hacer", parte, notas: 0 }
}

export type FilaBandeja = FilaPieza & { bandeja: BandejaRevision; parte: TipoVersion; notas: number }

/**
 * Los tres montones con sus piezas: el feedback y lo por hacer por fecha de publicación (lo que va
 * tarde arriba) y lo que espera a la marca, lo que más lleva esperando primero.
 */
export function bandejaRevision(collabs: Collab[], hoy: string): Record<BandejaRevision, FilaBandeja[]> {
  const montones: Record<BandejaRevision, FilaBandeja[]> = { feedback: [], "en-revision": [], "por-hacer": [] }
  for (const f of filasDePiezas(collabs.filter((c) => c.estado !== "cerrada"), hoy)) {
    const b = bandejaDe(f.pieza)
    if (b) montones[b.bandeja].push({ ...f, ...b })
  }
  montones.feedback.sort((a, b) => a.fecha.localeCompare(b.fecha))
  montones["por-hacer"].sort((a, b) => a.fecha.localeCompare(b.fecha))
  montones["en-revision"].sort((a, b) => b.esperando - a.esperando || a.fecha.localeCompare(b.fecha))
  return montones
}
