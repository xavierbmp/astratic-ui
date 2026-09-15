import Link from "next/link"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { ToolbarDemo } from "@/components/docs/examples/toolbar-demo"

export const metadata = { title: "Toolbar" }

export default function ToolbarPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Toolbar"
      lead="La fila de controles justo encima del bloque de operación y con su mismo ancho: buscador, menús de filtro, conmutador de vistas y la única acción principal de la página. Siempre en ese orden."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En toda página de operación, entre las cifras y el bloque. Se pasa a <code>WorkGrid</code> en la prop{" "}
            <code>toolbar</code>: así mide lo mismo que el bloque de operación y termina en su borde derecho, y el panel de
            información empieza a la altura del bloque, no de la toolbar. La toolbar no muestra datos ni avisos: solo
            controles que cambian lo que se ve en el bloque (búsqueda, filtros, vista) y el botón que crea el registro
            que gestiona la página. Los filtros activos aparecen debajo como chips con <code>ActiveFilters</code>.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Orden fijo:</strong> <code>ToolbarSearch</code> · <code>FilterMenu</code>(s) ·{" "}
              <code>ToolbarActions</code> con <code>ViewSwitcher</code> y el botón principal. Lo que se lee y se filtra a
              la izquierda; lo que cambia la vista y lo que crea, a la derecha.
            </>,
            <>
              <strong>Búsqueda, filtros y selección se comparten entre vistas.</strong> Cambiar de tabla a kanban no
              limpia nada; el estado vive en la página, no en la vista.
            </>,
            <>
              <strong>Una acción principal</strong>, negra, con icono + verbo + objeto («Nuevo registro»). Si no hay
              nada que crear, la toolbar acaba en el conmutador.
            </>,
            <>
              Altura 32 px en todos los controles. Si no cabe, primero el buscador se estrecha de 256 a 160 px y
              después la fila envuelve (<code>flex-wrap</code>): buscador y filtros arriba; vistas y acción abajo, pegadas
              a la derecha gracias al <code>ml-auto</code> de <code>ToolbarActions</code>.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Toolbar completa sobre ocho registros"
          description="Escribe, filtra por estado (múltiple, con contadores) o por categoría (único, con icono), quita chips y cambia de vista. El bloque de debajo muestra cuántos quedan."
          code={`<WorkGrid
  toolbar={
    <>
      <Toolbar>
        <ToolbarSearch placeholder="Buscar registro…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu
          label="Estado"
          options={estados.map((e) => ({ value: e.id, label: e.label, count: countBy(e.id) }))}
          value={estado}
          onChange={setEstado}
        />
        <FilterMenu label="Categoría" icon={TagIcon} multiple={false} options={categorias} value={categoria} onChange={setCategoria} />
        <ToolbarActions>
          <ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />
          <Button onClick={crear}>
            <PlusIcon /> Nuevo registro
          </Button>
        </ToolbarActions>
      </Toolbar>
      <ActiveFilters chips={chips} onClear={clear} />
    </>
  }
  aside={<InsightsPanel storageKey="registros" blocks={blocks} />}
>
  <Section>…</Section>
</WorkGrid>`}
        >
          <ToolbarDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Prose>
          <p>
            Las reglas de qué se filtra, cómo se combinan los filtros y cuándo un filtro es múltiple o único están en{" "}
            <Link href="/ds/patrones/filtros">Filtros y vistas</Link>. Aquí, solo lo que afecta al componente.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <code>FilterMenu</code> es controlado: recibe <code>value: string[]</code> y devuelve el array completo en{" "}
              <code>onChange</code>. En modo único el array tiene cero o un elemento. El botón se marca cuando hay valor
              y muestra la opción elegida o el número de opciones.
            </>,
            <>
              Los <code>count</code> de las opciones cuentan sobre el total sin ese filtro, para que el usuario sepa
              cuánto va a ver antes de marcar.
            </>,
            <>
              <code>ActiveFilters</code> pinta un chip por valor activo y el enlace «Limpiar». Se construye desde el
              estado de los filtros; devuelve <code>null</code> si no hay chips, así que se puede dejar siempre montado.
            </>,
            <>
              <code>ViewSwitcher</code> solo admite las cinco vistas del sistema (<code>ViewKind</code>) con sus iconos
              fijos. Su estado se lleva con <code>usePageView(clave, vistas)</code> de <code>hooks/use-page-view.ts</code>:
              recuerda la vista por página en localStorage y, en móvil, quita la tabla y usa la siguiente vista (lista o
              tarjetas), porque una tabla no cabe en 390 px. Si solo queda una vista, el conmutador no se pinta.
            </>,
            <>
              <code>ToolbarSearch</code> es un <code>InputGroup</code> con la lupa: hasta 256 px, se estrecha hasta 160 px
              antes de que la fila salte y ocupa todo el ancho en móvil. El placeholder corto («Buscar registro…») y con
              puntos suspensivos si no cabe. Filtra en cliente sobre lo cargado o lanza la búsqueda al servidor con un
              retardo; en ambos casos, controlado con <code>value</code>.
            </>,
          ]}
        />
        <SpecTable
          columns={["Vista", "Icono", "Etiqueta"]}
          rows={[
            [<code key="table">table</code>, "table-2", "Tabla"],
            [<code key="list">list</code>, "list", "Lista"],
            [<code key="kanban">kanban</code>, "columns-3", "Kanban"],
            [<code key="calendar">calendar</code>, "calendar-days", "Calendario"],
            [<code key="grid">grid</code>, "layout-grid", "Tarjetas"],
          ]}
        />
        <DoDont
          dos={[
            "Buscador · Fase · Estado · Responsable · [espacio] · vistas · Nuevo registro, con el ancho del bloque.",
            "FilterMenu con contadores y chips debajo de la toolbar.",
            "Un solo botón negro al final.",
          ]}
          donts={[
            "Texto de aviso o recuento dentro de la toolbar: eso va en la cabecera del bloque.",
            "Un Select suelto como filtro: siempre FilterMenu.",
            "Botones de acción en bloque en la toolbar: van en la BulkBar.",
            "Toolbar a todo el ancho de la página, con las vistas y «Nuevo» encima del panel de información.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>Toolbar</code> es un <code>div</code> con <code>flex flex-wrap items-center gap-2</code>;{" "}
            <code>ToolbarActions</code> es el grupo final (<code>ml-auto flex items-center gap-2</code>) y acepta
            cualquier prop de <code>div</code>. <code>ToolbarSearch</code> acepta las props de un{" "}
            <code>input</code> (<code>placeholder</code>, <code>value</code>, <code>onChange</code>…) y{" "}
            <code>className</code> para el grupo.
          </p>
          <p>
            <code>FilterMenu</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="label">label</code>, <code key="label-t">string</code>, "Texto del botón y título del menú. Obligatoria."],
            [<code key="icon">icon</code>, <code key="icon-t">LucideIcon</code>, "Icono delante del texto. Opcional."],
            [<code key="options">options</code>, <code key="options-t">FilterOption[]</code>, "Opciones: { value, label, count? }. El count se pinta a la derecha en gris."],
            [<code key="value">value</code>, <code key="value-t">string[]</code>, "Valores activos. Obligatoria."],
            [<code key="onChange">onChange</code>, <code key="onChange-t">{"(next: string[]) => void"}</code>, "Recibe el array completo tras marcar, desmarcar o «Quitar filtro»."],
            [<code key="multiple">multiple</code>, <code key="multiple-t">boolean</code>, "Por defecto true (checkboxes). En false, radio: un valor o ninguno."],
          ]}
        />
        <Prose>
          <p>
            <code>ActiveFilters</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="chips">chips</code>, <code key="chips-t">{"{ label: string; onRemove: () => void }[]"}</code>, "Un chip por filtro activo, con el texto «Filtro: valor». Sin chips no se renderiza nada."],
            [<code key="onClear">onClear</code>, <code key="onClear-t">{"() => void"}</code>, "Acción del enlace «Limpiar»: vacía todos los filtros."],
          ]}
        />
        <Prose>
          <p>
            <code>ViewSwitcher</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="views">views</code>, <code key="views-t">ViewKind[]</code>, "Las vistas disponibles en esta página, en el orden en que se pintan. Con menos de dos no se pinta nada."],
            [<code key="v-value">value</code>, <code key="v-value-t">ViewKind</code>, "Vista activa (modo controlado). Lo normal es sacarla de usePageView, que la recuerda por página y la adapta a móvil."],
            [<code key="v-default">defaultValue</code>, <code key="v-default-t">ViewKind</code>, "Vista inicial en modo no controlado. Por defecto, la primera de views."],
            [<code key="v-onChange">onChange</code>, <code key="v-onChange-t">{"(v: ViewKind) => void"}</code>, "Se llama al pulsar otra vista; pulsar la activa no deselecciona."],
            [<code key="v-className">className</code>, <code key="v-className-t">string</code>, "Clases extra del contenedor: control segmentado de 32 px, fondo muted, botones de 28 px y el activo en blanco con sombra."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/toolbar.json" />
        <Prose>
          <p>
            Trae <code>button</code>, <code>input-group</code>, <code>dropdown-menu</code> y <code>tooltip</code>; el
            conmutador usa el <code>ToggleGroup</code> de <code>radix-ui</code> directamente, con el mismo estilo que{" "}
            <code>Tabs</code>. Necesita un <code>TooltipProvider</code> en el layout raíz.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Qué se filtra y cómo se combinan." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Dónde va cada botón." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "La vista por defecto del bloque." },
            { href: "/ds/componentes/bulk-bar", label: "Barra de selección", text: "Las acciones sobre lo marcado." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
