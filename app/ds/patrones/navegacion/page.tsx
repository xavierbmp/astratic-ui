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
            ["Módulo", <code key="m">ModuloMenu</code>, "Sidebar, con su icono. Al pulsarlo se despliega y entra en su primera subpágina", <code key="a">/facturacion</code>],
            ["Subpágina", <code key="s">ModuloMenu</code>, "Sidebar, debajo de su módulo. Su nombre es el título de la página", <code key="h">/gastos</code>],
            ["Pestaña", <code key="b">PageTabs</code>, "Cabecera de página, debajo del título y a todo el ancho", <code key="c">/facturacion/cobros</code>],
            ["Vista", <code key="d">BarraBase · LateralVistas</code>, "Barra de la base: el nombre de la vista y el lateral", "No cambia: se guarda por persona"],
            ["Filtro", <code key="e">PanelFiltro</code>, "Barra de la base: botón «Filtro» y buscar", "Recorta la vista; no cambia de página"],
            ["Registro", <code key="f">DetailSheet</code>, "Panel lateral derecho, encima de la página", <code key="g">?registro=id</code>],
          ]}
        />
        <Prose>
          <p>
            Solo está desplegado el módulo que se usa, así el menú cabe sin scroll. Una página tiene como mucho una fila
            de pestañas.
          </p>
        </Prose>
      </DocSection>

      <DocSection
        id="subpaginas"
        title="Subpáginas y pestañas"
        lead="Las subpáginas de un módulo van en la sidebar. Si una subpágina tiene partes con contenido distinto, cada parte es una pestaña con su propia ruta, debajo del título."
      >
        <Example
          title="Facturación con dos pestañas"
          description="El título es el de la subpágina; cambian la descripción, las cifras, la barra y el bloque. Pulsa una pestaña para abrirla en la demo."
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
              mismas pestañas, en el mismo sitio, al pasar de una a otra: la descripción ocupa siempre una línea para que
              no las mueva. Los botones de la página van a la derecha de esa fila.
            </>,
            <>
              <strong>Cómo:</strong> icono y texto, sin cápsulas: 44 px de alto, 16 px de aire a cada lado y 20 px entre
              pestañas. Las demás en gris (<code>muted-foreground</code>); la activa en <code>foreground</code> con un
              subrayado de 2 px que pisa la línea gris de abajo, que cruza todo el ancho. El contador ámbar solo cuenta
              pendientes, como en la sidebar; si no hay pendientes, no se pinta.
            </>,
            <>
              <strong>Cada pestaña es una ruta.</strong> La primera vive en la URL de la subpágina (<code>/facturacion</code>)
              y las demás cuelgan de ella (<code>/facturacion/cobros</code>): se pueden enlazar, recargar y volver atrás.
              Cada pestaña es su propio <code>page.tsx</code> con su vista.
            </>,
            <>
              <strong>El título es el de la subpágina</strong>, nunca el del módulo, y no cambia entre pestañas. La
              descripción y los botones son de cada pestaña.
            </>,
            <>
              <strong>Cada pestaña es una página completa</strong> con su anatomía: cifras, barra y bloque de operación.
              Solo comparten la cabecera.
            </>,
            <>
              <strong>La sidebar despliega el módulo y marca la subpágina.</strong> Plegado, el módulo enseña la suma de sus
              pendientes; desplegado, cada subpágina el suyo. Plegada a iconos, sus subpáginas salen en un menú al pasar el
              ratón. Las migas llevan todos los niveles («Operaciones › Administración › Facturación › Cobros») y el buscador
              ⌘K los lista. Todo sale de los campos <code>tabs</code> en <code>nav.ts</code>.
            </>,
            <>
              <strong>Una sola fila, de 2 a 8 pestañas.</strong> Con una no hay fila. Si salen más de ocho, la subpágina son
              dos subpáginas. Un registro (una campaña, una collab) lleva sus partes en esta misma fila.
            </>,
            <>
              <strong>En móvil</strong> las pestañas bajan debajo del título y se desplazan en horizontal; la activa queda
              siempre a la vista.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="codigo" title="En código" lead="Subpáginas y pestañas se definen una vez en nav.ts y las usan la sidebar, las migas, el buscador ⌘K y la cabecera. El portal lo activa con AppShell subpaginasEnMenu.">
        <CodeBlock
          title="app/(portal)/nav.ts"
          code={`export const administracionTabs: PageTab[] = [
  {
    href: "/facturacion",
    label: "Facturación",
    icon: ReceiptTextIcon,
    tabs: [
      { href: "/facturacion", label: "Facturas", icon: ReceiptTextIcon, count: facturasVencidas },
      { href: "/facturacion/cobros", label: "Cobros", icon: HandCoinsIcon },
    ],
  },
  { href: "/gastos", label: "Gastos", icon: WalletIcon },
]

export const nav: NavGroup[] = [
  {
    label: "Operaciones",
    items: [{ id: "administracion", label: "Administración", href: "/facturacion", icon: LandmarkIcon, tabs: administracionTabs }],
  },
]`}
        />
        <CodeBlock
          title="app/(portal)/facturacion/cobros/cobros-view.tsx"
          code={`<PageBody>
  <CabeceraSubpagina
    subpaginas={administracionTabs}
    description="Cobros recibidos y su conciliación con las facturas."
    actions={<Button variant="outline"><DownloadIcon /> Exportar</Button>}
  />
  <WorkGrid stats={<KpiRow>…</KpiRow>}>
    <BaseDatos … />
  </WorkGrid>
</PageBody>`}
        />
        <SpecTable
          columns={["Ruta", "Archivo", "Se ve"]}
          rows={[
            [<code key="r1">/facturacion</code>, <code key="f1">facturacion/page.tsx</code>, "Facturación, pestaña Facturas"],
            [<code key="r2">/facturacion/cobros</code>, <code key="f2">facturacion/cobros/page.tsx</code>, "Facturación, pestaña Cobros"],
            [<code key="r3">/facturacion?factura=id</code>, <code key="f3">facturacion/page.tsx</code>, "Facturas, con el sheet de esa factura abierto"],
          ]}
        />
      </DocSection>

      <DocSection id="decidir" title="¿Subpágina, pestaña, vista o filtro?">
        <SpecTable
          columns={["Si…", "Entonces", "Ejemplo"]}
          rows={[
            ["Son los mismos datos presentados de otra forma", "Vista, con el conmutador de iconos de la toolbar", "Tabla y kanban de registros"],
            ["Es un recorte de la misma lista", "Filtro de la vista o una vista guardada", "Facturas vencidas"],
            ["Es una parte de una subpágina, con sus propias cifras y columnas", "Pestaña, con PageTabs", "Facturas y Cobros"],
            ["Se usa a diario por separado dentro de un módulo", "Subpágina en la sidebar", "Base y Pipeline del IRM"],
            ["No pertenece a ningún módulo", "Entrada propia en la sidebar", "Tareas"],
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
            pestañas, el periodo pasa a un botón outline con desplegable y los segmentos, a una condición del filtro de
            la base.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Pestañas con icono debajo del título, siempre en el mismo sitio.",
            "Una ruta por pestaña: /facturacion y /facturacion/cobros.",
            "El nombre de la subpágina como título.",
            "Contador ámbar en la pestaña que tiene pendientes.",
          ]}
          donts={[
            "Pestañas para cambiar de vista: eso es el conmutador de iconos de la toolbar.",
            "Pestañas que solo filtran la misma lista, o un segmentado gris para cambiar de subpágina.",
            "Dos filas de pestañas, pestañas de carpeta, o pestañas encima de las cifras o dentro del bloque.",
            "El nombre del módulo como título.",
            "Juntar en un módulo páginas que se usan por separado.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/demo/facturacion", label: "Ver en la demo", text: "Facturación, con Facturas y Cobros." },
            { href: "/ds/componentes/page-header", label: "Cabecera de página", text: "Las props tabs y PageTabs." },
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Lo que lleva cada subpágina." },
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Segmentos, filtros y conmutador de vistas." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
