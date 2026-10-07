// Vistas de una base de datos al estilo de Notion: cada vista guarda su diseño (lista, tabla,
// tablero, calendario o cronograma), su filtro, su orden, su agrupación y sus propiedades visibles.
//
// Es puro (sin React ni datos): ordena, agrupa y calcula sobre las filas ya cargadas, con los
// mismos campos que declara cada objeto para filtrar (`CampoFiltrable`), así que lo que se puede
// filtrar se puede también ordenar y agrupar.
import { GRUPO_VACIO, type CampoFiltrable, type GrupoCondiciones, type TipoFiltro, type ValorFila } from "@/lib/filtros/core"
import { TRAMOS_FECHA, lunesDe, soloFecha, tramoDeFecha } from "@/lib/filtros/fechas"

export type DisenoVista = "lista" | "tabla" | "tablero" | "galeria" | "calendario" | "cronograma"

export const DISENOS_VISTA: Record<DisenoVista, string> = {
  lista: "Lista",
  tabla: "Tabla",
  tablero: "Tablero",
  galeria: "Galería",
  calendario: "Calendario",
  cronograma: "Cronograma",
}

export const LISTA_DISENOS_VISTA = Object.keys(DISENOS_VISTA) as DisenoVista[]

export type Orden = { campo: string; dir: "asc" | "desc" }

/** Cómo se agrupan las fechas: en tramos desde hoy (hoy, mañana, esta semana…), por día, por semana o por mes. */
export type ModoFecha = "relativo" | "dia" | "semana" | "mes"

export const MODOS_FECHA: Record<ModoFecha, string> = { relativo: "Relativo a hoy", dia: "Por día", semana: "Por semana", mes: "Por mes" }

/** Orden de los grupos: el de sus opciones (o el del calendario, en fechas) o alfabético. */
export type OrdenGrupos = "opciones" | "asc" | "desc"

export type Agrupacion = {
  campo: string
  modoFecha?: ModoFecha
  ordenGrupos?: OrdenGrupos
  ocultarVacios?: boolean
  /** Ids de los grupos que no se enseñan. */
  ocultos?: string[]
  /** Ids de los grupos plegados: se recuerdan con la vista. */
  plegados?: string[]
}

export type Calculo =
  | "contar"
  | "con_valor"
  | "vacios"
  | "pct_con_valor"
  | "pct_vacios"
  | "pct_si"
  | "suma"
  | "media"
  | "minimo"
  | "maximo"
  | "mas_temprana"
  | "mas_tardia"

export const CALCULOS: Record<Calculo, { label: string; tipos?: TipoFiltro[] }> = {
  contar: { label: "Contar todas" },
  con_valor: { label: "Con valor" },
  vacios: { label: "Vacías" },
  pct_con_valor: { label: "% con valor" },
  pct_vacios: { label: "% vacías" },
  pct_si: { label: "% marcadas", tipos: ["booleano"] },
  suma: { label: "Suma", tipos: ["numero"] },
  media: { label: "Media", tipos: ["numero"] },
  minimo: { label: "Mínimo", tipos: ["numero"] },
  maximo: { label: "Máximo", tipos: ["numero"] },
  mas_temprana: { label: "Más temprana", tipos: ["fecha"] },
  mas_tardia: { label: "Más tardía", tipos: ["fecha"] },
}

/** Los cálculos que tienen sentido para un tipo de campo (sin campo, solo contar). */
export function calculosDe(tipo: TipoFiltro | undefined): Calculo[] {
  return (Object.keys(CALCULOS) as Calculo[]).filter((c) => {
    const tipos = CALCULOS[c].tipos
    if (!tipo) return c === "contar"
    return !tipos || tipos.includes(tipo)
  })
}

/** Cómo se enseñan las subtareas: debajo de su tarea, todas sueltas o solo las principales. */
export type ModoSubtareas = "anidadas" | "planas" | "principales"

export type AjustesVista = {
  abrirEn?: "lateral" | "centro" | "pagina"
  subtareas?: ModoSubtareas
  /** A qué filas se aplica el filtro: a todas o solo a las principales (sus subtareas salen siempre). */
  filtroSubtareas?: "todas" | "principales"
  ajustarTexto?: boolean
  /** Columnas fijas a la izquierda en la tabla, contando la primera. */
  congelar?: number
  /** Campo de fecha que manda en el calendario. */
  calendarioPor?: string
  calendarioModo?: "mes" | "semana"
  finesDeSemana?: boolean
  zoom?: "dias" | "semanas" | "meses"
  tamanoTarjeta?: "pequena" | "mediana" | "grande"
}

export type Vista = {
  id: string
  nombre: string
  diseno: DisenoVista
  /** El filtro propio de la vista; se suma al de la página. */
  filtro: GrupoCondiciones
  orden: Orden[]
  agrupar?: Agrupacion
  /** Filas del tablero: se agrupa por `agrupar` en columnas y por esto en filas. */
  subagrupar?: Agrupacion
  /** Propiedades visibles, en su orden. La principal (el título) no está aquí: siempre se ve. */
  propiedades: string[]
  /** Ancho de cada columna de la tabla, en píxeles. */
  anchos?: Record<string, number>
  /** Cálculo del pie de cada columna de la tabla. */
  calculos?: Record<string, Calculo>
  ajustes: AjustesVista
}

export const VISTA_VACIA: Omit<Vista, "id" | "nombre" | "diseno"> = { filtro: GRUPO_VACIO, orden: [], propiedades: [], ajustes: {} }

// ---------- Ordenar ----------

/** Minúsculas y sin acentos, como compara el filtro de texto. */
function texto(v: unknown) {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

function esVacio(v: ValorFila) {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0)
}

/** Posición de un valor de lista en sus opciones: así «Urgente» va antes que «Baja», y no por el abecedario. */
function posicion<T>(campo: CampoFiltrable<T>, v: string) {
  const i = campo.opciones?.findIndex((o) => o.value === v) ?? -1
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

function comparar<T>(campo: CampoFiltrable<T>, a: ValorFila, b: ValorFila): number {
  switch (campo.tipo) {
    case "select":
      return posicion(campo, String(a)) - posicion(campo, String(b))
    case "multiselect": {
      const primera = (v: ValorFila) => Math.min(...(Array.isArray(v) ? v : [String(v)]).map((x) => posicion(campo, x)))
      return primera(a) - primera(b)
    }
    case "numero":
      return Number(a) - Number(b)
    case "booleano":
      return Number(a === true) - Number(b === true)
    case "fecha":
      return soloFecha(String(a)).localeCompare(soloFecha(String(b)))
    default:
      return texto(a).localeCompare(texto(b), "es")
  }
}

/**
 * Ordena por varios criterios: manda el primero y los demás desempatan. Lo vacío va siempre al
 * final, en los dos sentidos. Sin criterios, deja el orden que traen las filas (el manual).
 */
export function ordenarFilas<T>(filas: T[], orden: Orden[], campos: CampoFiltrable<T>[], desempate?: (a: T, b: T) => number): T[] {
  const criterios = orden.map((o) => ({ ...o, campo: campos.find((c) => c.id === o.campo) })).filter((o): o is Orden & { campo: CampoFiltrable<T> } => o.campo !== undefined)
  if (criterios.length === 0 && !desempate) return filas
  return [...filas].sort((x, y) => {
    for (const { campo, dir } of criterios) {
      const a = campo.valor(x)
      const b = campo.valor(y)
      if (esVacio(a) && esVacio(b)) continue
      if (esVacio(a)) return 1
      if (esVacio(b)) return -1
      const r = comparar(campo, a, b)
      if (r !== 0) return dir === "asc" ? r : -r
    }
    return desempate ? desempate(x, y) : 0
  })
}

// ---------- Agrupar ----------

/** El grupo de las filas sin valor. */
export const SIN_VALOR = "__vacio"

export type GrupoFilas<T> = { id: string; label: string; filas: T[] }

const diaCorto = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" })
const diaMes = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" })
const mesLargo = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" })
const enFecha = (dia: string) => new Date(`${dia}T12:00:00`)

/** La clave y el nombre del grupo de una fecha. Las claves se ordenan bien como texto. */
function grupoDeFecha(valor: string, modo: ModoFecha, hoy: string): { id: string; label: string } {
  const dia = soloFecha(valor)
  switch (modo) {
    case "relativo": {
      const tramo = tramoDeFecha(dia, hoy)
      return { id: tramo, label: TRAMOS_FECHA.find((t) => t.id === tramo)?.label ?? tramo }
    }
    case "dia":
      return { id: dia, label: diaCorto.format(enFecha(dia)).replace(",", "").replace(/\./g, "") }
    case "semana": {
      const lunes = lunesDe(dia)
      return { id: lunes, label: `Semana del ${diaMes.format(enFecha(lunes)).replace(".", "")}` }
    }
    case "mes":
      return { id: dia.slice(0, 7), label: mesLargo.format(enFecha(`${dia.slice(0, 7)}-01`)) }
  }
}

function etiquetaSinValor<T>(campo: CampoFiltrable<T>) {
  return campo.tipo === "fecha" ? "Sin fecha" : `Sin ${campo.label.toLowerCase()}`
}

/**
 * Reparte las filas en grupos por un campo. Las listas dan un grupo por opción, en su orden y
 * aunque estén vacíos (para poder arrastrar a ellos), y una fila con varias etiquetas sale en
 * cada una. Las fechas, en tramos desde hoy, por día, por semana o por mes. Lo que no tiene
 * valor va a «Sin …», al final.
 */
export function agruparFilas<T>(filas: T[], agrupacion: Agrupacion | undefined, campos: CampoFiltrable<T>[], ref: { hoy: string }): GrupoFilas<T>[] {
  const campo = agrupacion ? campos.find((c) => c.id === agrupacion.campo) : undefined
  if (!agrupacion || !campo) return [{ id: "todas", label: "", filas }]

  const grupos = new Map<string, GrupoFilas<T>>()
  const anadir = (id: string, label: string, fila?: T) => {
    const g = grupos.get(id) ?? { id, label, filas: [] }
    if (fila !== undefined) g.filas.push(fila)
    grupos.set(id, g)
  }

  // Las opciones de una lista abren sus grupos aunque no tengan filas; los tramos de fecha, también.
  if (campo.tipo === "select" || campo.tipo === "multiselect") campo.opciones?.forEach((o) => anadir(o.value, o.label))
  if (campo.tipo === "booleano") {
    anadir("true", "Sí")
    anadir("false", "No")
  }
  const modo = agrupacion.modoFecha ?? "relativo"
  if (campo.tipo === "fecha" && modo === "relativo") TRAMOS_FECHA.forEach((t) => anadir(t.id, t.label))

  for (const fila of filas) {
    const v = campo.valor(fila)
    if (campo.tipo === "booleano") {
      anadir(String(v === true), v === true ? "Sí" : "No", fila)
      continue
    }
    if (esVacio(v)) {
      anadir(SIN_VALOR, etiquetaSinValor(campo), fila)
      continue
    }
    if (campo.tipo === "fecha") {
      const g = grupoDeFecha(String(v), modo, ref.hoy)
      anadir(g.id, g.label, fila)
      continue
    }
    const valores = Array.isArray(v) ? v : [String(v)]
    for (const x of valores) anadir(x, campo.opciones?.find((o) => o.value === x)?.label ?? x, fila)
  }

  let lista = [...grupos.values()]
  const sinValor = lista.find((g) => g.id === SIN_VALOR)
  lista = lista.filter((g) => g.id !== SIN_VALOR)

  const ordenGrupos = agrupacion.ordenGrupos ?? "opciones"
  if (ordenGrupos === "asc" || ordenGrupos === "desc") {
    lista.sort((a, b) => texto(a.label).localeCompare(texto(b.label), "es") * (ordenGrupos === "asc" ? 1 : -1))
  } else if (campo.tipo === "fecha" && modo !== "relativo") {
    lista.sort((a, b) => a.id.localeCompare(b.id))
  } else if (campo.tipo === "numero") {
    lista.sort((a, b) => Number(a.id) - Number(b.id))
  } else if (campo.tipo === "texto") {
    lista.sort((a, b) => texto(a.label).localeCompare(texto(b.label), "es"))
  }
  if (sinValor) lista.push(sinValor)

  const ocultos = new Set(agrupacion.ocultos ?? [])
  return lista.filter((g) => !ocultos.has(g.id) && !(agrupacion.ocultarVacios && g.filas.length === 0))
}

/** Todos los grupos posibles de una agrupación, también los ocultos: para el menú de mostrar y ocultar. */
export function gruposPosibles<T>(filas: T[], agrupacion: Agrupacion, campos: CampoFiltrable<T>[], ref: { hoy: string }): { id: string; label: string; n: number }[] {
  return agruparFilas(filas, { ...agrupacion, ocultos: [], ocultarVacios: false }, campos, ref).map((g) => ({ id: g.id, label: g.label, n: g.filas.length }))
}

// ---------- Calcular ----------

const numeroEs = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })

/** El resultado de un cálculo del pie, ya escrito: «12», «35 %», «6 oct». */
export function calcular<T>(filas: T[], campo: CampoFiltrable<T> | undefined, calculo: Calculo): string {
  const n = filas.length
  if (calculo === "contar" || !campo) return String(n)
  const valores = filas.map((f) => campo.valor(f))
  const conValor = valores.filter((v) => !esVacio(v))
  const pct = (x: number) => (n === 0 ? "0 %" : `${Math.round((x / n) * 100)} %`)
  switch (calculo) {
    case "con_valor":
      return String(conValor.length)
    case "vacios":
      return String(n - conValor.length)
    case "pct_con_valor":
      return pct(conValor.length)
    case "pct_vacios":
      return pct(n - conValor.length)
    case "pct_si":
      return pct(valores.filter((v) => v === true).length)
    case "suma":
    case "media":
    case "minimo":
    case "maximo": {
      const nums = conValor.map(Number).filter((x) => Number.isFinite(x))
      if (nums.length === 0) return "—"
      const r =
        calculo === "suma" ? nums.reduce((a, b) => a + b, 0) : calculo === "media" ? nums.reduce((a, b) => a + b, 0) / nums.length : calculo === "minimo" ? Math.min(...nums) : Math.max(...nums)
      return numeroEs.format(r)
    }
    case "mas_temprana":
    case "mas_tardia": {
      const dias = conValor.map((v) => soloFecha(String(v))).sort()
      if (dias.length === 0) return "—"
      const d = calculo === "mas_temprana" ? dias[0] : dias[dias.length - 1]
      return diaMes.format(enFecha(d)).replace(".", "")
    }
  }
}

// ---------- Lo que hereda una fila nueva ----------

/**
 * Los valores que pone el filtro de una vista a lo que se crea en ella, como en Notion: solo las
 * condiciones que fijan un valor («Estado es Esperando», «Campaña es alguno de Lumea») de un grupo
 * con Y. Con O, o con condiciones como «antes de», no se puede saber qué valor poner.
 */
export function valoresDeFiltro(grupo: GrupoCondiciones): { campo: string; valor: string }[] {
  if (grupo.union === "o" && grupo.condiciones.length + (grupo.grupos?.length ?? 0) > 1) return []
  return grupo.condiciones.flatMap((c) => {
    const valores = Array.isArray(c.valor) ? c.valor : c.valor !== undefined ? [c.valor] : []
    if ((c.op === "alguno" || c.op === "es" || c.op === "todos") && valores.length === 1) return [{ campo: c.campo, valor: valores[0] }]
    if (c.op === "verdadero") return [{ campo: c.campo, valor: "true" }]
    if (c.op === "falso") return [{ campo: c.campo, valor: "false" }]
    return []
  })
}

// ---------- Vistas guardadas ----------

/**
 * Lo que cada persona ha decidido sobre las vistas de una página. Solo se guardan sus decisiones,
 * nunca la lista entera: si el código cambia una vista de serie, el cambio llega a quien no la tocó.
 */
export type ConfigVistas = {
  /** Las que ha creado ella, enteras. */
  propias: Vista[]
  /** Lo cambiado en cada vista de serie. */
  editadas: Record<string, Partial<Vista>>
  /** Vistas de serie que ha borrado. */
  borradas: string[]
  /** Orden de las pestañas. */
  orden: string[]
  activa?: string
}

export const CONFIG_VISTAS_VACIA: ConfigVistas = { propias: [], editadas: {}, borradas: [], orden: [] }

/** Las vistas de una página: las de serie con sus cambios, más las propias, en el orden elegido. */
export function mezclarVistas(deSerie: Vista[], config: ConfigVistas): Vista[] {
  const borradas = new Set(config.borradas ?? [])
  const todas = [
    ...deSerie.filter((v) => !borradas.has(v.id)).map((v) => ({ ...v, ...config.editadas?.[v.id], id: v.id })),
    ...(config.propias ?? []),
  ]
  const porId = new Map(todas.map((v) => [v.id, v]))
  const vistos = new Set<string>()
  const out: Vista[] = []
  for (const id of config.orden ?? []) {
    const v = porId.get(id)
    if (v && !vistos.has(id)) {
      out.push(v)
      vistos.add(id)
    }
  }
  for (const v of todas) if (!vistos.has(v.id)) out.push(v)
  return out
}
