// Lógica de las tareas: de qué son, cuándo tocan (vencidas, hoy, esta semana…), en qué orden se
// hacen hoy, cómo se repiten y cómo nace una nueva. Pura: sin datos ni React.
import {
  ESTADOS_TAREA,
  FRECUENCIAS_TAREA,
  PRIORIDADES_TAREA,
  TIPOS_TAREA,
  type Collab,
  type Contacto,
  type DondeTarea,
  type EntradaTarea,
  type EstadoTarea,
  type GrupoEstadoTarea,
  type Marca,
  type Propuesta,
  type RegistroTarea,
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

// ───────────────────────── Tipo y de qué es ─────────────────────────

export type ContextoTareas = { collabs: Collab[]; propuestas: Propuesta[]; marcas: Marca[]; contactos: Contacto[] }

/** Una tarea nueva, sin decir otra cosa, no tiene tipo: es general. */
export const SIN_TIPO: DondeTarea = { tipo: "sin-tipo" }

export const nombreDeTipo = (donde: Pick<DondeTarea, "tipo">) => TIPOS_TAREA[donde.tipo]

type Registro = RegistroTarea & { nombre: string; marcaId?: string }

/** La ficha del CRM de una tarea, si la tiene: la propuesta, la marca o el contacto. */
export function registroDe(donde: DondeTarea, ctx: ContextoTareas): Registro | undefined {
  if (donde.tipo !== "crm" || !donde.registro) return undefined
  const { tipo, id } = donde.registro
  if (tipo === "propuesta") {
    const p = ctx.propuestas.find((x) => x.id === id)
    if (!p) return undefined
    const marca = ctx.marcas.find((m) => m.id === p.marcaId)
    return { tipo, id, nombre: `${marca?.nombre ?? ""} · ${p.campana}`, marcaId: p.marcaId }
  }
  if (tipo === "marca") {
    const m = ctx.marcas.find((x) => x.id === id)
    return m ? { tipo, id, nombre: m.nombre, marcaId: m.id } : undefined
  }
  const c = ctx.contactos.find((x) => x.id === id)
  if (!c) return undefined
  const marca = ctx.marcas.find((m) => m.id === c.marcaId)
  return { tipo, id, nombre: marca ? `${c.nombre} (${marca.nombre})` : c.nombre, marcaId: c.marcaId }
}

/** La campaña de una tarea de Collabs o de Cobros, si es de una. */
export function collabIdDe(donde: DondeTarea): string | undefined {
  return donde.tipo === "collabs" || donde.tipo === "cobros" ? donde.collabId : undefined
}

export function collabDe(donde: DondeTarea, ctx: ContextoTareas): Collab | undefined {
  const id = collabIdDe(donde)
  return id ? ctx.collabs.find((c) => c.id === id) : undefined
}

/** La marca de una tarea: la de su campaña o la de su ficha del CRM. */
export function marcaIdDe(donde: DondeTarea, ctx: ContextoTareas): string | undefined {
  return collabDe(donde, ctx)?.marcaId ?? registroDe(donde, ctx)?.marcaId
}

/** «Lumea Skin · Rutina de noche»: cómo se nombra una campaña en los selectores y grupos. */
export function nombreDeCampana(c: Collab, ctx: ContextoTareas) {
  return `${ctx.marcas.find((m) => m.id === c.marcaId)?.nombre ?? ""} · ${c.campana}`
}

/**
 * El proyecto de una tarea: su campaña o su ficha del CRM, con un id único entre todos
 * («collab:lumea», «propuesta:p-nuura»). Sirve para filtrar y agrupar «todo lo de Lumea».
 */
export function proyectoDe(donde: DondeTarea, ctx: ContextoTareas): { id: string; label: string } | undefined {
  const collab = collabDe(donde, ctx)
  if (collab) return { id: `collab:${collab.id}`, label: nombreDeCampana(collab, ctx) }
  const r = registroDe(donde, ctx)
  return r ? { id: `${r.tipo}:${r.id}`, label: r.nombre } : undefined
}

/** Todos los proyectos posibles: las campañas y las fichas del CRM, para los filtros. */
export function proyectosPosibles(ctx: ContextoTareas): { id: string; label: string; grupo: string }[] {
  return [
    ...ctx.collabs.map((c) => ({ id: `collab:${c.id}`, label: nombreDeCampana(c, ctx), grupo: "Campañas" })),
    ...registrosPosibles(ctx).map((r) => ({ id: `${r.tipo}:${r.id}`, label: r.label, grupo: r.grupo })),
  ]
}

const GRUPOS_REGISTRO: Record<RegistroTarea["tipo"], string> = { propuesta: "Propuestas", marca: "Marcas", contacto: "Contactos" }

/** Las fichas del CRM a las que puede ir una tarea del CRM, agrupadas. */
export function registrosPosibles(ctx: ContextoTareas): (RegistroTarea & { label: string; grupo: string })[] {
  const nombreMarca = (id: string) => ctx.marcas.find((m) => m.id === id)?.nombre ?? ""
  return [
    ...ctx.propuestas.map((p) => ({ tipo: "propuesta" as const, id: p.id, label: `${nombreMarca(p.marcaId)} · ${p.campana}`, grupo: GRUPOS_REGISTRO.propuesta })),
    ...ctx.marcas.map((m) => ({ tipo: "marca" as const, id: m.id, label: m.nombre, grupo: GRUPOS_REGISTRO.marca })),
    ...ctx.contactos.map((c) => ({ tipo: "contacto" as const, id: c.id, label: `${c.nombre} (${nombreMarca(c.marcaId)})`, grupo: GRUPOS_REGISTRO.contacto })),
  ]
}

/**
 * Cómo se dice de qué es, corto, para las listas: «Lumea Skin · Cobros», «Nuura · CRM»,
 * «Collabs». Las de sin tipo no dicen nada.
 */
export function textoDonde(donde: DondeTarea, ctx: ContextoTareas): string {
  const tipo = nombreDeTipo(donde)
  const collab = collabDe(donde, ctx)
  if (collab) return `${ctx.marcas.find((m) => m.id === collab.marcaId)?.nombre ?? collab.campana} · ${tipo}`
  const registro = registroDe(donde, ctx)
  if (registro) return `${registro.tipo === "propuesta" ? registro.nombre.split(" · ")[0] : registro.nombre} · ${tipo}`
  return donde.tipo === "sin-tipo" ? "" : tipo
}

/** Las migas de la ficha: «Cobros › Lumea Skin · Rutina de noche», con su enlace cada una. */
export function migasDonde(donde: DondeTarea, ctx: ContextoTareas): { label: string; href?: string }[] {
  if (donde.tipo === "sin-tipo") return []
  const tipo = { label: nombreDeTipo(donde), href: HREF_TIPO[donde.tipo] }
  const proyecto = proyectoDe(donde, ctx)
  return proyecto ? [tipo, { label: proyecto.label, href: hrefDonde(donde) }] : [tipo]
}

const HREF_TIPO: Record<TipoTarea, string | undefined> = { "sin-tipo": undefined, crm: "/workspace/crm", collabs: "/workspace/collabs", cobros: "/workspace/cobros" }

/** Donde se trabaja la tarea: la campaña (su pieza o su facturación), la ficha del CRM o la página de su tipo. */
export function hrefDonde(donde: DondeTarea): string | undefined {
  if (donde.tipo === "collabs" && donde.collabId) return `/workspace/collabs/${donde.collabId}${donde.piezaId ? `/contenidos/${donde.piezaId}` : ""}`
  if (donde.tipo === "cobros" && donde.collabId) return `/workspace/collabs/${donde.collabId}/facturacion`
  if (donde.tipo === "crm" && donde.registro) {
    const ruta = { propuesta: "/workspace/crm", marca: "/workspace/crm/marcas", contacto: "/workspace/crm/contactos" }[donde.registro.tipo]
    return `${ruta}?registro=${donde.registro.id}`
  }
  return HREF_TIPO[donde.tipo]
}

/** Para las listas de cada página: las tareas de un tipo, de una campaña, de una pieza o de una ficha del CRM. */
export type FiltroDonde = { tipo?: TipoTarea; collabId?: string; piezaId?: string; registro?: RegistroTarea }

export function perteneceA(t: Tarea, f: FiltroDonde): boolean {
  const d = t.donde
  if (f.tipo && d.tipo !== f.tipo) return false
  if (f.collabId && collabIdDe(d) !== f.collabId) return false
  if (f.piezaId && (d.tipo !== "collabs" || d.piezaId !== f.piezaId)) return false
  if (f.registro && (d.tipo !== "crm" || d.registro?.tipo !== f.registro.tipo || d.registro.id !== f.registro.id)) return false
  return true
}

export function tareasDe(tareas: Tarea[], f: FiltroDonde) {
  return tareas.filter((t) => perteneceA(t, f))
}

/**
 * El mismo sitio con otro tipo: la campaña pasa de Collabs a Cobros (y al revés); lo demás no tiene
 * sentido en el tipo nuevo y se quita.
 */
export function cambiarTipo(donde: DondeTarea, tipo: TipoTarea): DondeTarea {
  if (donde.tipo === tipo) return donde
  const collabId = collabIdDe(donde)
  if (tipo === "collabs" || tipo === "cobros") return collabId ? { tipo, collabId } : { tipo }
  return { tipo }
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

/**
 * Identificador para lo que se crea en pantalla. Es aleatorio para que no choque con lo de nadie más
 * cuando se guarda en la base de datos.
 */
export function idNuevo(prefijo: string) {
  return `${prefijo}-${crypto.randomUUID()}`
}
