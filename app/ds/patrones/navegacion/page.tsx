import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { FacturacionTabsDemo } from "@/components/docs/examples/page-tabs-demo"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Navegación y subpáginas" }

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
            ["Subpágina", <code key="b">PageTabs</code>, "Cabecera de página, debajo del título y a todo el ancho", <code key="c">/facturacion/cobros</code>],
            ["Vista", <code key="d">BarraBase · LateralVistas</code>, "Barra de la base: el nombre de la vista y el lateral", "No cambia: se guarda por persona"],
            ["Filtro", <code key="e">PanelFiltro</code>, "Barra de la base: botón «Filtro» y buscar", "Recorta la vista; no cambia de página"],
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
            tabs={<FacturacionTabsDemo current="/demo/facturacion" />}
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
              <strong>Dónde:</strong> en la cabecera de página, debajo del título y la descripción, a todo el ancho. Las
              mismas pestañas, en el mismo sitio, en todas las subpáginas del módulo: la descripción ocupa siempre una
              línea para que no las mueva.
            </>,
            <>
              <strong>Cómo:</strong> icono y texto, sin cápsulas: 44 px de alto, 16 px de aire a cada lado y 20 px entre
              pestañas. Las demás en gris (<code>muted-foreground</code>); la activa en <code>foreground</code> con un
              subrayado de 2 px que pisa la línea gris de abajo, que cruza todo el ancho. El contador ámbar solo cuenta
              pendientes, como en la sidebar; si no hay pendientes, no se pinta.
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
  { href: "/facturacion", label: "Facturas", icon: ReceiptTextIcon, count: facturasVencidas },
  { href: "/facturacion/cobros", label: "Cobros", icon: HandCoinsIcon },
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
            ["Es un recorte de la misma lista", "Filtro de la vista o una vista guardada", "Facturas vencidas"],
            ["Es otro contenido del mismo módulo, con sus propias cifras y columnas", "Subpágina, con PageTabs", "Facturas y Cobros"],
            ["Se usa a diario por separado o lo usa otro equipo", "Página propia en la sidebar", "Registros y Tareas"],
            ["Es un registro con operación propia", "Página de registro con pestañas de navegación (TabsList variant=\"line\")", "Una campaña con sus piezas"],
          ]}
        />
        <Prose>
          <p>
            <strong>Navegar o elegir.</strong> Todo lo que cambia de página, o de «página» dentro de una ficha, un
            diálogo o un bloque (las partes de una ficha, Nuevo y Enviados en un diálogo), usa las pestañas de
            navegación: <code>PageTabs</code> o <code>TabsList variant=&quot;line&quot;</code>, con el mismo aspecto (en una
            ficha o un diálogo estrecho, con <code>compact</code>: juntas y con 12 px de aire). Lo
            que elige un valor o recorta lo que se ve (el periodo de un dashboard, Email o Llamadas en un formulario, Todo
            o Notas) es un control segmentado: <code>TabsList</code> por defecto. Un solo segmentado por cabecera: con
            subpáginas, el periodo pasa a un botón outline con desplegable y los segmentos, a una condición del filtro de
            la base.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Pestañas con icono debajo del título, en el mismo sitio en cada subpágina.",
            "Una ruta por subpágina: /facturacion y /facturacion/cobros.",
            "El mismo título en todas las subpáginas del módulo.",
            "Contador ámbar en la pestaña que tiene pendientes.",
          ]}
          donts={[
            "Pestañas para cambiar de vista: eso es el conmutador de iconos de la toolbar.",
            "Pestañas que solo filtran la misma lista, o un segmentado gris para cambiar de subpágina.",
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
