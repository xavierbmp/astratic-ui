import { KanbanSkeleton } from "@/components/app/states"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { KanbanDemo } from "@/components/docs/examples/kanban-demo"

export const metadata = { title: "Kanban" }

export default function KanbanPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Kanban"
      lead="Una columna por fase y las tarjetas que se arrastran entre ellas. Es la vista del bloque de operación cuando el registro tiene una fase y moverlo de fase es el trabajo."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cuando los registros pasan por fases ordenadas (nuevo, en contacto, propuesta, ganado) y el usuario las
            cambia a mano. Comparte búsqueda, filtros y selección con la tabla: es otra forma de ver el mismo conjunto,
            elegida desde el <code>ViewSwitcher</code>. Si la fase la decide el sistema y no la persona, no hay kanban.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Modelo mínimo.</strong> Cada tarjeta es un <code>KanbanItem</code>: <code>id</code> y{" "}
              <code>columnId</code>, más los campos que tu tarjeta necesite. Las columnas son{" "}
              <code>KanbanColumn</code>: <code>id</code>, <code>title</code>, <code>tone</code> y <code>meta</code>.
            </>,
            <>
              <strong><code>onChange</code> recibe el array completo</strong>, ya reordenado y con el{" "}
              <code>columnId</code> nuevo. Se llama cuando la tarjeta entra en otra columna durante el arrastre (para que
              la interfaz responda al momento) y al soltar si cambia el orden dentro de la columna.
            </>,
            <>
              <strong>La fase real se guarda en el servidor.</strong> La página aplica el cambio al estado local de
              inmediato, llama a una Server Action con el id y la fase destino, y el toast confirma («Registro 4 ahora
              está en Negociando»). Si la acción falla, se repone el estado anterior y el toast lo dice.
            </>,
            <>
              <strong><code>renderCard</code> pinta solo el interior.</strong> La tarjeta (borde, fondo, sombra, cursor,
              foco) la pone el componente; tú devuelves título, subtítulo, badge y cifra.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Cuatro fases, una plegada"
          description="Arrastra una tarjeta a otra columna: el total de la fase se recalcula y el toast confirma. Pulsa sin arrastrar para abrir el detalle. «Descartado» empieza plegada; el menú «…» de cada columna la pliega y la flecha la despliega. Con teclado: Espacio para levantar, flechas para mover, Espacio para soltar."
          padded={false}
          code={`<Kanban
  columns={stages.map((s) => ({ id: s.id, title: s.label, tone: s.tone, meta: fmt.eur(totalDeFase(s.id)) }))}
  items={records}
  storageKey="registros"
  defaultCollapsed={["descartado"]}
  onChange={(next) => {
    const moved = next.find((n) => n.columnId !== records.find((r) => r.id === n.id)?.columnId)
    setRecords(next)
    if (moved) {
      startTransition(async () => {
        await cambiarFase(moved.id, moved.columnId)
        toast.success(\`\${moved.name} ahora está en \${labelDeFase(moved.columnId)}\`)
      })
    }
  }}
  onCardClick={(r) => setOpenId(r.id)}
  renderCard={(r) => (
    <div className="flex flex-col">
      <div className="flex items-start gap-2.5">
        <AvatarInitials name={r.name} variant="entity" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] leading-[18px] font-semibold">{r.name}</div>
          <div className="mt-px truncate text-xs text-muted-foreground">{r.code}</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">{fmt.eur(r.value)}</span>
        <span className="ml-auto truncate rounded-md border px-1.5 py-px text-[11px] font-medium text-muted-foreground">{r.tag}</span>
      </div>
      <div className="mt-2.5 flex items-center gap-2 border-t pt-2">
        <span className={cn("inline-flex min-w-0 items-center gap-1 text-xs font-medium", statusTextClass[r.status.tone])}>
          <CalendarClockIcon className="size-3 flex-none" />
          <span className="truncate">{r.status.label} · {fmt.date(r.dueAt)}</span>
        </span>
        <AvatarInitials name={r.owner} size="xs" className="ml-auto" />
      </div>
    </div>
  )}
/>`}
        >
          <KanbanDemo />
        </Example>
        <Example
          title="Cargando"
          description="KanbanSkeleton, de components/app/states.tsx, con la misma columna gris y el mismo ancho."
          padded={false}
          code={`{loading ? <KanbanSkeleton cols={3} /> : <Kanban … />}`}
        >
          <KanbanSkeleton cols={3} />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>Columnas elásticas</strong> de 208 px como mínimo que se reparten el ancho disponible, fondo{" "}
              <code>bg-muted/60</code>, radio 14 px y 6 px de relleno; 10 px entre columnas y 6 px entre tarjetas. Si no
              caben, el contenedor hace scroll horizontal. Es la columna del CRM de la propuesta a Twic.
            </>,
            <>
              <strong>Cabecera dentro de la columna:</strong> punto del tono de la fase, nombre en 13 px semibold, el
              número de tarjetas en una pastilla blanca con borde y el menú «…» a la derecha. Debajo, alineado con el
              nombre, <code>meta</code> con el total en euros de la fase.
            </>,
            <>
              <strong>Tarjeta:</strong> <code>rounded-lg border bg-card p-3 shadow-xs</code>. Arriba, monograma de la
              entidad con nombre y subtítulo; en medio, el valor y una etiqueta; abajo, separado por un borde, el estado o
              recordatorio coloreado con su tono y el avatar del responsable. Sin botones dentro: las acciones están en el
              sheet.
            </>,
            <>
              <strong>Fases plegables.</strong> Las fases de los extremos (entrada y cierre) se pliegan a una tira de 40 px
              con la flecha para desplegar, el punto, el contador y el nombre en vertical. Plegada sigue siendo destino
              válido para soltar. Con <code>storageKey</code> se recuerda qué columnas plegó cada usuario.
            </>,
            <>
              <strong>Tres fases desplegadas a la vez</strong> con el panel de información abierto a 1440 px (cuatro sin
              panel). Con más fases, las de los extremos empiezan plegadas con <code>defaultCollapsed</code>, como «Lead» y
              «Ganado» en el CRM de Twic.
            </>,
            <>
              <strong>Columna vacía con caja discontinua</strong> y el texto de <code>emptyColumn</code> («Sin
              registros»). La columna sigue siendo destino válido para soltar.
            </>,
            <>
              <strong>Al soltar</strong>, la columna destino se marca en <code>bg-brand-soft</code> con anillo; la tarjeta
              arrastrada va en un <code>DragOverlay</code> con sombra y 1° de giro y la original se atenúa al 40 %.
            </>,
            <>
              <strong>Teclado</strong> con dnd-kit sortable: la tarjeta recibe foco con Tab, Espacio o Enter la levanta,
              las flechas la mueven entre posiciones y columnas, Espacio la suelta y Escape cancela.
            </>,
            <>
              El puntero necesita moverse 6 px para empezar a arrastrar; un clic sin movimiento dispara{" "}
              <code>onCardClick</code>.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "Columnas con tono de la fase y total en euros en meta.",
            "onChange que guarda en local y persiste con una Server Action.",
            "Tarjeta con monograma, nombre, valor, etiqueta y pie de estado.",
            "Fases de entrada y cierre plegadas por defecto cuando hay muchas.",
          ]}
          donts={[
            "Seis columnas desplegadas con scroll horizontal por defecto.",
            "Botones o menús dentro de la tarjeta.",
            "Confirmar cada arrastre con un diálogo.",
            "Un kanban para registros sin fase que cambie la persona.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>{"Kanban<T extends KanbanItem>"}</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="columns">columns</code>, <code key="columns-t">KanbanColumn[]</code>, "Las fases, en orden. Obligatoria."],
            [<code key="items">items</code>, <code key="items-t">T[]</code>, "Las tarjetas, con su columnId. Las que apuntan a una columna inexistente no se pintan. Obligatoria."],
            [<code key="onChange">onChange</code>, <code key="onChange-t">{"(next: T[]) => void"}</code>, "Recibe el array completo con el nuevo columnId y el nuevo orden. Obligatoria."],
            [<code key="renderCard">renderCard</code>, <code key="renderCard-t">{"(item: T, state: { dragging: boolean }) => ReactNode"}</code>, "Interior de la tarjeta. dragging es true para la tarjeta que se está arrastrando y para su copia en el overlay. Obligatoria."],
            [<code key="onCardClick">onCardClick</code>, <code key="onCardClick-t">{"(item: T) => void"}</code>, "Clic sin arrastre. Normalmente abre el DetailSheet. Opcional."],
            [<code key="emptyColumn">emptyColumn</code>, <code key="emptyColumn-t">ReactNode</code>, "Texto de la caja discontinua en columnas vacías. Por defecto «Sin registros»."],
            [<code key="storageKey">storageKey</code>, <code key="storageKey-t">string</code>, "Si se pasa, las columnas plegadas se guardan en localStorage con la clave kanban:<storageKey>. Sin ella, se recuerdan solo mientras la página está abierta."],
            [<code key="defaultCollapsed">defaultCollapsed</code>, <code key="defaultCollapsed-t">string[]</code>, "Ids de las columnas que empiezan plegadas. Por defecto ninguna."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases del contenedor de columnas (flex h-full min-h-0 gap-2.5 overflow-x-auto p-3)."],
          ]}
        />
        <Prose>
          <p>
            <code>KanbanColumn</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Descripción"]}
          rows={[
            [<code key="k-id">id</code>, <code key="k-id-t">string</code>, "Id de la fase; coincide con el columnId de las tarjetas."],
            [<code key="k-title">title</code>, <code key="k-title-t">string</code>, "Nombre de la fase en la cabecera."],
            [<code key="k-tone">tone</code>, <code key="k-tone-t">StatusTone</code>, "Tono del punto de la cabecera. Por defecto neutral."],
            [<code key="k-meta">meta</code>, <code key="k-meta-t">ReactNode</code>, "Línea bajo el nombre de la fase, normalmente el total en euros. Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>KanbanItem</code> es <code>{"{ id: string; columnId: string }"}</code>; tu tipo de tarjeta lo extiende
            con lo que necesite pintar.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/kanban.json" />
        <Prose>
          <p>
            Trae <code>kanban.tsx</code>, <code>lib/status.ts</code> y <code>hooks/use-local-storage.ts</code>, añade{" "}
            <code>button</code> y <code>dropdown-menu</code> de shadcn e instala <code>@dnd-kit/core</code>,{" "}
            <code>@dnd-kit/sortable</code> y <code>@dnd-kit/utilities</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "El conmutador que lleva a esta vista." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "La otra vista del mismo conjunto." },
            { href: "/ds/componentes/status-badge", label: "Badges de estado", text: "Los tonos de las columnas y las tarjetas." },
            { href: "/ds/fundamentos/movimiento", label: "Movimiento", text: "Duración y curva del arrastre y la caída." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
