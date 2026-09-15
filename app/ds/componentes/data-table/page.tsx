import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DataTableDemo } from "@/components/docs/examples/data-table-demo"
import { RecordList, RecordListItem } from "@/components/app/record-list"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { StatusBadge } from "@/components/app/status-badge"
import { fmt } from "@/lib/format"

export const metadata = { title: "Tabla de datos" }

export default function DataTablePage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Tabla de datos"
      lead="La vista por defecto del bloque de operación. Columnas declarativas y tipadas, orden por columna, selección múltiple, fila clicable que abre el detalle y paginación en el pie."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cuando hay que comparar muchos campos, ordenar o seleccionar en bloque. Es la vista de entrada de toda página
            de registros; la lista y el kanban son alternativas para el mismo conjunto filtrado. <code>DataTable</code>{" "}
            no carga datos ni pagina por sí sola: recibe las filas de la página actual y devuelve los eventos.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Genérica sobre la fila.</strong> <code>{"DataTable<T>"}</code> con <code>{"Column<T>[]"}</code>: cada
              columna declara <code>id</code>, <code>header</code>, <code>cell(row)</code> y, si se ordena,{" "}
              <code>sortValue(row)</code>. Nada de índices ni claves mágicas.
            </>,
            <>
              <strong>La página decide; la tabla pinta.</strong> Filtrado, paginación y carga viven en la página. La
              tabla ordena las filas que recibe (o delega con <code>sort</code> y <code>onSortChange</code>) y gestiona la
              selección como un <code>Set</code> de ids.
            </>,
            <>
              <strong>Texto a 13,5 px, filas de 40 px</strong> (<code>py-2.5</code>), cabecera de 36 px pegajosa con fondo
              muted. Con <code>dense</code>, filas de 32 px para tablas secundarias.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Ocho registros en dos páginas"
          description="Marca filas (el Set se muestra debajo), ordena por Registro o por Valor, pulsa una fila para abrir el detalle (aquí, un toast) y pasa de página en el pie."
          code={`const columns: Column<Row>[] = [
  {
    id: "name",
    header: "Registro",
    minWidth: 220,
    sortValue: (r) => r.name,
    cell: (r) => <CellPrimary leading={<AvatarInitials name={r.name} />} title={r.name} subtitle={r.code} />,
  },
  { id: "owner", header: "Responsable", hideBelow: "md", cell: (r) => r.owner },
  { id: "status", header: "Estado", cell: (r) => <StatusBadge tone={r.status.tone} dot>{r.status.label}</StatusBadge> },
  { id: "value", header: "Valor", align: "right", sortValue: (r) => r.value, cell: (r) => fmt.eur(r.value) },
]

<Section>
  <SectionHeader title="Registros" count={rows.length} />
  <SectionBody>
    <DataTable
      rows={paged}
      columns={columns}
      getRowId={(r) => r.id}
      selectable
      selected={selected}
      onSelectedChange={setSelected}
      sort={sort}
      onSortChange={setSort}
      onRowClick={(r) => setOpenId(r.id)}
      emptyState={<EmptyState title="Aún no hay registros" />}
    />
  </SectionBody>
  <SectionFooter>
    <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} total={rows.length} pageSize={5} />
  </SectionFooter>
</Section>`}
        >
          <DataTableDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>La primera columna es siempre <code>CellPrimary</code></strong> con <code>minWidth: 220</code>:
              avatar o monograma, nombre en semibold y código o categoría debajo. Es lo que identifica la fila y lo que
              nunca se oculta.
            </>,
            <>
              <strong>Números a la derecha</strong> con <code>align: "right"</code>, que añade <code>tabular-nums</code>{" "}
              a la celda y alinea la cabecera. Euros con <code>fmt.eur</code>, fechas con <code>fmt.date</code>.
            </>,
            <>
              <strong>Columnas secundarias con <code>hideBelow</code></strong> (<code>md</code>, <code>lg</code>,{" "}
              <code>xl</code>, <code>2xl</code>): se ocultan antes de que la tabla haga scroll horizontal. Las
              imprescindibles (nombre, estado, valor) no llevan <code>hideBelow</code>.
            </>,
            <>
              <strong>Cabecera pegajosa.</strong> El <code>thead</code> es <code>sticky top-0</code> dentro del contenedor
              con scroll, que es <code>SectionBody</code>. No pongas la tabla dentro de otro contenedor con overflow.
            </>,
            <>
              <strong>Orden en tres pasos</strong> al pulsar la cabecera: ascendente, descendente, sin orden. Solo las
              columnas con <code>sortValue</code> muestran la flecha. Sin <code>sort</code>/<code>onSortChange</code> la
              tabla ordena en local; con ellos, ordena la página (y el servidor si pagina allí).
            </>,
            <>
              <strong>Selección por checkbox, detalle por clic.</strong> El checkbox de la cabecera marca lo visible en la
              página; la celda del checkbox detiene la propagación para no abrir el detalle. La fila entera es clicable
              y muestra un chevron al pasar el ratón.
            </>,
            <>
              <strong>Vacío con <code>EmptyState</code></strong> en <code>emptyState</code>: dice cómo poblar la tabla o
              cómo quitar los filtros, según el caso. Ocupa todas las columnas.
            </>,
            <>
              <strong>Cargando en dos tiempos:</strong> antes de tener datos, <code>TableSkeleton</code> en lugar de la
              tabla; al refrescar con datos ya en pantalla, <code>loading</code>, que atenúa la tabla al 60 % y bloquea
              los clics sin que nada salte.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "CellPrimary con AvatarInitials, nombre y código en la primera columna.",
            "align: \"right\" y fmt.eur en la columna de valor.",
            "hideBelow: \"xl\" en categoría y hideBelow: \"lg\" en actualizado.",
            "Fila seleccionada en bg-brand-soft y BulkBar abajo.",
          ]}
          donts={[
            "Columna de acciones con botones en cada fila: las acciones van en el sheet y en la BulkBar.",
            "Ordenar en cliente lo que está paginado en servidor.",
            "Scroll horizontal antes de ocultar columnas.",
            "Texto «Cargando…» en lugar del skeleton.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>{"DataTable<T>"}</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="rows">rows</code>, <code key="rows-t">T[]</code>, "Las filas de la página actual. Obligatoria."],
            [<code key="columns">columns</code>, <code key="columns-t">{"Column<T>[]"}</code>, "Definición de columnas. Obligatoria."],
            [<code key="getRowId">getRowId</code>, <code key="getRowId-t">{"(row: T) => string"}</code>, "Id estable de cada fila, usado para la key y la selección. Obligatoria."],
            [<code key="selectable">selectable</code>, <code key="selectable-t">boolean</code>, "Por defecto false. Añade la columna de checkboxes con «seleccionar todo» en la cabecera."],
            [<code key="selected">selected</code>, <code key="selected-t">{"Set<string>"}</code>, "Ids seleccionados. Controlado desde la página."],
            [<code key="onSelectedChange">onSelectedChange</code>, <code key="onSelectedChange-t">{"(next: Set<string>) => void"}</code>, "Recibe el Set completo tras cada cambio."],
            [<code key="onRowClick">onRowClick</code>, <code key="onRowClick-t">{"(row: T) => void"}</code>, "Hace la fila clicable (cursor, chevron al hover). Normalmente abre el DetailSheet."],
            [<code key="sort">sort</code>, <code key="sort-t">Sort | null</code>, "Orden controlado. Si se omite (undefined), la tabla lleva su propio estado."],
            [<code key="onSortChange">onSortChange</code>, <code key="onSortChange-t">{"(next: Sort | null) => void"}</code>, "Se llama al ciclar la cabecera: asc, desc, null."],
            [<code key="emptyState">emptyState</code>, <code key="emptyState-t">ReactNode</code>, "Se pinta en una fila a todo el ancho cuando no hay filas. Usa EmptyState."],
            [<code key="loading">loading</code>, <code key="loading-t">boolean</code>, "Por defecto false. Atenúa al 60 % y desactiva los eventos de puntero durante un refetch."],
            [<code key="dense">dense</code>, <code key="dense-t">boolean</code>, "Por defecto false. Filas de 32 px (py-1.5) en lugar de 40 px."],
            [<code key="rowClassName">rowClassName</code>, <code key="rowClassName-t">{"(row: T) => string | undefined"}</code>, "Clases extra por fila, por ejemplo para atenuar las archivadas."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases del contenedor con scroll."],
          ]}
        />
        <Prose>
          <p>
            <code>{"Column<T>"}</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Descripción"]}
          rows={[
            [<code key="c-id">id</code>, <code key="c-id-t">string</code>, "Identificador único de la columna; es el id que viaja en Sort."],
            [<code key="c-header">header</code>, <code key="c-header-t">ReactNode</code>, "Texto de la cabecera, 12 px gris."],
            [<code key="c-cell">cell</code>, <code key="c-cell-t">{"(row: T) => ReactNode"}</code>, "Contenido de la celda."],
            [<code key="c-align">align</code>, <code key="c-align-t">"left" | "right" | "center"</code>, "Por defecto left. right añade tabular-nums y alinea la cabecera y su flecha."],
            [<code key="c-width">width</code>, <code key="c-width-t">number | string</code>, "Ancho fijo de la cabecera, para columnas de progreso o fecha."],
            [<code key="c-minWidth">minWidth</code>, <code key="c-minWidth-t">number | string</code>, "Ancho mínimo desde 768 px. 220 en la columna primaria. En pantallas estrechas se reduce a 144 px para que quepan las demás."],
            [<code key="c-sortValue">sortValue</code>, <code key="c-sortValue-t">{"(row: T) => string | number | Date | null | undefined"}</code>, "Valor por el que se ordena; activa el botón de orden. Los nulos van al final. Cadenas con localeCompare «es»."],
            [<code key="c-hideBelow">hideBelow</code>, <code key="c-hideBelow-t">"md" | "lg" | "xl" | "2xl"</code>, "Oculta la columna por debajo de ese ancho."],
            [<code key="c-className">className</code>, <code key="c-className-t">string</code>, "Clases para cabecera y celdas de la columna."],
          ]}
        />
        <Prose>
          <p>
            <code>Sort</code> es <code>{"{ id: string; dir: \"asc\" | \"desc\" }"}</code>. <code>CellPrimary</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="p-title">title</code>, <code key="p-title-t">ReactNode</code>, "Nombre en semibold, truncado. Obligatoria."],
            [<code key="p-subtitle">subtitle</code>, <code key="p-subtitle-t">ReactNode</code>, "Código o categoría en text-xs gris debajo. Opcional."],
            [<code key="p-leading">leading</code>, <code key="p-leading-t">ReactNode</code>, "AvatarInitials o icono a la izquierda, gap 10 px. Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>TablePagination</code>, para el <code>SectionFooter</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="g-page">page</code>, <code key="g-page-t">number</code>, "Página actual, empezando en 1."],
            [<code key="g-pageCount">pageCount</code>, <code key="g-pageCount-t">number</code>, "Número de páginas. Los botones se desactivan en los extremos."],
            [<code key="g-onPageChange">onPageChange</code>, <code key="g-onPageChange-t">{"(p: number) => void"}</code>, "Recibe la página destino."],
            [<code key="g-total">total</code>, <code key="g-total-t">number</code>, "Total de filas filtradas. Con pageSize, pinta a la izquierda el rango de filas mostradas y el total. Opcional."],
            [<code key="g-pageSize">pageSize</code>, <code key="g-pageSize-t">number</code>, "Filas por página. Opcional; solo para el rango."],
          ]}
        />
      </DocSection>

      <DocSection
        id="lista"
        title="Vista lista"
        lead="La otra vista de filas. Menos campos por fila, lectura rápida y la que se usa en móvil en lugar de la tabla. RecordList y RecordListItem, en components/app/record-list.tsx."
      >
        <Example
          padded={false}
          code={`<RecordList>
  {paged.map((r) => (
    <RecordListItem
      key={r.id}
      leading={<AvatarInitials name={r.name} variant="entity" />}
      title={r.name}
      subtitle={\`\${r.code} · \${r.category} · \${r.owner}\`}
      status={<StatusBadge tone={fase.tone}>{fase.label}</StatusBadge>}
      value={fmt.eur(r.value)}
      selected={selected.has(r.id)}
      onClick={() => setOpenId(r.id)}
    />
  ))}
</RecordList>`}
        >
          <RecordList>
            {[
              { n: 1, fase: "Propuesta enviada", tone: "warning" as const, v: 58249 },
              { n: 2, fase: "En contacto", tone: "info" as const, v: 29993 },
              { n: 3, fase: "Ganado", tone: "success" as const, v: 61737 },
            ].map((r) => (
              <RecordListItem
                key={r.n}
                leading={<AvatarInitials name={`Registro ${r.n}`} variant="entity" />}
                title={`Registro ${r.n}`}
                subtitle={`REG-000${r.n} · Categoría A · Usuario ${r.n}`}
                status={<StatusBadge tone={r.tone}>{r.fase}</StatusBadge>}
                value={fmt.eur(r.v)}
              />
            ))}
          </RecordList>
        </Example>
        <Rules
          items={[
            <>Una fila: monograma, nombre y subtítulo a la izquierda; estado y cifra a la derecha. En pantallas estrechas el estado y la cifra se apilan para que el nombre nunca desaparezca.</>,
            <>Con <code>onClick</code> la fila es un botón que abre el sheet; sin él, es una fila de solo lectura. <code>selected</code> la marca con el mismo fondo que una fila seleccionada de la tabla.</>,
            <>Comparte búsqueda, filtros, orden, selección y paginación con la tabla: cambiar de vista no cambia qué filas se ven.</>,
          ]}
        />
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="l-leading">leading</code>, <code key="l-leading-t">ReactNode</code>, "Monograma o avatar. Opcional."],
            [<code key="l-title">title</code>, <code key="l-title-t">ReactNode</code>, "Nombre del registro, en 13,5 px semibold. Obligatoria."],
            [<code key="l-subtitle">subtitle</code>, <code key="l-subtitle-t">ReactNode</code>, "Código, categoría, responsable. Se trunca. Opcional."],
            [<code key="l-status">status</code>, <code key="l-status-t">ReactNode</code>, "Normalmente un StatusBadge. Opcional."],
            [<code key="l-value">value</code>, <code key="l-value-t">ReactNode</code>, "Cifra a la derecha con tabular-nums. Opcional."],
            [<code key="l-selected">selected</code>, <code key="l-selected-t">boolean</code>, "Marca la fila como seleccionada. Por defecto false."],
            [<code key="l-onClick">onClick</code>, <code key="l-onClick-t">{"() => void"}</code>, "Convierte la fila en botón. Normalmente abre el DetailSheet."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/data-table.json" />
        <Prose>
          <p>
            Trae <code>table</code>, <code>checkbox</code> y <code>button</code>. Para la primera columna y los estados
            instala también <code>avatar-initials</code>, <code>status-badge</code> y <code>states</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "Búsqueda, filtros y vistas que alimentan la tabla." },
            { href: "/ds/componentes/bulk-bar", label: "Barra de selección", text: "Qué pasa con las filas marcadas." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "Lo que abre la fila al pulsarla." },
            { href: "/ds/componentes/states", label: "Estados", text: "EmptyState, TableSkeleton y ErrorState." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
