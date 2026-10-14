import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Root, RootContent } from "mdast"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { esTipoDeCaja, GuideCallout, GuideH2, GuideH3, GuideProse } from "@/components/document/guide"

/**
 * Pinta el Markdown de un capítulo con las piezas de la guía. Convenciones del texto:
 * - `##` y `###` son los títulos dentro del capítulo (el título del capítulo lo pone `GuideChapter`).
 * - `> [!consejo] Título` abre una caja (`consejo`, `ojo`, `ley`, `dato`, `ejemplo`, `resumen`); el título es opcional.
 * - Un bloque de código con lenguaje `figura` y el id dentro pinta la figura de `figures` con ese id.
 * - `---` fuerza un salto de página. Tablas y listas de casillas (`- [ ]`) son las de GitHub.
 */
export function GuideMarkdown({
  source,
  figures = {},
  className,
}: {
  source: string
  figures?: Record<string, React.ReactNode>
  className?: string
}) {
  const components: Components = {
    h1: ({ children }) => <GuideH2>{children}</GuideH2>,
    h2: ({ children }) => <GuideH2>{children}</GuideH2>,
    h3: ({ children }) => <GuideH3>{children}</GuideH3>,
    h4: ({ children }) => <GuideH3>{children}</GuideH3>,
    hr: () => <div className="break-before-page" aria-hidden />,
    aside: ({ node, children }) => {
      const kind = String(node?.properties?.dataKind ?? "")
      const title = node?.properties?.dataTitle ? String(node.properties.dataTitle) : undefined
      if (!esTipoDeCaja(kind)) return <aside>{children}</aside>
      return (
        <GuideCallout kind={kind} title={title}>
          {children}
        </GuideCallout>
      )
    },
    figure: ({ node }) => {
      const id = String(node?.properties?.dataFigura ?? "")
      const figura = figures[id]
      if (figura) return <>{figura}</>
      return (
        <div className="my-2 rounded-xl border border-dashed border-warning px-5 py-4 text-[12px] text-warning">
          Figura pendiente: <code>{id}</code>
        </div>
      )
    },
    table: ({ children }) => (
      <div className="my-2 overflow-hidden rounded-xl border bg-card shadow-xs">
        <table className="w-full border-collapse text-[11.5px] leading-[1.45]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{children}</thead>,
    th: ({ children }) => <th className="border-b px-3.5 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b px-3.5 py-2 align-top text-foreground/85 last:[tr:last-child>&]:border-b-0">{children}</td>,
    input: ({ node }) =>
      node?.properties?.type === "checkbox" ? (
        <span
          className="mr-2 inline-grid size-3.5 translate-y-[2px] place-items-center rounded-[4px] border border-foreground/30"
          aria-hidden
        >
          <CheckIcon className="size-2.5 text-transparent" />
        </span>
      ) : null,
    li: ({ node, className: cls, children }) => (
      <li className={cn(cls, node?.properties?.className && String(node.properties.className).includes("task-list-item") && "list-none -ml-5")}>
        {children}
      </li>
    ),
  }

  return (
    <GuideProse className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkGuia]} components={components}>
        {source}
      </ReactMarkdown>
    </GuideProse>
  )
}

/** Plugin de remark: cajas `> [!tipo] Título` y figuras ```figura. */
function remarkGuia() {
  return (tree: Root) => {
    recorrer(tree.children)
  }
}

const marcaDeCaja = /^\[!([a-záéíóú]+)\]\s*(.*)$/i

function recorrer(nodos: RootContent[]) {
  for (const nodo of nodos) {
    if (nodo.type === "blockquote") {
      const primero = nodo.children[0]
      const texto = primero?.type === "paragraph" ? primero.children[0] : undefined
      if (texto?.type === "text") {
        const marca = marcaDeCaja.exec(texto.value.split("\n")[0])
        if (marca) {
          nodo.data = { hName: "aside", hProperties: { dataKind: marca[1].toLowerCase(), dataTitle: marca[2] || undefined } }
          const resto = texto.value.split("\n").slice(1).join("\n")
          if (resto.trim()) texto.value = resto
          else if (primero.type === "paragraph") {
            primero.children.shift()
            if (primero.children.length === 0) nodo.children.shift()
          }
        }
      }
    }
    if (nodo.type === "code" && nodo.lang === "figura") {
      nodo.data = { hName: "figure", hProperties: { dataFigura: nodo.value.trim() } }
    }
    if ("children" in nodo) recorrer(nodo.children as RootContent[])
  }
}
