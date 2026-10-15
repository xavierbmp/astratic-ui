import { createDocument, getHTMLFromFragment, getSchema } from "@tiptap/core"
import { EditorState } from "@tiptap/pm/state"
import { ubicarCita, type CambioTexto } from "@/lib/revision-sugerencias"
import { extensionesEditor } from "@/components/influencer/editor-extensiones"
import { rangoEnDoc, reemplazarEnDoc, textoDeDoc } from "@/components/influencer/editor-sugerencias"

let esquema: ReturnType<typeof getSchema> | null = null

/**
 * Aplica sugerencias a un documento del editor (HTML) sin pintarlo, en el navegador: la versión
 * siguiente de un guion con los cambios aceptados. Devuelve el HTML y las que no han encontrado su
 * sitio (ese trozo ya se había cambiado a mano).
 */
export function aplicarCambiosHtml<C extends CambioTexto>(html: string, cambios: C[]): { html: string; sinSitio: C[] } {
  esquema ??= getSchema(extensionesEditor({ editable: false }))
  let estado = EditorState.create({ doc: createDocument(html, esquema), schema: esquema })
  const sinSitio: C[] = []
  for (const c of cambios) {
    const mapa = textoDeDoc(estado.doc)
    const sitio = ubicarCita(mapa.texto, c)
    if (!sitio) {
      sinSitio.push(c)
      continue
    }
    const { from, to } = rangoEnDoc(mapa, sitio.desde, sitio.hasta)
    estado = estado.apply(reemplazarEnDoc(estado.tr, from, to, c.poner))
  }
  return { html: getHTMLFromFragment(estado.doc.content, esquema), sinSitio }
}
