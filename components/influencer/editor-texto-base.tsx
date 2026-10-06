"use client"

import * as React from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { cn } from "cn"
import { PROSA } from "@/components/influencer/prosa"
import { EditorBarra } from "@/components/influencer/editor-barra"
import { ProveedorVariables, Variable, type ContextoVariables } from "@/components/influencer/editor-variable"
import { CLAVE_NOTAS, NotasGuion, type MarcaNota } from "@/components/influencer/editor-notas"

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
  /** Variables de contrato: qué dato tiene cada una y si se ven los datos o los nombres. */
  variables?: ContextoVariables
  /** Notas de la marca ancladas al texto, numeradas como en el panel. */
  notas?: MarcaNota[]
  notaSeleccionada?: string | null
  onSeleccionarNota?: (id: string) => void
  /** Seleccionar un trozo de texto propone anclar una nota ahí. */
  onCitar?: (cita: string) => void
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
 * notas de la marca marcadas en su sitio y recuento de palabras. Se carga bajo demanda desde
 * `editor-texto.tsx`.
 */
export function EditorTextoBase({
  value,
  onChange,
  editable = true,
  placeholder = "Escribe aquí…",
  barra = true,
  extra,
  variables,
  notas,
  notaSeleccionada = null,
  onSeleccionarNota,
  onCitar,
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
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, code: false, codeBlock: false, link: { openOnClick: !editable, autolink: true, defaultProtocol: "https" } }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Variable,
      NotasGuion,
    ],
    content: value,
    editorProps: { attributes: { class: cn("min-h-full outline-none", PROSA, contenidoClassName) } },
  })

  // Tiptap guarda la configuración del primer pintado: lo que pasa en el editor se escucha aquí, con
  // las funciones de la última versión de las props.
  const alCambiar = React.useEffectEvent((html: string) => onChange?.(html))
  const alTenerEditor = React.useEffectEvent((e: Editor | null) => onEditor?.(e))

  React.useEffect(() => {
    if (!editor) return
    const actualizar = () => alCambiar(editor.getHTML())
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
  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value || "", { emitUpdate: false })
  }, [editor, value])

  React.useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  // Las notas viven fuera del documento: se pasan al plugin, que las marca sobre el texto.
  React.useEffect(() => {
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta(CLAVE_NOTAS, { notas: notas ?? [], seleccionada: notaSeleccionada }))
  }, [editor, notas, notaSeleccionada])

  // En solo lectura el editor no sigue la selección: se lee la del navegador, que es el mismo texto.
  const citar = () => {
    if (!onCitar) return
    const cita = window.getSelection()?.toString().replace(/\s+/g, " ").trim() ?? ""
    if (cita.length >= CITA.min && cita.length <= CITA.max) onCitar(cita)
  }

  const palabras = useEditorState({ editor, selector: (ctx) => ctx.editor?.storage.characterCount.words() ?? 0 }) ?? 0

  return (
    <ProveedorVariables value={variables ?? { valores: {}, verDatos: false, etiqueta: (c) => c }}>
      <div data-slot="ws-editor" className={cn("flex min-h-0 flex-col", className)}>
        {barra && editable && editor && <EditorBarra editor={editor} extra={extra} />}
        <div onMouseUp={citar} onClick={pulsar} onKeyDown={tecla} className={cn("min-h-0 flex-1 overflow-y-auto", "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground/70 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]")}>
          <EditorContent editor={editor} className="h-full" />
        </div>
        {pie?.({ palabras })}
      </div>
    </ProveedorVariables>
  )
}
