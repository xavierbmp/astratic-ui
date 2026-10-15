import { Extension } from "@tiptap/core"
import type { Node as NodoPM } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { ubicarCita } from "@/lib/revision-sugerencias"
import { rangoEnDoc, textoDeDoc } from "@/components/influencer/editor-sugerencias"

/** Una nota de la marca anclada a un trozo del texto (con lo que lo rodea, si se guardó), con el número con el que sale en el panel. */
export type MarcaNota = { id: string; numero: number; cita: string; antes?: string; despues?: string; resuelta: boolean }

export type EstadoNotas = { notas: MarcaNota[]; seleccionada: string | null }

export const CLAVE_NOTAS = new PluginKey<DecorationSet>("notas-guion")

function decorar(doc: NodoPM, { notas, seleccionada }: EstadoNotas) {
  const mapa = textoDeDoc(doc)
  const decoraciones = notas.flatMap((n) => {
    const sitio = n.cita ? ubicarCita(mapa.texto, n) : null
    if (!sitio) return []
    const { from, to } = rangoEnDoc(mapa, sitio.desde, sitio.hasta)
    const rango = { desde: from, hasta: to }
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
