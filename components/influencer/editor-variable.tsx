"use client"

import * as React from "react"
import { InputRule, Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import { cn } from "cn"

/** Cómo se pintan las variables: su nombre o el dato de esta collab, y qué falta. */
export type ContextoVariables = {
  valores: Record<string, string | undefined>
  /** `true`: se ve el dato («Lumea Cosmetics S.L.»); `false`: el nombre de la variable. */
  verDatos: boolean
  etiqueta: (clave: string) => string
}

const VariablesContext = React.createContext<ContextoVariables>({ valores: {}, verDatos: false, etiqueta: (c) => c })

/** Envuelve el editor para que sus variables sepan qué enseñar (el contexto llega a las vistas de nodo). */
export const ProveedorVariables = VariablesContext.Provider

function FichaVariable({ node, selected }: ReactNodeViewProps) {
  const { valores, verDatos, etiqueta } = React.useContext(VariablesContext)
  const clave = String(node.attrs.clave ?? "")
  const valor = valores[clave]
  const falta = !valor
  return (
    <NodeViewWrapper
      as="span"
      data-variable={clave}
      contentEditable={false}
      className={cn(
        "mx-px inline rounded-md px-1 py-px text-[0.92em] font-medium whitespace-nowrap",
        verDatos ? (falta ? "bg-warning-soft text-warning" : "bg-brand-soft/70 text-foreground") : "bg-brand-soft text-brand",
        selected && "ring-2 ring-brand",
      )}
      title={verDatos ? etiqueta(clave) : valor ? `Para esta collab: ${valor}` : "Sin dato para esta collab"}
    >
      {verDatos ? (valor ?? `Falta: ${etiqueta(clave).toLowerCase()}`) : etiqueta(clave)}
    </NodeViewWrapper>
  )
}

/**
 * Variable de contrato o plantilla: `{{collab.importe}}`. Se guarda como
 * `<span data-variable="collab.importe">` y se pinta como una ficha con su nombre o con el dato de
 * la collab. Escribir `{{clave}}` la crea.
 */
export const Variable = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      clave: {
        default: "",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-variable") ?? "",
        renderHTML: (attrs: { clave?: string }) => ({ "data-variable": attrs.clave }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-variable]" }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), `{{${node.attrs.clave}}}`]
  },

  renderText({ node }) {
    return `{{${node.attrs.clave}}}`
  },

  addNodeView() {
    return ReactNodeViewRenderer(FichaVariable)
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\{\{([a-z_.]+)\}\}$/,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(range.from, range.to, this.type.create({ clave: match[1] }))
        },
      }),
    ]
  },
})
