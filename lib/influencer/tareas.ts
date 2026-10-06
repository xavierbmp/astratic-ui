// Lógica de las tareas: en qué grupo caen según la fecha, cómo se ordenan y a qué pertenecen.
import type { Collab, Marca, Propuesta, RelacionTarea, Tarea } from "@/lib/influencer/modelo"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"

export type GrupoTarea = "vencidas" | "hoy" | "semana" | "despues" | "sin-fecha" | "hechas"

export const GRUPOS_TAREA: { id: GrupoTarea; label: string }[] = [
  { id: "vencidas", label: "Vencidas" },
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "despues", label: "Más adelante" },
  { id: "sin-fecha", label: "Sin fecha" },
  { id: "hechas", label: "Hechas" },
]

export function grupoDeTarea(t: Tarea, hoy: string): GrupoTarea {
  if (t.hecha) return "hechas"
  if (!t.fechaLimite) return "sin-fecha"
  const dias = diasEntre(hoy, t.fechaLimite)
  if (dias < 0) return "vencidas"
  if (dias === 0) return "hoy"
  if (dias <= 7) return "semana"
  return "despues"
}

export type TonoFecha = "vencida" | "hoy" | "normal"

export function tonoDeFecha(fecha: string | undefined, hoy: string): TonoFecha {
  if (!fecha) return "normal"
  const dias = diasEntre(hoy, fecha)
  return dias < 0 ? "vencida" : dias === 0 ? "hoy" : "normal"
}

/** Pendientes primero por fecha (las sin fecha al final); las hechas, al final de todo. */
export function ordenarTareas(tareas: Tarea[]) {
  return [...tareas].sort((a, b) => {
    if (a.hecha !== b.hecha) return a.hecha ? 1 : -1
    if (!a.fechaLimite || !b.fechaLimite) return a.fechaLimite ? -1 : b.fechaLimite ? 1 : 0
    return a.fechaLimite.localeCompare(b.fechaLimite)
  })
}

export function mismaRelacion(a?: RelacionTarea, b?: RelacionTarea) {
  if (!a || !b) return !a && !b
  return a.tipo === b.tipo && a.id === b.id
}

export function tareasDe(tareas: Tarea[], relacion: RelacionTarea) {
  return tareas.filter((t) => mismaRelacion(t.relacion, relacion))
}

export type Contexto = { collabs: Collab[]; propuestas: Propuesta[]; marcas: Marca[] }

/** «Lumea Skin · Rutina de noche»: a qué pertenece la tarea, para listas mezcladas. */
export function contextoDeTarea(t: Tarea, ctx: Contexto): string | undefined {
  if (!t.relacion) return undefined
  const registro = t.relacion.tipo === "collab" ? ctx.collabs.find((c) => c.id === t.relacion?.id) : ctx.propuestas.find((p) => p.id === t.relacion?.id)
  if (!registro) return undefined
  const marca = ctx.marcas.find((m) => m.id === registro.marcaId)
  return `${marca?.nombre ?? ""} · ${registro.campana}`
}

export function hrefDeTarea(t: Tarea): string | undefined {
  if (!t.relacion) return undefined
  return t.relacion.tipo === "collab" ? `/workspace/collabs/${t.relacion.id}/tareas` : `/workspace/propuestas?propuesta=${t.relacion.id}`
}

/** Pendientes que vencen hoy o ya vencieron: la insignia de la barra inferior y de la sidebar. */
export function tareasUrgentes(tareas: Tarea[], hoy: string) {
  return tareas.filter((t) => !t.hecha && t.fechaLimite && diasEntre(soloFecha(hoy), t.fechaLimite) <= 0).length
}

let contador = 0

/** Identificador para lo que se crea en pantalla; en el portal lo pone la base de datos. */
export function idNuevo(prefijo: string) {
  contador += 1
  return `${prefijo}-${Date.now().toString(36)}-${contador}`
}
