// Motor de filtros avanzados (estilo Airtable): un campo, un operador y un valor.
//
// Es un módulo puro (sin Prisma ni React) para que lo usen igual el servidor —que filtra
// las filas antes de mandarlas— y el cliente —que pinta el constructor y los chips—.
// Cada objeto del CRM declara sus campos filtrables en `lib/filtros/crm.ts` con una función
// `valor(fila)`: filtramos en memoria sobre las filas ya cargadas, así funcionan también los
// campos calculados (nº de contactos, valor abierto, campañas) que no son columnas de la BD.
//
// Las condiciones se agrupan como en Notion: un grupo une sus condiciones con Y o con O y puede
// llevar grupos dentro (hasta tres niveles), para filtros como «(Lumea o Nuura) y sin hacer».
// Las fechas se comparan también contra hoy («es esta semana», «en los próximos 7 días»).

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
  | "empieza"
  | "termina"
  | "mayor"
  | "mayor_igual"
  | "menor"
  | "menor_igual"
  | "antes"
  | "despues"
  | "en_o_antes"
  | "en_o_despues"
  | "alguno"
  | "ninguno"
  | "todos"
  | "vacio"
  | "no_vacio"
  | "verdadero"
  | "falso"
  | "es_hoy"
  | "es_manana"
  | "es_ayer"
  | "esta_semana"
  | "semana_que_viene"
  | "este_mes"
  | "pasada"
  | "proximos_dias"
  | "ultimos_dias"

export type Condicion = {
  campo: string
  op: Operador
  /** Ausente en los operadores sin valor (vacío, no vacío, sí, no). */
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

/** Niveles de grupos, contando el de fuera: como en Notion, hasta tres. */
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
  /** Pide un número (de días) en vez de un valor del campo. */
  numerico?: boolean
  /** Lo que va detrás del número: «en los próximos 7 días». */
  sufijo?: string
}

const OPS_VACIO: DefOperador[] = [
  { value: "vacio", label: "está vacío", sinValor: true },
  { value: "no_vacio", label: "no está vacío", sinValor: true },
]

const OPERADORES: Record<TipoFiltro, DefOperador[]> = {
  texto: [
    { value: "contiene", label: "contiene" },
    { value: "no_contiene", label: "no contiene" },
    { value: "es", label: "es" },
    { value: "no_es", label: "no es" },
    { value: "empieza", label: "empieza por" },
    { value: "termina", label: "termina en" },
    ...OPS_VACIO,
  ],
  numero: [
    { value: "es", label: "es igual a" },
    { value: "no_es", label: "no es igual a" },
    { value: "mayor", label: "es mayor que" },
    { value: "mayor_igual", label: "es mayor o igual que" },
    { value: "menor", label: "es menor que" },
    { value: "menor_igual", label: "es menor o igual que" },
    ...OPS_VACIO,
  ],
  fecha: [
    { value: "es", label: "es el día" },
    { value: "antes", label: "es anterior a" },
    { value: "despues", label: "es posterior a" },
    { value: "en_o_antes", label: "es ese día o antes" },
    { value: "en_o_despues", label: "es ese día o después" },
    { value: "es_hoy", label: "es hoy", sinValor: true },
    { value: "es_manana", label: "es mañana", sinValor: true },
    { value: "es_ayer", label: "fue ayer", sinValor: true },
    { value: "esta_semana", label: "es esta semana", sinValor: true },
    { value: "semana_que_viene", label: "es la semana que viene", sinValor: true },
    { value: "este_mes", label: "es este mes", sinValor: true },
    { value: "pasada", label: "ya pasó", sinValor: true },
    { value: "proximos_dias", label: "está en los próximos", numerico: true, sufijo: "días" },
    { value: "ultimos_dias", label: "está en los últimos", numerico: true, sufijo: "días" },
    ...OPS_VACIO,
  ],
  select: [
    { value: "alguno", label: "es alguno de", multiple: true },
    { value: "ninguno", label: "no es ninguno de", multiple: true },
    ...OPS_VACIO,
  ],
  multiselect: [
    { value: "alguno", label: "incluye alguno de", multiple: true },
    { value: "todos", label: "incluye todos", multiple: true },
    { value: "ninguno", label: "no incluye ninguno de", multiple: true },
    ...OPS_VACIO,
  ],
  booleano: [
    { value: "verdadero", label: "es sí", sinValor: true },
    { value: "falso", label: "es no", sinValor: true },
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
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
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

/** Fechas contra hoy: «es esta semana», «en los próximos 7 días». Un número a medio escribir no filtra. */
function cumpleFechaRelativa(v: ValorFila, c: Condicion, ref: RefFiltro | undefined): boolean {
  const pideNumero = c.op === "proximos_dias" || c.op === "ultimos_dias"
  if (pideNumero && num(comoLista(c.valor)[0]) === null) return true
  const a = dia(v)
  if (a === null) return false
  const hoy = ref?.hoy?.slice(0, 10) ?? hoyLocal()
  const lunes = lunesDe(hoy)
  switch (c.op) {
    case "es_hoy": return a === hoy
    case "es_manana": return a === sumarDias(hoy, 1)
    case "es_ayer": return a === sumarDias(hoy, -1)
    case "esta_semana": return a >= lunes && a <= domingoDe(hoy)
    case "semana_que_viene": return a >= sumarDias(lunes, 7) && a <= sumarDias(lunes, 13)
    case "este_mes": return a.slice(0, 7) === hoy.slice(0, 7)
    case "pasada": return a < hoy
    case "proximos_dias":
    case "ultimos_dias": {
      const n = num(comoLista(c.valor)[0]) ?? 0
      return c.op === "proximos_dias" ? a >= hoy && a <= sumarDias(hoy, n) : a >= sumarDias(hoy, -n) && a <= hoy
    }
    default: return true
  }
}

const OPS_FECHA_RELATIVA = new Set<Operador>(["es_hoy", "es_manana", "es_ayer", "esta_semana", "semana_que_viene", "este_mes", "pasada", "proximos_dias", "ultimos_dias"])

/** ¿Cumple la fila esta condición? Una condición mal formada no filtra (deja pasar). */
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
  if (OPS_FECHA_RELATIVA.has(c.op)) return cumpleFechaRelativa(v, c, ref)

  const objetivos = comoLista(c.valor).filter((x) => x !== "")
  if (objetivos.length === 0) return true // condición a medio escribir: no filtra

  switch (campo.tipo) {
    case "numero": {
      const a = num(v)
      const b = num(objetivos[0])
      if (b === null) return true
      if (a === null) return false
      switch (c.op) {
        case "es": return a === b
        case "no_es": return a !== b
        case "mayor": return a > b
        case "mayor_igual": return a >= b
        case "menor": return a < b
        case "menor_igual": return a <= b
        default: return true
      }
    }
    case "fecha": {
      const a = dia(v)
      const b = dia(objetivos[0])
      if (b === null) return true
      if (a === null) return false
      switch (c.op) {
        case "es": return a === b
        case "antes": return a < b
        case "despues": return a > b
        case "en_o_antes": return a <= b
        case "en_o_despues": return a >= b
        default: return true
      }
    }
    case "select":
    case "multiselect": {
      const actuales = lista(v)
      switch (c.op) {
        case "alguno": return objetivos.some((o) => actuales.includes(o))
        case "todos": return objetivos.every((o) => actuales.includes(o))
        case "ninguno": return !objetivos.some((o) => actuales.includes(o))
        default: return true
      }
    }
    default: {
      // Texto: el valor de la fila puede ser una lista (nombres de etiquetas, por ejemplo).
      const partes = lista(v).map(txt)
      const b = txt(objetivos[0])
      const alguna = (fn: (p: string) => boolean) => partes.some(fn)
      switch (c.op) {
        case "contiene": return alguna((p) => p.includes(b))
        case "no_contiene": return !alguna((p) => p.includes(b))
        case "es": return alguna((p) => p === b)
        case "no_es": return !alguna((p) => p === b)
        case "empieza": return alguna((p) => p.startsWith(b))
        case "termina": return alguna((p) => p.endsWith(b))
        default: return true
      }
    }
  }
}

/** Un grupo sin condiciones en ningún nivel: no filtra nada. */
export function grupoVacio(grupo: GrupoCondiciones): boolean {
  return grupo.condiciones.length === 0 && (grupo.grupos ?? []).every(grupoVacio)
}

/** Condiciones de un grupo y de los de dentro: el número del botón «Filtros». */
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
  const valores = comoLista(c.valor).map((v) => campo?.opciones?.find((o) => o.value === v)?.label ?? v)
  return `${etiqueta} ${op} ${valores.join(", ")} ${def?.sufijo ?? ""}`.trim()
}

/** «(Campaña es alguno de Lumea o Prioridad es alguno de Urgente)»: un grupo de dentro, en un chip. */
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
