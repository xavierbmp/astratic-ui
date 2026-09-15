import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { PageTabs } from "@/components/app/page-tabs"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Navegación y subpáginas" }

const facturacionTabs = [
  { href: "/demo/facturacion", label: "Facturas", count: 3 },
  { href: "/demo/facturacion/cobros", label: "Cobros" },
]

export default function NavegacionPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Navegación y subpáginas"
      lead="Cada nivel de navegación tiene su sitio y su control. Así nadie confunde cambiar de página, de subpágina, de vista o de registro."
    >
      <DocSection id="niveles" title="Los niveles">
        <SpecTable
          columns={["Nivel", "Control", "Dónde", "URL"]}
          rows={[
            ["Página", "Sidebar", "Izquierda, en grupos con etiqueta", <code key="a">/facturacion</code>],
            ["Subpágina", <code key="b">PageTabs</code>, "Cabecera de página, a la derecha del título", <code key="c">/facturacion/cobros</code>],
            ["Vista", <code key="d">ViewSwitcher</code>, "Toolbar del bloque, antes de la acción principal", "No cambia: se recuerda por página"],
            ["Filtro", <code key="e">ToolbarSearch · FilterMenu</code>, "Toolbar del bloque", "Recorta la lista; no cambia de página"],
            ["Registro", <code key="f">DetailSheet</code>, "Panel lateral derecho, encima de la página", <code key="g">?registro=id</code>],
          ]}
        />
        <Prose>
          <p>
            La sidebar tiene dos niveles, grupo y página, y ninguno más: las subpáginas no se anidan en la sidebar, van en
            la cabecera de su página.
          </p>
        </Prose>
      </DocSection>

      <DocSection
        id="subpaginas"
        title="Subpáginas"
        lead="Cuando un módulo tiene varias partes con contenido distinto que comparten título y contexto, cada parte es una subpágina con su propia ruta y las pestañas van en la cabecera."
      >
        <Example
          title="Facturación con dos subpáginas"
          description="Mismo título en las dos; cambian la descripción, las cifras, la toolbar y el bloque. Pulsa una pestaña para abrirla en la demo."
          code={`<PageHeader
  title="Facturación"
  description="Facturas emitidas, su vencimiento y su cobro."
  tabs={<PageTabs items={facturacionTabs} />}
  actions={
    <Button variant="outline">
      <DownloadIcon /> Exportar
    </Button>
  }
/>`}
        >
          <PageHeader
            title="Facturación"
            description="Facturas emitidas, su vencimiento y su cobro."
            tabs={<PageTabs items={facturacionTabs} current="/demo/facturacion" />}
            actions={
              <Button variant="outline">
                <DownloadIcon /> Exportar
              </Button>
            }
          />
        </Example>
        <Rules
          items={[
            <>
              <strong>Dónde:</strong> en la cabecera de página, a la derecha del título y antes de las acciones de página
              («Exportar»). Las mismas pestañas, en el mismo sitio, en todas las subpáginas del módulo.
            </>,
            <>
              <strong>Cómo:</strong> un control segmentado de texto, igual que las Tabs del sistema: fondo gris, la
              pestaña activa en blanco con sombra, 32 px de alto y sin iconos. El contador ámbar solo cuenta pendientes,
              como en la sidebar; si no hay pendientes, no se pinta.
            </>,
            <>
              <strong>Cada pestaña es una ruta.</strong> La primera vive en la URL del módulo (<code>/facturacion</code>)
              y las demás cuelgan de ella (<code>/facturacion/cobros</code>): se pueden enlazar, recargar y volver atrás.
              Cada subpágina es su propio <code>page.tsx</code> con su vista.
            </>,
            <>
              <strong>El título es el del módulo</strong> y no cambia entre subpáginas. La descripción y las acciones de
              página son de cada subpágina.
            </>,
            <>
              <strong>Cada subpágina es una página completa</strong> con su anatomía: cifras, toolbar, bloque de operación
              y panel. Solo comparten la cabecera.
            </>,
            <>
              <strong>La sidebar marca el módulo</strong> en todas sus subpáginas. Las migas añaden la subpágina cuando no
              es la primera («Administración › Facturación › Cobros») y el buscador ⌘K las lista. Todo sale del campo{" "}
              <code>tabs</code> del ítem en <code>nav.ts</code>.
            </>,
            <>
              <strong>De 2 a 6 subpáginas.</strong> Con una no hay pestañas. Si salen más de seis, el módulo son dos
              páginas de la sidebar.
            </>,
            <>
              <strong>En móvil</strong> las pestañas bajan debajo del título y se desplazan en horizontal; la activa queda
              siempre a la vista.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="codigo" title="En código" lead="Las pestañas se definen una vez en nav.ts y las usan la sidebar, las migas, el buscador ⌘K y la cabecera.">
        <CodeBlock
          title="app/(portal)/nav.ts"
          code={`export const facturacionTabs: PageTab[] = [
  { href: "/facturacion", label: "Facturas", count: facturasVencidas },
  { href: "/facturacion/cobros", label: "Cobros" },
]

export const nav: NavGroup[] = [
  {
    label: "Administración",
    items: [
      {
        id: "facturacion",
        label: "Facturación",
        href: "/facturacion",
        icon: ReceiptTextIcon,
        tabs: facturacionTabs,
      },
      …
    ],
  },
]`}
        />
        <CodeBlock
          title="app/(portal)/facturacion/cobros/cobros-view.tsx"
          code={`<PageBody>
  <PageHeader
    title="Facturación"
    description="Cobros recibidos y su conciliación con las facturas."
    tabs={<PageTabs items={facturacionTabs} />}
    actions={<Button variant="outline"><DownloadIcon /> Exportar</Button>}
  />
  <KpiRow>…</KpiRow>
  <WorkGrid toolbar={<Toolbar>…</Toolbar>} aside={<InsightsPanel storageKey="cobros" blocks={…} />}>
    <Section>…</Section>
  </WorkGrid>
</PageBody>`}
        />
        <SpecTable
          columns={["Ruta", "Archivo", "Pestaña activa"]}
          rows={[
            [<code key="r1">/facturacion</code>, <code key="f1">facturacion/page.tsx</code>, "Facturas"],
            [<code key="r2">/facturacion/cobros</code>, <code key="f2">facturacion/cobros/page.tsx</code>, "Cobros"],
            [<code key="r3">/facturacion?factura=id</code>, <code key="f3">facturacion/page.tsx</code>, "Facturas, con el sheet de esa factura abierto"],
          ]}
        />
      </DocSection>

      <DocSection id="decidir" title="¿Subpágina, vista, filtro o página?">
        <SpecTable
          columns={["Si…", "Entonces", "Ejemplo"]}
          rows={[
            ["Son los mismos datos presentados de otra forma", "Vista, con el conmutador de iconos de la toolbar", "Tabla y kanban de registros"],
            ["Es un recorte de la misma lista", "Filtro (FilterMenu) o segmento", "Facturas vencidas"],
            ["Es otro contenido del mismo módulo, con sus propias cifras y columnas", "Subpágina, con PageTabs", "Facturas y Cobros"],
            ["Se usa a diario por separado o lo usa otro equipo", "Página propia en la sidebar", "Registros y Tareas"],
            ["Es un registro con operación propia", "Página de registro con pestañas de línea", "Una campaña con sus piezas"],
          ]}
        />
        <Prose>
          <p>
            <strong>Un solo segmentado por cabecera.</strong> La cabecera admite un control segmentado de texto: las
            pestañas de subpágina o, si no hay subpáginas, el periodo de un dashboard o los segmentos de una lista. Si una
            página con subpáginas necesita también periodo o segmentos, el periodo pasa a un botón outline con
            desplegable y los segmentos, a un <code>FilterMenu</code> de selección única en la toolbar.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Pestañas de texto a la derecha del título, antes de «Exportar».",
            "Una ruta por subpágina: /facturacion y /facturacion/cobros.",
            "El mismo título en todas las subpáginas del módulo.",
            "Contador ámbar en la pestaña que tiene pendientes.",
          ]}
          donts={[
            "Pestañas para cambiar de vista: eso es el conmutador de iconos de la toolbar.",
            "Pestañas que solo filtran la misma lista.",
            "Subpáginas dentro de subpáginas, o pestañas encima de las cifras o dentro del bloque.",
            "Juntar en un módulo páginas que se usan por separado.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/demo/facturacion", label: "Ver en la demo", text: "Facturación, con Facturas y Cobros como subpáginas." },
            { href: "/ds/componentes/page-header", label: "Cabecera de página", text: "Las props tabs y PageTabs." },
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Lo que lleva cada subpágina." },
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Segmentos, filtros y conmutador de vistas." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
