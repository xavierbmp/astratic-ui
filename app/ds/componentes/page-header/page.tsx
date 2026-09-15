import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/app/page-header"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Cabecera de página" }

export default function PageHeaderPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Cabecera de página"
      lead="Título, una línea de descripción y las acciones de toda la página a la derecha. Junto con PageBody, el contenedor con el padding del sistema, es lo primero que hay dentro del shell."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En todas las páginas, siempre como primer hijo de <code>PageBody</code>. El título dice qué gestiona la
            página (un sustantivo: «Registros», «Campañas», «Ajustes»); la descripción, en una línea, qué hay dentro o
            cuándo se actualizó. A la derecha van las acciones que afectan a toda la página, no a un registro.
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
              En pantallas estrechas las acciones envuelven debajo del título (<code>flex-wrap</code>); no se ocultan.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Título, descripción y acciones"
          description="Tabs de sub-navegación y una acción secundaria outline. La acción principal no está aquí: va en la toolbar."
          code={`<PageBody>
  <PageHeader
    title="Registros"
    description="Base de datos de registros y su fase, con vistas de tabla, lista y kanban."
    actions={
      <>
        <Tabs defaultValue="todos">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="mios">Míos</TabsTrigger>
            <TabsTrigger value="archivados">Archivados</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline">
          <DownloadIcon /> Exportar
        </Button>
      </>
    }
  />
  …
</PageBody>`}
        >
          <PageHeader
            title="Registros"
            description="Base de datos de registros y su fase, con vistas de tabla, lista y kanban."
            actions={
              <>
                <Tabs defaultValue="todos">
                  <TabsList>
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="mios">Míos</TabsTrigger>
                    <TabsTrigger value="archivados">Archivados</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline">
                  <DownloadIcon /> Exportar
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
              <strong>En <code>actions</code> va</strong> la sub-navegación de la página (tabs: periodo, subconjunto, vista
              de un informe) y las acciones secundarias que afectan a toda la página: «Exportar», «Importar», «Editar
              fases», «Configurar». Siempre <code>outline</code>, tamaño <code>default</code>.
            </>,
            <>
              <strong>No va</strong> la acción principal («Nuevo registro»): es el último elemento de la toolbar. Tampoco
              van filtros, el buscador ni el conmutador de vistas: todo eso es de la toolbar.
            </>,
            <>
              Un máximo razonable son unas tabs y dos botones. Si hacen falta más acciones, las secundarias se agrupan en
              un menú «…» outline.
            </>,
            <>
              La descripción no repite el título ni explica cómo usar la página. Cuenta qué hay («24 registros en 5
              fases») o cuándo se actualizó («actualizado hace 2 min»).
            </>,
          ]}
        />
        <DoDont
          dos={[
            "«Registros» + «Base de datos de registros y su fase».",
            "Tabs Mes · Trimestre · Año a la derecha del título de un dashboard.",
            "Botón outline «Exportar» con icono.",
          ]}
          donts={[
            "El botón negro «Nuevo registro» en la cabecera.",
            "Un FilterMenu o un buscador junto al título.",
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
            [<code key="actions">actions</code>, <code key="actions-t">ReactNode</code>, "Tabs y botones outline alineados a la derecha, gap 10 px, sin salto de línea interno. Opcional."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases extra para el contenedor."],
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
            [<code key="b-children">children</code>, <code key="b-children-t">ReactNode</code>, "PageHeader, KpiRow, Toolbar, ActiveFilters, WorkGrid y DetailSheet, en ese orden."],
          ]}
        />
        <CodeBlock
          title="Esqueleto"
          code={`<PageBody>
  <PageHeader title="Registros" description="…" actions={…} />
  <KpiRow>…</KpiRow>
  <Toolbar>…</Toolbar>
  <ActiveFilters chips={chips} onClear={clear} />
  <WorkGrid aside={…}>…</WorkGrid>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/page-header.json" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Qué botón va en cada sitio." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "La fila que va justo debajo." },
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "Donde va la acción principal." },
            { href: "/ds/componentes/buttons", label: "Botones", text: "Variantes y tamaños." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
