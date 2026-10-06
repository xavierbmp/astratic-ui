// La portada de Collabs: lo que está en marcha, lo que hay que entregar esta semana, lo que espera a
// la marca, lo que falta por cobrar y las tareas de hoy y de los próximos días. Sin React.
import { COLLABS_ACTIVAS, type Collab, type Marca, type Tarea, type TipoVersion } from "@/lib/influencer/modelo"
import { diasEsperando, hitosDePieza, marcaDe, nombreDeParte } from "@/lib/influencer/collabs"
import { ordenarTareas } from "@/lib/influencer/tareas"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"

/** Días hacia delante que cuentan como «esta semana» y como «próximas». */
export const DIAS_PROXIMOS = 7

const activas = (collabs: Collab[]) => collabs.filter((c) => COLLABS_ACTIVAS.includes(c.estado))
const loSuyo = (c: Collab) => c.importeNeto ?? c.importe

/** Las cuatro cifras de arriba. */
export function cifrasCollabs(collabs: Collab[], hoy: string) {
  const dia = soloFecha(hoy)
  const vivas = activas(collabs)
  const enMarcha = vivas.filter((c) => c.estado === "en-curso" || c.estado === "por-empezar")
  const hitos = vivas.flatMap((c) => c.piezas.flatMap((p) => hitosDePieza(p).filter((h) => !h.hecho)))
  const esperando = enRevision(vivas, [], dia)
  const pendientes = vivas.filter((c) => c.cobro.estado !== "cobrado")
  return {
    enMarcha: enMarcha.length,
    piezasPorEntregar: enMarcha.flatMap((c) => c.piezas).filter((p) => !p.publicada).length,
    entregasSemana: hitos.filter((h) => diasEntre(dia, h.fecha) <= DIAS_PROXIMOS).length,
    vencidas: hitos.filter((h) => diasEntre(dia, h.fecha) < 0).length,
    esperando: esperando.length,
    esperaMasLarga: Math.max(0, ...esperando.map((e) => e.dias)),
    porCobrar: pendientes.reduce((a, c) => a + loSuyo(c), 0),
    vencido: pendientes.filter((c) => c.cobro.estado === "vencido").reduce((a, c) => a + loSuyo(c), 0),
  }
}

export type EnRevision = { collabId: string; piezaId: string; titulo: string; parte: TipoVersion; nombreParte: string; version: number; dias: number; marca?: string }

/** Lo que espera a la marca: cada versión en revisión, la que más lleva primero. */
export function enRevision(collabs: Collab[], marcas: Marca[], hoy: string): EnRevision[] {
  return collabs
    .flatMap((c) =>
      c.piezas.flatMap((p) =>
        (["guion", "media"] as TipoVersion[]).flatMap((parte) =>
          p[parte]
            .filter((v) => v.estado === "en-revision")
            .map((v) => ({ collabId: c.id, piezaId: p.id, titulo: p.titulo, parte, nombreParte: nombreDeParte(p, parte), version: v.numero, dias: diasEsperando(v, hoy), marca: marcas.length ? marcaDe(c, marcas).nombre : undefined })),
        ),
      ),
    )
    .sort((a, b) => b.dias - a.dias)
}

/** Las de hoy: lo que vence hoy y lo que ya venció, sin hacer. */
export function tareasDeHoy(tareas: Tarea[], hoy: string) {
  const dia = soloFecha(hoy)
  return ordenarTareas(tareas.filter((t) => !t.hecha && t.fechaLimite && diasEntre(dia, t.fechaLimite) <= 0))
}

/** Las próximas: lo que vence en los próximos días, por fecha. */
export function proximasTareas(tareas: Tarea[], hoy: string, dias = DIAS_PROXIMOS) {
  const dia = soloFecha(hoy)
  return ordenarTareas(
    tareas.filter((t) => {
      if (t.hecha || !t.fechaLimite) return false
      const faltan = diasEntre(dia, t.fechaLimite)
      return faltan > 0 && faltan <= dias
    }),
  )
}

/** «Hoy», «Mañana», «jue 8» o «3 oct»: cómo se dice una fecha cercana en una lista de tareas. */
export function fechaCercana(fecha: string, hoy: string) {
  const faltan = diasEntre(soloFecha(hoy), fecha)
  if (faltan === 0) return "Hoy"
  if (faltan === 1) return "Mañana"
  if (faltan === -1) return "Ayer"
  if (faltan > 1 && faltan < 7) return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric" }).format(new Date(`${fecha}T12:00:00`)).replace(",", "")
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(`${fecha}T12:00:00`)).replace(".", "")
}
