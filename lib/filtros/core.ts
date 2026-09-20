// Motor de filtros avanzados (estilo Airtable): un campo, un operador y un valor.
//
// Es un módulo puro (sin Prisma ni React) para que lo usen igual el servidor —que filtra
// las filas antes de mandarlas— y el cliente —que pinta el constructor y los chips—.
// Cada objeto del CRM declara sus campos filtrables en `lib/filtros/crm.ts` con una función
// `valor(fila)`: filtramos en memoria sobre las filas ya cargadas, así funcionan también los
// campos calculados (nº de contactos, valor abierto, campañas) que no son columnas de la BD.

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

export type Condicion = {
  campo: string
  op: Operador
  /** Ausente en los operadores sin valor (vacío, no vacío, sí, no). */
  valor?: string | string[]
  /** Id del filtro rápido que puso esta condición, para poder quitarla al apagarlo. */
  de?: string
}

export type GrupoCondiciones = { union: "y" | "o"; condiciones: Condicion[] }

export const GRUPO_VACIO: GrupoCondiciones = { union: "y", condiciones: [] }

export type DefOperador = {
  value: Operador
  label: string
  /** No pide valor: el operador se basta solo. */
  sinValor?: boolean
  /** Pide varias opciones en vez de una. */
  multiple?: boolean
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

/** ¿Cumple la fila esta condición? Una condición mal formada no filtra (deja pasar). */
export function cumpleCondicion<T>(row: T, c: Condicion, campos: CampoFiltrable<T>[]): boolean {
  const campo = campos.find((f) => f.id === c.campo)
  if (!campo) return true
  const def = defOperador(campo.tipo, c.op)
  if (!def) return true
  const v = campo.valor(row)

  if (c.op === "vacio") return esVacio(v)
  if (c.op === "no_vacio") return !esVacio(v)
  if (c.op === "verdadero") return v === true
  if (c.op === "falso") return v !== true

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

export function cumpleGrupo<T>(row: T, grupo: GrupoCondiciones, campos: CampoFiltrable<T>[]): boolean {
  const cs = grupo.condiciones
  if (cs.length === 0) return true
  return grupo.union === "o"
    ? cs.some((c) => cumpleCondicion(row, c, campos))
    : cs.every((c) => cumpleCondicion(row, c, campos))
}

export function filtrarFilas<T>(rows: T[], grupo: GrupoCondiciones | null | undefined, campos: CampoFiltrable<T>[]): T[] {
  if (!grupo || grupo.condiciones.length === 0) return rows
  return rows.filter((r) => cumpleGrupo(r, grupo, campos))
}

// ---------- Texto de una condición (chips, resúmenes) ----------

export function describirCondicion<T>(c: Condicion, campos: CampoFiltrable<T>[]): string {
  const campo = campos.find((f) => f.id === c.campo)
  const etiqueta = campo?.label ?? c.campo
  const def = campo ? defOperador(campo.tipo, c.op) : undefined
  const op = def?.label ?? c.op
  if (def?.sinValor) return `${etiqueta} ${op}`
  const valores = comoLista(c.valor).map((v) => campo?.opciones?.find((o) => o.value === v)?.label ?? v)
  return `${etiqueta} ${op} ${valores.join(", ")}`.trim()
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

/** Lee `?f=` de la URL. Cualquier cosa rara devuelve «sin filtros» en vez de romper la página. */
export function parseGrupo(raw: string | null | undefined): GrupoCondiciones {
  if (!raw) return GRUPO_VACIO
  try {
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== "object") return GRUPO_VACIO
    const o = data as Record<string, unknown>
    const union = UNIONES.includes(o.u as (typeof UNIONES)[number]) ? (o.u as "y" | "o") : "y"
    const condiciones = Array.isArray(o.c) ? o.c.map(saneaCondicion).filter((c): c is Condicion => c !== null) : []
    return { union, condiciones }
  } catch {
    return GRUPO_VACIO
  }
}

/** Serializa para la URL. Sin condiciones devuelve "" para que el parámetro desaparezca. */
export function serializarGrupo(grupo: GrupoCondiciones): string {
  if (grupo.condiciones.length === 0) return ""
  return JSON.stringify({
    u: grupo.union,
    c: grupo.condiciones.map((c) => ({
      campo: c.campo,
      op: c.op,
      ...(c.valor === undefined ? {} : { valor: c.valor }),
      ...(c.de === undefined ? {} : { de: c.de }),
    })),
  })
}
