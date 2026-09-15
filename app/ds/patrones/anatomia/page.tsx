import Link from "next/link"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

function Zone({ n, label, className }: { n: number; label: string; className?: string }) {
  return (
    <div className={`relative flex items-start rounded-md border border-dashed border-foreground/30 bg-muted/40 p-2 text-[11px] text-muted-foreground ${className ?? ""}`}>
      <span className="mr-1.5 grid size-4 flex-none place-items-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">{n}</span>
      <span className="leading-tight">{label}</span>
    </div>
  )
}

export const metadata = { title: "Anatomía de página" }

export default function AnatomiaPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Anatomía de página"
      lead="Todas las páginas de operación comparten el mismo esqueleto. Cambia el contenido, no la estructura."
    >
      <DocSection id="esquema" title="Las siete zonas">
        <Example padded={false}>
          <div className="flex h-[420px] bg-background text-xs">
            <Zone n={1} label="Sidebar 256 px · grupos y páginas con contadores" className="w-40 flex-none rounded-none border-y-0 border-l-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              <Zone n={2} label="Cabecera 48 px · migas · buscador ⌘K · campana · tema" className="h-10 flex-none rounded-none border-x-0 border-t-0" />
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Zone n={3} label="Título 27 px + descripción · a la derecha, pestañas de subpágina y acciones de página (Exportar)" className="h-12" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Zone key={i} n={4} label="Cifra" className="h-10" />
                  ))}
                </div>
                <div className="grid flex-1 grid-cols-[minmax(0,1fr)_120px] grid-rows-[auto_minmax(0,1fr)] gap-2">
                  <Zone n={5} label="Toolbar · buscador · filtros · [espacio] · vistas · acción principal" className="h-9" />
                  <Zone n={6} label="Bloque de operación · cabecera con contador · tabla, lista o kanban · paginación" className="col-start-1 row-start-2" />
                  <Zone n={7} label="Panel de información 320 px · bloques personalizables · misma altura que el bloque" className="col-start-2 row-start-2" />
                </div>
              </div>
            </div>
          </div>
        </Example>
        <SpecTable
          columns={["Zona", "Medidas", "Componente"]}
          rows={[
            ["1 · Sidebar", "256 px, colapsa a 48 px. Fondo sidebar, borde derecho.", <code key="a">AppShell</code>],
            ["2 · Cabecera", "48 px, borde inferior. Padding 16 px.", <code key="b">AppShell</code>],
            ["3 · Cabecera de página", "Padding 26 px arriba, 34 px a los lados. Título 27/32 semibold, tracking-tight (-0.025em). A la derecha, pestañas de subpágina y acciones.", <code key="c">PageHeader · PageTabs</code>],
            ["4 · Cifras", "Grid auto-fit mín. 180 px, gap 12 px. De 3 a 5.", <code key="d">KpiRow · KpiCard</code>],
            ["5 · Toolbar", "Encima del bloque y con su mismo ancho: termina en su borde derecho, nunca encima del panel. Altura 32 px, gap 8 px, envuelve en pantallas estrechas.", <code key="e">WorkGrid toolbar · Toolbar · ToolbarActions</code>],
            ["6 · Bloque de operación", "Ocupa el alto restante (mín. 480 px). Borde, radio 10 px, sombra xs.", <code key="f">Section · DataTable · Kanban</code>],
            ["7 · Panel de información", "320 px. Empieza a la altura del bloque, no de la toolbar, y mide lo mismo que él; scroll interno.", <code key="g">InsightsPanel</code>],
          ]}
        />
      </DocSection>

      <DocSection id="arquetipos" title="Cuatro arquetipos" lead="Todas las páginas de un portal son uno de estos cuatro. Si una no encaja, es que son dos páginas.">
        <SpecTable
          columns={["Arquetipo", "Qué tiene", "Ejemplo en la demo"]}
          rows={[
            ["Dashboard", "Cifras del área y un grid de secciones de resumen (gráfico, ranking, lista de atención) + panel «Hoy». Es la única página con varios bloques.", "/demo"],
            ["Operación", "Cifras + toolbar + un bloque de operación con vistas + panel de información. La página tipo; el 80 % de un portal.", "/demo/registros, /demo/tareas, /demo/equipo"],
            ["Ajustes / formulario", "Navegación vertical de secciones a la izquierda y un bloque con campos y pie de guardado a la derecha. Sin cifras.", "/demo/ajustes"],
            ["Página de registro", "Para registros grandes (una campaña, un evento): cabecera con datos clave, pestañas y dentro de cada pestaña un bloque de operación. Sustituye al sheet cuando el registro tiene su propia operación.", "Pendiente en la demo"],
          ]}
        />
        <Prose>
          <p>
            Un módulo con <strong>subpáginas</strong> no es un quinto arquetipo: cada subpágina es una de estas páginas
            y las pestañas para pasar de una a otra van en la cabecera (zona 3). Ver{" "}
            <Link href="/ds/patrones/navegacion">Navegación y subpáginas</Link> y, en la demo,{" "}
            <Link href="/demo/facturacion">Facturación</Link>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="codigo" title="Esqueleto en código">
        <CodeBlock
          title="app/(portal)/registros/page.tsx"
          code={`<PageBody>
  <PageHeader title="Registros" description="…" actions={<Button variant="outline">Exportar</Button>} />

  <KpiRow>
    <KpiCard icon={BanknoteIcon} label="Pipeline" value="799.342 €" delta={{ value: 8.4, label: "vs mes anterior" }} />
    …
  </KpiRow>

  <WorkGrid
    toolbar={
      <>
        <Toolbar>
          <ToolbarSearch placeholder="Buscar registro…" />
          <FilterMenu label="Fase" options={…} value={…} onChange={…} />
          <ToolbarActions>
            <ViewSwitcher views={["table", "kanban"]} value={view} onChange={setView} />
            <Button><PlusIcon /> Nuevo registro</Button>
          </ToolbarActions>
        </Toolbar>
        <ActiveFilters chips={chips} onClear={clear} />
      </>
    }
    aside={<InsightsPanel storageKey="registros" blocks={…} />}
  >
    <Section>
      <SectionHeader icon={KanbanSquareIcon} title="Registros" count={filtered.length} />
      <SectionBody>{view === "table" ? <DataTable … /> : <Kanban … />}</SectionBody>
      <SectionFooter><TablePagination … /></SectionFooter>
      <BulkBar count={selected.size} onClear={…}>…</BulkBar>
    </Section>
  </WorkGrid>

  <DetailSheet open={!!open} onOpenChange={…}>…</DetailSheet>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="responsive" title="Comportamiento por ancho">
        <Rules
          items={[
            <><strong>≥ 1280 px (xl):</strong> layout completo con panel de información a la derecha. La toolbar mide lo que el bloque; si no le caben los filtros, el buscador se estrecha y después salta de línea, con las vistas y la acción principal a la derecha.</>,
            <><strong>1024–1279 px:</strong> el panel de información pasa debajo del bloque de operación, a todo el ancho. Las columnas de tabla marcadas <code>hideBelow</code> se ocultan.</>,
            <><strong>768–1023 px:</strong> la sidebar sigue visible y se pliega a iconos con el botón de la cabecera o con ⌘B; la toolbar envuelve en dos filas (buscador y filtros arriba; vistas y acción principal abajo, a la derecha).</>,
            <><strong>&lt; 768 px:</strong> sidebar en cajón, buscador a todo el ancho, cifras en dos columnas, la tabla se sustituye por la lista o las tarjetas (<code>usePageView</code>), sheet a pantalla completa.</>,
          ]}
        />
        <Prose>
          <p>
            Los portales se usan sobre todo en escritorio; el móvil debe funcionar, no brillar. Prioriza que la tabla
            oculte columnas antes que hacer scroll horizontal.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Qué va en cada zona y por qué." },
            { href: "/ds/patrones/navegacion", label: "Navegación y subpáginas", text: "Pestañas de subpágina en la cabecera." },
            { href: "/ds/componentes/insights-panel", label: "Panel de información", text: "Los bloques de la derecha." },
            { href: "/demo/registros", label: "Ver en la demo", text: "Una página de operación completa." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
