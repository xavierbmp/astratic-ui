import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { BulkBarDemo } from "@/components/docs/examples/bulk-bar-demo"

export const metadata = { title: "Barra de selección" }

const example = `const [selected, setSelected] = React.useState<Set<string>>(new Set())

<Section className="min-h-[520px]">
  <SectionHeader icon={KanbanSquareIcon} title="Registros" count={filtered.length} />
  <SectionBody>
    <DataTable
      rows={paged}
      columns={columns}
      getRowId={(r) => r.id}
      selectable
      selected={selected}
      onSelectedChange={setSelected}
      onRowClick={(r) => setOpenId(r.id)}
    />
  </SectionBody>
  <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
    <Button variant="ghost" size="sm" onClick={() => advance([...selected])}><ArrowRightIcon /> Avanzar fase</Button>
    <Button variant="ghost" size="sm" onClick={() => archive([...selected])}><ArchiveIcon /> Archivar</Button>
  </BulkBar>
</Section>`

const more = `<BulkBar count={selected.size} onClear={clear}>
  <Button variant="ghost" size="sm" onClick={advance}><ArrowRightIcon /> Avanzar fase</Button>
  <Button variant="ghost" size="sm" onClick={assign}><UserIcon /> Asignar</Button>
  <Button variant="ghost" size="sm" onClick={send}><SendIcon /> Enviar</Button>
  <Button variant="ghost" size="sm" onClick={archive}><ArchiveIcon /> Archivar</Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm"><EllipsisIcon /> Más</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={exportSelection}><DownloadIcon /> Exportar selección</DropdownMenuItem>
      <DropdownMenuItem onClick={addTag}><TagIcon /> Etiquetar</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}><Trash2Icon /> Eliminar</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</BulkBar>

<ConfirmDialog
  open={confirm}
  onOpenChange={setConfirm}
  title={\`¿Eliminar \${selected.size} registros?\`}
  description="Se borrarán de forma permanente junto con su actividad. Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  destructive
  onConfirm={() => remove([...selected])}
/>`

const destructiveLast = `<BulkBar count={selected.size} onClear={clear}>
  <Button variant="ghost" size="sm" onClick={complete}><CircleCheckIcon /> Completar</Button>
  <Button variant="ghost" size="sm" onClick={reassign}><UserIcon /> Reasignar</Button>
  <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirm(true)}>
    <Trash2Icon /> Eliminar
  </Button>
</BulkBar>`

export default function BulkBarPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Barra de selección"
      lead="La barra flotante que aparece al marcar la primera fila y agrupa las acciones sobre la selección. Flota fija al pie de la ventana, centrada, mientras hay algo seleccionado."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Aparece cuando hay al menos una fila o tarjeta seleccionada y desaparece al vaciar la selección. Muestra
            el contador, las acciones en bloque como botones ghost con icono y una X para deseleccionar. Es el único
            sitio del sistema donde viven las acciones en bloque: nunca en la toolbar ni en la cabecera del bloque.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              Va como último hijo del <code>Section</code> del bloque de operación y se posiciona{" "}
              <code>fixed bottom-6</code>, centrada en la ventana: se ve aunque la tabla sea más alta que la pantalla.
              Queda por encima del contenido y por debajo del sheet y de los diálogos.
            </>,
            <>
              El estado de selección (un <code>Set</code> de ids) vive en la página y se comparte entre vistas: lo
              marcado en la tabla sigue marcado en el kanban.
            </>,
            <>
              Al ejecutar una acción, la selección se vacía y el resultado se confirma con un toast que dice cuántos
              registros se han tocado.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo" lead="Cinco filas con checkbox. La barra aparece al marcar la primera y se va con la X, al vaciar la selección o al ejecutar una acción.">
        <Example title="Selección en una lista" description="En este ejemplo acotado la barra se ancla al borde del contenedor con className=&quot;absolute bottom-4&quot;; en una página va fija al pie de la ventana." code={example}>
          <BulkBarDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Por defecto es fija. Solo dentro de un contenedor acotado (un ejemplo, un diálogo, un panel con scroll
              propio) se ancla a él con <code>className=&quot;absolute bottom-4&quot;</code>, y ese contenedor lleva{" "}
              <code>relative</code>.
            </>,
            <>
              Aparece con la primera selección y desaparece al vaciarla: con <code>count === 0</code> no renderiza
              nada, así que no hace falta condicionarla desde fuera.
            </>,
            <>
              Acciones en orden de frecuencia de uso, de izquierda a derecha. La destructiva siempre la última y en{" "}
              <code>text-danger</code>.
            </>,
            <>
              Máximo cinco acciones visibles. Si hay más, las cuatro más frecuentes fuera y el resto en un menú «Más»
              al final de la barra.
            </>,
            <>
              Botones <code>variant=&quot;ghost&quot; size=&quot;sm&quot;</code> con icono lucide y verbo. Nunca
              botones primarios ni outline dentro de la barra.
            </>,
            <>
              El contador es el total seleccionado, aunque la selección abarque varias páginas del listado. Las
              acciones actúan sobre ese total, no sobre lo visible.
            </>,
            <>
              Nunca acciones en bloque en la parte superior de la tabla ni en la toolbar. Seleccionar todo lo visible
              se hace desde el checkbox de la cabecera.
            </>,
            <>
              Lo irreversible (eliminar) pide <code>ConfirmDialog</code> con el número de registros en el título. Lo
              reversible (archivar, completar) se ejecuta y el toast ofrece «Deshacer».
            </>,
          ]}
        />
        <Example title="La destructiva, la última y en rojo" padded={false} className="border-0" code={destructiveLast}>
          <span className="sr-only">Ejemplo de código</span>
        </Example>
        <Example title="Con más de cinco acciones" padded={false} className="border-0" code={more}>
          <span className="sr-only">Ejemplo de código</span>
        </Example>
        <DoDont
          dos={[
            "Barra fija, centrada abajo, mientras hay selección.",
            "Ghost sm con icono; la destructiva la última.",
            "Toast con el número de registros afectados.",
            "Selección que se mantiene al cambiar de vista.",
          ]}
          donts={[
            "Botones «Eliminar seleccionados» encima de la tabla.",
            "Acción destructiva en primer lugar o en rojo sólido.",
            "Barra visible con cero seleccionados.",
            "Contador que solo cuenta la página actual.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            ["count", <code key="t">number</code>, "Total seleccionado. Con 0 el componente no renderiza nada."],
            ["onClear", <code key="t">() =&gt; void</code>, "Deseleccionar todo. Lo dispara la X del final."],
            ["children", <code key="t">ReactNode</code>, "Botones ghost sm con icono, en orden de frecuencia."],
            ["className", <code key="t">string</code>, "Clases extra. El resto de props de div se pasan al contenedor, que ya lleva role=\"toolbar\" y aria-label."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/bulk-bar.json" />
        <Prose>
          <p>
            Depende de <code>button</code> de shadcn. La selección de filas la gestiona <code>data-table</code> con{" "}
            <code>selectable</code>, <code>selected</code> y <code>onSelectedChange</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "Selección múltiple con checkbox de cabecera." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Toast con «Deshacer» y diálogo de confirmación." },
            { href: "/ds/componentes/buttons", label: "Botones", text: "Ghost sm con icono para barras y listas." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Dónde va cada cosa en la página." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
