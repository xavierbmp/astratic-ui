// Lógica de las tareas: dónde viven, cuándo tocan (vencidas, hoy, esta semana…), en qué orden se
// hacen hoy, cómo se repiten y cómo nace una nueva. Pura: sin datos ni React.
import {
  ESTADOS_TAREA,
  FRECUENCIAS_TAREA,
  PAGINAS_TAREA,
  PRIORIDADES_TAREA,
  TIPOS_TAREA,
  type Collab,
  type Contacto,
  type DondeTarea,
  type EntradaTarea,
  type EstadoTarea,
  type GrupoEstadoTarea,
  type Marca,
  type PaginaTarea,
  type Propuesta,
  type Repeticion,
  type Tarea,
  type TipoTarea,
} from "@/lib/influencer/modelo"
import { diaDeLaSemana, diasEntre, lunesDe, soloFecha, sumarDias, tramoDeFecha } from "@/lib/filtros/fechas"

// ───────────────────────── Estado ─────────────────────────

export function grupoDeEstado(estado: EstadoTarea): GrupoEstadoTarea {
  return ESTADOS_TAREA.find((e) => e.id === estado)?.grupo ?? "pendiente"
}

/** Hecha o cancelada: ya no sale en Hoy ni cuenta como vencida. */
export const estaCerrada = (t: Pick<Tarea, "estado">) => grupoDeEstado(t.estado) === "cerrada"

/**
 * Cambia el estado y lo que va con él: cuándo se hizo y desde cuándo espera. Volver a abrir una
 * tarea hecha le quita la fecha de hecha.
 */
export function conEstado(t: Tarea, estado: EstadoTarea, ahora: string): Tarea {
  if (t.estado === estado) return t
  return {
    ...t,
    estado,
    hechaEl: estado === "hecha" ? ahora : undefined,
    esperandoDesde: estado === "esperando" ? (t.esperandoDesde ?? soloFecha(ahora)) : undefined,
  }
}

// ───────────────────────── Fechas ─────────────────────────

/**
 * El día que cuenta para las listas: el primero entre el que pensaba hacerla y la fecha límite.
 * Si la planeó para después de la entrega, manda la entrega.
 */
export function diaDeTarea(t: Pick<Tarea, "fecha" | "fechaLimite">): string | undefined {
  const dias = [t.fecha, t.fechaLimite].filter((d): d is string => !!d).map(soloFecha).sort()
  return dias[0]
}

/** «10:00» si la tarea tiene hora. */
export function horaDeTarea(t: Pick<Tarea, "fecha">): string | undefined {
  return t.fecha && t.fecha.length > 10 ? t.fecha.slice(11, 16) : undefined
}

/** Último día de la tarea: el fin del rango o su día. */
export function finDeTarea(t: Pick<Tarea, "fecha" | "fechaFin" | "fechaLimite">): string | undefined {
  return t.fechaFin ? soloFecha(t.fechaFin) : diaDeTarea(t)
}

/** Abierta y con la fecha límite pasada, o con su último día ya pasado. */
export function estaVencida(t: Tarea, hoy: string): boolean {
  if (estaCerrada(t)) return false
  const dia = soloFecha(hoy)
  const fin = finDeTarea(t)
  return (!!t.fechaLimite && soloFecha(t.fechaLimite) < dia) || (!!fin && fin < dia)
}

/** Cuándo toca una tarea, en tramos que no se pisan: lo de hoy no sale también en «Esta semana». */
export type CuandoTarea = "vencidas" | "hoy" | "manana" | "semana" | "proxima" | "despues" | "sin-fecha" | "hechas"

export const CUANDO_TAREA: { id: CuandoTarea; label: string }[] = [
  { id: "vencidas", label: "Vencidas" },
  { id: "hoy", label: "Hoy" },
  { id: "manana", label: "Mañana" },
  { id: "semana", label: "Esta semana" },
  { id: "proxima", label: "Semana que viene" },
  { id: "despues", label: "Más adelante" },
  { id: "sin-fecha", label: "Sin fecha" },
  { id: "hechas", label: "Hechas" },
]

export function cuandoDe(t: Tarea, hoy: string): CuandoTarea {
  if (estaCerrada(t)) return "hechas"
  if (estaVencida(t, hoy)) return "vencidas"
  const dia = diaDeTarea(t)
  if (!dia) return "sin-fecha"
  const tramo = tramoDeFecha(dia, hoy)
  // Una tarea de varios días que ya empezó (y no ha acabado, o estaría vencida) es de hoy.
  if (tramo === "pasado" || tramo === "hoy") return "hoy"
  return tramo
}

/** Lo que sale en Hoy: lo vencido y lo de hoy, sin hacer. */
export function tareasDeHoy(tareas: Tarea[], hoy: string) {
  return {
    vencidas: tareas.filter((t) => cuandoDe(t, hoy) === "vencidas"),
    hoy: tareas.filter((t) => cuandoDe(t, hoy) === "hoy"),
  }
}

/** Las de los próximos días (sin hoy), por día: el panel de Collabs. */
export function proximasTareas(tareas: Tarea[], hoy: string, dias = 7) {
  const dia = soloFecha(hoy)
  return ordenarTareas(
    tareas.filter((t) => {
      const d = diaDeTarea(t)
      if (estaCerrada(t) || !d) return false
      const faltan = diasEntre(dia, d)
      return faltan > 0 && faltan <= dias
    }),
  )
}

/** Pendientes que vencen hoy o ya vencieron: la insignia de la barra inferior y de la sidebar. */
export function tareasUrgentes(tareas: Tarea[], hoy: string) {
  return tareas.filter((t) => {
    const c = cuandoDe(t, hoy)
    return c === "vencidas" || c === "hoy"
  }).length
}

export type TonoFecha = "vencida" | "hoy" | "normal"

export function tonoDeFecha(fecha: string | undefined, hoy: string): TonoFecha {
  if (!fecha) return "normal"
  const dias = diasEntre(hoy, fecha)
  return dias < 0 ? "vencida" : dias === 0 ? "hoy" : "normal"
}

// ───────────────────────── Orden ─────────────────────────

export const indicePrioridad = (t: Pick<Tarea, "prioridad">) => PRIORIDADES_TAREA.findIndex((p) => p.id === t.prioridad)

/**
 * El orden de Hoy, por importancia: la prioridad manda; dentro de cada prioridad, primero las que
 * tienen hora (por hora) y después las que vencen antes. Si ella ha reordenado el día a mano
 * (`manual`, ids en su orden), su orden va primero y lo nuevo detrás.
 */
export function ordenarHoy(tareas: Tarea[], manual?: string[]): Tarea[] {
  const auto = [...tareas].sort((a, b) => {
    const p = indicePrioridad(a) - indicePrioridad(b)
    if (p !== 0) return p
    const ha = horaDeTarea(a)
    const hb = horaDeTarea(b)
    if (ha && hb && ha !== hb) return ha.localeCompare(hb)
    if (!!ha !== !!hb) return ha ? -1 : 1
    const la = a.fechaLimite ?? "9999"
    const lb = b.fechaLimite ?? "9999"
    if (la !== lb) return la.localeCompare(lb)
    return a.orden - b.orden
  })
  if (!manual?.length) return auto
  const posicion = new Map(manual.map((id, i) => [id, i]))
  const enManual = auto.filter((t) => posicion.has(t.id)).sort((a, b) => (posicion.get(a.id) ?? 0) - (posicion.get(b.id) ?? 0))
  return [...enManual, ...auto.filter((t) => !posicion.has(t.id))]
}

/** Para las listas de una ficha: abiertas por día (las sin fecha detrás), después las cerradas. */
export function ordenarTareas(tareas: Tarea[]) {
  return [...tareas].sort((a, b) => {
    const ca = estaCerrada(a)
    const cb = estaCerrada(b)
    if (ca !== cb) return ca ? 1 : -1
    const da = diaDeTarea(a)
    const db = diaDeTarea(b)
    if (da !== db) return !da ? 1 : !db ? -1 : da.localeCompare(db)
    const p = indicePrioridad(a) - indicePrioridad(b)
    return p !== 0 ? p : a.orden - b.orden
  })
}

/** La posición de una tarea nueva: al final de la lista a mano. */
export function siguienteOrden(tareas: Tarea[]) {
  return tareas.reduce((max, t) => Math.max(max, t.orden), 0) + 1
}

// ───────────────────────── Repetir ─────────────────────────

/** El mismo día del mes `meses` después; si ese mes es más corto, su último día (31 ene → 28 feb). */
function mismoDiaEnMeses(fecha: string, meses: number) {
  const [a, m, d] = soloFecha(fecha).split("-").map(Number)
  const total = (m - 1) + meses
  const ano = a + Math.floor(total / 12)
  const mes = ((total % 12) + 12) % 12
  const ultimo = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(Math.min(d, ultimo)).padStart(2, "0")}`
}

/** El día de la siguiente vez, después de `fecha`. */
export function siguienteFecha(fecha: string, r: Repeticion): string {
  const dia = soloFecha(fecha)
  const cada = Math.max(1, Math.floor(r.cada ?? 1))
  switch (r.frecuencia) {
    case "diaria":
      return sumarDias(dia, cada)
    case "laborables": {
      let d = sumarDias(dia, 1)
      while (diaDeLaSemana(d) === 0 || diaDeLaSemana(d) === 6) d = sumarDias(d, 1)
      return d
    }
    case "semanal": {
      const dias = r.dias?.length ? r.dias : [diaDeLaSemana(dia)]
      const semanaDe = lunesDe(dia)
      // Se busca el siguiente día marcado; al saltar de semana, se salta las que no tocan («cada 2 semanas»).
      for (let i = 1; i <= 7 * cada + 7; i += 1) {
        const d = sumarDias(dia, i)
        const semanas = Math.round(diasEntre(semanaDe, lunesDe(d)) / 7)
        if (semanas % cada === 0 && dias.includes(diaDeLaSemana(d))) return d
      }
      return sumarDias(dia, 7 * cada)
    }
    case "mensual":
      return mismoDiaEnMeses(dia, cada)
    case "trimestral":
      return mismoDiaEnMeses(dia, 3 * cada)
    case "anual":
      return mismoDiaEnMeses(dia, 12 * cada)
  }
}

/** «Cada semana: lunes y jueves», «Cada 2 meses». */
export function describirRepeticion(r: Repeticion): string {
  const cada = Math.max(1, r.cada ?? 1)
  const nombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  const plural: Record<Repeticion["frecuencia"], string> = { diaria: "días", laborables: "días laborables", semanal: "semanas", mensual: "meses", trimestral: "trimestres", anual: "años" }
  const base = cada > 1 && r.frecuencia !== "laborables" ? `Cada ${cada} ${plural[r.frecuencia]}` : FRECUENCIAS_TAREA[r.frecuencia]
  if (r.frecuencia !== "semanal" || !r.dias?.length) return base
  const dias = [...r.dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => nombres[d])
  const lista = dias.length > 1 ? `${dias.slice(0, -1).join(", ")} y ${dias[dias.length - 1]}` : dias[0]
  return `${base}: ${lista}`
}

/**
 * La siguiente de una tarea que se repite, ya con su fecha: se mueven juntas la fecha, el fin y la
 * fecha límite. Si se hace tarde, la siguiente no nace ya vencida: salta hasta hoy o después.
 */
export function siguienteRepeticion(t: Tarea, hoy: string, id: string): Tarea | null {
  if (!t.repetir) return null
  const base = diaDeTarea(t) ?? soloFecha(hoy)
  let nueva = siguienteFecha(base, t.repetir)
  while (nueva < soloFecha(hoy)) nueva = siguienteFecha(nueva, t.repetir)
  const salto = diasEntre(base, nueva)
  const mover = (f?: string) => (f ? `${sumarDias(f, salto)}${f.slice(10)}` : undefined)
  return {
    ...t,
    id,
    estado: "por-hacer",
    origen: "repetida",
    fecha: mover(t.fecha),
    fechaFin: mover(t.fechaFin),
    fechaLimite: mover(t.fechaLimite),
    actividad: [],
    esperandoDesde: undefined,
    hechaEl: undefined,
    editadaEl: undefined,
    creadaEl: hoy,
  }
}

// ───────────────────────── Dónde vive ─────────────────────────

export type ContextoTareas = { collabs: Collab[]; propuestas: Propuesta[]; marcas: Marca[]; contactos: Contacto[] }

export function nombreDeTipo(donde: DondeTarea): string {
  const tipos: Record<string, string> = TIPOS_TAREA[donde.pagina]
  return tipos[donde.tipo] ?? donde.tipo
}

/** Los tipos de una página, en su orden: para los selectores. */
export function tiposDePagina(pagina: PaginaTarea): { id: TipoTarea; label: string }[] {
  return Object.entries(TIPOS_TAREA[pagina]).map(([id, label]) => ({ id: id as TipoTarea, label }))
}

/** El primer tipo de una página: con el que nace una tarea si no se dice otro. */
export function tipoPorDefecto(pagina: PaginaTarea): TipoTarea {
  return tiposDePagina(pagina)[0].id
}

/** La página a la que pertenece un tipo (cada tipo es de una sola). */
export function paginaDeTipo(tipo: TipoTarea): PaginaTarea {
  return (Object.keys(TIPOS_TAREA) as PaginaTarea[]).find((p) => tipo in TIPOS_TAREA[p]) ?? "personal"
}

type Registro = { tipo: "propuesta" | "marca" | "contacto"; id: string; nombre: string; marcaId?: string }

/** El registro del CRM de una tarea, si lo tiene: la propuesta, la marca o el contacto. */
export function registroDe(donde: DondeTarea, ctx: ContextoTareas): Registro | undefined {
  if (donde.pagina !== "crm" || !donde.registroId) return undefined
  const id = donde.registroId
  if (donde.tipo === "propuesta") {
    const p = ctx.propuestas.find((x) => x.id === id)
    if (!p) return undefined
    const marca = ctx.marcas.find((m) => m.id === p.marcaId)
    return { tipo: "propuesta", id, nombre: `${marca?.nombre ?? ""} · ${p.campana}`, marcaId: p.marcaId }
  }
  if (donde.tipo === "marca") {
    const m = ctx.marcas.find((x) => x.id === id)
    return m ? { tipo: "marca", id, nombre: m.nombre, marcaId: m.id } : undefined
  }
  if (donde.tipo === "contacto") {
    const c = ctx.contactos.find((x) => x.id === id)
    if (!c) return undefined
    const marca = ctx.marcas.find((m) => m.id === c.marcaId)
    return { tipo: "contacto", id, nombre: marca ? `${c.nombre} (${marca.nombre})` : c.nombre, marcaId: c.marcaId }
  }
  return undefined
}

export function collabDe(donde: DondeTarea, ctx: ContextoTareas): Collab | undefined {
  return donde.pagina === "campanas" ? ctx.collabs.find((c) => c.id === donde.collabId) : undefined
}

/** La marca de una tarea: la de su campaña o la de su registro del CRM. */
export function marcaIdDe(donde: DondeTarea, ctx: ContextoTareas): string | undefined {
  return collabDe(donde, ctx)?.marcaId ?? registroDe(donde, ctx)?.marcaId
}

/**
 * El proyecto de una tarea: su campaña o su registro del CRM, con un id único entre todos
 * («collab:lumea», «propuesta:p-nuura»). Sirve para filtrar y agrupar «todo lo de Lumea».
 */
export function proyectoDe(donde: DondeTarea, ctx: ContextoTareas): { id: string; label: string } | undefined {
  const collab = collabDe(donde, ctx)
  if (collab) {
    const marca = ctx.marcas.find((m) => m.id === collab.marcaId)
    return { id: `collab:${collab.id}`, label: `${marca?.nombre ?? ""} · ${collab.campana}` }
  }
  const r = registroDe(donde, ctx)
  return r ? { id: `${r.tipo}:${r.id}`, label: r.nombre } : undefined
}

/** Todos los proyectos posibles: las campañas y los registros del CRM, para los selectores y filtros. */
export function proyectosPosibles(ctx: ContextoTareas): { id: string; label: string; grupo: string }[] {
  const nombreMarca = (id: string) => ctx.marcas.find((m) => m.id === id)?.nombre ?? ""
  return [
    ...ctx.collabs.map((c) => ({ id: `collab:${c.id}`, label: `${nombreMarca(c.marcaId)} · ${c.campana}`, grupo: "Campañas" })),
    ...ctx.propuestas.map((p) => ({ id: `propuesta:${p.id}`, label: `${nombreMarca(p.marcaId)} · ${p.campana}`, grupo: "Propuestas" })),
    ...ctx.marcas.map((m) => ({ id: `marca:${m.id}`, label: m.nombre, grupo: "Marcas" })),
    ...ctx.contactos.map((c) => ({ id: `contacto:${c.id}`, label: `${c.nombre} (${nombreMarca(c.marcaId)})`, grupo: "Contactos" })),
  ]
}

/**
 * Cómo se dice dónde vive, corto, para las listas: «Lumea Skin · Cobros», «Nuura · Propuesta»,
 * «CRM · Media kit», «Personal · Administración».
 */
export function textoDonde(donde: DondeTarea, ctx: ContextoTareas): string {
  const tipo = nombreDeTipo(donde)
  const collab = collabDe(donde, ctx)
  if (collab) return `${ctx.marcas.find((m) => m.id === collab.marcaId)?.nombre ?? collab.campana} · ${tipo}`
  const registro = registroDe(donde, ctx)
  if (registro) return `${registro.tipo === "propuesta" ? registro.nombre.split(" · ")[0] : registro.nombre} · ${tipo}`
  return `${PAGINAS_TAREA[donde.pagina]} · ${tipo}`
}

/** Las migas de la ficha: «Campañas › Lumea Skin · Rutina de noche › Cobros», con su enlace cada una. */
export function migasDonde(donde: DondeTarea, ctx: ContextoTareas): { label: string; href?: string }[] {
  const pagina = { label: PAGINAS_TAREA[donde.pagina], href: `/workspace/tareas/${donde.pagina}` }
  const tipo = { label: nombreDeTipo(donde), href: hrefDonde(donde) }
  const proyecto = proyectoDe(donde, ctx)
  if (!proyecto) return [pagina, tipo]
  // La campaña lleva a su Resumen; el registro del CRM, a su ficha (la misma que el tipo).
  const hrefProyecto = donde.pagina === "campanas" ? `/workspace/collabs/${donde.collabId}` : hrefDonde(donde)
  return [pagina, { label: proyecto.label, href: hrefProyecto }, tipo]
}

const PESTANA_COLLAB: Record<string, string> = { general: "", contenidos: "/contenidos", materiales: "/materiales", contrato: "/contrato", cobros: "/facturacion", resultados: "/resultados" }

/** La página del workspace donde vive la tarea: la pestaña de la campaña o la ficha del CRM. */
export function hrefDonde(donde: DondeTarea): string | undefined {
  if (donde.pagina === "campanas") {
    const base = `/workspace/collabs/${donde.collabId}${PESTANA_COLLAB[donde.tipo]}`
    return donde.tipo === "contenidos" && donde.piezaId ? `${base}/${donde.piezaId}` : base
  }
  if (donde.pagina === "crm") {
    switch (donde.tipo) {
      case "propuesta":
        return donde.registroId ? `/workspace/crm?registro=${donde.registroId}` : "/workspace/crm"
      case "marca":
        return donde.registroId ? `/workspace/crm/marcas?registro=${donde.registroId}` : "/workspace/crm/marcas"
      case "contacto":
        return donde.registroId ? `/workspace/crm/contactos?registro=${donde.registroId}` : "/workspace/crm/contactos"
      case "media-kit":
        return "/workspace/crm/media-kit"
      case "plantillas":
        return "/workspace/crm/plantillas"
    }
  }
  return undefined
}

/** Para las listas de cada página: las tareas de una campaña, de una de sus pestañas, de una pieza o de un registro. */
export type FiltroDonde = { pagina?: PaginaTarea; tipo?: TipoTarea; collabId?: string; piezaId?: string; registroId?: string }

export function perteneceA(t: Tarea, f: FiltroDonde): boolean {
  const d = t.donde
  if (f.pagina && d.pagina !== f.pagina) return false
  if (f.tipo && d.tipo !== f.tipo) return false
  if (f.collabId && (d.pagina !== "campanas" || d.collabId !== f.collabId)) return false
  if (f.piezaId && (d.pagina !== "campanas" || d.piezaId !== f.piezaId)) return false
  if (f.registroId && (d.pagina !== "crm" || d.registroId !== f.registroId)) return false
  return true
}

export function tareasDe(tareas: Tarea[], f: FiltroDonde) {
  return tareas.filter((t) => perteneceA(t, f))
}

/** Lo que pone una lista de una página a las tareas que nacen en ella: su sitio, ya elegido. */
export function dondeDeFiltro(f: FiltroDonde): DondeTarea | undefined {
  const pagina = f.pagina ?? (f.collabId ? "campanas" : f.registroId ? "crm" : undefined)
  // Los `as` de abajo son seguros: `paginaDeTipo` acaba de comprobar que el tipo es de esa página.
  if (pagina === "campanas" && f.collabId) {
    const tipo = f.tipo && paginaDeTipo(f.tipo) === "campanas" ? f.tipo : "general"
    return { pagina, tipo: tipo as Extract<DondeTarea, { pagina: "campanas" }>["tipo"], collabId: f.collabId, piezaId: f.piezaId }
  }
  if (pagina === "crm") {
    const tipo = f.tipo && paginaDeTipo(f.tipo) === "crm" ? f.tipo : "propuesta"
    return { pagina, tipo: tipo as Extract<DondeTarea, { pagina: "crm" }>["tipo"], registroId: f.registroId }
  }
  if (pagina === "personal") {
    const tipo = f.tipo && paginaDeTipo(f.tipo) === "personal" ? f.tipo : "personal"
    return { pagina, tipo: tipo as Extract<DondeTarea, { pagina: "personal" }>["tipo"] }
  }
  return undefined
}

// ───────────────────────── Nueva y actividad ─────────────────────────

/**
 * Una tarea nueva con lo que falta puesto por defecto: por hacer, prioridad normal, sin etiquetas.
 * Un dato que llega vacío (`undefined`) no pisa el valor por defecto.
 */
export function nuevaTarea(datos: Pick<Tarea, "titulo" | "donde"> & Partial<Omit<Tarea, "id" | "titulo" | "donde">>, id: string, ahora: string): Tarea {
  return {
    ...datos,
    id,
    estado: datos.estado ?? "por-hacer",
    prioridad: datos.prioridad ?? "normal",
    etiquetas: datos.etiquetas ?? [],
    orden: datos.orden ?? 0,
    origen: datos.origen ?? "manual",
    actividad: datos.actividad ?? [],
    creadaEl: datos.creadaEl ?? ahora,
  }
}

export function conEntrada(t: Tarea, entrada: Omit<EntradaTarea, "id">, id: string): Tarea {
  return { ...t, actividad: [...t.actividad, { ...entrada, id }] }
}

const fechaCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" })
const diaLegible = (f?: string) => (f ? `${fechaCorta.format(new Date(`${soloFecha(f)}T12:00:00`)).replace(".", "")}${f.length > 10 ? ` ${f.slice(11, 16)}` : ""}` : "sin fecha")

/** Lo que ha cambiado de una tarea, en frases para su actividad: «Estado: Por hacer → Hecha». */
export function describirCambios(antes: Tarea, despues: Tarea, ctx: ContextoTareas): string[] {
  const cambios: string[] = []
  const estado = (e: EstadoTarea) => ESTADOS_TAREA.find((x) => x.id === e)?.label ?? e
  const prioridad = (p: Tarea["prioridad"]) => PRIORIDADES_TAREA.find((x) => x.id === p)?.label ?? p
  if (antes.titulo !== despues.titulo) cambios.push(`Título: «${despues.titulo}»`)
  if (antes.estado !== despues.estado) cambios.push(`Estado: ${estado(antes.estado)} → ${estado(despues.estado)}`)
  if (antes.prioridad !== despues.prioridad) cambios.push(`Prioridad: ${prioridad(antes.prioridad)} → ${prioridad(despues.prioridad)}`)
  if (antes.fecha !== despues.fecha) cambios.push(`Fecha: ${diaLegible(antes.fecha)} → ${diaLegible(despues.fecha)}`)
  if (antes.fechaLimite !== despues.fechaLimite) cambios.push(`Fecha límite: ${diaLegible(antes.fechaLimite)} → ${diaLegible(despues.fechaLimite)}`)
  if (JSON.stringify(antes.donde) !== JSON.stringify(despues.donde)) cambios.push(`Ahora en ${migasDonde(despues.donde, ctx).map((m) => m.label).join(" › ")}`)
  if (JSON.stringify(antes.repetir) !== JSON.stringify(despues.repetir)) cambios.push(despues.repetir ? `Se repite: ${describirRepeticion(despues.repetir).toLowerCase()}` : "Ya no se repite")
  return cambios
}

let contador = 0

/** Identificador para lo que se crea en pantalla; en el portal lo pone la base de datos. */
export function idNuevo(prefijo: string) {
  contador += 1
  return `${prefijo}-${Date.now().toString(36)}-${contador}`
}
