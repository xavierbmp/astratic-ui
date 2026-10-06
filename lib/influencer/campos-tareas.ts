// Los campos de las tareas: por ellos se filtra, se ordena y se agrupa en la página de Tareas y en
// sus listas de cada página. Incluyen los calculados (cuándo toca, si está vencida, el proyecto, la
// marca, los días esperando), que no se escriben: salen de la tarea, de hoy y de dónde vive.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { diasEntre, lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"
import { SIN_VALOR } from "@/lib/vistas/core"
import {
  ESTADOS_TAREA,
  GRUPOS_ESTADO_TAREA,
  LISTA_PAGINAS_TAREA,
  ORIGENES_TAREA,
  PAGINAS_TAREA,
  PRIORIDADES_TAREA,
  type EstadoTarea,
  type EtiquetaTarea,
  type GrupoEstadoTarea,
  type OrigenTarea,
  type PaginaTarea,
  type PrioridadTarea,
  type Tarea,
  type TipoTarea,
} from "@/lib/influencer/modelo"
import {
  CUANDO_TAREA,
  conEstado,
  cuandoDe,
  estaVencida,
  grupoDeEstado,
  marcaIdDe,
  paginaDeTipo,
  proyectoDe,
  proyectosPosibles,
  tiposDePagina,
  type ContextoTareas,
  type CuandoTarea,
} from "@/lib/influencer/tareas"

export type ParamsCamposTarea = {
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  hoy: string
  /** Todas las tareas: para saber cuáles tienen subtareas. */
  tareas: Tarea[]
  /** En la pestaña de una página, los tipos son solo los suyos y no hace falta el campo «Página». */
  pagina?: PaginaTarea
}

export function camposTarea({ ctx, etiquetas, hoy, tareas, pagina }: ParamsCamposTarea): CampoFiltrable<Tarea>[] {
  const conHijas = new Set(tareas.filter((t) => t.padreId).map((t) => t.padreId))
  const paginas = pagina ? [pagina] : LISTA_PAGINAS_TAREA
  const nombreMarca = (id: string) => ctx.marcas.find((m) => m.id === id)?.nombre ?? ""
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
  if (!pagina) {
    campos.push({ id: "pagina", label: "Página", tipo: "select", grupo: "Dónde", opciones: LISTA_PAGINAS_TAREA.map((p) => ({ value: p, label: PAGINAS_TAREA[p] })), valor: (t) => t.donde.pagina })
  }
  campos.push(
    {
      id: "tipo",
      label: "Tipo",
      tipo: "select",
      grupo: "Dónde",
      // En General el tipo dice también la página: «Campañas › Cobros».
      opciones: paginas.flatMap((p) => tiposDePagina(p).map((x) => ({ value: x.id, label: pagina ? x.label : `${PAGINAS_TAREA[p]} › ${x.label}` }))),
      valor: (t) => t.donde.tipo,
    },
    {
      id: "proyecto",
      label: "Proyecto",
      tipo: "select",
      grupo: "Dónde",
      opciones: proyectosPosibles(ctx)
        .filter((p) => !pagina || (pagina === "campanas" ? p.grupo === "Campañas" : pagina === "crm" && p.grupo !== "Campañas"))
        .map((p) => ({ value: p.id, label: p.label })),
      valor: (t) => proyectoDe(t.donde, ctx)?.id ?? null,
    },
    { id: "marca", label: "Marca", tipo: "select", grupo: "Dónde", opciones: ctx.marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (t) => marcaIdDe(t.donde, ctx) ?? null },
  )
  if (!pagina || pagina === "campanas") {
    campos.push({
      id: "campana",
      label: "Campaña",
      tipo: "select",
      grupo: "Dónde",
      opciones: ctx.collabs.map((c) => ({ value: c.id, label: `${nombreMarca(c.marcaId)} · ${c.campana}` })),
      valor: (t) => (t.donde.pagina === "campanas" ? t.donde.collabId : null),
    })
  }
  campos.push(
    { id: "cuando", label: "Cuándo", tipo: "select", grupo: "Fechas", opciones: CUANDO_TAREA.map((c) => ({ value: c.id, label: c.label })), valor: (t) => cuandoDe(t, hoy) },
    { id: "fecha", label: "Fecha", tipo: "fecha", grupo: "Fechas", valor: (t) => (t.fecha ? soloFecha(t.fecha) : null) },
    { id: "fechaLimite", label: "Fecha límite", tipo: "fecha", grupo: "Fechas", valor: (t) => t.fechaLimite ?? null },
    { id: "vencida", label: "Vencida", tipo: "booleano", grupo: "Fechas", valor: (t) => estaVencida(t, hoy) },
    { id: "repite", label: "Se repite", tipo: "booleano", grupo: "Fechas", valor: (t) => !!t.repetir },
    { id: "origen", label: "Origen", tipo: "select", grupo: "Más", opciones: (Object.keys(ORIGENES_TAREA) as OrigenTarea[]).map((o) => ({ value: o, label: ORIGENES_TAREA[o] })), valor: (t) => t.origen },
    { id: "creadaEl", label: "Creada", tipo: "fecha", grupo: "Más", valor: (t) => soloFecha(t.creadaEl) },
    { id: "hechaEl", label: "Hecha el", tipo: "fecha", grupo: "Más", valor: (t) => (t.hechaEl ? soloFecha(t.hechaEl) : null) },
  )
  return campos
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
export function asignarCampo(t: Tarea, a: Asignacion, ref: { hoy: string; ahora: string }): Tarea | null {
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
    case "pagina": {
      if (vacio) return null
      if (t.donde.pagina === a.valor) return t
      // A Campañas no se puede pasar sin elegir la campaña: eso se hace en la ficha.
      if (a.valor === "crm") return { ...t, donde: { pagina: "crm", tipo: "propuesta" } }
      if (a.valor === "personal") return { ...t, donde: { pagina: "personal", tipo: "personal" } }
      return null
    }
    case "tipo":
      return vacio ? null : conTipo(t, a.valor as TipoTarea) // valor de las opciones de «tipo»
    case "campana": {
      if (vacio) return null
      const tipo = t.donde.pagina === "campanas" ? t.donde.tipo : "general"
      return { ...t, donde: { pagina: "campanas", tipo, collabId: a.valor } }
    }
    case "proyecto": {
      if (vacio) return null
      const [clase, id] = a.valor.split(":")
      if (clase === "collab") return asignarCampo(t, { campo: "campana", valor: id }, ref)
      if (clase === "propuesta" || clase === "marca" || clase === "contacto") return { ...t, donde: { pagina: "crm", tipo: clase, registroId: id } }
      return null
    }
    default:
      return null
  }
}

/** Cambia el tipo dentro de su página; si el tipo es de otra página, solo se puede sin campaña de por medio. */
function conTipo(t: Tarea, tipo: TipoTarea): Tarea | null {
  const pagina = paginaDeTipo(tipo)
  const d = t.donde
  // Los `as` son seguros: `paginaDeTipo` dice de qué página es el tipo.
  if (pagina === "campanas") return d.pagina === "campanas" ? { ...t, donde: { ...d, tipo: tipo as typeof d.tipo, piezaId: tipo === "contenidos" ? d.piezaId : undefined } } : null
  if (pagina === "crm") return { ...t, donde: { pagina, tipo: tipo as Extract<Tarea["donde"], { pagina: "crm" }>["tipo"], registroId: d.pagina === "crm" && d.tipo === tipo ? d.registroId : undefined } }
  return { ...t, donde: { pagina: "personal", tipo: tipo as Extract<Tarea["donde"], { pagina: "personal" }>["tipo"] } }
}
