// Importar registros a una base desde un CSV o un Excel (Xavier, 2026-10-14: «en todo donde haya datos, subir un
// Excel o un CSV con mapeo de campos»). Lo puro: leer el CSV, sugerir qué columna va a qué campo y convertir cada
// fila en los valores de sus campos, leídos como al pegar en la cuadrícula (`valorDeTexto`). El Excel lo lee el
// diálogo (`ImportarDialog`) y llega aquí como tabla de textos.
import { campoDePropio, leerFecha, leerNumero, valorDeTexto, type CampoPropio, type DefCampo, type TipoCampoPropio, type ValorCampo } from "@/lib/base/campos"
import { idBase } from "@/lib/base/vistas"

/** Lo leído del archivo: filas de celdas en texto. */
export type Tabla = string[][]

/** Cuántas filas se importan como mucho de una vez. */
export const MAXIMO_FILAS_IMPORTAR = 2000

const SEPARADORES = [",", ";", "\t"] as const

/** El separador que más se repite en las primeras líneas, fuera de comillas: coma, punto y coma o tabulador. */
function separadorDe(texto: string): string {
  const muestra = texto.split(/\r?\n/).slice(0, 5).join("\n").replace(/"[^"]*"/g, "")
  return [...SEPARADORES].sort((a, b) => muestra.split(b).length - muestra.split(a).length)[0]
}

/**
 * Un CSV (o TSV, o lo pegado de una hoja de cálculo) como tabla: el separador sale solo, las comillas protegen comas y
 * saltos de línea («""» es una comilla) y se quita la marca BOM de Excel.
 */
export function leerCsv(texto: string): Tabla {
  const limpio = texto.replace(/^﻿/, "")
  const sep = separadorDe(limpio)
  const filas: Tabla = []
  let fila: string[] = []
  let celda = ""
  let entreComillas = false
  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i]
    if (entreComillas) {
      if (c === '"' && limpio[i + 1] === '"') {
        celda += '"'
        i++
      } else if (c === '"') entreComillas = false
      else celda += c
    } else if (c === '"' && celda === "") entreComillas = true
    else if (c === sep) {
      fila.push(celda)
      celda = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && limpio[i + 1] === "\n") i++
      fila.push(celda)
      filas.push(fila)
      fila = []
      celda = ""
    } else celda += c
  }
  if (celda !== "" || fila.length) {
    fila.push(celda)
    filas.push(fila)
  }
  return limpiarTabla(filas)
}

/** Sin filas vacías, sin espacios de sobra y todas con las mismas columnas. */
export function limpiarTabla(tabla: Tabla): Tabla {
  const llenas = tabla.map((f) => f.map((c) => c.trim())).filter((f) => f.some((c) => c !== ""))
  const columnas = Math.max(0, ...llenas.map((f) => f.length))
  return llenas.map((f) => [...f, ...Array<string>(columnas - f.length).fill("")])
}

const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/** Otras formas de llamar a una columna (en español y en inglés) según el tipo del campo o su nombre. */
const SINONIMOS: { campo: (c: { id: string; nombre: string; tipo: string }) => boolean; nombres: string[] }[] = [
  { campo: (c) => c.tipo === "email", nombres: ["email", "e mail", "correo", "correo electronico", "mail"] },
  { campo: (c) => c.tipo === "telefono", nombres: ["telefono", "tel", "movil", "phone", "mobile", "whatsapp"] },
  { campo: (c) => c.tipo === "url" && /web|url|sitio/i.test(c.nombre + c.id), nombres: ["web", "website", "url", "sitio web", "pagina web"] },
  { campo: (c) => /instagram/i.test(c.nombre + c.id), nombres: ["instagram", "ig", "insta"] },
  { campo: (c) => /^nombre$|^name$/i.test(c.id) || normal(c.nombre) === "nombre", nombres: ["nombre", "name", "nombre completo", "full name", "contacto"] },
  { campo: (c) => /marca|empresa/i.test(c.nombre + c.id), nombres: ["marca", "empresa", "compania", "company", "brand", "cliente"] },
  { campo: (c) => /cargo/i.test(c.nombre + c.id), nombres: ["cargo", "puesto", "rol", "title", "job title"] },
  { campo: (c) => /nota/i.test(c.nombre + c.id), nombres: ["notas", "nota", "comentarios", "observaciones", "notes"] },
  { campo: (c) => /sector/i.test(c.nombre + c.id), nombres: ["sector", "industria", "industry", "categoria"] },
]

/** Los campos en los que se puede escribir al importar: los que no son de solo lectura. */
export function camposImportables<T>(campos: DefCampo<T>[]): DefCampo<T>[] {
  return campos.filter((c) => !c.soloLectura)
}

/**
 * Para cada columna, el campo al que va: el que se llama igual (sin mayúsculas ni acentos) o, si no, uno de sus otros
 * nombres de siempre. Cada campo, en una columna como mucho; la que no se parece a ninguno, a ninguno (`null`).
 */
export function sugerirMapeo<T>(cabeceras: string[], campos: DefCampo<T>[]): (string | null)[] {
  const libres = camposImportables(campos)
  const usados = new Set<string>()
  const elegir = (encuentra: (c: DefCampo<T>) => boolean) => {
    const campo = libres.find((c) => !usados.has(c.id) && encuentra(c))
    if (campo) usados.add(campo.id)
    return campo?.id ?? null
  }
  // Primero los nombres exactos, para que un sinónimo no le quite el sitio a una columna que se llama igual.
  const exactos = cabeceras.map((h) => elegir((c) => normal(c.nombre) === normal(h) || normal(c.id) === normal(h)))
  return exactos.map((id, i) => id ?? elegir((c) => SINONIMOS.some((s) => s.campo(c) && s.nombres.includes(normal(cabeceras[i])))))
}

export type AvisoImportacion = { fila: number; campo: string; error: string }

/**
 * Las filas de la tabla como valores de los campos elegidos (`mapeo`: el campo de cada columna o `null`). Cada celda se
 * lee como al pegarla en la cuadrícula; la que no se puede leer (una opción que no existe, una fecha mal escrita) se
 * queda vacía y avisa. Las filas sin nada que importar no cuentan. `fila` en los avisos, contando desde 1 en el archivo.
 */
export function filasParaImportar<T>(tabla: Tabla, mapeo: (string | null)[], campos: DefCampo<T>[], conCabecera: boolean): { filas: Record<string, ValorCampo>[]; avisos: AvisoImportacion[] } {
  const datos = (conCabecera ? tabla.slice(1) : tabla).slice(0, MAXIMO_FILAS_IMPORTAR)
  const avisos: AvisoImportacion[] = []
  const filas: Record<string, ValorCampo>[] = []
  datos.forEach((fila, i) => {
    const valores: Record<string, ValorCampo> = {}
    mapeo.forEach((id, col) => {
      const campo = id ? campos.find((c) => c.id === id) : undefined
      const texto = fila[col] ?? ""
      if (!campo || texto.trim() === "") return
      const lectura = valorDeTexto(campo, texto)
      if (lectura.ok) valores[campo.id] = lectura.valor
      else avisos.push({ fila: i + 1 + (conCabecera ? 1 : 0), campo: campo.nombre, error: lectura.error })
    })
    if (Object.keys(valores).length) filas.push(valores)
  })
  return { filas, avisos }
}

/**
 * Un registro por fila: el vacío de la página (`vacio`, con su id nuevo) con cada valor escrito con las reglas de su
 * base (`escribirEn…`), igual que si se escribiera en la celda.
 */
export function registrosDeFilas<T>(filas: Record<string, ValorCampo>[], campos: DefCampo<T>[], vacio: () => T, escribir: (registro: T, campo: DefCampo<T>, valor: ValorCampo) => T): T[] {
  return filas.map((valores) =>
    Object.entries(valores).reduce((registro, [id, valor]) => {
      const campo = campos.find((c) => c.id === id)
      return campo ? escribir(registro, campo, valor) : registro
    }, vacio()),
  )
}

// ─────────────── Campos nuevos desde el archivo ───────────────
// Una columna que no va a ningún campo puede crear el suyo (Xavier, 2026-10-16: «sincronizar los campos y crear nuevos
// si su base de datos lo necesita»): con el nombre de la columna y el tipo que mejor lee lo que lleva.

/** Lo que se marca en el mapeo de una columna que crea su campo. */
export const CAMPO_NUEVO = "__nuevo__"

const URL = /^(https?:\/\/|www\.)\S+$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONO = /^\+?[\d\s().-]{7,20}$/
const CASILLA = new Set(["sí", "si", "no", "x", "true", "false", "yes", "✓"])
/** Con más letras que esto de media, es una nota y no un texto de una línea. */
const LARGO_TEXTO_CORTO = 80

/** El tipo que mejor lee todos los valores de una columna; si no hay ninguno claro, texto. */
export function tipoSugerido(valores: string[]): TipoCampoPropio {
  const llenos = valores.map((v) => v.trim()).filter(Boolean)
  if (!llenos.length) return "texto"
  const todos = (prueba: (v: string) => boolean) => llenos.every(prueba)
  if (todos((v) => EMAIL.test(v))) return "email"
  if (todos((v) => URL.test(v))) return "url"
  if (todos((v) => CASILLA.has(v.toLowerCase()))) return "casilla"
  if (todos((v) => /\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}/.test(v) && leerFecha(v) !== null)) return "fecha"
  if (todos((v) => /[\s+()]/.test(v) && TELEFONO.test(v))) return "telefono"
  if (todos((v) => leerNumero(v) !== null)) return "numero"
  const media = llenos.reduce((n, v) => n + v.length, 0) / llenos.length
  return media > LARGO_TEXTO_CORTO ? "texto_largo" : "texto"
}

/** El nombre de una columna como nombre de campo: sin repetir uno que ya existe («Notas» → «Notas 2»). */
export function nombreLibre(nombre: string, usados: string[]): string {
  const base = nombre.trim() || "Campo nuevo"
  const ocupados = new Set(usados.map((u) => u.trim().toLowerCase()))
  if (!ocupados.has(base.toLowerCase())) return base
  let n = 2
  while (ocupados.has(`${base} ${n}`.toLowerCase())) n++
  return `${base} ${n}`
}

/**
 * Los campos propios que crean las columnas marcadas con `CAMPO_NUEVO`, y el mapeo con sus ids en su lugar, listo para
 * `filasParaImportar` junto a los campos de siempre (`campos`).
 */
export function camposNuevosDelMapeo<T>(tabla: Tabla, mapeo: (string | null)[], campos: DefCampo<T>[], conCabecera: boolean): { nuevos: CampoPropio[]; mapeo: (string | null)[]; campos: DefCampo<T>[] } {
  const datos = conCabecera ? tabla.slice(1) : tabla
  const usados = campos.map((c) => c.nombre)
  const nuevos: CampoPropio[] = []
  const final = mapeo.map((m, col) => {
    if (m !== CAMPO_NUEVO) return m
    const nombre = nombreLibre(conCabecera ? (tabla[0]?.[col] ?? "") : `Columna ${col + 1}`, usados)
    usados.push(nombre)
    const campo: CampoPropio = { id: idBase("f"), nombre, tipo: tipoSugerido(datos.map((f) => f[col] ?? "")) }
    nuevos.push(campo)
    return campo.id
  })
  return { nuevos, mapeo: final, campos: [...campos, ...nuevos.map((p) => campoDePropio<T>(p, () => undefined))] }
}
