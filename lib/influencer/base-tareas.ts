// La base de tareas al estilo Airtable (la página de Tareas). Los campos y cómo se escribe cada uno
// salen de las reglas de siempre (`campos-tareas.ts`): cambiar el estado lo apunta en su actividad,
// «Cuándo» pone el día que toca y los campos que crea ella son los suyos (`CampoTarea`). Puro: lo
// usan la página y las pruebas.

import { SIN_VALOR } from "@/lib/vistas/core"
import { opcionesDeEstados, textoLimpio, type ColorOpcion, type DefCampo, type TipoCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaDeSerie } from "@/lib/base/vistas"
import { soloFecha } from "@/lib/influencer/fechas"
import { asignarCampo, conValor, idCampoPropio } from "@/lib/influencer/campos-tareas"
import { CUANDO_TAREA, collabIdDe, cuandoDe, estaVencida, marcaIdDe, nombreDeCampana, proyectoDe, proyectosPosibles, tiposDe, type ContextoTareas } from "@/lib/influencer/tareas"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { ESTADOS_TAREA, ORIGENES_TAREA, PRIORIDADES_TAREA, TIPOS_TAREA, type CampoTarea, type EtiquetaTarea, type PrioridadTarea, type Tarea, type TipoCampoTarea } from "@/lib/influencer/modelo"

const COLOR_PRIORIDAD: Record<PrioridadTarea, ColorOpcion> = { urgente: "rojo", alta: "naranja", normal: "gris", baja: "azul" }
const TIPO_PROPIO: Record<TipoCampoTarea, TipoCampo> = { texto: "texto", url: "url", numero: "numero", fecha: "fecha", select: "select", multiselect: "multiselect", casilla: "casilla" }

/** El campo propio de una tarea a partir de su id en la base («propio:c-plataforma»). */
const propioDe = (id: string, propios: CampoTarea[]) => propios.find((c) => idCampoPropio(c.id) === id)

export type ParamsBaseTareas = { ctx: ContextoTareas; etiquetas: EtiquetaTarea[]; hoy: string; tareas: Tarea[]; propios: CampoTarea[] }

export function camposBaseTareas({ ctx, etiquetas, hoy, tareas, propios }: ParamsBaseTareas): DefCampo<Tarea>[] {
  const dia = soloFecha(hoy)
  const hijas = (t: Tarea) => tareas.filter((x) => x.padreId === t.id)
  const conHijas = new Set(tareas.map((t) => t.padreId))
  const madres = tareas.filter((t) => conHijas.has(t.id))
  return [
    { id: "titulo", nombre: "Tarea", tipo: "texto", principal: true, obligatorio: true, grupo: "Tarea", valor: (t) => t.titulo },
    { id: "hecha", nombre: "Hecha", tipo: "casilla", grupo: "Tarea", valor: (t) => t.estado === "hecha" },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_TAREA), grupo: "Tarea", valor: (t) => t.estado },
    { id: "cuando", nombre: "Cuándo", tipo: "select", obligatorio: true, opciones: CUANDO_TAREA.map((c) => ({ id: c.id, label: c.label, color: c.id === "vencidas" ? "rojo" : c.id === "hoy" ? "verde" : "gris" })), grupo: "Fechas", descripcion: "Se calcula a partir de la fecha. Al moverla a «Hoy» o «Mañana», la fecha se actualiza.", valor: (t) => cuandoDe(t, dia) },
    { id: "fecha", nombre: "Fecha", tipo: "fecha", grupo: "Fechas", valor: (t) => (t.fecha ? soloFecha(t.fecha) : null) },
    { id: "prioridad", nombre: "Prioridad", tipo: "select", obligatorio: true, opciones: PRIORIDADES_TAREA.map((p) => ({ id: p.id, label: p.label, color: COLOR_PRIORIDAD[p.id] })), grupo: "Tarea", valor: (t) => t.prioridad },
    { id: "tipo", nombre: "Tipo", tipo: "select", obligatorio: true, opciones: tiposDe(ctx).map((t) => ({ id: t, label: TIPOS_TAREA[t] })), grupo: "De qué es", valor: (t) => t.donde.tipo },
    { id: "proyecto", nombre: "De qué es", tipo: "select", opciones: proyectosPosibles(ctx).map((p) => ({ id: p.id, label: p.label })), grupo: "De qué es", valor: (t) => proyectoDe(t.donde, ctx)?.id ?? null },
    { id: "etiquetas", nombre: "Etiquetas", tipo: "multiselect", opciones: etiquetas.map((e) => ({ id: e.id, label: e.nombre })), grupo: "Tarea", valor: (t) => t.etiquetas },
    { id: "fechaLimite", nombre: "Fecha límite", tipo: "fecha", grupo: "Fechas", valor: (t) => t.fechaLimite ?? null },
    { id: "subtareas", nombre: "Subtareas", tipo: "texto", soloLectura: true, grupo: "Tarea", valor: (t) => (hijas(t).length ? `${hijas(t).filter((h) => h.estado === "hecha").length} de ${hijas(t).length}` : null) },
    { id: "campana", nombre: "Campaña", tipo: "select", ocultoDeSerie: true, opciones: ctx.collabs.map((c) => ({ id: c.id, label: nombreDeCampana(c, ctx) })), grupo: "De qué es", valor: (t) => collabIdDe(t.donde) ?? null },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, soloLectura: true, ocultoDeSerie: true, opciones: opcionesDeMarcas(ctx.marcas), grupo: "De qué es", valor: (t) => marcaIdDe(t.donde, ctx) ?? null },
    { id: "esSubtarea", nombre: "Es subtarea", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Tarea", valor: (t) => !!t.padreId },
    { id: "madre", nombre: "Tarea principal", tipo: "select", soloLectura: true, ocultoDeSerie: true, opciones: madres.map((m) => ({ id: m.id, label: m.titulo })), grupo: "Tarea", descripcion: "De qué tarea cuelga una subtarea.", valor: (t) => t.padreId ?? null },
    { id: "vencida", nombre: "Vencida", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (t) => estaVencida(t, dia) },
    { id: "repite", nombre: "Se repite", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (t) => !!t.repetir },
    { id: "origen", nombre: "Origen", tipo: "select", soloLectura: true, ocultoDeSerie: true, opciones: Object.entries(ORIGENES_TAREA).map(([id, label]) => ({ id, label })), grupo: "Más", valor: (t) => t.origen },
    { id: "creadaEl", nombre: "Creada", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Más", valor: (t) => soloFecha(t.creadaEl) },
    { id: "hechaEl", nombre: "Hecha el", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Más", valor: (t) => (t.hechaEl ? soloFecha(t.hechaEl) : null) },
    ...propios.map(
      (c): DefCampo<Tarea> => ({
        id: idCampoPropio(c.id),
        nombre: c.nombre,
        tipo: TIPO_PROPIO[c.tipo],
        opciones: c.opciones,
        grupo: "Mis campos",
        valor: (t) => t.valores?.[c.id] ?? (c.tipo === "casilla" ? false : null),
      }),
    ),
  ]
}

const sinSubtareas = { union: "y" as const, condiciones: [{ campo: "esSubtarea", op: "falso" as const }] }
const soloSubtareas = { union: "y" as const, condiciones: [{ campo: "esSubtarea", op: "verdadero" as const }] }

/** Por cuándo toca (la de siempre), el tablero por estado, el calendario, por tipo, todas y las subtareas agrupadas por su tarea. */
export const vistasDeSerieTareas = (campos: DefCampo<Tarea>[]): VistaDeSerie[] => [
  { ...vistaNueva("Por cuándo", campos, { id: "tareas-cuando" }), filtro: sinSubtareas, grupos: [{ campo: "cuando", ordenGrupos: "asc" }] },
  { ...vistaNueva("Tablero", campos, { id: "tareas-tablero", tipo: "kanban", apilar: "estado" }), filtro: sinSubtareas },
  vistaNueva("Calendario", campos, { id: "tareas-calendario", tipo: "calendario", fecha: "fecha" }),
  { ...vistaNueva("Por tipo", campos, { id: "tareas-tipo" }), filtro: sinSubtareas, grupos: [{ campo: "tipo", ordenGrupos: "asc" }] },
  vistaNueva("Todas", campos, { id: "tareas-todas" }),
  // Llegó el 2026-10-15 (reporte de Xavier): se añade también a quien ya tenía sus vistas.
  { ...vistaNueva("Subtareas", campos, { id: "tareas-subtareas" }), filtro: soloSubtareas, grupos: [{ campo: "madre", ordenGrupos: "asc" }], nueva: true },
]

/**
 * Una tarea con el valor de un campo cambiado, con las reglas de siempre (`asignarCampo`). Lo que
 * no se puede poner así (una semana sin día, un calculado) no cambia.
 */
export function escribirEnTarea(t: Tarea, campo: DefCampo<Tarea>, valor: ValorCampo, ref: { hoy: string; ahora: string; propios: CampoTarea[] }): Tarea {
  if (campo.soloLectura) return t
  const propio = propioDe(campo.id, ref.propios)
  if (propio) return conValor(t, propio.id, valor === null ? undefined : valor)
  switch (campo.id) {
    case "titulo":
      return textoLimpio(valor) ? { ...t, titulo: textoLimpio(valor) ?? t.titulo } : t
    case "etiquetas":
      return { ...t, etiquetas: Array.isArray(valor) ? valor : [] }
    case "hecha":
      return asignarCampo(t, { campo: "hecha", valor: valor === true ? "true" : "false" }, ref) ?? t
    default:
      return asignarCampo(t, { campo: campo.id, valor: typeof valor === "string" && valor ? valor : SIN_VALOR }, ref) ?? t
  }
}
