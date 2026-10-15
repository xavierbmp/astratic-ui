"use client"

import * as React from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import type { Transaction } from "@tiptap/pm/state"
import { cn } from "cn"
import { PROSA } from "@/components/influencer/prosa"
import { EditorBarra } from "@/components/influencer/editor-barra"
import { ProveedorVariables, type ContextoVariables } from "@/components/influencer/editor-variable"
import { CLAVE_NOTAS, type MarcaNota } from "@/components/influencer/editor-notas"
import { CLAVE_SUGERENCIAS, indiceEnTexto, rangoEnDoc, reemplazarEnDoc, textoDeDoc, type MarcaSugerencia } from "@/components/influencer/editor-sugerencias"
import { extensionesEditor } from "@/components/influencer/editor-extensiones"
import { citaDe, ubicarCita, type CambioTexto, type Cita, type Tramo } from "@/lib/revision-sugerencias"

export type EditorTextoProps = {
  /** HTML del documento. Si cambia desde fuera (otra versión, una plantilla), el editor lo carga. */
  value: string
  onChange?: (html: string) => void
  /** Sin edición: el mismo documento, solo para leer (lo que ve la marca, una versión enviada). */
  editable?: boolean
  placeholder?: string
  /** `false` quita la barra de formato (solo lectura o campos cortos). */
  barra?: boolean
  /** Botones propios a la derecha de la barra: plantillas, variables, cláusulas. */
  extra?: React.ReactNode
  /** Para la barra: `sticky top-0` la deja a la vista al bajar por un documento largo (su contenedor no puede recortar). */
  barraClassName?: string
  /** Variables de contrato: qué dato tiene cada una y si se ven los datos o los nombres. */
  variables?: ContextoVariables
  /** Notas de la marca ancladas al texto, numeradas como en el panel. */
  notas?: MarcaNota[]
  notaSeleccionada?: string | null
  onSeleccionarNota?: (id: string) => void
  /** Seleccionar un trozo de texto propone anclar una nota ahí (con lo que lo rodea, para encontrarlo aunque se repita). */
  onCitar?: (cita: Cita) => void
  /** Sugerencias de cambio guardadas, en su sitio: lo que se quita tachado y lo que se pone resaltado. */
  sugerencias?: MarcaSugerencia[]
  /**
   * Escribir sugiriendo, como en Google Docs: `value` es el original, que no cambia. Al abrirse se le
   * aplican las sugerencias aún abiertas (`pendientes`) y cada cambio se compara con él: lo escrito
   * sale resaltado, lo borrado tachado, y `onCambios` recibe los cambios en el texto del original.
   */
  sugerir?: { pendientes: CambioTexto[]; onCambios: (cambios: { original: string; tramos: Tramo[] }) => void }
  /** Da acceso al editor para insertar desde fuera (variables, cláusulas, plantillas). */
  onEditor?: (editor: Editor | null) => void
  /** Pie: palabras y duración, estado de guardado. */
  pie?: (info: { palabras: number }) => React.ReactNode
  /** ⌘+Enter, para guardar o enviar. */
  onAtajoGuardar?: () => void
  autoFocus?: boolean
  className?: string
  contenidoClassName?: string
}

/** Longitud de una cita que tiene sentido anclar: ni una letra ni medio guion. */
const CITA = { min: 3, max: 240 }

/**
 * El editor de texto del workspace (Tiptap): guiones, brief, contratos y conclusiones. Formato
 * profesional (títulos, listas, citas, resaltado, enlaces, alineación), variables de contrato,
 * notas y sugerencias de la marca marcadas en su sitio, escribir sugiriendo (como en Google Docs) y
 * recuento de palabras. Se carga bajo demanda desde `editor-texto.tsx`.
 */
export function EditorTextoBase({
  value,
  onChange,
  editable = true,
  placeholder = "Escribe aquí…",
  barra = true,
  extra,
  barraClassName,
  variables,
  notas,
  notaSeleccionada = null,
  onSeleccionarNota,
  onCitar,
  sugerencias,
  sugerir,
  onEditor,
  pie,
  onAtajoGuardar,
  autoFocus,
  className,
  contenidoClassName,
}: EditorTextoProps) {
  const editor = useEditor({
    // El editor se crea al montar (no en el primer pintado): así `useEditor` no crea uno que luego descarta.
    immediatelyRender: false,
    editable,
    autofocus: autoFocus ? "end" : false,
    extensions: extensionesEditor({ editable, placeholder }),
    content: value,
    editorProps: { attributes: { class: cn("min-h-full outline-none", PROSA, contenidoClassName) } },
  })

  // Tiptap guarda la configuración del primer pintado: lo que pasa en el editor se escucha aquí, con
  // las funciones de la última versión de las props.
  const alCambiar = React.useEffectEvent((html: string) => onChange?.(html))
  const alTenerEditor = React.useEffectEvent((e: Editor | null) => onEditor?.(e))
  const alSugerir = React.useEffectEvent((e: Editor) => {
    const estado = CLAVE_SUGERENCIAS.getState(e.state)
    if (sugerir && estado?.estado.original != null) sugerir.onCambios({ original: estado.estado.original, tramos: estado.tramos })
  })
  // Al sugerir, el original se queda tal cual (su texto, para comparar) y el documento pasa a ser lo
  // escrito: el original con las sugerencias aún abiertas aplicadas.
  const sugiriendo = Boolean(sugerir)
  const pendientes = React.useEffectEvent(() => sugerir?.pendientes ?? [])

  React.useEffect(() => {
    if (!editor) return
    // Solo lo que cambia quien escribe. Tiptap también avisa al abrir: cuando un plugin arregla el
    // documento (un párrafo al final si acaba en una lista) y con `setEditable`; eso no es editar.
    const actualizar = ({ transaction }: { transaction: Transaction }) => {
      if (!transaction.docChanged) return
      alCambiar(editor.getHTML())
      alSugerir(editor)
    }
    editor.on("update", actualizar)
    alTenerEditor(editor)
    return () => {
      editor.off("update", actualizar)
      alTenerEditor(null)
    }
  }, [editor])

  // Los clics en una nota marcada y ⌘+Enter se escuchan en el contenedor: el DOM del editor no
  // existe hasta que se monta.
  const pulsar = (e: React.MouseEvent) => {
    const marca = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>("[data-nota]") : null
    if (marca?.dataset.nota) onSeleccionarNota?.(marca.dataset.nota)
  }
  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onAtajoGuardar) {
      e.preventDefault()
      onAtajoGuardar()
    }
  }

  // El documento cambia desde fuera (otra versión, una plantilla): se carga sin avisar de cambios.
  // Al sugerir, el documento es lo escrito: el original solo se carga al empezar.
  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value || "", { emitUpdate: false })
    if (!editor || !sugiriendo) return
    const original = textoDeDoc(editor.state.doc).texto
    const tr = editor.state.tr.setMeta(CLAVE_SUGERENCIAS, { marcas: [], seleccionada: null, original }).setMeta("addToHistory", false)
    for (const c of pendientes()) {
      const mapa = textoDeDoc(tr.doc)
      const sitio = ubicarCita(mapa.texto, c)
      if (!sitio) continue
      const { from, to } = rangoEnDoc(mapa, sitio.desde, sitio.hasta)
      reemplazarEnDoc(tr, from, to, c.poner)
    }
    editor.view.dispatch(tr)
  }, [editor, value, sugiriendo])

  React.useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  // Las notas y las sugerencias viven fuera del documento: se pasan a sus plugins, que las marcan sobre el texto.
  React.useEffect(() => {
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta(CLAVE_NOTAS, { notas: notas ?? [], seleccionada: notaSeleccionada }))
  }, [editor, notas, notaSeleccionada])

  React.useEffect(() => {
    if (!editor || sugiriendo) return
    editor.view.dispatch(editor.state.tr.setMeta(CLAVE_SUGERENCIAS, { marcas: sugerencias ?? [], seleccionada: notaSeleccionada, original: null }))
  }, [editor, sugerencias, notaSeleccionada, sugiriendo])

  // En solo lectura el editor no sigue la selección: se lee la del navegador y se pasa al texto plano
  // del documento, con lo que la rodea para encontrarla aunque se repita.
  const citar = () => {
    const seleccion = window.getSelection()
    if (!onCitar || !editor || !seleccion || seleccion.isCollapsed || !seleccion.anchorNode || !seleccion.focusNode) return
    if (!editor.view.dom.contains(seleccion.anchorNode) || !editor.view.dom.contains(seleccion.focusNode)) return
    const a = editor.view.posAtDOM(seleccion.anchorNode, seleccion.anchorOffset)
    const b = editor.view.posAtDOM(seleccion.focusNode, seleccion.focusOffset)
    const mapa = textoDeDoc(editor.state.doc)
    let desde = indiceEnTexto(mapa, Math.min(a, b))
    let hasta = indiceEnTexto(mapa, Math.max(a, b))
    while (desde < hasta && /\s/.test(mapa.texto[desde])) desde++
    while (hasta > desde && /\s/.test(mapa.texto[hasta - 1])) hasta--
    if (hasta - desde >= CITA.min && hasta - desde <= CITA.max) onCitar(citaDe(mapa.texto, desde, hasta))
  }

  const palabras = useEditorState({ editor, selector: (ctx) => ctx.editor?.storage.characterCount.words() ?? 0 }) ?? 0

  return (
    <ProveedorVariables value={variables ?? { valores: {}, verDatos: false, etiqueta: (c) => c }}>
      <div data-slot="ws-editor" className={cn("flex min-h-0 flex-col", className)}>
        {barra && editable && !sugiriendo && editor && <EditorBarra editor={editor} extra={extra} className={barraClassName} />}
        <div onMouseUp={citar} onClick={pulsar} onKeyDown={tecla} className={cn("min-h-0 flex-1 overflow-y-auto", "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground/70 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]")}>
          <EditorContent editor={editor} className="h-full" />
        </div>
        {pie?.({ palabras })}
      </div>
    </ProveedorVariables>
  )
}
