import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocPage, DocSection, DoDont, Example, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { GuideCallout, GuideChecklist, GuideStats, GuideToc } from "@/components/document/guide"
import { GuideMarkdown } from "@/components/document/guide-markdown"

export const metadata = { title: "Guía" }

const rutaCode = `import { GuideBook, GuideCover, GuidePart, GuideChapter, GuideToc, GuideSources } from "@/components/document/guide"
import { GuideMarkdown } from "@/components/document/guide-markdown"

<GuideBook toolbar={<DocToolbar title="La guía" />} footer="La guía · 2026">
  <GuideCover eyebrow="Guía" meta="Edición 2026" title="El título" lead="La entradilla." />
  <GuideToc parts={partes} pages={paginas} />
  <GuidePart number="1" title="Primera parte" chapters={partes[0].chapters} />
  <GuideChapter id="perfil" number="1.1" title="El perfil" minutes={4}>
    <GuideMarkdown source={markdown} figures={{ anatomia: <FiguraAnatomia /> }} />
  </GuideChapter>
  <GuideSources items={fuentes} />
</GuideBook>`

const markdownCode = `## Un apartado

Texto corrido con **negrita** y [enlaces](https://astraticnetwork.com).

> [!consejo] Título opcional
> Caja de consejo. Tipos: consejo, ojo, ley, dato, ejemplo y resumen.

\`\`\`figura
anatomia
\`\`\`

| Columna | Otra |
|---|---|
| Tablas de GitHub | Con cabecera |

- [ ] Lista de casillas para la lectora

---
(un «---» fuerza un salto de página)`

const exportCode = `node scripts/exportar-pdf.ts http://localhost:3020/documentos/guia guia.pdf --paginas content/paginas.json`

const ejemplo = `Un párrafo de texto corrido con **negrita**.

> [!consejo] Mira tu perfil desde otra cuenta
> Es lo que ve la marca antes de escribirte.

> [!ojo]
> Una etiqueta en inglés como «#ad» no sirve.

| Formato | Cuánto |
|---|---|
| Story | ≈ 35 % de un reel |

- [ ] La marca ha aprobado la versión final.`

function Paper({ children }: { children: React.ReactNode }) {
  return <div className="theme-light bg-background p-8 text-[12.5px] text-foreground">{children}</div>
}

export default function GuiaDocPage() {
  return (
    <DocPage
      eyebrow="Documentos"
      title="Guía"
      lead="Para manuales, guías y documentos largos de contenido corrido: portada, índice por partes con páginas, portadillas, capítulos escritos en Markdown con cajas, tablas, figuras y listas, y anexo de fuentes. Chrome pagina el contenido al exportar."
    >
      <DocSection id="demo" title="Demo">
        <Prose>
          <p>
            La demo es una guía corta de uso de un portal. Se abre en una ruta propia y se exporta con el script de abajo, que
            es el que pone la numeración y las páginas del índice.
          </p>
        </Prose>
        <Button asChild variant="outline">
          <Link href="/documentos/guia" target="_blank">
            Abrir la guía de ejemplo
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </DocSection>

      <DocSection id="como-fluye" title="Cómo fluye">
        <Rules
          items={[
            <><strong>No hay hojas.</strong> A diferencia de las propuestas, el contenido va corrido en <code>GuideBook</code> y es Chrome quien decide dónde acaba cada página al exportar. Nada se recorta: lo que no cabe pasa a la siguiente.</>,
            <><strong>Páginas con nombre.</strong> La portada y las portadillas (<code>GuideCover</code>, <code>GuidePart</code>) van a sangre (página <code>guia-plena</code>, sin márgenes); el resto lleva los márgenes de la página <code>guia</code> (20 mm arriba, 18 a los lados, 24 abajo). Está en el bloque «Guía» de <code>globals.css</code>.</>,
            <><strong>Saltos.</strong> Cada parte y cada capítulo empiezan en página nueva. Los títulos no se quedan solos al final de una página, y las cajas, figuras, tablas y filas de listas no se parten.</>,
            <><strong>Pie y numeración.</strong> El script de exportación pinta en cada página el texto de <code>footer</code> de <code>GuideBook</code> a la izquierda y el número a la derecha, en la tipografía del sistema (Chrome no deja usar la de la página en el pie). En pantalla no se ve.</>,
            <><strong>Índice numerado en dos pasadas.</strong> Cada <code>GuideChapter</code> lleva un marcador invisible <code>⟦cap:id⟧</code>. El script exporta una vez, busca los marcadores en el texto del PDF, escribe <code>{`{ id: página }`}</code> en un JSON y vuelve a exportar con el índice ya numerado.</>,
          ]}
        />
      </DocSection>

      <DocSection id="piezas" title="Piezas">
        <SpecTable
          columns={["Pieza", "Qué es"]}
          rows={[
            [<code key="a">GuideBook</code>, "El lienzo: tema claro, columna A4 en pantalla, contenido corrido al imprimir. Recibe toolbar y footer."],
            [<code key="b">GuideCover</code>, "Portada a sangre: logo, etiqueta y dato, título, entradilla, figura opcional y pie."],
            [<code key="c">GuideToc</code>, "Índice por partes con la página de cada capítulo (pages) y enlace a su ancla."],
            [<code key="d">GuidePart</code>, "Portadilla negra de una parte: número grande, título, entradilla y sus capítulos."],
            [<code key="e">GuideChapter</code>, "Capítulo: ficha con el número, minutos de lectura, título y entradilla. Empieza en página nueva."],
            [<code key="f">GuideMarkdown</code>, "Pinta el Markdown de un capítulo con las convenciones de abajo; las figuras se pasan por id."],
            [<code key="g">GuideCallout</code>, "Caja: consejo, ojo, ley, dato, ejemplo o resumen («En un minuto»)."],
            [<code key="h">GuideChecklist · GuideStats · GuideFigure</code>, "Lista de casillas, cifras destacadas con su fuente y figura con marco y pie."],
            [<code key="i">GuideSources</code>, "Anexo de fuentes numerado: título, quién lo publica, enlace y nota."],
          ]}
        />
        <Example title="Cajas, tabla y lista de casillas desde Markdown" code={ejemplo} lang="md" padded={false}>
          <Paper>
            <GuideMarkdown source={ejemplo} />
          </Paper>
        </Example>
        <Example title="Cifras, lista e índice" padded={false}>
          <Paper>
            <div className="flex flex-col gap-4">
              <GuideStats
                items={[
                  { value: "285.000", label: "Creadores con actividad en España" },
                  { value: "12.000", label: "Con contenido patrocinado en Instagram" },
                  { value: "+90 %", label: "Crecimiento del patrocinado en TikTok" },
                ]}
                source="Cifras de ejemplo, con el formato en que se citan."
              />
              <GuideChecklist title="Antes de publicar" items={["La marca ha aprobado esta versión.", "Se ve que es publicidad."]} />
              <GuideToc
                parts={[{ number: "2", title: "Tu perfil", chapters: [{ id: "a", number: "2.1", title: "Anatomía de un perfil que vende" }, { id: "b", number: "2.2", title: "La bio" }] }]}
                pages={{ a: 14, b: 16 }}
              />
              <GuideCallout kind="resumen">Un capítulo acaba siempre con su resumen en una caja negra.</GuideCallout>
            </div>
          </Paper>
        </Example>
      </DocSection>

      <DocSection id="ruta" title="Montar una guía">
        <Prose>
          <p>
            Una guía es una ruta de servidor que devuelve <code>GuideBook</code>. El texto de cada capítulo vive en un archivo
            Markdown (uno por capítulo, con su número, título y entradilla en la cabecera) y se pinta con{" "}
            <code>GuideMarkdown</code>; las figuras se componen con el kit y se pasan por id.
          </p>
        </Prose>
        <CodeBlock lang="tsx" code={rutaCode} />
        <CodeBlock lang="md" code={markdownCode} />
      </DocSection>

      <DocSection id="exportar" title="Exportar a PDF">
        <Prose>
          <p>
            El botón «Exportar PDF» de la barra sirve para mirar, pero el PDF bueno sale del script, que usa el Chrome instalado
            (<code>playwright-core</code>) y necesita <code>pdftotext</code> (<code>brew install poppler</code>) para numerar el
            índice.
          </p>
        </Prose>
        <CodeBlock lang="bash" code={exportCode} />
        <DoDont
          dos={[
            "Revisar el PDF página a página: dónde cae cada salto, que ninguna figura quede sola y que el índice coincida.",
            "Figuras de menos de media página; si una no cabe, se parte en dos.",
            "Cada capítulo con su caja de resumen al final.",
          ]}
          donts={[
            "Maquetar por hojas ni forzar saltos para que algo quede bonito en pantalla: la pantalla no es el PDF.",
            "Cifras sin fuente en una caja de dato.",
            "Encoger la letra para que algo quepa.",
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
