// Sugerencias de cambio sobre un texto, como en Google Docs: quien revisa escribe encima del texto
// y cada cambio (quitar un trozo, poner otro o las dos cosas) queda como una sugerencia que el autor
// acepta o rechaza. Aquí solo el texto plano (un salto por bloque): comparar el original con lo que
// ha escrito quien revisa, anclar cada cambio a su sitio con lo que lo rodea, aplicarlo y saber qué
// sugerencias hay que crear, cambiar o retirar. El editor pasa de su documento a este texto y vuelta.

/** Un trozo de un texto como lo citaría una persona: el trozo y lo que tiene justo antes y después. */
export type Cita = { cita: string; antes?: string; despues?: string }

/** Lo que propone quien revisa: quitar la cita (vacía si solo añade) y poner otro texto (vacío si solo quita). */
export type CambioTexto = Cita & { poner: string }

/** Un cambio entre el original y lo escrito, con su sitio en los dos textos. */
export type Tramo = {
  /** Dónde empieza y acaba lo que se quita, en el original (iguales si solo se añade). */
  desde: number
  hasta: number
  quitar: string
  poner: string
  /** Dónde empieza lo puesto en el texto nuevo. */
  enNuevo: number
}

/** Cuánto texto de alrededor se guarda con una cita para encontrarla aunque se repita. */
const CONTEXTO = 32

/** Por encima de este tamaño (palabras × palabras) la parte cambiada se da como un solo cambio. */
const LIMITE_COMPARAR = 2_000_000

/** Palabras (con # y @ para que un hashtag o una mención vayan enteros), espacios y cada signo suelto. */
const TOKEN = /\s+|[\p{L}\p{N}_#@']+|[^\s\p{L}\p{N}_#@']/gu

const trozos = (texto: string) => texto.match(TOKEN) ?? []
const esEspacio = (s: string) => s.trim() === ""

type Paso = { tipo: "igual" | "quitar" | "poner"; texto: string }

/** Los pasos de la parte central, con la subsecuencia común más larga palabra a palabra. */
function pasosCentro(a: string[], b: string[]): Paso[] {
  if (a.length * b.length > LIMITE_COMPARAR) return [...a.map((t): Paso => ({ tipo: "quitar", texto: t })), ...b.map((t): Paso => ({ tipo: "poner", texto: t }))]
  const largo: Uint32Array[] = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) largo[i][j] = a[i] === b[j] ? largo[i + 1][j + 1] + 1 : Math.max(largo[i + 1][j], largo[i][j + 1])
  }
  const pasos: Paso[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pasos.push({ tipo: "igual", texto: a[i] })
      i++
      j++
    } else if (largo[i + 1][j] >= largo[i][j + 1]) pasos.push({ tipo: "quitar", texto: a[i++] })
    else pasos.push({ tipo: "poner", texto: b[j++] })
  }
  while (i < a.length) pasos.push({ tipo: "quitar", texto: a[i++] })
  while (j < b.length) pasos.push({ tipo: "poner", texto: b[j++] })
  return pasos
}

/** Los pasos de todo el texto: lo común del principio y del final no se compara (casi siempre se cambia un trozo). */
function pasos(original: string, nuevo: string): Paso[] {
  const a = trozos(original)
  const b = trozos(nuevo)
  let inicio = 0
  while (inicio < a.length && inicio < b.length && a[inicio] === b[inicio]) inicio++
  let fin = 0
  while (fin < a.length - inicio && fin < b.length - inicio && a[a.length - 1 - fin] === b[b.length - 1 - fin]) fin++
  const igual = (t: string): Paso => ({ tipo: "igual", texto: t })
  return [...a.slice(0, inicio).map(igual), ...pasosCentro(a.slice(inicio, a.length - fin), b.slice(inicio, b.length - fin)), ...a.slice(a.length - fin).map(igual)]
}

/** Lo igual que queda entre dos cambios y se traga con ellos: espacios, signos y como mucho una palabra corta («que», «y la»). */
const HUECO = { palabras: 1, letras: 4 }

/**
 * Los cambios entre el texto original y el que ha escrito quien revisa, en orden. Lo que se quita y
 * lo que se pone seguido es un solo cambio («reemplazar»), y dos cambios separados solo por
 * espacios, signos o una palabra corta también: borrar una frase y escribir otra que comparte un
 * «que» es un cambio, no dos. Los cambios que solo tocan espacios no cuentan.
 */
export function tramosDeCambio(original: string, nuevo: string): Tramo[] {
  const tramos: Tramo[] = []
  let enOriginal = 0
  let enNuevo = 0
  let abierto: Tramo | null = null
  let palabrasDelHueco = 0
  const cerrar = () => {
    if (abierto) tramos.push(abierto)
    abierto = null
  }
  for (const p of pasos(original, nuevo)) {
    if (p.tipo === "igual") {
      const corta = p.texto.length <= HUECO.letras && palabrasDelHueco < HUECO.palabras
      if (abierto && !esEspacio(p.texto)) {
        if (corta) palabrasDelHueco++
        else cerrar()
      }
      enOriginal += p.texto.length
      enNuevo += p.texto.length
      continue
    }
    if (!abierto) abierto = { desde: enOriginal, hasta: enOriginal, quitar: "", poner: "", enNuevo }
    palabrasDelHueco = 0
    if (p.tipo === "quitar") enOriginal += p.texto.length
    else enNuevo += p.texto.length
    abierto.hasta = enOriginal
    abierto.quitar = original.slice(abierto.desde, enOriginal)
    abierto.poner = nuevo.slice(abierto.enNuevo, enNuevo)
  }
  cerrar()
  return tramos.filter((t) => !(esEspacio(t.quitar) && esEspacio(t.poner))).map((t) => deslizar(original, t))
}

const corte = (c: string | undefined) => c === undefined || /[\s.,;:!?)»”]/.test(c)

/**
 * Lo que solo se añade o solo se quita puede ir en varios sitios que dan lo mismo («.\nCierro» antes
 * del punto o «\nCierro.» después): se queda donde lo haría una persona. Primero, un párrafo entero
 * va como «salto + texto» al final del bloque de antes (Intro al final de un párrafo), para que al
 * aplicarlo tome su formato y no el del siguiente (un título); si no, donde empieza y acaba en un
 * corte de palabra.
 */
function deslizar(original: string, t: Tramo): Tramo {
  if (t.quitar && t.poner) return t
  const quita = Boolean(t.quitar)
  const largo = (t.quitar || t.poner).length
  const despues = (p: number) => original[quita ? p + largo : p]
  let p = t.desde
  let s = t.quitar || t.poner
  while (p > 0 && s[s.length - 1] === original[p - 1]) {
    s = original[p - 1] + s.slice(0, -1)
    p--
  }
  const sitios: { p: number; s: string }[] = [{ p, s }]
  while (despues(p) !== undefined && s[0] === despues(p)) {
    s = s.slice(1) + despues(p)
    p++
    sitios.push({ p, s })
  }
  const puntos = (x: { p: number; s: string }) => (x.s.startsWith("\n") ? 4 : 0) + Number(corte(original[x.p - 1]) || corte(x.s[0])) + Number(corte(x.s[x.s.length - 1]) || corte(despues(x.p)))
  const mejor = sitios.reduce((a, b) => (puntos(b) > puntos(a) ? b : a))
  const delta = mejor.p - t.desde
  return { desde: mejor.p, hasta: t.hasta + delta, quitar: quita ? mejor.s : "", poner: quita ? "" : mejor.s, enNuevo: t.enNuevo + delta }
}

/** La cita de un trozo del texto, con lo que lo rodea para encontrarla aunque se repita. */
export function citaDe(texto: string, desde: number, hasta: number): Cita {
  return { cita: texto.slice(desde, hasta), antes: texto.slice(Math.max(0, desde - CONTEXTO), desde), despues: texto.slice(hasta, hasta + CONTEXTO) }
}

/** Cuántas letras coinciden al final de `a` con el final de `b`. */
function finComun(a: string, b: string) {
  let n = 0
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++
  return n
}

function principioComun(a: string, b: string) {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n++
  return n
}

function apariciones(texto: string, buscado: string) {
  const posiciones: number[] = []
  if (!buscado) return posiciones
  for (let i = texto.indexOf(buscado); i >= 0; i = texto.indexOf(buscado, i + 1)) posiciones.push(i)
  return posiciones
}

/**
 * Dónde está una cita en un texto: entre todas las veces que aparece, la que mejor encaja con lo
 * que tenía antes y después. Una cita vacía (solo se añade) se busca por lo que la rodea. Sin sitio
 * (el trozo ya no está), nada.
 */
export function ubicarCita(texto: string, { cita, antes = "", despues = "" }: Cita): { desde: number; hasta: number } | null {
  const candidatos = cita
    ? apariciones(texto, cita)
    : [...new Set([...apariciones(texto, antes + despues).map((i) => i + antes.length), ...apariciones(texto, antes).map((i) => i + antes.length), ...apariciones(texto, despues)])]
  if (!cita && !antes && !despues) candidatos.push(0)
  let mejor: { desde: number; hasta: number } | null = null
  let puntos = -1
  for (const desde of candidatos) {
    const hasta = desde + cita.length
    const p = finComun(texto.slice(0, desde), antes) + principioComun(texto.slice(hasta), despues)
    if (p > puntos) {
      mejor = { desde, hasta }
      puntos = p
    }
  }
  return mejor
}

/** Un cambio aplicado sobre un texto, o `null` si su trozo ya no está. */
export function aplicarCambio(texto: string, cambio: CambioTexto): string | null {
  const sitio = ubicarCita(texto, cambio)
  return sitio ? texto.slice(0, sitio.desde) + cambio.poner + texto.slice(sitio.hasta) : null
}

/** Varios cambios seguidos sobre un texto: el resultado y los que no han encontrado su sitio. */
export function aplicarCambios<C extends CambioTexto>(texto: string, cambios: C[]): { texto: string; sinSitio: C[] } {
  const sinSitio: C[] = []
  let resultado = texto
  for (const c of cambios) {
    const aplicado = aplicarCambio(resultado, c)
    if (aplicado === null) sinSitio.push(c)
    else resultado = aplicado
  }
  return { texto: resultado, sinSitio }
}

/** Una sugerencia ya guardada que quien revisa aún puede cambiar o retirar. */
export type SugerenciaAbierta = { id: string; cambio: CambioTexto }

export type Sincronizacion = { crear: CambioTexto[]; cambiar: SugerenciaAbierta[]; retirar: string[] }

const mismoCambio = (a: CambioTexto, b: CambioTexto) => a.cita === b.cita && a.poner === b.poner && (a.antes ?? "") === (b.antes ?? "") && (a.despues ?? "") === (b.despues ?? "")

/**
 * Qué hay que guardar después de que quien revisa haya escrito sobre el texto: cada cambio que pisa
 * o toca una sugerencia suya ya guardada la cambia; uno nuevo se crea; y la sugerencia que ya no
 * sale (la ha deshecho) se retira. Todo en posiciones del original, que no cambia.
 */
export function sincronizarSugerencias(original: string, tramos: Tramo[], abiertas: SugerenciaAbierta[]): Sincronizacion {
  const ubicadas = abiertas.flatMap((s) => {
    const sitio = ubicarCita(original, s.cambio)
    return sitio ? [{ ...s, ...sitio }] : []
  })
  const usadas = new Set<string>()
  const crear: CambioTexto[] = []
  const cambiar: SugerenciaAbierta[] = []
  for (const t of tramos) {
    const cambio: CambioTexto = { ...citaDe(original, t.desde, t.hasta), poner: t.poner }
    const suya = ubicadas.find((s) => !usadas.has(s.id) && s.desde <= t.hasta && t.desde <= s.hasta)
    if (!suya) {
      crear.push(cambio)
      continue
    }
    usadas.add(suya.id)
    if (!mismoCambio(suya.cambio, cambio)) cambiar.push({ id: suya.id, cambio })
  }
  return { crear, cambiar, retirar: ubicadas.filter((s) => !usadas.has(s.id)).map((s) => s.id) }
}

export type TipoCambio = "reemplazar" | "anadir" | "quitar"

export function tipoDeCambio({ cita, poner }: Pick<CambioTexto, "cita" | "poner">): TipoCambio {
  if (!cita) return "anadir"
  if (!poner) return "quitar"
  return "reemplazar"
}

/** Un texto plano (el copy) como párrafos del editor, uno por línea, y vuelta igual con `textoDeDoc`. */
export function textoAParrafos(texto: string) {
  const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return texto
    .split("\n")
    .map((linea) => `<p>${escapar(linea)}</p>`)
    .join("")
}
