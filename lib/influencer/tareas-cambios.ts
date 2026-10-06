// Los cambios sobre la lista de tareas: crear, guardar (dejando constancia en su actividad),
// hacer una que se repite (sale la siguiente), borrar con sus subtareas, deshacer y ordenar a
// mano. Puro: el proveedor de la app los aplica a su estado; en el portal serán server actions.
import type { Tarea } from "@/lib/influencer/modelo"
import { conEntrada, conEstado, describirCambios, nuevaTarea, siguienteOrden, siguienteRepeticion, type ContextoTareas } from "@/lib/influencer/tareas"

export type Reloj = { hoy: string; ahora: string; id: (prefijo: string) => string }

/** Añade tareas al final de su lista a mano (las subtareas, detrás de su madre). */
export function crearTareas(tareas: Tarea[], nuevas: Tarea[]): Tarea[] {
  let orden = siguienteOrden(tareas)
  return [...tareas, ...nuevas.map((t) => ({ ...t, orden: t.orden || orden++ }))]
}

/** Una tarea con sus subtareas, todas en el mismo sitio. */
export function conSubtareas(madre: Tarea, titulos: string[], reloj: Reloj): Tarea[] {
  return [madre, ...titulos.map((titulo) => nuevaTarea({ titulo, donde: madre.donde, padreId: madre.id, origen: madre.origen }, reloj.id("t"), reloj.ahora))]
}

/**
 * Guarda una tarea cambiada: apunta en su actividad lo que cambió y, si se acaba de hacer una que
 * se repite, crea la siguiente con su fecha (la hecha deja de repetirse, para no duplicarla al
 * reabrirla). Devuelve también la siguiente, para avisar.
 */
export function guardarTarea(tareas: Tarea[], cambiada: Tarea, ctx: ContextoTareas, reloj: Reloj): { tareas: Tarea[]; siguiente?: Tarea } {
  const antes = tareas.find((t) => t.id === cambiada.id)
  if (!antes) return { tareas }
  let guardada: Tarea = { ...cambiada, editadaEl: reloj.ahora }
  for (const texto of describirCambios(antes, cambiada, ctx)) guardada = conEntrada(guardada, { tipo: "cambio", texto, el: reloj.ahora }, reloj.id("a"))
  const recienHecha = antes.estado !== "hecha" && guardada.estado === "hecha"
  const siguiente = recienHecha ? siguienteRepeticion(guardada, reloj.hoy, reloj.id("t")) : null
  if (siguiente) guardada = { ...guardada, repetir: undefined }
  const lista = tareas.map((t) => (t.id === guardada.id ? guardada : t))
  return siguiente ? { tareas: crearTareas(lista, [{ ...siguiente, orden: 0 }]), siguiente } : { tareas: lista }
}

/** Marca hecha o la vuelve a abrir (una cancelada se reabre). */
export function alternarHecha(tareas: Tarea[], id: string, ctx: ContextoTareas, reloj: Reloj) {
  const t = tareas.find((x) => x.id === id)
  if (!t) return { tareas }
  return guardarTarea(tareas, conEstado(t, t.estado === "hecha" || t.estado === "cancelada" ? "por-hacer" : "hecha", reloj.ahora), ctx, reloj)
}

/** Las tareas y todas sus subtareas, a cualquier profundidad. */
function conDescendientes(tareas: Tarea[], ids: string[]) {
  const todas = new Set(ids)
  let creciendo = true
  while (creciendo) {
    creciendo = false
    for (const t of tareas) {
      if (t.padreId && todas.has(t.padreId) && !todas.has(t.id)) {
        todas.add(t.id)
        creciendo = true
      }
    }
  }
  return todas
}

/** Borra tareas con sus subtareas. Devuelve las borradas para poder deshacer. */
export function borrarTareas(tareas: Tarea[], ids: string[]): { tareas: Tarea[]; borradas: Tarea[] } {
  const fuera = conDescendientes(tareas, ids)
  return { tareas: tareas.filter((t) => !fuera.has(t.id)), borradas: tareas.filter((t) => fuera.has(t.id)) }
}

/** Deshace un borrado: vuelven tal cual estaban, en su sitio de la lista a mano. */
export function restaurarTareas(tareas: Tarea[], borradas: Tarea[]): Tarea[] {
  const ya = new Set(tareas.map((t) => t.id))
  return [...tareas, ...borradas.filter((t) => !ya.has(t.id))].sort((a, b) => a.orden - b.orden)
}

/** Una copia, sin hacer y con sus subtareas copiadas también. */
export function duplicarTarea(tareas: Tarea[], id: string, reloj: Reloj): { tareas: Tarea[]; copia?: Tarea } {
  const original = tareas.find((t) => t.id === id)
  if (!original) return { tareas }
  const copia: Tarea = { ...conEstado(original, "por-hacer", reloj.ahora), id: reloj.id("t"), titulo: `${original.titulo} (copia)`, actividad: [], creadaEl: reloj.ahora, editadaEl: undefined, orden: 0 }
  const hijas = tareas.filter((t) => t.padreId === id).map((h) => ({ ...conEstado(h, "por-hacer", reloj.ahora), id: reloj.id("t"), padreId: copia.id, actividad: [], creadaEl: reloj.ahora, orden: 0 }))
  return { tareas: crearTareas(tareas, [copia, ...hijas]), copia }
}

/**
 * Coloca una tarea a mano en una lista (`ids`, en su orden de pantalla): queda entre sus nuevos
 * vecinos con un `orden` intermedio, sin tocar el resto.
 */
export function colocarTarea(tareas: Tarea[], id: string, ids: string[]): Tarea[] {
  const i = ids.indexOf(id)
  if (i === -1) return tareas
  const ordenDe = (x?: string) => tareas.find((t) => t.id === x)?.orden
  const antes = ordenDe(ids[i - 1])
  const despues = ordenDe(ids[i + 1])
  const orden = antes === undefined && despues === undefined ? 0 : antes === undefined ? (despues ?? 0) - 1 : despues === undefined ? antes + 1 : (antes + despues) / 2
  return tareas.map((t) => (t.id === id ? { ...t, orden } : t))
}

export function comentarTarea(tareas: Tarea[], id: string, texto: string, reloj: Reloj): Tarea[] {
  return tareas.map((t) => (t.id === id ? conEntrada(t, { tipo: "comentario", texto: texto.trim(), el: reloj.ahora }, reloj.id("a")) : t))
}
