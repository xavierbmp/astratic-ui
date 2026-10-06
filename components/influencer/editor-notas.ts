import { Extension } from "@tiptap/core"
import type { Node as NodoPM } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

/** Una nota de la marca anclada a un trozo del texto, con el número con el que sale en el panel. */
export type MarcaNota = { id: string; numero: number; cita: string; resuelta: boolean }

export type EstadoNotas = { notas: MarcaNota[]; seleccionada: string | null }

export const CLAVE_NOTAS = new PluginKey<DecorationSet>("notas-guion")

/** Dónde está una cita en el documento: recorre cada párrafo sumando el texto de sus trozos. */
function rangoDeCita(doc: NodoPM, cita: string): { desde: number; hasta: number } | null {
  let rango: { desde: number; hasta: number } | null = null
  doc.descendants((nodo, pos) => {
    if (rango || !nodo.isTextblock) return !rango
    const texto = nodo.textContent
    const i = texto.indexOf(cita)
    if (i < 0) return false
    // Pasar de la posición en el texto a la del documento, contando solo los trozos de texto: el
    // principio cae dentro de un trozo y el final puede caer justo al acabar uno.
    const posicion = (indice: number, alFinal: boolean) => {
      let acumulado = 0
      let resultado: number | null = null
      nodo.forEach((hijo, offset) => {
        if (resultado !== null || !hijo.isText) return
        const largo = hijo.text?.length ?? 0
        const dentro = alFinal ? indice > acumulado && indice <= acumulado + largo : indice >= acumulado && indice < acumulado + largo
        if (dentro) resultado = pos + 1 + offset + (indice - acumulado)
        acumulado += largo
      })
      return resultado
    }
    const desde = posicion(i, false)
    const hasta = posicion(i + cita.length, true)
    if (desde !== null && hasta !== null) rango = { desde, hasta }
    return false
  })
  return rango
}

function decorar(doc: NodoPM, { notas, seleccionada }: EstadoNotas) {
  const decoraciones = notas.flatMap((n) => {
    const rango = rangoDeCita(doc, n.cita)
    if (!rango) return []
    const clase = ["rounded-sm px-0.5 cursor-pointer transition-colors", n.resuelta ? "bg-success-soft" : "bg-warning-soft", seleccionada === n.id ? "ring-2 ring-brand" : ""].join(" ")
    const numero = () => {
      const el = document.createElement("span")
      el.textContent = String(n.numero)
      el.dataset.nota = n.id
      el.className = `ml-0.5 inline-grid size-4 cursor-pointer place-items-center rounded-full align-middle text-[10px] font-semibold text-white ${n.resuelta ? "bg-success" : "bg-brand"}`
      return el
    }
    return [Decoration.inline(rango.desde, rango.hasta, { class: clase, "data-nota": n.id }), Decoration.widget(rango.hasta, numero, { side: 1, key: `nota-${n.id}-${n.resuelta}-${seleccionada === n.id}` })]
  })
  return DecorationSet.create(doc, decoraciones)
}

/**
 * Marca en el texto las citas de las notas de la marca, con su número (`data-nota`, para saber cuál
 * se pulsa). Las notas cambian desde fuera con una transacción con `CLAVE_NOTAS`.
 */
export const NotasGuion = Extension.create({
  name: "notasGuion",

  addProseMirrorPlugins() {
    return [
      new Plugin<{ estado: EstadoNotas; decoraciones: DecorationSet }>({
        key: new PluginKey("notas-guion-estado"),
        state: {
          init: () => ({ estado: { notas: [], seleccionada: null }, decoraciones: DecorationSet.empty }),
          apply: (tr, valor) => {
            const nuevo = tr.getMeta(CLAVE_NOTAS) as EstadoNotas | undefined
            if (nuevo) return { estado: nuevo, decoraciones: decorar(tr.doc, nuevo) }
            if (tr.docChanged) return { estado: valor.estado, decoraciones: decorar(tr.doc, valor.estado) }
            return valor
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decoraciones
          },
        },
      }),
    ]
  },
})
