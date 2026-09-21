import Link from "next/link"
import { ArrowUpRightIcon, ListTodoIcon } from "lucide-react"
import type { StatusTone } from "@/lib/status"
import { Button } from "@/components/ui/button"
import { Section, SectionBody, SectionFooter, SectionHeader } from "@/components/app/section"
import { WorkGrid } from "@/components/app/work-grid"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Sección" }

const tareas: { id: string; title: string; record: string; owner: string; due: string; tone: StatusTone }[] = [
  { id: "t1", title: "Tarea 1", record: "Registro 4", owner: "Usuario 1", due: "Hoy", tone: "warning" },
  { id: "t2", title: "Tarea 2", record: "Registro 9", owner: "Usuario 2", due: "Hoy", tone: "warning" },
  { id: "t3", title: "Tarea 3", record: "Registro 14", owner: "Usuario 3", due: "Mañana", tone: "neutral" },
]

function Box({ label, className = "h-60" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg border border-dashed border-foreground/30 bg-muted/40 text-xs text-muted-foreground ${className}`}>
      {label}
    </div>
  )
}

export default function SectionPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Sección"
      lead="El bloque con borde en el que se trabaja: cabecera con icono, título, contador y acción; cuerpo con scroll propio; pie. WorkGrid coloca uno de estos bloques junto al panel de información."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            <code>Section</code> es el bloque de operación de una página (la tabla, la lista o el kanban) y también cada
            bloque de resumen de un dashboard. <code>InsightsPanel</code> y <code>Kanban</code> lo usan por dentro. Todo
            lo que en un portal tiene borde, cabecera y contenido es una <code>Section</code>.
          </p>
          <p>
            <code>WorkGrid</code> es la rejilla de la página de operación: la toolbar (<code>toolbar</code>) encima del
            bloque y con su mismo ancho; el bloque a la izquierda ocupando todo el ancho disponible y, si se pasa{" "}
            <code>aside</code>, el panel de información de 320 px a la derecha, que empieza a la altura del bloque y
            mide lo mismo que él.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Un bloque de operación por página.</strong> Los dashboards son la excepción: varios bloques de
              resumen en un grid dentro de <code>WorkGrid</code>.
            </>,
            <>
              <strong>La cabecera cuenta lo filtrado</strong>, no el total. <code>count</code> se pinta en una pill gris;{" "}
              <code>meta</code> en gris pequeño al lado para el total en euros o el periodo.
            </>,
            <>
              <strong>La acción de la cabecera es del bloque</strong>, no de la página: «Ver todas», el engranaje de campos
              visibles (<code>ColumnSettings</code>) o el de configurar lo que enseña el bloque (<code>ConfigButton</code>).
              Botones <code>ghost</code> tamaño <code>sm</code>.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Sección completa"
          description="Cabecera con icono, título, contador, meta y acción; cuerpo con una lista divide-y; pie con texto de apoyo."
          code={`<Section>
  <SectionHeader
    icon={ListTodoIcon}
    title="Tareas"
    count={tareas.length}
    meta="hoy"
    action={
      <Button variant="ghost" size="sm" asChild>
        <Link href="/demo/tareas">Ver todas <ArrowUpRightIcon /></Link>
      </Button>
    }
  />
  <SectionBody>
    <ul className="divide-y">
      {tareas.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
          <AvatarInitials name={t.owner} size="sm" />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-[13.5px] font-medium">{t.title}</span>
            <span className="truncate text-xs text-muted-foreground">{t.record} · {t.owner}</span>
          </span>
          <StatusBadge tone={t.tone}>{t.due}</StatusBadge>
        </li>
      ))}
    </ul>
  </SectionBody>
  <SectionFooter>
    <span>Actualizado hace 2 min</span>
    <span>3 de 12</span>
  </SectionFooter>
</Section>`}
        >
          <Section>
            <SectionHeader
              icon={ListTodoIcon}
              title="Tareas"
              count={tareas.length}
              meta="hoy"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/demo/tareas">
                    Ver todas <ArrowUpRightIcon />
                  </Link>
                </Button>
              }
            />
            <SectionBody>
              <ul className="divide-y">
                {tareas.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                    <AvatarInitials name={t.owner} size="sm" />
                    <span className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate text-[13.5px] font-medium">{t.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t.record} · {t.owner}
                      </span>
                    </span>
                    <StatusBadge tone={t.tone}>{t.due}</StatusBadge>
                  </li>
                ))}
              </ul>
            </SectionBody>
            <SectionFooter>
              <span>Actualizado hace 2 min</span>
              <span>3 de 12</span>
            </SectionFooter>
          </Section>
        </Example>

        <Example
          title="WorkGrid con toolbar y panel"
          description="A partir de 1280 px, dos columnas: 1fr y 320 px. La toolbar solo ocupa la columna del bloque y el panel arranca a la altura del bloque. Por debajo, todo va en una columna y el panel pasa debajo del bloque. Estrecha la ventana para verlo."
          code={`<WorkGrid
  toolbar={<Toolbar>…</Toolbar>}
  aside={<InsightsPanel storageKey="registros" blocks={blocks} />}
>
  <Section>…</Section>
</WorkGrid>`}
        >
          <WorkGrid toolbar={<Box label="toolbar · ancho del bloque" className="h-8" />} aside={<Box label="aside · 320 px" className="h-full min-h-60" />}>
            <Box label="children · 1fr" />
          </WorkGrid>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Prose>
          <p>
            <strong>La sección se estira y el cuerpo hace scroll.</strong> <code>Section</code> es{" "}
            <code>flex min-h-0 flex-1 flex-col overflow-hidden</code>: dentro de <code>PageBody</code> (columna flex) ocupa
            el alto que queda, y como recorta lo que sobresale, es <code>SectionBody</code> (<code>min-h-0 flex-1
            overflow-auto</code>) quien hace scroll. La cabecera de la tabla queda pegada arriba y el pie con la
            paginación siempre visible.
          </p>
          <p>
            <strong>El panel no empuja la altura.</strong> <code>WorkGrid</code> es un grid que, a partir de{" "}
            <code>xl</code>, pone la toolbar en una primera fila (<code>auto</code>) solo sobre la columna del bloque, y
            el bloque y el panel en la segunda (<code>minmax(0,1fr)</code>). La celda del <code>aside</code> es{" "}
            <code>relative</code> y el panel va dentro en <code>absolute inset-0</code>. Así el panel empieza donde
            empieza el bloque y mide lo que mide él, aunque tenga más contenido: hace su propio scroll. Por debajo de{" "}
            <code>xl</code> vuelve al flujo normal con <code>min-h-80</code>.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              Para que la cadena funcione, todos los padres hasta el shell deben ser columnas flex con{" "}
              <code>min-h-0</code>. <code>AppShell</code>, <code>PageBody</code> y <code>WorkGrid</code> ya lo son.
            </>,
            <>
              Un <code>Section</code> fuera de esa cadena (un dashboard con varios bloques, un ejemplo en la
              documentación) mide lo que mide su contenido. Dale <code>min-h-*</code> si necesitas altura fija.
            </>,
            <>
              <code>SectionBody</code> no lleva padding: la tabla y las listas lo ponen por fila. Para contenido libre
              (gráfico, campos) añade <code>className="p-4"</code>.
            </>,
            <>
              <code>SectionCount</code> se puede usar suelto en cabeceras de kanban o pestañas: pill gris de 20 px con{" "}
              <code>tabular-nums</code>.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "SectionHeader con icono, título, count y una acción ghost sm.",
            "SectionFooter con TablePagination en las vistas de tabla y lista.",
            "WorkGrid con la toolbar, un Section y un InsightsPanel.",
          ]}
          donts={[
            "Dos Section apilados como bloque de operación.",
            "Poner la acción principal de la página en la cabecera del bloque.",
            "Un aside con ancho distinto de 320 px sin un motivo documentado.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>Section</code>, <code>SectionBody</code>, <code>SectionFooter</code> y <code>SectionCount</code> son
            elementos con clases del sistema (<code>section</code>, <code>div</code>, <code>footer</code>,{" "}
            <code>span</code>) y aceptan cualquier prop de su elemento. <code>SectionHeader</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="icon">icon</code>, <code key="icon-t">LucideIcon</code>, "Icono de 16 px en gris delante del título. Opcional."],
            [<code key="title">title</code>, <code key="title-t">ReactNode</code>, "El h2 del bloque, 14 px semibold. Obligatoria."],
            [<code key="count">count</code>, <code key="count-t">number</code>, "Contador en pill gris (SectionCount). Opcional; se pinta también si es 0."],
            [<code key="meta">meta</code>, <code key="meta-t">ReactNode</code>, "Texto gris pequeño junto al contador: total en euros, periodo. Opcional."],
            [<code key="action">action</code>, <code key="action-t">ReactNode</code>, "Acciones del bloque alineadas a la derecha con gap 6 px. Opcional."],
            [<code key="children">children</code>, <code key="children-t">ReactNode</code>, "Contenido libre entre el título y las acciones (tabs de la vista, por ejemplo). Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>WorkGrid</code>. Acepta además cualquier prop de <code>div</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="toolbar">toolbar</code>, <code key="toolbar-t">ReactNode</code>, "La Toolbar del bloque y, debajo, los chips de ActiveFilters (gap 8 px). Va encima del bloque, con su mismo ancho. Opcional."],
            [<code key="aside">aside</code>, <code key="aside-t">ReactNode</code>, "El panel de la derecha, normalmente un InsightsPanel. Sin él, la rejilla es una sola columna."],
            [<code key="asideWidth">asideWidth</code>, <code key="asideWidth-t">number</code>, "Ancho del panel en píxeles. Por defecto 320."],
            [<code key="children">children</code>, <code key="children-t">ReactNode</code>, "El bloque de operación. Va en una columna flex con min-h-0 min-w-0."],
          ]}
        />
        <CodeBlock
          title="Composición mínima"
          code={`<WorkGrid
  toolbar={<Toolbar>…</Toolbar>}
  aside={<InsightsPanel storageKey="registros" blocks={blocks} />}
>
  <Section>
    <SectionHeader icon={KanbanSquareIcon} title="Registros" count={filtered.length} />
    <SectionBody>
      <DataTable rows={paged} columns={columns} getRowId={(r) => r.id} />
    </SectionBody>
    <SectionFooter>
      <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </SectionFooter>
  </Section>
</WorkGrid>`}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock
          lang="bash"
          code={`npx shadcn@latest add https://ui.astraticnetwork.com/r/section.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/work-grid.json`}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Zonas 5, 6 y 7: toolbar, bloque y panel." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "Lo que suele ir dentro del bloque." },
            { href: "/ds/componentes/insights-panel", label: "Panel de información", text: "Lo que va en el aside." },
            { href: "/ds/componentes/kanban", label: "Kanban", text: "La otra vista del bloque." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
