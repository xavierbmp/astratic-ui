import { Extension } from "@tiptap/core"
import type { Node as NodoPM } from "@tiptap/pm/model"
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { tramosDeCambio, ubicarCita, type CambioTexto, type Tramo } from "@/lib/revision-sugerencias"

export type EstadoSugerencia = "pendiente" | "aceptada" | "rechazada"

/** Una sugerencia guardada, con el número con el que sale en la conversación, para pintarla en su sitio. */
export type MarcaSugerencia = { id: string; numero: number; cambio: CambioTexto; estado: EstadoSugerencia }

/**
 * Lo que pinta el editor: las sugerencias guardadas sobre el texto o, mientras se sugiere, lo escrito
 * frente al original (`original`, su texto plano), con los cambios que salen de comparar.
 */
export type EstadoSugerencias = { marcas: MarcaSugerencia[]; seleccionada: string | null; original: string | null }

type EstadoPlugin = { estado: EstadoSugerencias; decoraciones: DecorationSet; tramos: Tramo[] }

export const CLAVE_SUGERENCIAS = new PluginKey<EstadoPlugin>("sugerencias-texto")

// ─────────────── Del documento al texto plano y vuelta ───────────────

/** El texto plano de un documento (un salto por bloque y por salto de línea) y la posición de cada letra. */
export type MapaTexto = { texto: string; antes: number[]; despues: number[]; fin: number }

export function textoDeDoc(doc: NodoPM): MapaTexto {
  let texto = ""
  const antes: number[] = []
  const despues: number[] = []
  let fin = 1
  let primero = true
  doc.descendants((nodo, pos) => {
    if (!nodo.isTextblock) return true
    if (!primero) {
      antes.push(fin)
      despues.push(pos + 1)
      texto += "\n"
    }
    primero = false
    nodo.forEach((hijo, offset) => {
      const p = pos + 1 + offset
      if (hijo.isText && hijo.text) {
        for (let i = 0; i < hijo.text.length; i++) {
          antes.push(p + i)
          despues.push(p + i + 1)
        }
        texto += hijo.text
      } else if (hijo.type.name === "hardBreak") {
        antes.push(p)
        despues.push(p + 1)
        texto += "\n"
      }
    })
    fin = pos + 1 + nodo.content.size
    return false
  })
  return { texto, antes, despues, fin }
}

/** Las posiciones del documento de un trozo del texto plano (vacío: un punto). */
export function rangoEnDoc(m: MapaTexto, desde: number, hasta: number) {
  const from = desde < m.texto.length ? m.antes[desde] : m.fin
  return { from, to: hasta > desde ? m.despues[hasta - 1] : from }
}

/** El sitio en el texto plano de una posición del documento: la primera letra que queda detrás. */
export function indiceEnTexto(m: MapaTexto, pos: number) {
  const i = m.antes.findIndex((p) => p >= pos)
  return i < 0 ? m.texto.length : i
}

/** Cambia un trozo del documento por un texto; cada salto de línea parte el bloque, como al pulsar Intro. */
export function reemplazarEnDoc(tr: Transaction, from: number, to: number, texto: string) {
  const [primera, ...resto] = texto.split("\n")
  tr.insertText(primera, from, to)
  let pos = from + primera.length
  for (const linea of resto) {
    tr.split(pos)
    pos += 2
    if (linea) tr.insertText(linea, pos)
    pos += linea.length
  }
  return tr
}

// ─────────────── Pintar ───────────────

const CLASES = {
  quitar: "rounded-sm bg-danger-soft text-danger line-through decoration-danger/60 whitespace-pre-wrap!",
  poner: "rounded-sm bg-success-soft text-success underline decoration-success/40 underline-offset-2 whitespace-pre-wrap!",
  aceptada: "rounded-sm bg-success-soft/60 whitespace-pre-wrap!",
  numero: "ml-0.5 inline-grid size-4 cursor-pointer place-items-center rounded-full bg-brand align-middle text-[10px] font-semibold text-white",
  seleccionada: "ring-2 ring-brand",
}

function trozo(texto: string, clase: string, id?: string) {
  return () => {
    const el = document.createElement("span")
    el.textContent = texto
    el.className = clase
    el.contentEditable = "false"
    if (id) {
      el.dataset.nota = id
      el.classList.add("cursor-pointer")
    }
    return el
  }
}

/** Las sugerencias guardadas: lo que se quita, tachado; lo que se pone, resaltado detrás; y su número. */
function decorarGuardadas(doc: NodoPM, { marcas, seleccionada }: EstadoSugerencias) {
  const mapa = textoDeDoc(doc)
  return marcas.flatMap((m) => {
    const sitio = m.estado === "rechazada" ? null : ubicarCita(mapa.texto, m.cambio)
    if (!sitio) return []
    const { from, to } = rangoEnDoc(mapa, sitio.desde, sitio.hasta)
    const marcada = seleccionada === m.id ? ` ${CLASES.seleccionada}` : ""
    const clave = `sug-${m.id}-${m.estado}-${marcada}-${m.cambio.poner}`
    const decoraciones: Decoration[] = []
    if (to > from) decoraciones.push(Decoration.inline(from, to, { class: (m.estado === "aceptada" ? "hidden" : `${CLASES.quitar} cursor-pointer`) + marcada, "data-nota": m.id }))
    if (m.cambio.poner) decoraciones.push(Decoration.widget(to, trozo(m.cambio.poner, (m.estado === "aceptada" ? CLASES.aceptada : CLASES.poner) + marcada, m.id), { side: 1, key: `${clave}-poner` }))
    if (m.estado === "pendiente") decoraciones.push(Decoration.widget(to, trozo(String(m.numero), CLASES.numero, m.id), { side: 2, key: `${clave}-numero-${m.numero}` }))
    return decoraciones
  })
}

/** Mientras se sugiere: lo escrito de más, resaltado; lo quitado del original, tachado en su sitio. */
function decorarEscritura(doc: NodoPM, original: string) {
  const mapa = textoDeDoc(doc)
  const tramos = tramosDeCambio(original, mapa.texto)
  const decoraciones = tramos.flatMap((t) => {
    const { from, to } = rangoEnDoc(mapa, t.enNuevo, t.enNuevo + t.poner.length)
    const lista: Decoration[] = []
    if (t.quitar) lista.push(Decoration.widget(from, trozo(t.quitar, CLASES.quitar), { side: -1, key: `quitado-${t.desde}-${t.quitar}`, ignoreSelection: true }))
    if (to > from) lista.push(Decoration.inline(from, to, { class: CLASES.poner }))
    return lista
  })
  return { decoraciones, tramos }
}

function calcular(doc: NodoPM, estado: EstadoSugerencias): EstadoPlugin {
  if (estado.original === null) return { estado, decoraciones: DecorationSet.create(doc, decorarGuardadas(doc, estado)), tramos: [] }
  const { decoraciones, tramos } = decorarEscritura(doc, estado.original)
  return { estado, decoraciones: DecorationSet.create(doc, decoraciones), tramos }
}

/**
 * Sugerencias de cambio sobre el texto, como en Google Docs. Con `original`, lo que se escribe se
 * compara con él y se pinta como sugerencia (y los cambios quedan en `tramos`, para guardarlos);
 * sin él, se pintan las sugerencias guardadas. El estado cambia desde fuera con `CLAVE_SUGERENCIAS`.
 */
export const SugerenciasTexto = Extension.create({
  name: "sugerenciasTexto",

  addProseMirrorPlugins() {
    return [
      new Plugin<EstadoPlugin>({
        key: CLAVE_SUGERENCIAS,
        state: {
          init: () => ({ estado: { marcas: [], seleccionada: null, original: null }, decoraciones: DecorationSet.empty, tramos: [] }),
          apply: (tr, valor) => {
            const nuevo = tr.getMeta(CLAVE_SUGERENCIAS) as EstadoSugerencias | undefined
            if (nuevo) return calcular(tr.doc, nuevo)
            if (tr.docChanged) return calcular(tr.doc, valor.estado)
            return valor
          },
        },
        props: {
          decorations(state) {
            return CLAVE_SUGERENCIAS.getState(state)?.decoraciones
          },
        },
      }),
    ]
  },
})
