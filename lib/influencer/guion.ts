// Guiones y textos: pasar del HTML del editor a texto, contar, estimar cuánto dura dicho en voz alta,
// comprobarlo contra el brief antes de enviarlo y comparar dos versiones palabra a palabra.
import type { Brief } from "@/lib/influencer/modelo"

/** Palabras por segundo al hablar a cámara, a ritmo de reel. */
const PALABRAS_POR_SEGUNDO = 2.6

const ENTIDADES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " }

/** El texto de un HTML del editor, con un salto por bloque. Solo para contar y comparar: no se pinta. */
export function textoPlano(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTIDADES[e] ?? e)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** El primer párrafo con texto de un documento (el objetivo de un brief), para resúmenes de una línea. */
export function primerParrafo(html: string) {
  const parrafo = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[0] ?? ""
  return textoPlano(parrafo).replace(/\s+/g, " ").trim()
}

export function contarPalabras(texto: string) {
  return texto.split(/\s+/).filter(Boolean).length
}

/** Segundos que dura el texto dicho a cámara. */
export function duracionEstimada(palabras: number) {
  return Math.round(palabras / PALABRAS_POR_SEGUNDO)
}

const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Texto plano (lo que escribe la marca en su formulario) a HTML del editor: un párrafo por línea. */
export function textoAHtml(texto: string) {
  return texto
    .split(/\n{2,}/)
    .map((bloque) => bloque.trim())
    .filter(Boolean)
    .map((bloque) => `<p>${bloque.split("\n").map(escapar).join("<br>")}</p>`)
    .join("")
}

export type Comprobacion = { id: string; label: string; ok: boolean; detalle?: string }

/** Lo que vale como marca de publicidad en español; «#ad» no basta (Código de Autocontrol de 2025). */
const PUBLICIDAD = /#publi\b|#publicidad\b|\bpublicidad\b|colaboraci[oó]n pagada/i

/** Si un texto va marcado como publicidad en español y si solo lleva «#ad», que no vale. */
export function marcaDePublicidad(texto: string) {
  const ok = PUBLICIDAD.test(texto)
  return { ok, soloAd: !ok && /#ad\b/i.test(texto) }
}

/**
 * Antes de enviar a revisión: que estén las menciones, los hashtags y el código del brief, y la marca
 * de publicidad. Con reglas simples; la comprobación de claims, más adelante.
 */
export function comprobarGuion(html: string, brief: Pick<Brief, "menciones" | "hashtags" | "codigo">): Comprobacion[] {
  const texto = textoPlano(html).toLowerCase()
  const contiene = (s: string) => texto.includes(s.toLowerCase())
  const lista: Comprobacion[] = [
    ...brief.menciones.map((m) => ({ id: `m-${m}`, label: `Menciona ${m}`, ok: contiene(m) })),
    ...brief.hashtags.filter((h) => h.toLowerCase() !== "#publi").map((h) => ({ id: `h-${h}`, label: `Lleva ${h}`, ok: contiene(h) })),
  ]
  if (brief.codigo) lista.push({ id: "codigo", label: `Código ${brief.codigo}`, ok: contiene(brief.codigo) })
  const { ok: publicidad, soloAd } = marcaDePublicidad(texto)
  lista.push({ id: "publi", label: "Marcado como publicidad", ok: publicidad, detalle: soloAd ? "«#ad» no vale en español: usa #publi o «publicidad»" : undefined })
  return lista
}

export type TramoDiff = { tipo: "igual" | "nuevo" | "quitado"; texto: string }

/**
 * Lo que cambia de una versión a otra, palabra a palabra (subsecuencia común más larga). Pensado
 * para guiones: unos cientos de palabras.
 */
export function compararTextos(antes: string, despues: string): TramoDiff[] {
  const a = antes.split(/(\s+)/).filter(Boolean)
  const b = despues.split(/(\s+)/).filter(Boolean)
  const largo: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      largo[i][j] = a[i] === b[j] ? largo[i + 1][j + 1] + 1 : Math.max(largo[i + 1][j], largo[i][j + 1])
    }
  }
  const tramos: TramoDiff[] = []
  const anadir = (tipo: TramoDiff["tipo"], texto: string) => {
    const ultimo = tramos[tramos.length - 1]
    if (ultimo?.tipo === tipo) ultimo.texto += texto
    else tramos.push({ tipo, texto })
  }
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      anadir("igual", a[i])
      i++
      j++
    } else if (largo[i + 1][j] >= largo[i][j + 1]) {
      anadir("quitado", a[i++])
    } else {
      anadir("nuevo", b[j++])
    }
  }
  while (i < a.length) anadir("quitado", a[i++])
  while (j < b.length) anadir("nuevo", b[j++])
  return tramos
}
