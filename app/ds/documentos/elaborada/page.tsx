import Link from "next/link"
import { ArrowUpRightIcon, PlugIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocPage, DocSection, DoDont, Example, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DocFeature, DocFeatureGrid, DocIndex, DocItemHeader, DocNote } from "@/components/document/content"
import { DocTimeline } from "@/components/document/commercial"

export const metadata = { title: "Propuesta elaborada" }

const sheetCode = `import { DocSheet, DocBand, DocFigure } from "@/components/document/sheet"
import { DocItemHeader, DocFeatureGrid, DocFeature, DocNote } from "@/components/document/content"

<DocSheet id="pedidos" title="Propuesta Portal Rumbo · Septiembre 2026" section="1. Operaciones">
  <DocItemHeader number="1.2" title="Pedidos" price="3.200 €" days={14} complexity={3}>
    Todos los pedidos en una tabla, desde que entran hasta que se entregan.
  </DocItemHeader>
  <DocBand className="mt-6">
    <DocFigure caption="Mockup ilustrativo con datos de ejemplo.">
      <MockOrders />
    </DocFigure>
  </DocBand>
  <DocFeatureGrid cols={2} className="mt-6">
    <DocFeature number="1.2.1" title="Entrada de pedidos">Alta manual, CSV y email.</DocFeature>
    <DocFeature number="1.2.2" title="Estados y seguimiento">De pendiente a entregado.</DocFeature>
  </DocFeatureGrid>
  <DocNote icon={PlugIcon} title="Integraciones" className="mt-4">lectura desde un buzón de email.</DocNote>
</DocSheet>`

function Paper({ children }: { children: React.ReactNode }) {
  return <div className="theme-light bg-background p-8 text-[13px] text-foreground">{children}</div>
}

export default function PropuestaElaboradaDocPage() {
  return (
    <DocPage
      eyebrow="Documentos"
      title="Propuesta elaborada"
      lead="Para portales y software a medida: portada, índice, bloques y páginas con precio, días y complejidad, paquetes, resumen económico, plazos y aceptación. Es la maqueta de la propuesta Twic con los colores y componentes del design system."
    >
      <div className="-mt-6">
        <Button asChild>
          <Link href="/documentos/propuesta-elaborada">
            Abrir la demo <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>

      <DocSection id="estructura" title="Estructura" lead="El orden es fijo. Las hojas de página se repiten tantas veces como páginas tenga el proyecto.">
        <SpecTable
          columns={["Hoja", "Qué lleva", "Componentes"]}
          rows={[
            ["Portada", "Cliente y logo, título en una línea, entradilla, enlaces a paquetes y contenido, mockup principal entero y bloques con su precio.", <code key="c">DocCover · DocAction · DocFigure frame=&quot;inset&quot; · DocBlockChips</code>],
            ["Introducción", "Qué se propone, tecnología, forma de trabajo y precio, aviso de propuesta modular, índice con páginas y leyenda.", <code key="c">DocHeading · DocFacts · DocCallout · DocIndex · DocPill · DocComplexity</code>],
            ["Setup y bloques", "Precio del bloque con sus páginas a la izquierda y qué resuelve a la derecha, con el kickoff incluido.", <code key="c">DocItemHeader · DocBlockIntro · DocCards</code>],
            ["Página", "Número, nombre, precio, días y complejidad; qué hace; mockup en banda gris; funcionalidades numeradas; integraciones.", <code key="c">DocItemHeader · DocBand · DocFigure · DocFeatureGrid · DocNote</code>],
            ["Add-ons y fase 2", "Opcionales con su precio o «se presupuesta aparte» e ideas para más adelante.", <code key="c">DocItemHeader badge · DocCallout tone=&quot;soft&quot;</code>],
            ["Paquetes", "Dos combinaciones recomendadas (la mayor en negro), oferta de contratación inicial e incluido siempre.", <code key="c">DocPlanCard · DocOffer · DocPanel · DocIconList</code>],
            ["Resumen económico", "Páginas con días y precio, descuento, base, IVA y total; costes fijos mensuales.", <code key="c">DocPriceTable</code>],
            ["Plazos", "Gantt por semanas con el fin de cada paquete marcado.", <code key="c">DocTimeline</code>],
            ["Siguientes pasos", "Pasos numerados, forma de pago y contacto.", <code key="c">DocSteps · DocPanel tone=&quot;dark&quot; · DocStat · DocContact</code>],
            ["Aceptación", "Paquetes y páginas para marcar a mano y firmas de las dos partes.", <code key="c">DocChoices · DocChecklist · DocSignatures</code>],
          ]}
        />
      </DocSection>

      <DocSection id="pagina" title="Hoja de página">
        <Example padded={false} description="Cabecera de página, funcionalidades y nota de integraciones, a tamaño real.">
          <Paper>
            <DocItemHeader number="1.2" title="Pedidos" price="3.200 €" days={14} complexity={3}>
              Todos los pedidos en una tabla, desde que entran hasta que se entregan, con su estado y su historial.
            </DocItemHeader>
            <DocFeatureGrid cols={2} className="mt-5">
              <DocFeature number="1.2.1" title="Entrada de pedidos">
                Alta manual, importación desde CSV y lectura de un buzón de email.
              </DocFeature>
              <DocFeature number="1.2.2" title="Estados y seguimiento">
                De pendiente a entregado, con la fecha y la persona de cada cambio.
              </DocFeature>
            </DocFeatureGrid>
            <DocNote icon={PlugIcon} title="Integraciones" className="mt-4">
              lectura de pedidos desde un buzón de email propio, sin coste mensual aparte.
            </DocNote>
          </Paper>
        </Example>
        <CodeBlock code={sheetCode} lang="tsx" />
      </DocSection>

      <DocSection id="indice-plazos" title="Índice y plazos">
        <Example padded={false}>
          <Paper>
            <DocIndex
              items={[
                { token: "0", title: "Setup", meta: "1.200 € · obligatorio", page: 3 },
                { token: "1", title: "Operaciones", meta: "9.400 €", page: 3 },
                { token: "P", title: "Paquetes e incluido siempre", meta: "desde 13.000 €", page: 10 },
              ]}
            />
            <DocTimeline
              className="mt-6"
              weeks={8}
              ticks={[2, 4, 6, 8]}
              markers={[{ week: 6, label: "Esencial" }]}
              rows={[
                { label: "Setup", from: 0, to: 0.6, days: 3, weeks: "1" },
                { label: "Pedidos", from: 0.6, to: 3.4, days: 14, weeks: "1 a 4" },
                { label: "Incidencias", from: 3.6, to: 6, days: 12, weeks: "4 a 6" },
                { milestone: true, label: "Fin del paquete Esencial", value: "Semana 6", hint: "unos 1,5 meses" },
              ]}
            />
          </Paper>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <><strong>Portada como Twic:</strong> título en una línea, mockup entero a todo el ancho con marco blanco, nunca recortado ni girado.</>,
            <><strong>Precio en pastilla negra, numeración en índigo suave.</strong> El negro es para dinero y decisiones; el índigo, para orientarse.</>,
            <><strong>Cada página del proyecto abre con <code>DocItemHeader</code></strong> y lleva sus funcionalidades numeradas (1.2.1, 1.2.2…). La rejilla cierra sin huecos con <code>span</code>.</>,
            <><strong>Una llamada negra por sección como mucho.</strong> <code>DocCallout</code> oscuro es para lo que no se puede pasar por alto (propuesta modular); el resto, <code>tone=&quot;soft&quot;</code>.</>,
            <><strong>Importes coherentes en todo el documento:</strong> salen de un único array de páginas en la ruta y se suman con código, no a mano.</>,
            <><strong>Plazos en semanas desde el kickoff</strong>, con el fin de cada paquete marcado y la nota de que son orientativos.</>,
          ]}
        />
        <DoDont
          dos={[
            "Mockups compuestos con componentes del kit y datos de ejemplo verosímiles.",
            "Enlaces internos en la portada y el índice (#paquetes, #bloque-1): funcionan en el PDF.",
          ]}
          donts={[
            "Hojas medio vacías por partir un bloque: se reparte el contenido o se añade la hoja de bloque.",
            "Precios distintos entre paquetes, resumen y aceptación.",
          ]}
        />
        <Prose>
          <p>
            La demo completa, con los 14 tipos de hoja, está en <Link href="/documentos/propuesta-elaborada">/documentos/propuesta-elaborada</Link>.
          </p>
        </Prose>
      </DocSection>
    </DocPage>
  )
}
