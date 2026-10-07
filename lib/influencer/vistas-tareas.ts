// Las vistas de serie de la página de Tareas: las del bloque de todas las tareas y las del bloque
// de al lado. Cada persona las cambia, las ordena, crea las suyas o las borra; esto es solo con lo
// que empieza.
import { GRUPO_VACIO } from "@/lib/filtros/core"
import type { DisenoVista, Vista } from "@/lib/vistas/core"

/** Las propiedades que se pueden enseñar, en el orden del panel de propiedades. */
export const PROPIEDADES_TAREA: { id: string; label: string }[] = [
  { id: "titulo", label: "Título" },
  { id: "estado", label: "Estado" },
  { id: "donde", label: "Tipo" },
  { id: "fecha", label: "Fecha" },
  { id: "fechaLimite", label: "Fecha límite" },
  { id: "prioridad", label: "Prioridad" },
  { id: "etiquetas", label: "Etiquetas" },
  { id: "subtareas", label: "Subtareas" },
  { id: "repite", label: "Se repite" },
  { id: "diasEsperando", label: "Días esperando" },
  { id: "origen", label: "Origen" },
  { id: "creadaEl", label: "Creada" },
  { id: "hechaEl", label: "Hecha el" },
]

const base = { filtro: GRUPO_VACIO, ajustes: { subtareas: "anidadas" as const, filtroSubtareas: "principales" as const } }
const PROPIEDADES_LISTA = ["donde", "fecha", "prioridad", "etiquetas", "subtareas"]
const PROPIEDADES_TABLA = ["estado", "donde", "fecha", "fechaLimite", "prioridad", "etiquetas", "subtareas"]
const POR_IMPORTANCIA = [
  { campo: "prioridad", dir: "asc" as const },
  { campo: "fecha", dir: "asc" as const },
]

const porFecha = (id: string): Vista => ({ ...base, id, nombre: "Por fecha", diseno: "lista", orden: POR_IMPORTANCIA, agrupar: { campo: "cuando", ocultarVacios: true, plegados: ["hechas"] }, propiedades: PROPIEDADES_LISTA })
const tabla = (id: string): Vista => ({ ...base, id, nombre: "Tabla", diseno: "tabla", orden: [{ campo: "fecha", dir: "asc" }], propiedades: PROPIEDADES_TABLA })
const tablero = (id: string, filas?: string): Vista => ({
  ...base,
  id,
  nombre: "Tablero",
  diseno: "tablero",
  orden: POR_IMPORTANCIA,
  agrupar: { campo: "estado" },
  subagrupar: filas ? { campo: filas, ocultarVacios: true } : undefined,
  propiedades: ["donde", "fecha", "prioridad", "subtareas"],
})
const calendario = (id: string): Vista => ({ ...base, id, nombre: "Calendario", diseno: "calendario", orden: [], propiedades: ["donde"], ajustes: { ...base.ajustes, calendarioPor: "fecha", calendarioModo: "mes", finesDeSemana: true } })

const porTipo = (id: string): Vista => ({ ...base, id, nombre: "Por tipo", diseno: "lista", orden: POR_IMPORTANCIA, agrupar: { campo: "tipo", ocultarVacios: true }, propiedades: PROPIEDADES_LISTA })

/** Las vistas con las que empieza el bloque de todas las tareas. */
export const VISTAS_TAREAS: Vista[] = [
  porFecha("g-fecha"),
  tablero("g-tablero"),
  calendario("g-calendario"),
  tabla("g-tabla"),
  porTipo("g-tipo"),
  {
    ...base,
    id: "g-esperando",
    nombre: "Esperando a otros",
    diseno: "lista",
    filtro: { union: "y", condiciones: [{ campo: "estado", op: "alguno", valor: ["esperando"] }] },
    orden: [{ campo: "diasEsperando", dir: "desc" }],
    agrupar: { campo: "proyecto", ocultarVacios: true },
    propiedades: ["donde", "estado", "fechaLimite"],
  },
  {
    ...base,
    id: "g-hechas",
    nombre: "Hechas",
    diseno: "lista",
    filtro: { union: "y", condiciones: [{ campo: "grupoEstado", op: "alguno", valor: ["cerrada"] }] },
    orden: [{ campo: "hechaEl", dir: "desc" }],
    agrupar: { campo: "hechaEl", modoFecha: "dia" },
    propiedades: ["donde", "estado"],
  },
]

/**
 * Las del bloque de al lado, más estrecho: lo que se quiere tener a la vista mientras se trabaja
 * en la lista (el calendario del mes, el tablero, lo de cada tipo…). Pocas propiedades, que cabe poco.
 */
export const VISTAS_LATERAL: Vista[] = [
  { ...calendario("l-calendario"), propiedades: [] },
  { ...porFecha("l-fecha"), propiedades: ["fecha"] },
  { ...tablero("l-tablero"), propiedades: ["fecha"] },
  { ...porTipo("l-tipo"), propiedades: ["fecha"] },
  { ...tabla("l-tabla"), propiedades: ["estado", "fecha"] },
]

/** Con qué nace una vista nueva de un diseño: las propiedades de siempre y, en el tablero, por estado. */
export function vistaNuevaDeTareas(diseno: DisenoVista): Omit<Vista, "id"> {
  const nombres: Record<DisenoVista, string> = { lista: "Lista", tabla: "Tabla", tablero: "Tablero", galeria: "Galería", calendario: "Calendario", cronograma: "Cronograma" }
  return {
    ...base,
    nombre: nombres[diseno],
    diseno,
    orden: [],
    agrupar: diseno === "tablero" ? { campo: "estado" } : undefined,
    propiedades: diseno === "tabla" ? PROPIEDADES_TABLA : PROPIEDADES_LISTA,
    ajustes: diseno === "calendario" ? { ...base.ajustes, calendarioPor: "fecha", calendarioModo: "mes", finesDeSemana: true } : base.ajustes,
  }
}
