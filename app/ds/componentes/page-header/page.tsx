import Link from "next/link"
import { CalendarIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/app/page-header"
import { PageTabs } from "@/components/app/page-tabs"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Cabecera de página" }

const facturacionTabs = [
  { href: "/demo/facturacion", label: "Facturas", count: 3 },
  { href: "/demo/facturacion/cobros", label: "Cobros" },
]

export default function PageHeaderPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Cabecera de página"
      lead="Título, una línea de descripción y, a la derecha, las pestañas de subpágina y las acciones de toda la página. Junto con PageBody, el contenedor con el padding del sistema, es lo primero que hay dentro del shell."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En todas las páginas, siempre como primer hijo de <code>PageBody</code>. El título dice qué gestiona la
            página (un sustantivo: «Registros», «Campañas», «Ajustes»); la descripción, en una línea, qué hay dentro o
            cuándo se actualizó. A la derecha van, por este orden, las pestañas de subpágina si el módulo las tiene y
            las acciones que afectan a toda la página, no a un registro.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <code>PageBody</code> es el contenedor de la página: padding 26 px arriba y 34 px a los lados, columna
              flex con <code>gap-4</code> y <code>min-h-0 flex-1</code> para que <code>WorkGrid</code> pueda ocupar el
              alto que sobra.
            </>,
            <>
              El título es un <code>h1</code> de 27 px semibold con tracking ajustado. Es el único h1 de la página; los
              bloques usan h2 en su cabecera.
            </>,
            <>
              Sin icono en el título y sin badge de estado: eso es del sheet de detalle y de la página de registro.
            </>,
            <>
              En pantallas estrechas las pestañas y las acciones bajan debajo del título (<code>flex-wrap</code>); no se
              ocultan. Si las pestañas no caben, se desplazan en horizontal.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplos">
        <Example
          title="Módulo con subpáginas"
          description="Las pestañas de subpágina van en tabs, antes de las acciones. Cada pestaña es una ruta y el contador ámbar marca pendientes. Pulsa una para verla en la demo."
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

        <Example
          title="Página sin subpáginas, con un segmentado de toda la página"
          description="El periodo de un dashboard o los segmentos de una lista van como primer elemento de actions. La acción principal no está aquí: va en la toolbar."
          code={`<PageHeader
  title="Buenos días, Usuario 1"
  description="Todo el portal en una pantalla, actualizado con cada cambio · hace 2 min"
  actions={
    <>
      <Tabs defaultValue="mes">
        <TabsList>
          <TabsTrigger value="mes">Mes</TabsTrigger>
          <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
          <TabsTrigger value="ano">Año</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button variant="outline">
        <CalendarIcon /> Septiembre 2026
      </Button>
    </>
  }
/>`}
        >
          <PageHeader
            title="Buenos días, Usuario 1"
            description="Todo el portal en una pantalla, actualizado con cada cambio · hace 2 min"
            actions={
              <>
                <Tabs defaultValue="mes">
                  <TabsList>
                    <TabsTrigger value="mes">Mes</TabsTrigger>
                    <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
                    <TabsTrigger value="ano">Año</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline">
                  <CalendarIcon /> Septiembre 2026
                </Button>
              </>
            }
          />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>En <code>tabs</code> van las pestañas de subpágina</strong> (<code>PageTabs</code>), una ruta por
              pestaña. Cuándo un módulo tiene subpáginas y cómo se definen está en{" "}
              <Link href="/ds/patrones/navegacion">Navegación y subpáginas</Link>.
            </>,
            <>
              <strong>En <code>actions</code> van</strong> las acciones secundarias que afectan a toda la página:
              «Exportar», «Importar», «Editar fases», «Configurar». Siempre <code>outline</code>, tamaño{" "}
              <code>default</code>. Si la página no tiene subpáginas, el primer elemento puede ser un segmentado de toda
              la página: el periodo de un dashboard o los segmentos de una lista.
            </>,
            <>
              <strong>Un solo segmentado por cabecera.</strong> Si hay pestañas de subpágina, el periodo pasa a un botón
              outline con desplegable y los segmentos a un <code>FilterMenu</code> de selección única en la toolbar.
            </>,
            <>
              <strong>No va</strong> la acción principal («Nuevo registro»): es el último elemento de la toolbar. Tampoco
              van filtros, el buscador ni el conmutador de vistas: todo eso es de la toolbar, encima del bloque.
            </>,
            <>
              Un máximo razonable son unas pestañas y dos botones. Si hacen falta más acciones, las secundarias se
              agrupan en un menú «…» outline.
            </>,
            <>
              La descripción no repite el título ni explica cómo usar la página. Cuenta qué hay («24 registros en 5
              fases») o cuándo se actualizó («actualizado hace 2 min»). En un módulo con subpáginas, el título es el del
              módulo y la descripción, la de la subpágina.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "«Registros» + «Base de datos de registros y su fase».",
            "Pestañas Facturas · Cobros a la derecha del título de Facturación, antes de «Exportar».",
            "Tabs Mes · Trimestre · Año a la derecha del título de un dashboard.",
            "Botón outline «Exportar» con icono.",
          ]}
          donts={[
            "El botón negro «Nuevo registro» en la cabecera.",
            "Un FilterMenu o un buscador junto al título.",
            "Dos controles segmentados en la misma cabecera.",
            "Título con icono, emoji o badge de estado.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>PageHeader</code>. Acepta además cualquier prop de <code>div</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="title">title</code>, <code key="title-t">ReactNode</code>, "El h1 de la página. Obligatoria."],
            [<code key="description">description</code>, <code key="description-t">ReactNode</code>, "Una línea en text-sm muted debajo del título. Opcional."],
            [<code key="tabs">tabs</code>, <code key="tabs-t">ReactNode</code>, "Las pestañas de subpágina (PageTabs). Se pintan a la derecha, antes de las acciones. Opcional."],
            [<code key="actions">actions</code>, <code key="actions-t">ReactNode</code>, "Botones outline (y, sin subpáginas, un segmentado) alineados a la derecha, gap 10 px, sin salto de línea interno. Opcional."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases extra para el contenedor."],
          ]}
        />
        <Prose>
          <p>
            <code>PageTabs</code>. Un <code>nav</code> con un enlace por subpágina; acepta cualquier prop de{" "}
            <code>nav</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="t-items">items</code>, <code key="t-items-t">PageTab[]</code>, "Las subpáginas: { href, label, count? }. La primera vive en la ruta del módulo. count es el número de pendientes (pill ámbar); con 0 no se pinta."],
            [<code key="t-current">current</code>, <code key="t-current-t">string</code>, "Ruta que se da por activa. Por defecto, la de la página (usePathname); solo hace falta en documentación y pruebas."],
            [<code key="t-className">className</code>, <code key="t-className-t">string</code>, "Clases extra del contenedor: segmentado de 32 px con las medidas de TabsList."],
          ]}
        />
        <Prose>
          <p>
            <code>PageBody</code>. Un <code>div</code> con las clases del sistema; acepta cualquier prop de{" "}
            <code>div</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="b-className">className</code>, <code key="b-className-t">string</code>, "Se combina con «flex min-h-0 flex-1 flex-col gap-4 px-[34px] pt-[26px] pb-10». Úsalo para cambiar el gap, nunca el padding."],
            [<code key="b-children">children</code>, <code key="b-children-t">ReactNode</code>, "PageHeader, KpiRow, WorkGrid (con la toolbar y el panel) y DetailSheet, en ese orden."],
          ]}
        />
        <CodeBlock
          title="Esqueleto"
          code={`<PageBody>
  <PageHeader title="Facturación" description="…" tabs={<PageTabs items={facturacionTabs} />} actions={…} />
  <KpiRow>…</KpiRow>
  <WorkGrid toolbar={<Toolbar>…</Toolbar>} aside={…}>
    <Section>…</Section>
  </WorkGrid>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock
          lang="bash"
          code={`npx shadcn@latest add https://ui.astraticnetwork.com/r/page-header.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/page-tabs.json`}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/navegacion", label: "Navegación y subpáginas", text: "Cuándo hay pestañas y cómo se definen." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Qué botón va en cada sitio." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "La fila que va justo debajo." },
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "Donde va la acción principal." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
