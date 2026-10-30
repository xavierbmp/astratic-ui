// Los campos de una base al estilo Airtable: su tipo, sus opciones con color y cómo se lee, se
// escribe y se copia su valor. Es puro (sin React): lo usan la rejilla, el formulario, los menús y
// el servidor, que valida con los mismos tipos.
//
// Una base tiene campos de serie (los declara la página: nombre, email…; se ocultan, no se borran)
// y campos propios (los crea cada persona desde la tabla; sus valores van en `valores` de la fila).

import type { CampoFiltrable, TipoFiltro } from "@/lib/filtros/core"
import type { StatusTone } from "@/lib/status"

export type TipoCampo =
  | "texto"
  | "texto_largo"
  | "numero"
  | "moneda"
  | "porcentaje"
  | "fecha"
  | "select"
  | "multiselect"
  | "casilla"
  | "url"
  | "email"
  | "telefono"
  | "calificacion"
  | "progreso"
  | "imagen"
  | "adjunto"
  | "vinculo"

/** Los tipos que se pueden crear: el vínculo a otra base solo lo pone la página en sus campos de serie. */
export type TipoCampoPropio = Exclude<TipoCampo, "vinculo">

/** Cada tipo: su nombre, qué hace y con qué operadores se filtra. */
export const TIPOS_CAMPO: Record<TipoCampo, { label: string; ayuda: string; filtro: TipoFiltro }> = {
  texto: { label: "Texto de una línea", ayuda: "Un texto corto: un nombre, un cargo, una ciudad.", filtro: "texto" },
  texto_largo: { label: "Texto largo", ayuda: "Notas o descripciones de varias líneas.", filtro: "texto" },
  casilla: { label: "Casilla de verificación", ayuda: "Sí o no: marcada o sin marcar.", filtro: "booleano" },
  multiselect: { label: "Selección múltiple", ayuda: "Varias opciones de una lista, cada una con su color.", filtro: "multiselect" },
  select: { label: "Selección única", ayuda: "Una opción de una lista, cada una con su color.", filtro: "select" },
  fecha: { label: "Fecha", ayuda: "Un día del calendario.", filtro: "fecha" },
  telefono: { label: "Número de teléfono", ayuda: "Un teléfono, para llamar o escribir por WhatsApp.", filtro: "texto" },
  email: { label: "Correo electrónico", ayuda: "Un email, que se abre en el correo.", filtro: "texto" },
  url: { label: "URL", ayuda: "Un enlace a una web.", filtro: "texto" },
  numero: { label: "Número", ayuda: "Un número, con o sin decimales.", filtro: "numero" },
  moneda: { label: "Moneda", ayuda: "Un importe en euros.", filtro: "numero" },
  porcentaje: { label: "Porcentaje", ayuda: "Un tanto por ciento.", filtro: "numero" },
  calificacion: { label: "Calificación", ayuda: "De una a cinco estrellas.", filtro: "numero" },
  progreso: { label: "Progreso", ayuda: "Cuánto lleva hecho, en una barra: de 0 al total que elijas (100 de serie, en %).", filtro: "numero" },
  imagen: { label: "Imagen", ayuda: "Una imagen, que sale también como portada en la vista de tarjetas.", filtro: "texto" },
  adjunto: { label: "Archivo adjunto", ayuda: "Un archivo: un PDF, un contrato, un documento.", filtro: "texto" },
  vinculo: { label: "Registro vinculado", ayuda: "Un registro de otra base, que se abre con un clic (la marca de un contacto).", filtro: "select" },
}

/** El orden en que se ofrecen al crear un campo, como en Airtable. */
export const LISTA_TIPOS_CAMPO = (Object.keys(TIPOS_CAMPO) as TipoCampo[]).filter((t): t is TipoCampoPropio => t !== "vinculo")

/** Los que guardan un archivo subido: su valor es su dirección. Se ofrecen si la página sabe subir (`SubidaBaseProvider`). */
export const TIPOS_CON_ARCHIVO: readonly TipoCampo[] = ["imagen", "adjunto"]

/** La dirección de un archivo, si se puede abrir sin riesgo: solo http y https, nunca `javascript:` ni `data:`. */
export const enlaceSeguro = (valor: unknown): string | null => (typeof valor === "string" && /^https?:\/\//i.test(valor) ? valor : null)

/** Los que llevan opciones. */
export const TIPOS_CON_OPCIONES: TipoCampo[] = ["select", "multiselect"]

/** Los de una sola opción o un solo registro: colorean filas y apilan las columnas del kanban. */
export const esDeUnaOpcion = (tipo: TipoCampo) => tipo === "select" || tipo === "vinculo"

/** Los colores de las opciones y de las filas (tokens `opcion-*` del design system). */
export const COLORES_OPCION = ["azul", "cian", "verde", "amarillo", "naranja", "rojo", "rosa", "morado", "gris"] as const
export type ColorOpcion = (typeof COLORES_OPCION)[number]

export const NOMBRES_COLOR: Record<ColorOpcion, string> = {
  azul: "Azul",
  cian: "Cian",
  verde: "Verde",
  amarillo: "Amarillo",
  naranja: "Naranja",
  rojo: "Rojo",
  rosa: "Rosa",
  morado: "Morado",
  gris: "Gris",
}

/** El color de la opción número `i` al crearla: van rotando, como en Airtable. */
export const colorPorDefecto = (i: number): ColorOpcion => COLORES_OPCION[i % COLORES_OPCION.length]

/**
 * Una opción de una lista. Las de un estado (propuesta, collab, factura) llevan su `tono` y se ven
 * como `StatusBadge`, igual que en el resto del design system; su `color` es el del tono.
 */
export type OpcionCampo = { id: string; label: string; color?: ColorOpcion; tono?: StatusTone }

/** El color de cada tono de estado, para la marca de la fila y el punto de la columna del kanban. */
export const COLOR_DE_TONO: Record<StatusTone, ColorOpcion> = { success: "verde", info: "azul", warning: "amarillo", danger: "rojo", neutral: "gris" }

/** Las opciones de un campo de estado a partir de su lista `{ id, label, tone }` del modelo. */
export const opcionesDeEstados = (estados: readonly { id: string; label: string; tone: StatusTone }[]): OpcionCampo[] =>
  estados.map((e) => ({ id: e.id, label: e.label, tono: e.tone, color: COLOR_DE_TONO[e.tone] }))

/** Lo que se puede ajustar de un tipo: decimales, el máximo de estrellas. */
export type FormatoCampo = { decimales?: number; maximo?: number }

export const DECIMALES_MAX = 4
export const ESTRELLAS_POR_DEFECTO = 5
export const ESTRELLAS_MAX = 10
/** Un progreso sin total se lee en %; con total, «2 de 3». */
export const PROGRESO_POR_DEFECTO = 100

/** Lo que se ve de un progreso: «40 %» o «2 de 3», y cuánto de la barra se llena (de 0 a 1). */
export function lecturaProgreso(valor: number, maximo = PROGRESO_POR_DEFECTO): { texto: string; parte: number } {
  const total = maximo > 0 ? maximo : PROGRESO_POR_DEFECTO
  const n = Math.max(0, Math.min(total, valor))
  return { texto: total === PROGRESO_POR_DEFECTO ? `${Math.round(n)} %` : `${Math.round(n)} de ${total}`, parte: n / total }
}

/** El valor de un campo en una fila. Las fechas van como día ISO (AAAA-MM-DD); las listas, por id de opción. */
export type ValorCampo = string | number | boolean | string[] | null

/** Un campo propio tal como se guarda: lo que lo define, sin funciones. */
export type CampoPropio = {
  id: string
  nombre: string
  tipo: TipoCampoPropio
  opciones?: OpcionCampo[]
  formato?: FormatoCampo
  /** Texto de ayuda que sale al pasar por su cabecera. */
  descripcion?: string
}

/** Un campo de una base: de serie o propio, con cómo leer su valor de una fila. */
export type DefCampo<T> = {
  id: string
  nombre: string
  tipo: TipoCampo
  opciones?: OpcionCampo[]
  formato?: FormatoCampo
  descripcion?: string
  /** El título de la fila: es la primera columna, va fija y no se oculta. */
  principal?: boolean
  /** Lo creó ella: se edita y se borra. Los de serie solo se ocultan. */
  propio?: boolean
  /** Calculado o de sistema (último contacto, fecha de alta): se ve, no se escribe. */
  soloLectura?: boolean
  /** Sin él no se crea el registro: no sale de su formulario. */
  obligatorio?: boolean
  /** Los de serie que una vista nueva no enseña hasta que se encienden. */
  ocultoDeSerie?: boolean
  /** Agrupa los campos en los selectores («Datos», «Cómo escribirle»…). */
  grupo?: string
  /**
   * Un vínculo a otra base: sus `opciones` son los registros de allí (id y nombre) y esto, cómo se
   * llama uno («marca»), para los textos («Sin marca», «Abrir la marca»).
   */
  vinculo?: { objeto: string }
  valor: (fila: T) => ValorCampo
}

const GRUPO_PROPIOS = "Mis campos"

/** Un campo propio como campo de la base: su valor sale de `valores` de la fila. */
export function campoDePropio<T>(propio: CampoPropio, valores: (fila: T) => Record<string, ValorCampo> | undefined): DefCampo<T> {
  return { ...propio, propio: true, grupo: GRUPO_PROPIOS, valor: (fila) => valores(fila)?.[propio.id] ?? null }
}

/** Un registro con el valor de uno de sus campos propios, en `valores`; vacío, se quita. */
export function conValorPropio<T extends { valores?: Record<string, ValorCampo> }>(fila: T, id: string, valor: ValorCampo): T {
  const valores = { ...fila.valores }
  if (esValorVacio(valor)) delete valores[id]
  else valores[id] = valor
  return { ...fila, valores }
}

/**
 * La lista con lo escrito en las celdas: cada cambio va a su registro (por id) con la función de
 * escribir de esa base. Varios cambios del mismo registro se aplican en orden.
 */
export function aplicarCambios<T extends { id: string }>(filas: T[], cambios: { fila: T; campo: DefCampo<T>; valor: ValorCampo }[], escribir: (fila: T, campo: DefCampo<T>, valor: ValorCampo) => T): T[] {
  const porId = new Map<string, typeof cambios>()
  for (const c of cambios) porId.set(c.fila.id, [...(porId.get(c.fila.id) ?? []), c])
  return filas.map((f) => (porId.get(f.id) ?? []).reduce((x, c) => escribir(x, c.campo, c.valor), f))
}

/** Un texto escrito en una celda: sin espacios de más y, si queda vacío, nada. */
export const textoLimpio = (v: ValorCampo): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined)

/** El campo con la forma que usan el filtro, el orden y la agrupación (`lib/filtros`, `lib/vistas`). */
export function aFiltrable<T>(campo: DefCampo<T>): CampoFiltrable<T> {
  return {
    id: campo.id,
    label: campo.nombre,
    tipo: TIPOS_CAMPO[campo.tipo].filtro,
    grupo: campo.grupo,
    opciones: campo.opciones?.map((o) => ({ value: o.id, label: o.label })),
    valor: (fila) => campo.valor(fila),
  }
}

export function opcionDe<T>(campo: Pick<DefCampo<T>, "opciones">, id: string): OpcionCampo | undefined {
  return campo.opciones?.find((o) => o.id === id)
}

// ---------- Texto de un valor: copiar, buscar y exportar ----------

const formatoNumero = (decimales: number | undefined) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: decimales ?? 0, maximumFractionDigits: decimales ?? 2, useGrouping: "always" })

const formatoDia = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })

/** El valor como se lee en la celda: «1.234,50 €», «32 %», «24 sep 2026», «Sí». */
export function textoDeValor<T>(campo: Pick<DefCampo<T>, "tipo" | "opciones" | "formato">, valor: ValorCampo): string {
  if (valor === null || valor === undefined || valor === "") return ""
  switch (campo.tipo) {
    case "casilla":
      return valor === true ? "Sí" : ""
    case "select":
    case "vinculo":
    case "multiselect": {
      const ids = Array.isArray(valor) ? valor : [String(valor)]
      return ids.map((id) => opcionDe(campo, id)?.label ?? id).join(", ")
    }
    case "numero":
      return typeof valor === "number" ? formatoNumero(campo.formato?.decimales).format(valor) : String(valor)
    case "moneda":
      return typeof valor === "number" ? `${formatoNumero(campo.formato?.decimales ?? 2).format(valor)} €` : String(valor)
    case "porcentaje":
      return typeof valor === "number" ? `${formatoNumero(campo.formato?.decimales).format(valor)} %` : String(valor)
    case "calificacion":
      return typeof valor === "number" && valor > 0 ? "★".repeat(Math.round(valor)) : ""
    case "progreso":
      return typeof valor === "number" ? lecturaProgreso(valor, campo.formato?.maximo).texto : String(valor)
    case "fecha": {
      const dia = String(valor).slice(0, 10)
      return /^\d{4}-\d{2}-\d{2}$/.test(dia) ? formatoDia.format(new Date(`${dia}T12:00:00`)).replace(/\./g, "") : String(valor)
    }
    default:
      return Array.isArray(valor) ? valor.join(", ") : String(valor)
  }
}

/** El valor para copiar al portapapeles: como se lee, salvo números y fechas, que van sin formato para que Excel los entienda. */
export function textoParaCopiar<T>(campo: Pick<DefCampo<T>, "tipo" | "opciones" | "formato">, valor: ValorCampo): string {
  if (valor === null || valor === undefined) return ""
  if (campo.tipo === "fecha") return String(valor).slice(0, 10)
  if (campo.tipo === "casilla") return valor === true ? "checked" : ""
  if (typeof valor === "number") return String(valor).replace(".", ",")
  return textoDeValor(campo, valor)
}

// ---------- Leer lo que se escribe o se pega ----------

export type Lectura = { ok: true; valor: ValorCampo } | { ok: false; error: string }

const ok = (valor: ValorCampo): Lectura => ({ ok: true, valor })
const mal = (error: string): Lectura => ({ ok: false, error })

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** «1.234,5», «1234.5», «12 %», «1.200 €» → 1234.5, 12, 1200. Se lee en español: «1.200» son mil doscientos. */
export function leerNumero(texto: string): number | null {
  let t = texto.replace(/[€%\s]/g, "")
  if (t === "") return null
  // Con coma y punto, el último es el decimal; con solo coma, la coma es el decimal; un punto
  // seguido de tres cifras separa los miles («1.200»), si no, es el decimal («1.5»).
  if (t.includes(",") && t.includes(".")) t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "")
  else if (t.includes(",")) t = t.replace(",", ".")
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "")
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

const MESES: Record<string, number> = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12 }

/** «2026-10-13», «13/10/2026», «13-10-26», «13 oct 2026» → «2026-10-13». */
export function leerFecha(texto: string): string | null {
  const t = texto.trim().toLowerCase()
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t)
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(t)
  const largo = /^(\d{1,2})\s+([a-záéíóú]{3})[a-záéíóú.]*\s+(\d{4})$/.exec(t)
  let a: number | undefined
  let m: number | undefined
  let d: number | undefined
  if (iso) [a, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  else if (dmy) [d, m, a] = [Number(dmy[1]), Number(dmy[2]), Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3])]
  else if (largo && MESES[largo[2]]) [d, m, a] = [Number(largo[1]), MESES[largo[2]], Number(largo[3])]
  if (a === undefined || m === undefined || d === undefined) return null
  const fecha = new Date(Date.UTC(a, m - 1, d))
  if (fecha.getUTCMonth() !== m - 1 || fecha.getUTCDate() !== d) return null
  return fecha.toISOString().slice(0, 10)
}

/**
 * Lo escrito o pegado como valor del campo. Las listas aceptan el nombre de la opción (sin
 * mayúsculas ni acentos) y, en las de varias, la lista separada por comas. Lo que no encaja se
 * rechaza con su motivo, no se guarda a medias.
 */
export function valorDeTexto<T>(campo: Pick<DefCampo<T>, "tipo" | "opciones" | "formato">, texto: string): Lectura {
  const t = texto.trim()
  if (t === "") return ok(campo.tipo === "casilla" ? false : campo.tipo === "multiselect" ? [] : null)
  switch (campo.tipo) {
    case "imagen":
    case "adjunto":
      return enlaceSeguro(t) ? ok(t) : mal("Tiene que ser un enlace que empiece por https://")
    case "numero":
    case "moneda":
    case "porcentaje": {
      const n = leerNumero(t)
      return n === null ? mal("No es un número") : ok(n)
    }
    case "calificacion": {
      const estrellas = /^★+$/.test(t) ? t.length : leerNumero(t)
      const maximo = campo.formato?.maximo ?? ESTRELLAS_POR_DEFECTO
      if (estrellas === null) return mal("No es una calificación")
      return ok(Math.max(0, Math.min(maximo, Math.round(estrellas))))
    }
    case "progreso": {
      // «40 %», «40», «2 de 3» o «2/3» (sobre el total del campo).
      const maximo = campo.formato?.maximo ?? PROGRESO_POR_DEFECTO
      const fraccion = /^(\d+(?:[.,]\d+)?)\s*(?:de|\/)\s*(\d+(?:[.,]\d+)?)$/i.exec(t)
      const n = fraccion ? (leerNumero(fraccion[1]) ?? 0) * (maximo / (leerNumero(fraccion[2]) || maximo)) : leerNumero(t)
      if (n === null) return mal("No es un progreso")
      return ok(Math.max(0, Math.min(maximo, n)))
    }
    case "casilla":
      return ok(["checked", "true", "sí", "si", "x", "1", "yes", "✓"].includes(t.toLowerCase()))
    case "fecha": {
      const dia = leerFecha(t)
      return dia === null ? mal("No es una fecha") : ok(dia)
    }
    case "email":
      return EMAIL.test(t) ? ok(t) : mal("No es un email")
    case "select":
    case "vinculo": {
      const opcion = buscarOpcion(campo, t)
      return opcion ? ok(opcion.id) : mal(`«${t}» no es una de sus opciones`)
    }
    case "multiselect": {
      const partes = t.split(",").map((p) => p.trim()).filter(Boolean)
      const ids = partes.map((p) => buscarOpcion(campo, p)?.id)
      const falta = partes.find((_, i) => ids[i] === undefined)
      return falta ? mal(`«${falta}» no es una de sus opciones`) : ok([...new Set(ids.filter((id): id is string => !!id))])
    }
    default:
      return ok(t)
  }
}

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

function buscarOpcion<T>(campo: Pick<DefCampo<T>, "opciones">, texto: string): OpcionCampo | undefined {
  const buscado = sinAcentos(texto)
  return campo.opciones?.find((o) => sinAcentos(o.label) === buscado || o.id === texto)
}

/** ¿Está vacío? Para el formulario (obligatorios) y los cálculos. */
export function esValorVacio(valor: ValorCampo | undefined): boolean {
  return valor === null || valor === undefined || valor === "" || (Array.isArray(valor) && valor.length === 0)
}
