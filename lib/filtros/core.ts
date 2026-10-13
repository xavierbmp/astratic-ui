// Motor de filtros al estilo Airtable: un campo, un operador y un valor.
//
// Es un módulo puro (sin Prisma ni React) para que lo usen igual el servidor —que filtra
// las filas antes de mandarlas— y el cliente —que pinta el editor de filtros—.
// Cada objeto declara sus campos filtrables con una función `valor(fila)`: filtramos en memoria
// sobre las filas ya cargadas, así funcionan también los campos calculados (nº de contactos,
// valor abierto, campañas) que no son columnas de la BD.
//
// Los operadores son los de Airtable, con sus nombres: «contiene», «=», «es cualquiera de»,
// «tiene todos los», «es exactamente», y en las fechas un día relativo a hoy («hoy», «hace 3 días»)
// o un tramo («está dentro de la semana pasada»). Las condiciones se agrupan como en Airtable: un
// grupo une las suyas con Y o con O y puede llevar grupos dentro, hasta tres niveles.

import { domingoDe, hoyLocal, lunesDe, sumarDias } from "@/lib/filtros/fechas"

export type TipoFiltro = "texto" | "numero" | "fecha" | "select" | "multiselect" | "booleano"

export type OpcionFiltro = { value: string; label: string }

/** Valor de una fila ya normalizado para comparar. */
export type ValorFila = string | number | boolean | string[] | null | undefined

export type CampoFiltrable<T> = {
  id: string
  label: string
  tipo: TipoFiltro
  /** Agrupa el selector de campo ("Datos", "Actividad", "Campos propios"…). */
  grupo?: string
  /** Opciones cerradas para `select` y `multiselect`. */
  opciones?: OpcionFiltro[]
  valor: (row: T) => ValorFila
}

export type Operador =
  | "contiene"
  | "no_contiene"
  | "es"
  | "no_es"
  | "mayor"
  | "mayor_igual"
  | "menor"
  | "menor_igual"
  | "antes"
  | "despues"
  | "en_o_antes"
  | "en_o_despues"
  | "dentro_de"
  | "alguno"
  | "ninguno"
  | "todos"
  | "exactamente"
  | "vacio"
  | "no_vacio"
  | "verdadero"
  | "falso"

export type Condicion = {
  campo: string
  op: Operador
  /** Ausente en los operadores sin valor (vacío, no vacío, marcada, sin marcar). */
  valor?: string | string[]
  /** Id del filtro rápido que puso esta condición, para poder quitarla al apagarlo. */
  de?: string
}

export type GrupoCondiciones = {
  union: "y" | "o"
  condiciones: Condicion[]
  /** Grupos dentro de este, unidos con la misma Y u O que sus condiciones. */
  grupos?: GrupoCondiciones[]
}

export const GRUPO_VACIO: GrupoCondiciones = { union: "y", condiciones: [] }

/** Niveles de grupos, contando el de fuera: como en Airtable, hasta tres. */
export const NIVELES_GRUPO = 3

/** Lo que hace falta para comparar fechas con hoy. Sin `hoy`, se toma el día del reloj. */
export type RefFiltro = { hoy?: string }

export type DefOperador = {
  value: Operador
  label: string
  /** No pide valor: el operador se basta solo. */
  sinValor?: boolean
  /** Pide varias opciones en vez de una. */
  multiple?: boolean
  /** En las fechas, el valor es un día («hoy», «hace 3 días», uno exacto) o un tramo («la semana pasada»). */
  fecha?: "dia" | "tramo"
}

const OPS_VACIO: DefOperador[] = [
  { value: "vacio", label: "está vacío", sinValor: true },
  { value: "no_vacio", label: "no está vacío", sinValor: true },
]

const OPERADORES: Record<TipoFiltro, DefOperador[]> = {
  texto: [{ value: "contiene", label: "contiene" }, { value: "no_contiene", label: "no contiene" }, { value: "es", label: "es" }, { value: "no_es", label: "no es" }, ...OPS_VACIO],
  numero: [
    { value: "es", label: "=" },
    { value: "no_es", label: "≠" },
    { value: "menor", label: "<" },
    { value: "mayor", label: ">" },
    { value: "menor_igual", label: "≤" },
    { value: "mayor_igual", label: "≥" },
    ...OPS_VACIO,
  ],
  fecha: [
    { value: "es", label: "es", fecha: "dia" },
    { value: "dentro_de", label: "está dentro de", fecha: "tramo" },
    { value: "antes", label: "es antes de", fecha: "dia" },
    { value: "despues", label: "es después de", fecha: "dia" },
    { value: "en_o_antes", label: "es el mismo día o antes de", fecha: "dia" },
    { value: "en_o_despues", label: "es el mismo día o después de", fecha: "dia" },
    { value: "no_es", label: "no es", fecha: "dia" },
    ...OPS_VACIO,
  ],
  select: [
    { value: "es", label: "es" },
    { value: "no_es", label: "no es" },
    { value: "alguno", label: "es cualquiera de", multiple: true },
    { value: "ninguno", label: "no es ninguno de", multiple: true },
    ...OPS_VACIO,
  ],
  multiselect: [
    { value: "alguno", label: "tiene cualquiera de", multiple: true },
    { value: "todos", label: "tiene todos los", multiple: true },
    { value: "exactamente", label: "es exactamente", multiple: true },
    { value: "ninguno", label: "no tiene ninguno de", multiple: true },
    ...OPS_VACIO,
  ],
  // Como en Airtable, una casilla no tiene desplegable de operador: «es» y la casilla marcada o no.
  booleano: [
    { value: "verdadero", label: "está marcada", sinValor: true },
    { value: "falso", label: "no está marcada", sinValor: true },
  ],
}

export function operadoresDe(tipo: TipoFiltro): DefOperador[] {
  return OPERADORES[tipo]
}

export function defOperador(tipo: TipoFiltro, op: Operador): DefOperador | undefined {
  return OPERADORES[tipo].find((o) => o.value === op)
}

/** Primer operador del tipo: el que se pone al elegir campo o al cambiar de tipo. */
export function operadorPorDefecto(tipo: TipoFiltro): Operador {
  return OPERADORES[tipo][0].value
}

// ---------- Fechas relativas a hoy ----------

/**
 * Los días que se eligen en una condición de fecha, como en Airtable: relativos a hoy o uno exacto.
 * Los que llevan número se guardan como «hace_dias:3»; un día exacto, como «2026-10-13».
 */
export const DIAS_RELATIVOS = [
  { value: "hoy", label: "hoy" },
  { value: "manana", label: "mañana" },
  { value: "ayer", label: "ayer" },
  { value: "hace_semana", label: "hace una semana" },
  { value: "dentro_semana", label: "dentro de una semana" },
  { value: "hace_mes", label: "hace un mes" },
  { value: "dentro_mes", label: "dentro de un mes" },
  { value: "hace_dias", label: "hace…", numero: true, sufijo: "días" },
  { value: "dentro_dias", label: "dentro de…", numero: true, sufijo: "días" },
  { value: "exacta", label: "fecha exacta" },
] as const

/** Los tramos de «está dentro de», como en Airtable. Los de número se guardan como «ultimos_dias:7». */
export const TRAMOS_RELATIVOS = [
  { value: "semana_pasada", label: "la semana pasada" },
  { value: "mes_pasado", label: "el mes pasado" },
  { value: "ano_pasado", label: "el año pasado" },
  { value: "semana_proxima", label: "la próxima semana" },
  { value: "mes_proximo", label: "el próximo mes" },
  { value: "ano_proximo", label: "el próximo año" },
  { value: "esta_semana", label: "esta semana" },
  { value: "este_mes", label: "este mes" },
  { value: "este_ano", label: "este año" },
  { value: "ultimos_dias", label: "los últimos…", numero: true, sufijo: "días" },
  { value: "proximos_dias", label: "los próximos…", numero: true, sufijo: "días" },
] as const

const ES_DIA_ISO = /^\d{4}-\d{2}-\d{2}/

/** «hace_dias:3» → { modo: "hace_dias", n: 3 }; un día exacto → { modo: "exacta", dia }. Sin valor, «hoy». */
export function leerValorFecha(valor: string | undefined): { modo: string; n?: number; dia?: string } {
  if (!valor) return { modo: "hoy" }
  if (ES_DIA_ISO.test(valor)) return { modo: "exacta", dia: valor.slice(0, 10) }
  const [modo, n] = valor.split(":")
  return n === undefined ? { modo } : { modo, n: num(n) ?? undefined }
}

function sumarMeses(diaIso: string, meses: number) {
  const d = new Date(`${diaIso}T12:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

/** El día al que apunta el valor de una condición de fecha. Con un número a medio escribir, ninguno. */
export function fechaDeValor(valor: string | undefined, hoy: string): string | null {
  const { modo, n, dia: exacta } = leerValorFecha(valor)
  switch (modo) {
    case "exacta": return exacta ?? null
    case "hoy": return hoy
    case "manana": return sumarDias(hoy, 1)
    case "ayer": return sumarDias(hoy, -1)
    case "hace_semana": return sumarDias(hoy, -7)
    case "dentro_semana": return sumarDias(hoy, 7)
    case "hace_mes": return sumarMeses(hoy, -1)
    case "dentro_mes": return sumarMeses(hoy, 1)
    case "hace_dias": return n === undefined ? null : sumarDias(hoy, -n)
    case "dentro_dias": return n === undefined ? null : sumarDias(hoy, n)
    default: return null
  }
}

/** Los días, incluidos, de un tramo de «está dentro de». La semana pasada son los últimos 7 días, como en Airtable. */
export function tramoDeValor(valor: string | undefined, hoy: string): [string, string] | null {
  const { modo, n } = leerValorFecha(valor ?? "semana_pasada")
  const mes = hoy.slice(0, 7)
  switch (modo) {
    case "semana_pasada": return [sumarDias(hoy, -7), hoy]
    case "mes_pasado": return [sumarMeses(hoy, -1), hoy]
    case "ano_pasado": return [sumarMeses(hoy, -12), hoy]
    case "semana_proxima": return [hoy, sumarDias(hoy, 7)]
    case "mes_proximo": return [hoy, sumarMeses(hoy, 1)]
    case "ano_proximo": return [hoy, sumarMeses(hoy, 12)]
    case "esta_semana": return [lunesDe(hoy), domingoDe(hoy)]
    case "este_mes": return [`${mes}-01`, sumarDias(sumarMeses(`${mes}-01`, 1), -1)]
    case "este_ano": return [`${hoy.slice(0, 4)}-01-01`, `${hoy.slice(0, 4)}-12-31`]
    case "ultimos_dias": return n === undefined ? null : [sumarDias(hoy, -n), hoy]
    case "proximos_dias": return n === undefined ? null : [hoy, sumarDias(hoy, n)]
    default: return null
  }
}

/** «hoy», «hace 3 días», «la semana pasada», «2026-10-13»: el valor de una condición de fecha, en texto. */
export function describirValorFecha(valor: string | undefined, tramo: boolean): string {
  const { modo, n, dia: exacta } = leerValorFecha(valor ?? (tramo ? "semana_pasada" : undefined))
  if (modo === "exacta") return exacta ?? ""
  const lista: readonly { value: string; label: string; sufijo?: string }[] = tramo ? TRAMOS_RELATIVOS : DIAS_RELATIVOS
  const def = lista.find((d) => d.value === modo)
  if (!def) return valor ?? ""
  return def.sufijo ? `${def.label.replace("…", "")} ${n ?? "N"} ${def.sufijo}` : def.label
}

// ---------- Comparación ----------

/** Minúsculas y sin acentos: buscar «cafeteria» encuentra «Cafetería». */
function txt(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null
  const n = Number(String(v ?? "").replace(",", "."))
  return String(v ?? "").trim() !== "" && Number.isFinite(n) ? n : null
}

/** Día en ISO (YYYY-MM-DD): así se comparan como texto sin líos de zona horaria. */
function dia(v: unknown): string | null {
  if (v == null || v === "") return null
  const s = String(v)
  if (ES_DIA_ISO.test(s)) return s.slice(0, 10)
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function lista(v: ValorFila): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (v == null || v === "") return []
  return [String(v)]
}

function esVacio(v: ValorFila): boolean {
  if (v == null) return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === "string") return v.trim() === ""
  return false
}

function comoLista(valor: string | string[] | undefined): string[] {
  if (valor === undefined) return []
  return Array.isArray(valor) ? valor : [valor]
}

function cumpleFecha(v: ValorFila, op: Operador, objetivo: string | undefined, ref: RefFiltro | undefined): boolean {
  const hoy = ref?.hoy?.slice(0, 10) ?? hoyLocal()
  const a = dia(v)
  if (op === "dentro_de") {
    const tramo = tramoDeValor(objetivo, hoy)
    if (tramo === null) return true
    return a !== null && a >= tramo[0] && a <= tramo[1]
  }
  const b = fechaDeValor(objetivo, hoy)
  if (b === null) return true // un número a medio escribir no filtra
  if (op === "no_es") return a !== b
  if (a === null) return false
  switch (op) {
    case "es": return a === b
    case "antes": return a < b
    case "despues": return a > b
    case "en_o_antes": return a <= b
    case "en_o_despues": return a >= b
    default: return true
  }
}

function cumpleLista(v: ValorFila, op: Operador, objetivos: string[]): boolean {
  const actuales = lista(v)
  switch (op) {
    case "es": return actuales.includes(objetivos[0])
    case "no_es": return !actuales.includes(objetivos[0])
    case "alguno": return objetivos.some((o) => actuales.includes(o))
    case "todos": return objetivos.every((o) => actuales.includes(o))
    case "ninguno": return !objetivos.some((o) => actuales.includes(o))
    case "exactamente": return actuales.length === new Set(objetivos).size && objetivos.every((o) => actuales.includes(o))
    default: return true
  }
}

function cumpleNumero(v: ValorFila, op: Operador, objetivo: string): boolean {
  const a = num(v)
  const b = num(objetivo)
  if (b === null) return true
  if (a === null) return op === "no_es"
  switch (op) {
    case "es": return a === b
    case "no_es": return a !== b
    case "mayor": return a > b
    case "mayor_igual": return a >= b
    case "menor": return a < b
    case "menor_igual": return a <= b
    default: return true
  }
}

function cumpleTexto(v: ValorFila, op: Operador, objetivo: string): boolean {
  // El valor de la fila puede ser una lista (nombres de etiquetas, por ejemplo).
  const partes = lista(v).map(txt)
  const b = txt(objetivo)
  switch (op) {
    case "contiene": return partes.some((p) => p.includes(b))
    case "no_contiene": return !partes.some((p) => p.includes(b))
    case "es": return partes.some((p) => p === b)
    case "no_es": return !partes.some((p) => p === b)
    default: return true
  }
}

/** ¿Cumple la fila esta condición? Una condición mal formada o a medio escribir no filtra (deja pasar). */
export function cumpleCondicion<T>(row: T, c: Condicion, campos: CampoFiltrable<T>[], ref?: RefFiltro): boolean {
  const campo = campos.find((f) => f.id === c.campo)
  if (!campo) return true
  const def = defOperador(campo.tipo, c.op)
  if (!def) return true
  const v = campo.valor(row)

  if (c.op === "vacio") return esVacio(v)
  if (c.op === "no_vacio") return !esVacio(v)
  if (c.op === "verdadero") return v === true
  if (c.op === "falso") return v !== true
  if (campo.tipo === "fecha") return cumpleFecha(v, c.op, comoLista(c.valor)[0], ref)

  const objetivos = comoLista(c.valor).filter((x) => x !== "")
  if (objetivos.length === 0) return true
  if (campo.tipo === "select" || campo.tipo === "multiselect") return cumpleLista(v, c.op, objetivos)
  if (campo.tipo === "numero") return cumpleNumero(v, c.op, objetivos[0])
  return cumpleTexto(v, c.op, objetivos[0])
}

/** Un grupo sin condiciones en ningún nivel: no filtra nada. */
export function grupoVacio(grupo: GrupoCondiciones): boolean {
  return grupo.condiciones.length === 0 && (grupo.grupos ?? []).every(grupoVacio)
}

/** Condiciones de un grupo y de los de dentro: el número del botón de filtro. */
export function contarCondiciones(grupo: GrupoCondiciones): number {
  return grupo.condiciones.length + (grupo.grupos ?? []).reduce((n, g) => n + contarCondiciones(g), 0)
}

export function cumpleGrupo<T>(row: T, grupo: GrupoCondiciones, campos: CampoFiltrable<T>[], ref?: RefFiltro): boolean {
  // Los grupos vacíos no cuentan: si contaran, en un «O» dejarían pasar todas las filas.
  const comprobaciones = [
    ...grupo.condiciones.map((c) => () => cumpleCondicion(row, c, campos, ref)),
    ...(grupo.grupos ?? []).filter((g) => !grupoVacio(g)).map((g) => () => cumpleGrupo(row, g, campos, ref)),
  ]
  if (comprobaciones.length === 0) return true
  return grupo.union === "o" ? comprobaciones.some((f) => f()) : comprobaciones.every((f) => f())
}

export function filtrarFilas<T>(rows: T[], grupo: GrupoCondiciones | null | undefined, campos: CampoFiltrable<T>[], ref?: RefFiltro): T[] {
  if (!grupo || grupoVacio(grupo)) return rows
  return rows.filter((r) => cumpleGrupo(r, grupo, campos, ref))
}

// ---------- Texto de una condición (chips, resúmenes) ----------

export function describirCondicion<T>(c: Condicion, campos: CampoFiltrable<T>[]): string {
  const campo = campos.find((f) => f.id === c.campo)
  const etiqueta = campo?.label ?? c.campo
  const def = campo ? defOperador(campo.tipo, c.op) : undefined
  const op = def?.label ?? c.op
  if (def?.sinValor) return `${etiqueta} ${op}`
  if (def?.fecha) return `${etiqueta} ${op} ${describirValorFecha(comoLista(c.valor)[0], def.fecha === "tramo")}`
  const valores = comoLista(c.valor).map((v) => campo?.opciones?.find((o) => o.value === v)?.label ?? v)
  return `${etiqueta} ${op} ${valores.join(", ")}`.trim()
}

/** «(Campaña es cualquiera de Lumea o Prioridad es Urgente)»: un grupo de dentro, en un chip. */
export function describirGrupo<T>(grupo: GrupoCondiciones, campos: CampoFiltrable<T>[]): string {
  const union = grupo.union === "o" ? " o " : " y "
  const partes = [...grupo.condiciones.map((c) => describirCondicion(c, campos)), ...(grupo.grupos ?? []).filter((g) => !grupoVacio(g)).map((g) => describirGrupo(g, campos))]
  return `(${partes.join(union)})`
}

// ---------- Serialización a la URL ----------

const UNIONES = ["y", "o"] as const

/** Condición mínima viable: campo y operador conocidos. Lo demás se descarta en silencio. */
function saneaCondicion(raw: unknown): Condicion | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  if (typeof o.campo !== "string" || typeof o.op !== "string") return null
  const valor = Array.isArray(o.valor)
    ? o.valor.filter((v): v is string => typeof v === "string")
    : typeof o.valor === "string"
      ? o.valor
      : undefined
  return { campo: o.campo, op: o.op as Operador, valor, de: typeof o.de === "string" ? o.de : undefined }
}

/** Un grupo con sus grupos de dentro, sin pasar de `NIVELES_GRUPO`. */
function saneaGrupo(raw: unknown, nivel: number): GrupoCondiciones | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const union = UNIONES.includes(o.u as (typeof UNIONES)[number]) ? (o.u as "y" | "o") : "y"
  const condiciones = Array.isArray(o.c) ? o.c.map(saneaCondicion).filter((c): c is Condicion => c !== null) : []
  const grupos = nivel < NIVELES_GRUPO && Array.isArray(o.g) ? o.g.map((g) => saneaGrupo(g, nivel + 1)).filter((g): g is GrupoCondiciones => g !== null) : []
  return grupos.length ? { union, condiciones, grupos } : { union, condiciones }
}

/** Lee `?f=` de la URL (o un filtro guardado). Cualquier cosa rara devuelve «sin filtros» en vez de romper la página. */
export function parseGrupo(raw: string | null | undefined): GrupoCondiciones {
  if (!raw) return GRUPO_VACIO
  try {
    return saneaGrupo(JSON.parse(raw) as unknown, 1) ?? GRUPO_VACIO
  } catch {
    return GRUPO_VACIO
  }
}

type GrupoSerializado = { u: "y" | "o"; c: Record<string, unknown>[]; g?: GrupoSerializado[] }

function compactar(grupo: GrupoCondiciones): GrupoSerializado {
  const grupos = (grupo.grupos ?? []).filter((g) => !grupoVacio(g)).map(compactar)
  return {
    u: grupo.union,
    c: grupo.condiciones.map((c) => ({
      campo: c.campo,
      op: c.op,
      ...(c.valor === undefined ? {} : { valor: c.valor }),
      ...(c.de === undefined ? {} : { de: c.de }),
    })),
    ...(grupos.length ? { g: grupos } : {}),
  }
}

/** Serializa para la URL. Sin condiciones devuelve "" para que el parámetro desaparezca. */
export function serializarGrupo(grupo: GrupoCondiciones): string {
  if (grupoVacio(grupo)) return ""
  return JSON.stringify(compactar(grupo))
}
