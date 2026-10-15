import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { Variable } from "@/components/influencer/editor-variable"
import { NotasGuion } from "@/components/influencer/editor-notas"
import { SugerenciasTexto } from "@/components/influencer/editor-sugerencias"

/**
 * Las extensiones del editor del workspace, las mismas para escribir, para leer y para aplicar
 * sugerencias sin pantalla (`aplicarCambiosHtml`): así el texto de un documento es el mismo en todos.
 */
export function extensionesEditor({ editable = true, placeholder = "" }: { editable?: boolean; placeholder?: string } = {}) {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, code: false, codeBlock: false, link: { openOnClick: !editable, autolink: true, defaultProtocol: "https" } }),
    Highlight,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    Variable,
    NotasGuion,
    SugerenciasTexto,
  ]
}
