import { KanbanSquareIcon, PlusIcon, Table2Icon, UsersIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { ErrorStateDemo, LoadingDemo } from "@/components/docs/examples/states-demo"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { EmptyState, KanbanSkeleton, KpiSkeleton, TableSkeleton } from "@/components/app/states"

export const metadata = { title: "Estados" }

const emptyCode = `const filtering = query.length > 0 || chips.length > 0

<EmptyState
  icon={KanbanSquareIcon}
  title={filtering ? "Ningún registro coincide" : "Aún no hay registros"}
  description={filtering ? "Prueba con otra búsqueda o quita algún filtro." : "Crea el primero con el botón «Nuevo registro»."}
  action={
    filtering ? (
      <Button variant="outline" size="sm" onClick={clearFilters}>Quitar filtros</Button>
    ) : (
      <Button size="sm" onClick={openCreate}><PlusIcon /> Nuevo registro</Button>
    )
  }
/>`

const loadingCode = `<Section className="min-h-[520px]">
  <SectionHeader icon={Table2Icon} title="Registros" count={data ? data.length : undefined} />
  <SectionBody>
    {isPending && <TableSkeleton rows={8} cols={5} />}
    {isError && <ErrorState description={error.message} onRetry={() => refetch()} />}
    {data && (
      <div aria-busy={isFetching || undefined} className={cn("transition-opacity", isFetching && "pointer-events-none opacity-60")}>
        <DataTable rows={data} columns={columns} getRowId={(r) => r.id} emptyState={emptyState} />
      </div>
    )}
  </SectionBody>
</Section>`

const errorCode = `<ErrorState
  title="No se ha podido cargar"
  description="El servidor no ha respondido. Comprueba la conexión y vuelve a intentarlo."
  onRetry={() => refetch()}
/>

const save = useMutation({
  onError: (e) => toast.error("No se ha podido guardar", { description: e.message }),
})`

const skeletonCode = `{isPending ? <KpiSkeleton count={4} /> : (
  <KpiRow>
    <KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(total)} />
    <KpiCard icon={UsersIcon} label="Responsables" value={owners ?? "–"} />
  </KpiRow>
)}

{isPending && view === "kanban" && <KanbanSkeleton cols={4} />}

<div className="flex flex-col gap-2 p-4">
  <Skeleton className="h-3 w-24" />
  <Skeleton className="h-7 w-20" />
  <Skeleton className="h-3 w-28" />
</div>`

function PropsTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[13px] font-semibold">{children}</h3>
}

export default function StatesPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Estados"
      lead="Todo bloque tiene tres estados además del normal: vacío, cargando y error. Los tres se resuelven dentro del bloque, con la forma del contenido que sustituyen."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Una tabla, un kanban, una fila de cifras o un bloque del panel de información no están terminados hasta
            que se sabe qué muestran cuando no hay datos, mientras llegan y cuando fallan. Los tres estados ocupan el
            mismo sitio que el contenido normal, dentro del <code>SectionBody</code>, sin tocar la cabecera del bloque
            ni el resto de la página.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Vacío por falta de datos:</strong> <code>EmptyState</code> que dice cómo poblarlo y ofrece la
              acción («Nuevo registro»).
            </>,
            <>
              <strong>Vacío por filtros:</strong> «Ningún registro coincide» con «Quitar filtros». Se distingue del
              anterior comprobando si hay búsqueda o chips activos.
            </>,
            <>
              <strong>Cargando:</strong> skeleton con la forma del contenido final (<code>TableSkeleton</code>,{" "}
              <code>KanbanSkeleton</code>, <code>KpiSkeleton</code>). Nunca un spinner.
            </>,
            <>
              <strong>Error:</strong> <code>ErrorState</code> con reintento dentro del bloque. Si la carga la disparó
              el usuario (guardar, filtrar), además un <code>toast.error</code>.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo" lead="Cada estado dentro de un Section, como se ve en una página real.">
        <Example title="Vacío: aún no hay datos" description="Dice cómo poblarlo y ofrece la acción principal en sm. El icono es el del bloque." code={emptyCode}>
          <Section>
            <SectionHeader icon={KanbanSquareIcon} title="Registros" count={0} />
            <SectionBody>
              <EmptyState
                icon={KanbanSquareIcon}
                title="Aún no hay registros"
                description="Crea el primero con el botón «Nuevo registro»."
                action={
                  <Button size="sm">
                    <PlusIcon /> Nuevo registro
                  </Button>
                }
              />
            </SectionBody>
          </Section>
        </Example>

        <Example title="Vacío: ningún resultado con los filtros" description="Misma pieza, otro mensaje y la acción de quitar filtros en outline.">
          <Section>
            <SectionHeader icon={KanbanSquareIcon} title="Registros" count={0} />
            <SectionBody>
              <EmptyState
                icon={KanbanSquareIcon}
                title="Ningún registro coincide"
                description="Prueba con otra búsqueda o quita algún filtro."
                action={
                  <Button variant="outline" size="sm">
                    Quitar filtros
                  </Button>
                }
              />
            </SectionBody>
          </Section>
        </Example>

        <Example title="Cargando y refetch" description="Primera carga con TableSkeleton; al recargar, los datos existentes se atenúan con opacity-60 y no vuelve el skeleton." code={loadingCode}>
          <LoadingDemo />
        </Example>

        <Example title="Error con reintento" description="La cabecera se mantiene; el cuerpo muestra el error y el botón «Reintentar»." code={errorCode}>
          <ErrorStateDemo />
        </Example>

        <Example title="Esqueletos" description="TableSkeleton, KanbanSkeleton y KpiSkeleton reproducen la forma de lo que sustituyen. Skeleton de shadcn para el resto." code={skeletonCode}>
          <div className="flex flex-col gap-4">
            <KpiSkeleton count={4} />
            <Section>
              <SectionHeader icon={Table2Icon} title="Registros" />
              <SectionBody>
                <TableSkeleton rows={4} cols={5} />
              </SectionBody>
            </Section>
            <Section>
              <SectionHeader icon={KanbanSquareIcon} title="Registros" />
              <SectionBody>
                <KanbanSkeleton cols={3} />
              </SectionBody>
            </Section>
            <Section>
              <SectionHeader icon={UsersIcon} title="Por responsable" />
              <SectionBody className="flex flex-col gap-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-6 rounded-md" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </SectionBody>
            </Section>
          </div>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Todo bloque tiene los tres estados. La revisión de una página empieza por comprobar los tres en cada
              bloque, incluidos los del panel de información.
            </>,
            <>
              El vacío dice cómo poblarlo y ofrece la acción: título de una línea, descripción de una frase, botón{" "}
              <code>sm</code>. El icono es el del bloque.
            </>,
            <>
              El vacío por filtros dice «Ningún X coincide», sugiere cambiar la búsqueda y ofrece «Quitar filtros» en
              outline. Nunca «No hay resultados» a secas.
            </>,
            <>
              Cargando = skeleton con la forma del contenido final: mismas columnas, número de filas aproximado y la
              misma altura, para que la página no salte al llegar los datos. Nunca un spinner.
            </>,
            <>
              Refetch (los datos ya existen y se actualizan) = <code>opacity-60</code> y{" "}
              <code>pointer-events-none</code> sobre el contenido existente, con <code>aria-busy</code>. El skeleton no
              vuelve a aparecer.
            </>,
            <>
              Error = <code>ErrorState</code> dentro del bloque con <code>onRetry</code>. Cabecera y contador se
              mantienen. Si fue una acción del usuario, además <code>toast.error</code> con el mensaje del servidor.
            </>,
            <>
              Los KPIs muestran <code>KpiSkeleton</code> mientras cargan y «–» cuando un dato concreto no existe.
              Nunca un 0 en lugar de «sin dato».
            </>,
            <>
              <code>Skeleton</code> de shadcn para lo que no tiene esqueleto propio (bloques del panel, ficha del
              sheet): rectángulos de la altura del texto que sustituyen, sin bordes ni sombras.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "«Ningún registro coincide» + «Quitar filtros».",
            "TableSkeleton con las columnas de la tabla real.",
            "ErrorState con «Reintentar» dentro del bloque.",
            "KpiSkeleton mientras carga y «–» si no hay dato.",
          ]}
          donts={[
            "Spinner centrado en la página.",
            "«No hay resultados» sin acción.",
            "Página entera en blanco mientras carga un bloque.",
            "Un 0 donde no hay dato.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <div className="flex flex-col gap-2">
          <PropsTitle>EmptyState</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["icon", <code key="t">LucideIcon · InboxIcon</code>, "El icono del bloque."],
              ["title", <code key="t">ReactNode</code>, "Una línea: «Aún no hay registros», «Ningún registro coincide»."],
              ["description", <code key="t">ReactNode</code>, "Una frase que dice cómo poblarlo o qué cambiar."],
              ["action", <code key="t">ReactNode</code>, "Button sm: principal para crear, outline para quitar filtros."],
              ["className", <code key="t">string</code>, "Clases extra. Acepta las props de div."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>ErrorState</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["title", <code key="t">ReactNode · &quot;No se ha podido cargar&quot;</code>, "Qué no se ha podido hacer."],
              ["description", <code key="t">ReactNode</code>, "El mensaje del servidor o qué comprobar."],
              ["onRetry", <code key="t">() =&gt; void</code>, "Muestra el botón «Reintentar» y lo ejecuta."],
              ["className", <code key="t">string</code>, "Clases extra. Acepta las props de div; ya lleva role=\"alert\"."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>TableSkeleton · KanbanSkeleton · KpiSkeleton</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["rows", <code key="t">number · 6</code>, "TableSkeleton: filas, aproximadas a las de la página."],
              ["cols", <code key="t">number · 5</code>, "TableSkeleton: columnas visibles de la tabla."],
              ["cols", <code key="t">number · 4</code>, "KanbanSkeleton: columnas del tablero."],
              ["count", <code key="t">number · 4</code>, "KpiSkeleton: tarjetas de la fila de cifras."],
            ]}
          />
        </div>
        <Prose>
          <p>
            <code>Skeleton</code> es el de shadcn:{" "}
            <a href="https://ui.shadcn.com/docs/components/skeleton" target="_blank" rel="noreferrer">
              ui.shadcn.com/docs/components/skeleton
            </a>
            . Solo acepta <code>className</code> para darle tamaño y forma.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/states.json" />
        <Prose>
          <p>
            Añade <code>button</code> y <code>skeleton</code> de shadcn. Los ejemplos se apoyan en <code>section</code>{" "}
            para el contenedor.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/section", label: "Sección", text: "El bloque donde viven los tres estados." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "emptyState y el skeleton de tabla." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "KpiSkeleton y el «–» cuando falta un dato." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "El toast de error cuando la acción fue del usuario." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
