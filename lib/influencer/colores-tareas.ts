// Los colores de las tareas, que elige ella: por urgencia (vencida, hoy, los próximos días, más
// adelante, sin fecha), por prioridad, por su primera etiqueta, por la marca de su campaña o sin
// color. De serie, por urgencia: lo vencido en rojo y lo de hoy y los tres días siguientes en verde.
// Las fechas de las listas siguen siempre los colores de la urgencia. Pura: sin React.
import type { EtiquetaTarea, PrioridadTarea, Tarea } from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"
import { collabDe, diaDeTarea, estaCerrada, estaVencida, type ContextoTareas } from "@/lib/influencer/tareas"
import { diasEntre, soloFecha } from "@/lib/filtros/fechas"

export type ColorTarea = "rojo" | "naranja" | "amarillo" | "verde" | "azul" | "morado" | "rosa" | "gris" | "ninguno"

export const COLORES_TAREA: { id: ColorTarea; label: string }[] = [
  { id: "rojo", label: "Rojo" },
  { id: "naranja", label: "Naranja" },
  { id: "amarillo", label: "Amarillo" },
  { id: "verde", label: "Verde" },
  { id: "azul", label: "Azul" },
  { id: "morado", label: "Morado" },
  { id: "rosa", label: "Rosa" },
  { id: "gris", label: "Gris" },
  { id: "ninguno", label: "Sin color" },
]

export type TramoUrgencia = "vencida" | "hoy" | "proximos" | "despues" | "sin-fecha"

export const TRAMOS_URGENCIA: { id: TramoUrgencia; label: string }[] = [
  { id: "vencida", label: "Vencida" },
  { id: "hoy", label: "Hoy" },
  { id: "proximos", label: "Próximos días" },
  { id: "despues", label: "Más adelante" },
  { id: "sin-fecha", label: "Sin fecha" },
]

export type ColorearPor = "urgencia" | "prioridad" | "etiqueta" | "marca" | "ninguno"

export const OPCIONES_COLOREAR: { id: ColorearPor; label: string }[] = [
  { id: "urgencia", label: "Por urgencia" },
  { id: "prioridad", label: "Por prioridad" },
  { id: "etiqueta", label: "Por su primera etiqueta" },
  { id: "marca", label: "Por la marca de su campaña" },
  { id: "ninguno", label: "Sin color" },
]

export type ColoresTareas = {
  por: ColorearPor
  urgencia: Record<TramoUrgencia, ColorTarea>
  /** Cuántos días después de hoy cuentan como «Próximos días». */
  diasProximos: number
  prioridad: Record<PrioridadTarea, ColorTarea>
}

export const MAX_DIAS_PROXIMOS = 30

export const COLORES_TAREAS_DE_SERIE: ColoresTareas = {
  por: "urgencia",
  urgencia: { vencida: "rojo", hoy: "verde", proximos: "verde", despues: "ninguno", "sin-fecha": "ninguno" },
  diasProximos: 3,
  prioridad: { urgente: "rojo", alta: "naranja", normal: "ninguno", baja: "gris" },
}

/** Lo guardado encima de lo de serie: si mañana hay un tramo nuevo, sale con su color de serie. */
export function conColoresDeSerie(guardado?: Partial<ColoresTareas> | null): ColoresTareas {
  const s = COLORES_TAREAS_DE_SERIE
  if (!guardado) return s
  const dias = Number(guardado.diasProximos)
  return {
    por: OPCIONES_COLOREAR.some((o) => o.id === guardado.por) ? (guardado.por ?? s.por) : s.por,
    urgencia: { ...s.urgencia, ...guardado.urgencia },
    diasProximos: Number.isInteger(dias) && dias >= 1 && dias <= MAX_DIAS_PROXIMOS ? dias : s.diasProximos,
    prioridad: { ...s.prioridad, ...guardado.prioridad },
  }
}

/** En qué tramo de urgencia cae un día: antes de hoy, hoy, dentro de los próximos `diasProximos` o después. */
export function tramoDeDia(dia: string | undefined, hoy: string, diasProximos: number): TramoUrgencia {
  if (!dia) return "sin-fecha"
  const faltan = diasEntre(soloFecha(hoy), soloFecha(dia))
  if (faltan < 0) return "vencida"
  if (faltan === 0) return "hoy"
  return faltan <= diasProximos ? "proximos" : "despues"
}

/** El tramo de una tarea: vencida si ya pasó su fecha límite o su fecha (como en las listas); si no, el de cuándo toca. */
export function tramoDeTarea(t: Tarea, hoy: string, diasProximos: number): TramoUrgencia {
  if (estaVencida(t, hoy)) return "vencida"
  const tramo = tramoDeDia(diaDeTarea(t), hoy, diasProximos)
  // Una que empezó antes y aún no ha vencido (dura varios días o su límite es más tarde) toca hoy.
  return tramo === "vencida" ? "hoy" : tramo
}

/** El color de una tarea: uno de la paleta o, por etiqueta o por marca, el tinte de esa etiqueta o campaña. */
export type ColorDeTarea = { color: ColorTarea } | { tinte: Tint }

export function colorDeTarea(t: Tarea, colores: ColoresTareas, { hoy, ctx, etiquetas }: { hoy: string; ctx: ContextoTareas; etiquetas: EtiquetaTarea[] }): ColorDeTarea {
  switch (colores.por) {
    case "urgencia":
      return { color: estaCerrada(t) ? "ninguno" : colores.urgencia[tramoDeTarea(t, hoy, colores.diasProximos)] }
    case "prioridad":
      return { color: colores.prioridad[t.prioridad] }
    case "etiqueta": {
      const tinte = etiquetas.find((e) => e.id === t.etiquetas[0])?.tint
      return tinte ? { tinte } : { color: "ninguno" }
    }
    case "marca": {
      const tinte = collabDe(t.donde, ctx)?.tint
      return tinte ? { tinte } : { color: "ninguno" }
    }
    case "ninguno":
      return { color: "ninguno" }
  }
}
