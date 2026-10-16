// Las automatizaciones del workspace: «cuando pasa esto, se crea una tarea o un registro». Cada
// influencer tiene las suyas: de serie, las de AUTOMATIZACIONES_DE_SERIE, que puede cambiar, apagar
// o borrar y volver a poner con «Restaurar por defecto». Puro: la app dispara los eventos (en el
// navegador lo que hace ella; en el servidor lo que hace la marca) y aplica el plan que sale de aquí.
import { z } from "zod"
import { ESTADOS_COLLAB, ESTADOS_PROPUESTA, LISTA_TIPOS_TAREA, type Collab, type DondeTarea, type EstadoCollab, type EstadoPropuesta, type PrioridadTarea, type Propuesta, type Tarea, type TipoTarea, type TipoVersion } from "@/lib/influencer/modelo"
import { soloFecha, sumarDias } from "@/lib/influencer/fechas"
import { conEstado, estaCerrada, nuevaTarea } from "@/lib/influencer/tareas"
import { crearTareas, type Reloj } from "@/lib/influencer/tareas-cambios"

// ─────────────── Qué puede pasar ───────────────

export type EventoAutomatizacion =
  | `propuesta:${EstadoPropuesta}`
  | "collab:creada"
  | `collab:${EstadoCollab}`
  | "marca:feedback"
  | "marca:cambios"
  | "marca:aprueba-guion"
  | "marca:aprueba-contenido"
  | "marca:brief"
  | "marca:firma"

/** De qué es lo que pasa: decide qué datos hay (fechas, variables) y qué se puede crear. */
export type ObjetoEvento = "propuesta" | "collab" | "version"

/** Desde qué día se cuenta una tarea: el día en que pasa, o una fecha de la collab o de cada contenido. */
export type FechaBase = "hoy" | "inicio" | "fin" | "ultima-publicacion" | "publicacion" | "guion"

export const FECHAS_BASE: Record<FechaBase, string> = {
  hoy: "el día en que pasa",
  inicio: "el inicio de la collab",
  fin: "el fin de la collab",
  "ultima-publicacion": "la última publicación",
  publicacion: "la publicación de cada contenido",
  guion: "el guion de cada contenido",
}

/** Los registros que puede crear una automatización. */
export type RegistroAutomatico = "collab" | "contrato"

export const REGISTROS_AUTOMATICOS: Record<RegistroAutomatico, { label: string; descripcion: string }> = {
  collab: { label: "La collab", descripcion: "Con la marca, la persona, la campaña, las fechas, el importe y los entregables de la propuesta." },
  contrato: { label: "El contrato", descripcion: "En borrador, con la plantilla de contrato que tocaste por última vez (si tienes alguna), listo para revisarlo y mandarlo a firmar." },
}

/** Dónde se ajustan: una página, su subpágina y el bloque. Cada evento es de un bloque. */
export type BloqueAutomatizable = "crm-pipeline" | "collabs-directorio" | "collab-contenidos" | "collab-brief" | "collab-contrato"

export const BLOQUES_AUTOMATIZABLES: { id: BloqueAutomatizable; pagina: string; subpagina: string; bloque: string; descripcion: string }[] = [
  { id: "crm-pipeline", pagina: "CRM", subpagina: "Pipeline", bloque: "Propuestas", descripcion: "Lo que pasa cuando una propuesta cambia de estado." },
  { id: "collabs-directorio", pagina: "Collabs", subpagina: "Directorio", bloque: "Collabs", descripcion: "Lo que pasa al crear una collab y cuando cambia de estado." },
  { id: "collab-contenidos", pagina: "Collabs", subpagina: "Ficha de una collab", bloque: "Contenidos", descripcion: "Lo que pasa cuando la marca revisa un guion o un contenido." },
  { id: "collab-brief", pagina: "Collabs", subpagina: "Ficha de una collab", bloque: "Brief y materiales", descripcion: "Lo que pasa cuando la marca manda el brief o los materiales por su formulario." },
  { id: "collab-contrato", pagina: "Collabs", subpagina: "Ficha de una collab", bloque: "Contrato", descripcion: "Lo que pasa cuando la marca firma el contrato." },
]

type DefEvento = { label: string; objeto: ObjetoEvento; bloque: BloqueAutomatizable }

const MARCA: Record<Extract<EventoAutomatizacion, `marca:${string}`>, DefEvento> = {
  "marca:feedback": { label: "La marca comenta un guion o un contenido", objeto: "version", bloque: "collab-contenidos" },
  "marca:cambios": { label: "La marca pide cambios", objeto: "version", bloque: "collab-contenidos" },
  "marca:aprueba-guion": { label: "La marca aprueba un guion", objeto: "version", bloque: "collab-contenidos" },
  "marca:aprueba-contenido": { label: "La marca aprueba un contenido", objeto: "version", bloque: "collab-contenidos" },
  "marca:brief": { label: "La marca manda el brief o los materiales", objeto: "collab", bloque: "collab-brief" },
  "marca:firma": { label: "La marca firma el contrato", objeto: "collab", bloque: "collab-contrato" },
}

/** Todos los eventos, en el orden en que se enseñan. */
export const EVENTOS: Record<EventoAutomatizacion, DefEvento> = {
  ...Object.fromEntries(ESTADOS_PROPUESTA.map((e) => [`propuesta:${e.id}`, { label: e.id === "nueva" ? "Entra una propuesta nueva" : `Una propuesta pasa a «${e.label}»`, objeto: "propuesta", bloque: "crm-pipeline" } satisfies DefEvento])),
  "collab:creada": { label: "Se crea una collab", objeto: "collab", bloque: "collabs-directorio" },
  ...Object.fromEntries(ESTADOS_COLLAB.map((e) => [`collab:${e.id}`, { label: `Una collab pasa a «${e.label}»`, objeto: "collab", bloque: "collabs-directorio" } satisfies DefEvento])),
  ...MARCA,
} as Record<EventoAutomatizacion, DefEvento> // las claves salen de las listas de estados: el tipo las da todas

export const LISTA_EVENTOS = Object.keys(EVENTOS) as EventoAutomatizacion[]

export const eventosDelBloque = (bloque: BloqueAutomatizable) => LISTA_EVENTOS.filter((e) => EVENTOS[e].bloque === bloque)

/** Desde qué días se puede contar en un evento (las de cada contenido, solo con «una por contenido»). */
export function fechasDe(evento: EventoAutomatizacion, porCadaPieza = false): FechaBase[] {
  if (EVENTOS[evento].objeto !== "collab") return ["hoy"]
  return porCadaPieza ? ["publicacion", "guion", "hoy", "inicio", "fin"] : ["hoy", "inicio", "fin", "ultima-publicacion"]
}

/** Qué registros se pueden crear en un evento: la collab desde una propuesta; el contrato desde una collab. */
export function registrosDe(evento: EventoAutomatizacion): RegistroAutomatico[] {
  const objeto = EVENTOS[evento].objeto
  return objeto === "propuesta" ? ["collab"] : objeto === "collab" ? ["contrato"] : []
}

/** Las variables que se pueden escribir en el título de una tarea, según de qué sea el evento. */
export function variablesDe(evento: EventoAutomatizacion, porCadaPieza = false): { clave: string; label: string }[] {
  const objeto = EVENTOS[evento].objeto
  const base = [
    { clave: "{marca}", label: "Marca" },
    { clave: "{campana}", label: "Campaña" },
  ]
  if (objeto === "version") return [...base, { clave: "{pieza}", label: "Contenido" }, { clave: "{parte}", label: "Guion o contenido" }]
  return objeto === "collab" && porCadaPieza ? [...base, { clave: "{pieza}", label: "Contenido" }] : base
}

// ─────────────── Las reglas ───────────────

export type AccionTarea = {
  tipo: "tarea"
  /** Con variables: «Mandar la factura a {marca}». */
  titulo: string
  /** Cuántos días después (antes, si es negativo) de qué fecha. */
  cuando: { dias: number; desde: FechaBase }
  prioridad: PrioridadTarea
  subtareas: string[]
  /** Una tarea por cada contenido de la collab, en su fecha. */
  porCadaPieza?: boolean
  /** Una sola tarea por versión: cada comentario de la marca entra como subtarea. */
  agruparPorVersion?: boolean
  /** En qué página sale; sin ella, la de lo que pasa (el CRM o Collabs). */
  pagina?: TipoTarea
}

export type AccionRegistro = { tipo: "registro"; registro: RegistroAutomatico }

export type AccionAutomatizacion = AccionTarea | AccionRegistro

export type Automatizacion = { id: string; evento: EventoAutomatizacion; accion: AccionAutomatizacion; activa: boolean }

/** Lo que se guarda de cada una: sus reglas. Sin guardar nada, las de serie. */
export type AjustesAutomatizaciones = { reglas: Automatizacion[] }

const prioridad = z.enum(["urgente", "alta", "normal", "baja"])
const accionTarea = z.object({
  tipo: z.literal("tarea"),
  titulo: z.string().trim().min(1, "Escribe qué hay que hacer").max(160, "Máximo 160 caracteres"),
  cuando: z.object({ dias: z.number().int().min(-365, "Como mucho, un año antes").max(365, "Como mucho, un año después"), desde: z.enum(["hoy", "inicio", "fin", "ultima-publicacion", "publicacion", "guion"]) }),
  prioridad,
  subtareas: z.array(z.string().trim().min(1).max(160)).max(30),
  porCadaPieza: z.boolean().optional(),
  agruparPorVersion: z.boolean().optional(),
  pagina: z.enum(LISTA_TIPOS_TAREA).optional(),
})
const accionRegistro = z.object({ tipo: z.literal("registro"), registro: z.enum(["collab", "contrato"]) })

export const esquemaAutomatizacion = z.object({
  id: z.string().min(1).max(80),
  evento: z.enum(LISTA_EVENTOS as [EventoAutomatizacion, ...EventoAutomatizacion[]]),
  accion: z.discriminatedUnion("tipo", [accionTarea, accionRegistro]),
  activa: z.boolean(),
})

export const esquemaAjustesAutomatizaciones = z.object({ reglas: z.array(esquemaAutomatizacion).max(200) })

/** Las reglas que valen: las suyas o, si nunca las ha tocado, las de serie. */
export const reglasDe = (ajustes: AjustesAutomatizaciones | null | undefined): Automatizacion[] => ajustes?.reglas ?? AUTOMATIZACIONES_DE_SERIE

export const reglasDelBloque = (reglas: Automatizacion[], bloque: BloqueAutomatizable) => reglas.filter((r) => EVENTOS[r.evento].bloque === bloque)

const deSerieDe = (id: string) => AUTOMATIZACIONES_DE_SERIE.find((r) => r.id === id)
export const esDeSerie = (r: Automatizacion) => !!deSerieDe(r.id)

/** El valor como texto con las claves en orden: lo guardado vuelve de la base con otro orden y sigue siendo lo mismo. */
function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`
  if (valor && typeof valor === "object") {
    const entradas = Object.entries(valor).filter(([, v]) => v !== undefined)
    return `{${entradas
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonico(v)}`)
      .join(",")}}`
  }
  return JSON.stringify(valor)
}

/** Si las de un bloque ya no son las de serie (alguna cambiada, borrada o añadida). */
export function difiereDeSerie(reglas: Automatizacion[], bloque: BloqueAutomatizable): boolean {
  const suyas = reglasDelBloque(reglas, bloque)
  const deSerie = reglasDelBloque(AUTOMATIZACIONES_DE_SERIE, bloque)
  return suyas.length !== deSerie.length || suyas.some((r) => canonico(r) !== canonico(deSerieDe(r.id)))
}

/** «Restaurar por defecto»: las de serie del bloque vuelven tal cual (también las borradas) y las suyas de ese bloque se van. */
export function restaurarDeSerie(reglas: Automatizacion[], bloque: BloqueAutomatizable): Automatizacion[] {
  return [...reglas.filter((r) => EVENTOS[r.evento].bloque !== bloque), ...reglasDelBloque(AUTOMATIZACIONES_DE_SERIE, bloque)]
}

// ─────────────── Cómo se leen ───────────────

/** «el mismo día», «3 días después de la publicación de cada contenido», «2 días antes del fin de la collab». */
export function describirCuando({ dias, desde }: AccionTarea["cuando"]): string {
  const cuantos = `${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`
  if (desde === "hoy") return dias === 0 ? "el mismo día" : dias > 0 ? `${cuantos} después` : `${cuantos} antes`
  const fecha = FECHAS_BASE[desde]
  return dias === 0 ? `el día de ${fecha}` : `${cuantos} ${dias > 0 ? "después de" : "antes de"} ${fecha}`
}

/** Lo que hace, en una frase: «Crea la collab» o «Crea la tarea «Publicar {pieza}», una por contenido, el día de…». */
export function describirAccion(accion: AccionAutomatizacion): string {
  if (accion.tipo === "registro") return `Crea ${REGISTROS_AUTOMATICOS[accion.registro].label.toLowerCase()}`
  const extra = accion.porCadaPieza ? ", una por contenido," : accion.agruparPorVersion ? " (una por versión, con cada comentario como subtarea)" : ""
  return `Crea la tarea «${accion.titulo}»${extra} ${describirCuando(accion.cuando)}`
}

// ─────────────── Lo que pasa y lo que sale ───────────────

type Pieza = Collab["piezas"][number]

/** Lo que ha pasado, con los datos que hacen falta para las tareas. `marca`, su nombre. */
export type Ocurrido =
  | { objeto: "propuesta"; evento: EventoAutomatizacion; propuesta: Pick<Propuesta, "id" | "campana">; marca?: string }
  | { objeto: "collab"; evento: EventoAutomatizacion; collab: Pick<Collab, "id" | "campana" | "desde" | "hasta"> & { piezas: Pick<Pieza, "id" | "titulo" | "publicacion" | "fechaGuion" | "sinGuion">[] }; marca?: string }
  | { objeto: "version"; evento: EventoAutomatizacion; collab: Pick<Collab, "id" | "campana">; pieza: Pick<Pieza, "id" | "titulo">; parte: TipoVersion; version: { id: string; numero: number }; comentario?: string; marca?: string }

/** Una tarea que se va a crear (o, si ya está la de su `clave` y es de las agrupadas, a la que se añade una subtarea). */
export type TareaPlaneada = {
  /** Qué regla y de qué registro: con ella no se repite y el feedback de una versión va siempre a la misma. */
  clave: string
  titulo: string
  fecha?: string
  prioridad: PrioridadTarea
  donde: DondeTarea
  /** Las subtareas con las que nace. */
  subtareas: string[]
  /** La subtarea de lo que acaba de pasar (un comentario): entra también si la tarea ya existe. */
  nuevaSubtarea?: string
}

export type Plan = { tareas: TareaPlaneada[]; registros: RegistroAutomatico[] }

const LARGO_SUBTAREA = 160
const recortar = (texto: string) => (texto.length > LARGO_SUBTAREA ? `${texto.slice(0, LARGO_SUBTAREA - 1).trimEnd()}…` : texto)

function rellenar(titulo: string, valores: Record<string, string>) {
  return titulo.replace(/\{(\w+)\}/g, (todo, clave: string) => valores[clave] ?? todo).trim()
}

function dondeDe(o: Ocurrido, pagina: TipoTarea | undefined, piezaId?: string): DondeTarea {
  const collabId = o.objeto === "propuesta" ? undefined : o.collab.id
  const tipo = pagina ?? (o.objeto === "propuesta" ? "crm" : "collabs")
  if (tipo === "crm") return o.objeto === "propuesta" ? { tipo, registro: { tipo: "propuesta", id: o.propuesta.id } } : { tipo }
  if (tipo === "collabs") return { tipo, collabId, piezaId: piezaId ?? (o.objeto === "version" ? o.pieza.id : undefined) }
  if (tipo === "cobros") return { tipo, collabId }
  return { tipo }
}

/** El día del que se cuenta, o nada si ese registro no lo tiene (un contenido sin guion). */
function fechaBase(o: Ocurrido, desde: FechaBase, hoy: string, pieza?: Pick<Pieza, "publicacion" | "fechaGuion" | "sinGuion">): string | undefined {
  if (desde === "hoy" || o.objeto !== "collab") return soloFecha(hoy)
  if (desde === "inicio") return o.collab.desde
  if (desde === "fin") return o.collab.hasta
  if (desde === "ultima-publicacion") return o.collab.piezas.map((p) => p.publicacion).filter(Boolean).sort().at(-1) ?? o.collab.hasta
  if (desde === "publicacion") return pieza?.publicacion || undefined
  return pieza && !pieza.sinGuion ? pieza.fechaGuion : undefined
}

function tareasDeLaRegla(regla: Automatizacion & { accion: AccionTarea }, o: Ocurrido, hoy: string): TareaPlaneada[] {
  const a = regla.accion
  const valores: Record<string, string> = { marca: o.marca || "la marca", campana: o.objeto === "propuesta" ? o.propuesta.campana : o.collab.campana }
  const una = (clave: string, extra: Record<string, string>, fecha: string | undefined, piezaId?: string): TareaPlaneada => ({
    clave: `${regla.id}:${clave}`,
    titulo: rellenar(a.titulo, { ...valores, ...extra }) || "Tarea automática",
    fecha: fecha ? sumarDias(fecha, a.cuando.dias) : undefined,
    prioridad: a.prioridad,
    donde: dondeDe(o, a.pagina, piezaId),
    subtareas: a.subtareas,
  })
  if (o.objeto === "collab" && a.porCadaPieza) {
    return o.collab.piezas.flatMap((p) => {
      const fecha = fechaBase(o, a.cuando.desde, hoy, p)
      return fecha ? [una(p.id, { pieza: p.titulo }, fecha, p.id)] : []
    })
  }
  if (o.objeto === "version") {
    const extra = { pieza: o.pieza.titulo, parte: o.parte === "guion" ? "el guion" : "el contenido" }
    if (!a.agruparPorVersion) return [una(o.version.id, extra, soloFecha(hoy))]
    const tarea = una(o.version.id, extra, soloFecha(hoy))
    // Desde la segunda versión, el título lo dice: el feedback de la v2 es otra tarea.
    return [{ ...tarea, titulo: o.version.numero > 1 ? `${tarea.titulo} (v${o.version.numero})` : tarea.titulo, nuevaSubtarea: o.comentario?.trim() ? recortar(o.comentario.trim()) : undefined }]
  }
  return [una(o.objeto === "propuesta" ? o.propuesta.id : o.collab.id, {}, fechaBase(o, a.cuando.desde, hoy))]
}

/** Lo que sale de lo que ha pasado con sus reglas activas: las tareas y los registros que hay que crear. */
export function planificar(o: Ocurrido, reglas: Automatizacion[], hoy: string): Plan {
  const suyas = reglas.filter((r) => r.activa && r.evento === o.evento)
  const registros = [...new Set(suyas.flatMap((r) => (r.accion.tipo === "registro" && registrosDe(r.evento).includes(r.accion.registro) ? [r.accion.registro] : [])))]
  const tareas = suyas.flatMap((r) => (r.accion.tipo === "tarea" ? tareasDeLaRegla({ ...r, accion: r.accion }, o, hoy) : []))
  return { tareas, registros }
}

/**
 * Aplica las tareas del plan a la lista: crea las que no existen (con sus subtareas) y, en las que
 * ya existen por su clave, añade la subtarea nueva (un comentario más) y reabre la tarea si ya
 * estaba hecha. Las que ya existen sin subtarea nueva no se tocan: nada se duplica.
 */
export function aplicarPlan(tareas: Tarea[], plan: TareaPlaneada[], reloj: Reloj): { tareas: Tarea[]; creadas: Tarea[]; cambiadas: Tarea[] } {
  let lista = tareas
  const creadas: Tarea[] = []
  const cambiadas: Tarea[] = []
  const hija = (madre: Tarea, titulo: string) => nuevaTarea({ titulo, donde: madre.donde, padreId: madre.id, origen: "auto" }, reloj.id("t"), reloj.ahora)
  for (const p of plan) {
    const ya = lista.find((t) => t.clave === p.clave && !t.padreId)
    if (ya) {
      if (!p.nuevaSubtarea) continue
      const abierta = ya.estado === "hecha" || ya.estado === "cancelada" ? { ...conEstado(ya, "por-hacer", reloj.ahora), fecha: p.fecha ?? ya.fecha } : ya
      const nueva = hija(abierta, p.nuevaSubtarea)
      lista = crearTareas(abierta === ya ? lista : lista.map((t) => (t.id === ya.id ? abierta : t)), [nueva])
      creadas.push(nueva)
      if (abierta !== ya) cambiadas.push(abierta)
      continue
    }
    const madre = nuevaTarea({ titulo: p.titulo, donde: p.donde, fecha: p.fecha, prioridad: p.prioridad, origen: "auto", clave: p.clave }, reloj.id("t"), reloj.ahora)
    const hijas = [...p.subtareas, ...(p.nuevaSubtarea ? [p.nuevaSubtarea] : [])].map((titulo) => hija(madre, titulo))
    lista = crearTareas(lista, [madre, ...hijas])
    creadas.push(madre, ...hijas)
  }
  return { tareas: lista, creadas, cambiadas }
}

// ─────────────── Las de serie ───────────────

const tarea = (titulo: string, cuando: AccionTarea["cuando"], prioridad: PrioridadTarea, extra: Partial<AccionTarea> = {}): AccionTarea => ({ tipo: "tarea", titulo, cuando, prioridad, subtareas: [], ...extra })
const HOY = (dias = 0) => ({ dias, desde: "hoy" as const })

/**
 * Las de serie (Xavier, 2026-10-15: «las más básicas, en las que si ocurre un evento todo lo que se
 * tendrá que hacer se marque como tarea»): cada una con su id fijo, para restaurarlas.
 */
export const AUTOMATIZACIONES_DE_SERIE: Automatizacion[] = [
  { id: "serie-propuesta-nueva", evento: "propuesta:nueva", activa: true, accion: tarea("Contestar a {marca}", HOY(), "alta") },
  { id: "serie-propuesta-enviada", evento: "propuesta:enviada", activa: true, accion: tarea("Hacer seguimiento de la propuesta a {marca}", HOY(3), "normal") },
  { id: "serie-propuesta-negociando", evento: "propuesta:negociando", activa: true, accion: tarea("Cerrar las condiciones con {marca}", HOY(2), "alta") },
  { id: "serie-propuesta-ganada", evento: "propuesta:ganada", activa: true, accion: { tipo: "registro", registro: "collab" } },
  { id: "serie-propuesta-perdida", evento: "propuesta:perdida", activa: false, accion: tarea("Volver a escribir a {marca}", HOY(90), "baja") },
  { id: "serie-collab-publicar", evento: "collab:creada", activa: true, accion: tarea("Publicar {pieza}", { dias: 0, desde: "publicacion" }, "alta", { porCadaPieza: true }) },
  { id: "serie-collab-guion", evento: "collab:creada", activa: true, accion: tarea("Mandar el guion de {pieza}", { dias: 0, desde: "guion" }, "alta", { porCadaPieza: true }) },
  { id: "serie-collab-contrato", evento: "collab:creada", activa: true, accion: { tipo: "registro", registro: "contrato" } },
  { id: "serie-collab-tarea-contrato", evento: "collab:creada", activa: true, accion: tarea("Preparar y mandar el contrato de {campana}", HOY(1), "normal", { subtareas: ["Revisar las cláusulas", "Mandarlo a firmar"] }) },
  { id: "serie-collab-factura", evento: "collab:creada", activa: true, accion: tarea("Mandar la factura a {marca}", { dias: 0, desde: "ultima-publicacion" }, "alta", { pagina: "cobros" }) },
  { id: "serie-collab-resultados", evento: "collab:publicada", activa: true, accion: tarea("Mandar los resultados de {campana} a {marca}", HOY(7), "normal") },
  { id: "serie-marca-feedback", evento: "marca:feedback", activa: true, accion: tarea("Nuevo feedback: {pieza}", HOY(), "alta", { agruparPorVersion: true }) },
  { id: "serie-marca-aprueba-guion", evento: "marca:aprueba-guion", activa: true, accion: tarea("Grabar {pieza}", HOY(1), "alta") },
  { id: "serie-marca-aprueba-contenido", evento: "marca:aprueba-contenido", activa: false, accion: tarea("Programar la publicación de {pieza}", HOY(), "normal") },
  { id: "serie-marca-brief", evento: "marca:brief", activa: true, accion: tarea("Revisar el brief de {campana}", HOY(), "alta") },
]

/** Una regla nueva de un bloque, para empezar a editarla: una tarea en el primer evento del bloque. */
export function reglaNueva(bloque: BloqueAutomatizable, id: string): Automatizacion {
  return { id, evento: eventosDelBloque(bloque)[0], activa: true, accion: tarea("", HOY(), "normal") }
}

// ─────────────── Lo que ya no toca ───────────────

/** El camino de una propuesta: cada paso deja atrás las tareas de los anteriores. */
const CAMINO_PROPUESTA: EstadoPropuesta[] = ["nueva", "hablando", "enviada", "negociando", "ganada"]

/**
 * Las tareas automáticas de una propuesta que ya no tocan al pasar a `estado` (Xavier, 2026-10-16,
 * auditoría: «Contestar a …» seguía abierta con la propuesta ya enviada): las abiertas de las reglas
 * de sus estados anteriores. Al perderla, todas. Las de una regla suya, igual que las de serie.
 */
export function tareasSuperadas(tareas: Tarea[], reglas: Pick<Automatizacion, "id" | "evento">[], propuestaId: string, estado: EstadoPropuesta): Tarea[] {
  const hasta = estado === "perdida" ? CAMINO_PROPUESTA.length : CAMINO_PROPUESTA.indexOf(estado)
  const anteriores = new Set(CAMINO_PROPUESTA.slice(0, Math.max(hasta, 0)).map((e) => `propuesta:${e}`))
  const claves = new Set(reglas.filter((r) => anteriores.has(r.evento)).map((r) => `${r.id}:${propuestaId}`))
  return tareas.filter((t) => !t.padreId && !!t.clave && claves.has(t.clave) && !estaCerrada(t))
}
