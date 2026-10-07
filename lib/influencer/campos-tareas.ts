// Los campos de las tareas: por ellos se filtra, se ordena y se agrupa en la página de Tareas y en
// sus listas de cada página. Incluyen los calculados (cuándo toca, si está vencida, el proyecto, la
// marca, los días esperando), que no se escriben: salen de la tarea, de hoy y de qué es; y los
// campos que ha creado ella.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { diasEntre, lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"
import { SIN_VALOR } from "@/lib/vistas/core"
import {
  ESTADOS_TAREA,
  GRUPOS_ESTADO_TAREA,
  LISTA_TIPOS_TAREA,
  ORIGENES_TAREA,
  PRIORIDADES_TAREA,
  TIPOS_TAREA,
  type CampoTarea,
  type EstadoTarea,
  type EtiquetaTarea,
  type GrupoEstadoTarea,
  type OrigenTarea,
  type PrioridadTarea,
  type Tarea,
  type TipoCampoTarea,
  type TipoTarea,
  type ValorCampoTarea,
} from "@/lib/influencer/modelo"
import {
  CUANDO_TAREA,
  cambiarTipo,
  collabIdDe,
  conEstado,
  cuandoDe,
  estaVencida,
  grupoDeEstado,
  marcaIdDe,
  nombreDeCampana,
  proyectoDe,
  proyectosPosibles,
  type ContextoTareas,
  type CuandoTarea,
} from "@/lib/influencer/tareas"

export type ParamsCamposTarea = {
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  hoy: string
  /** Todas las tareas: para saber cuáles tienen subtareas. */
  tareas: Tarea[]
  /** Los campos que ha creado ella. */
  propios?: CampoTarea[]
}

/** El id con el que un campo propio entra en filtros, orden, grupos y columnas: «propio:c-plataforma». */
export const idCampoPropio = (id: string) => `propio:${id}`

const TIPO_FILTRO: Record<TipoCampoTarea, CampoFiltrable<Tarea>["tipo"]> = { texto: "texto", url: "texto", numero: "numero", fecha: "fecha", select: "select", multiselect: "multiselect", casilla: "booleano" }

export function camposTarea({ ctx, etiquetas, hoy, tareas, propios = [] }: ParamsCamposTarea): CampoFiltrable<Tarea>[] {
  const conHijas = new Set(tareas.filter((t) => t.padreId).map((t) => t.padreId))
  const campos: CampoFiltrable<Tarea>[] = [
    { id: "titulo", label: "Título", tipo: "texto", grupo: "Tarea", valor: (t) => t.titulo },
    { id: "estado", label: "Estado", tipo: "select", grupo: "Tarea", opciones: ESTADOS_TAREA.map((e) => ({ value: e.id, label: e.label })), valor: (t) => t.estado },
    { id: "grupoEstado", label: "Grupo de estado", tipo: "select", grupo: "Tarea", opciones: (Object.keys(GRUPOS_ESTADO_TAREA) as GrupoEstadoTarea[]).map((g) => ({ value: g, label: GRUPOS_ESTADO_TAREA[g] })), valor: (t) => grupoDeEstado(t.estado) },
    { id: "prioridad", label: "Prioridad", tipo: "select", grupo: "Tarea", opciones: PRIORIDADES_TAREA.map((p) => ({ value: p.id, label: p.label })), valor: (t) => t.prioridad },
    { id: "etiquetas", label: "Etiquetas", tipo: "multiselect", grupo: "Tarea", opciones: etiquetas.map((e) => ({ value: e.id, label: e.nombre })), valor: (t) => t.etiquetas },
    { id: "hecha", label: "Hecha", tipo: "booleano", grupo: "Tarea", valor: (t) => t.estado === "hecha" },
    {
      id: "diasEsperando",
      label: "Días esperando",
      tipo: "numero",
      grupo: "Tarea",
      valor: (t) => (t.estado === "esperando" && t.esperandoDesde ? diasEntre(t.esperandoDesde, hoy) : null),
    },
    { id: "subtareas", label: "Tiene subtareas", tipo: "booleano", grupo: "Tarea", valor: (t) => conHijas.has(t.id) },
    { id: "esSubtarea", label: "Es subtarea", tipo: "booleano", grupo: "Tarea", valor: (t) => !!t.padreId },
  ]
  campos.push(
    { id: "tipo", label: "Tipo", tipo: "select", grupo: "De qué es", opciones: LISTA_TIPOS_TAREA.map((t) => ({ value: t, label: TIPOS_TAREA[t] })), valor: (t) => t.donde.tipo },
    {
      id: "campana",
      label: "Campaña",
      tipo: "select",
      grupo: "De qué es",
      opciones: ctx.collabs.map((c) => ({ value: c.id, label: nombreDeCampana(c, ctx) })),
      valor: (t) => collabIdDe(t.donde) ?? null,
    },
    { id: "proyecto", label: "Proyecto", tipo: "select", grupo: "De qué es", opciones: proyectosPosibles(ctx).map((p) => ({ value: p.id, label: p.label })), valor: (t) => proyectoDe(t.donde, ctx)?.id ?? null },
    { id: "marca", label: "Marca", tipo: "select", grupo: "De qué es", opciones: ctx.marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (t) => marcaIdDe(t.donde, ctx) ?? null },
  )
  campos.push(
    { id: "cuando", label: "Cuándo", tipo: "select", grupo: "Fechas", opciones: CUANDO_TAREA.map((c) => ({ value: c.id, label: c.label })), valor: (t) => cuandoDe(t, hoy) },
    { id: "fecha", label: "Fecha", tipo: "fecha", grupo: "Fechas", valor: (t) => (t.fecha ? soloFecha(t.fecha) : null) },
    { id: "fechaLimite", label: "Fecha límite", tipo: "fecha", grupo: "Fechas", valor: (t) => t.fechaLimite ?? null },
    { id: "vencida", label: "Vencida", tipo: "booleano", grupo: "Fechas", valor: (t) => estaVencida(t, hoy) },
    { id: "repite", label: "Se repite", tipo: "booleano", grupo: "Fechas", valor: (t) => !!t.repetir },
    { id: "origen", label: "Origen", tipo: "select", grupo: "Más", opciones: (Object.keys(ORIGENES_TAREA) as OrigenTarea[]).map((o) => ({ value: o, label: ORIGENES_TAREA[o] })), valor: (t) => t.origen },
    { id: "creadaEl", label: "Creada", tipo: "fecha", grupo: "Más", valor: (t) => soloFecha(t.creadaEl) },
    { id: "hechaEl", label: "Hecha el", tipo: "fecha", grupo: "Más", valor: (t) => (t.hechaEl ? soloFecha(t.hechaEl) : null) },
    ...propios.map((c): CampoFiltrable<Tarea> => ({
      id: idCampoPropio(c.id),
      label: c.nombre,
      tipo: TIPO_FILTRO[c.tipo],
      grupo: "Mis campos",
      opciones: c.opciones?.map((o) => ({ value: o.id, label: o.label })),
      valor: (t) => t.valores?.[c.id] ?? (c.tipo === "casilla" ? false : null),
    })),
  )
  return campos
}

/** La tarea con otro valor en un campo propio; vacío lo quita. */
export function conValor(t: Tarea, campoId: string, valor: ValorCampoTarea | null | undefined): Tarea {
  const valores = { ...t.valores }
  if (valor === null || valor === undefined || valor === "" || (Array.isArray(valor) && valor.length === 0)) delete valores[campoId]
  else valores[campoId] = valor
  return { ...t, valores }
}

// ───────────────────────── Dar un valor a una tarea ─────────────────────────

/** Lo que se le cambia a una tarea al soltarla en un grupo o al crearla dentro de él. */
export type Asignacion = {
  campo: string
  /** El id del grupo o del valor del filtro (`SIN_VALOR` para «Sin …»). */
  valor: string
  /** El grupo del que sale, en los campos de varios valores: se quita ese y se pone el nuevo. */
  desde?: string
}

const mismoDiaConHora = (t: Tarea, dia: string) => `${dia}${t.fecha && t.fecha.length > 10 ? t.fecha.slice(10) : ""}`

/** El día que le corresponde a un tramo de «Cuándo» al soltar una tarea en él. */
function diaDeTramo(tramo: CuandoTarea, hoy: string): string | null | undefined {
  const dia = soloFecha(hoy)
  switch (tramo) {
    case "hoy":
      return dia
    case "manana":
      return sumarDias(dia, 1)
    case "proxima":
      return sumarDias(lunesDe(dia), 7)
    case "sin-fecha":
      return null
    default:
      // «Vencidas», «Esta semana» y «Más adelante» no dicen un día: no se puede soltar ahí.
      return undefined
  }
}

/**
 * La tarea con un valor nuevo en un campo, o `null` si ese valor no se puede poner así (un
 * calculado, como la marca, o una campaña sin elegir cuál). Lo usan arrastrar entre grupos y
 * crear dentro de un grupo o de una vista filtrada, como en Notion.
 */
export function asignarCampo(t: Tarea, a: Asignacion, ref: { hoy: string; ahora: string; propios?: CampoTarea[] }): Tarea | null {
  const vacio = a.valor === SIN_VALOR
  switch (a.campo) {
    case "estado":
      return vacio ? null : conEstado(t, a.valor as EstadoTarea, ref.ahora) // valor de las opciones de «estado»
    case "grupoEstado": {
      const estado: Record<string, EstadoTarea> = { pendiente: "por-hacer", "en-marcha": "en-curso", cerrada: "hecha" }
      // Si ya está en ese grupo, no se toca (una «Esperando» soltada en «En marcha» sigue esperando).
      if (grupoDeEstado(t.estado) === a.valor) return t
      return estado[a.valor] ? conEstado(t, estado[a.valor], ref.ahora) : null
    }
    case "hecha":
      return conEstado(t, a.valor === "true" ? "hecha" : "por-hacer", ref.ahora)
    case "prioridad":
      return vacio ? null : { ...t, prioridad: a.valor as PrioridadTarea } // valor de las opciones de «prioridad»
    case "etiquetas": {
      const sin = t.etiquetas.filter((e) => e !== a.desde)
      return { ...t, etiquetas: vacio ? sin : [...new Set([...sin, a.valor])] }
    }
    case "cuando": {
      if (a.valor === "hechas") return conEstado(t, "hecha", ref.ahora)
      const dia = diaDeTramo(a.valor as CuandoTarea, ref.hoy) // valor de las opciones de «cuando»
      if (dia === undefined) return null
      if (dia === null) return t.fechaLimite ? null : { ...t, fecha: undefined, fechaFin: undefined }
      const abierta = t.estado === "hecha" || t.estado === "cancelada" ? conEstado(t, "por-hacer", ref.ahora) : t
      return { ...abierta, fecha: mismoDiaConHora(t, dia), fechaFin: undefined }
    }
    case "fecha":
      return vacio ? { ...t, fecha: undefined, fechaFin: undefined } : /^\d{4}-\d{2}-\d{2}$/.test(a.valor) ? { ...t, fecha: mismoDiaConHora(t, a.valor) } : null
    case "fechaLimite":
      return vacio ? { ...t, fechaLimite: undefined } : /^\d{4}-\d{2}-\d{2}$/.test(a.valor) ? { ...t, fechaLimite: a.valor } : null
    case "tipo":
      return vacio ? null : { ...t, donde: cambiarTipo(t.donde, a.valor as TipoTarea) } // valor de las opciones de «tipo»
    case "campana": {
      // Sin campaña sigue siendo de su tipo; con campaña, si no era de Collabs ni de Cobros, pasa a Collabs.
      if (vacio) return t.donde.tipo === "collabs" || t.donde.tipo === "cobros" ? { ...t, donde: { tipo: t.donde.tipo } } : t
      return { ...t, donde: { tipo: t.donde.tipo === "cobros" ? "cobros" : "collabs", collabId: a.valor } }
    }
    case "proyecto": {
      if (vacio) return null
      const [clase, id] = a.valor.split(":")
      if (clase === "collab") return asignarCampo(t, { campo: "campana", valor: id }, ref)
      if (clase === "propuesta" || clase === "marca" || clase === "contacto") return { ...t, donde: { tipo: "crm", registro: { tipo: clase, id } } }
      return null
    }
    default: {
      const campo = ref.propios?.find((c) => idCampoPropio(c.id) === a.campo)
      if (!campo) return null
      if (campo.tipo === "multiselect") {
        // Como las etiquetas: se quita el valor del grupo del que sale y se pone el nuevo.
        const actual = t.valores?.[campo.id]
        const lista = (Array.isArray(actual) ? actual : []).filter((v) => v !== a.desde)
        return conValor(t, campo.id, vacio ? lista : [...new Set([...lista, a.valor])])
      }
      if (vacio) return conValor(t, campo.id, null)
      if (campo.tipo === "casilla") return conValor(t, campo.id, a.valor === "true")
      if (campo.tipo === "numero") return Number.isFinite(Number(a.valor)) ? conValor(t, campo.id, Number(a.valor)) : null
      return conValor(t, campo.id, a.valor)
    }
  }
}
