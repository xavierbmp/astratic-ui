import Link from "next/link"
import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Barra de la base" }

const FILTROS = `// Para una página con su propia vista (un calendario a medida), la misma barra sin base.
<BarraFiltros
  campos={camposMenuDeFiltrables(campos)}
  filtro={filtro}
  onFiltro={setFiltro}
  busqueda={q}
  onBuscar={setQ}
  objeto="lo que sale en el calendario"
  vistas={{ opciones: VISTAS, valor: vista, onCambiar: setVista }}
  accion={<Button size="sm"><CalendarPlusIcon /> Planificar contenido</Button>}
/>`

/** La barra de controles de toda lista: la de la base de datos, o la suelta para una vista propia. */
export default function BarraPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Barra de la base"
      lead="Los controles de una lista viven dentro de la base de datos, en su barra, con la colocación de Airtable: a la izquierda el lateral y la vista; a la derecha lo que cambia lo que se ve (campos, filtro, grupos, orden, color, altura, buscar), la acción principal y la ficha integrada. Ya no hay una toolbar suelta encima del bloque."
    >
      <DocSection id="botones" title="Los botones, de izquierda a derecha">
        <SpecTable
          columns={["Botón", "Qué hace", "Icono"]}
          rows={[
            ["Lateral", "Abre y cierra el lateral de vistas (o el propio de la página: carpetas, calendario).", "PanelLeft"],
            ["Nombre de la vista", "Su tipo, su nombre y su menú: las demás vistas, «Crear vista», renombrar, duplicar, eliminar.", "Table2 · Columns3 · LayoutGrid · CalendarDays"],
            ["Apilado por / Fecha", "Solo en kanban y calendario: el campo que reparte las columnas o pone cada registro en su día.", "Columns3 · CalendarDays"],
            ["Ocultar campos", "Qué campos se ven y en qué orden (en kanban y galería, los de la tarjeta).", "EyeOff"],
            ["Filtro", "Condiciones con los operadores de cada tipo y grupos anidados.", "SlidersHorizontal"],
            ["Agrupar", "Hasta tres niveles. Solo en la cuadrícula.", "Rows3"],
            ["Ordenar", "Varios campos, arrastrables.", "ArrowUpDown"],
            ["Color", "Por un campo de selección o por condiciones.", "Palette"],
            ["Altura", "Corta, media, alta o extra, y encabezados con ajuste.", "UnfoldVertical"],
            ["Buscar", "En todos los campos; Escape lo cierra.", "Search"],
            ["Acción principal", "La única negra de la página: «Nueva marca».", "Plus"],
            ["Ficha integrada", "La ficha a la derecha en vez de encima. Desde 1280 px.", "PanelRight"],
          ]}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>Lo activo, en el tono de la marca</strong> (<code>bg-brand-soft</code> con el icono en <code>brand</code>), igual en todos los botones. Si
              no cabe todo, los apagados se quedan en icono y los activos siguen diciendo qué hacen («Filtrado por Marca»).
            </>,
            <>
              <strong>Iconos del kit</strong>, los de la tabla de arriba: los mismos que en el resto del design system, no los de Airtable.
            </>,
            <>
              <strong>Lo que hace cada cambio se guarda en la vista</strong> de esa persona al momento. Nada de «Guardar en la vista».
            </>,
            <>
              <strong>Las cifras de una portada pueden filtrar la vista</strong> (Cobros: «Vencido»): ponen o quitan su condición en el filtro de la vista
              abierta, que se ve en el botón «Filtro».
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="sin-base" title="Una página con vista propia">
        <Prose>
          <p>
            Si la página tiene una vista hecha a medida que no es una base (el calendario de contenidos con «Para planificar»), usa <code>BarraFiltros</code>: la
            misma barra con la vista, el filtro y buscar, sin campos, grupos ni orden. Ver{" "}
            <Link href="/ds/componentes/base-de-datos">Base de datos</Link> para todo lo demás.
          </p>
        </Prose>
        <CodeBlock code={FILTROS} lang="tsx" />
        <DoDont
          dos={[<>La barra dentro de la base, en su borde superior.</>, <>Una sola acción principal, al final de la barra.</>]}
          donts={[<>Una toolbar de filtros encima del bloque y otra en la base.</>, <>Filtros rápidos sueltos o chips de filtros debajo: el filtro se ve en su botón.</>]}
        />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/componentes/base-de-datos", label: "Base de datos", text: "La pieza entera, con su demo." },
          { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Los operadores por tipo y las vistas personales." },
        ]}
      />
    </DocPage>
  )
}
