import { DocPage, DocSection, NextLinks, Prose, Rules } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Base de datos con vistas" }

/** Documentación de las piezas para montar una base al estilo de Notion sobre cualquier objeto. */
export default function BaseDeDatosPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Base de datos con vistas"
      lead="Para las páginas que son una base de datos de verdad, como las de Notion: vistas guardadas en pestañas, filtro y orden de cada vista, agrupar con todas sus opciones, propiedades visibles, cálculos al pie y filas que se arrastran entre grupos. La primera que lo usa es la página de Tareas del workspace de influencers."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cuando la persona necesita ver los mismos registros de varias formas y quedarse con ellas: por fecha, en tablero por estado, en
            calendario, solo lo que espera a otros. Si basta con una lista con filtros y una tabla, sigue siendo <code>FilterBar</code> +{" "}
            <code>DataTable</code>. Los filtros de la página (la toolbar, en la URL) se suman a los de la vista.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Los campos son los del filtro.</strong> Lo que declara cada objeto como <code>CampoFiltrable</code> (id, tipo, opciones y{" "}
              <code>valor(fila)</code>) sirve también para ordenar, agrupar y calcular (<code>lib/vistas/core.ts</code>). Las listas ordenan por el orden de
              sus opciones, no alfabéticamente; lo vacío va siempre al final.
            </>,
            <>
              <strong>Vistas guardadas</strong> con <code>useVistas(clave, deSerie)</code>: las de serie más las propias, en el orden que elige cada persona y
              recordadas en su navegador. Solo se guardan sus decisiones: si el código cambia una vista de serie, le llega a quien no la tocó.
            </>,
            <>
              <strong>El filtro y el orden de una vista no se guardan solos</strong>: salen como cambio sin guardar con «Guardar en la vista · Restablecer»
              (<code>CambiosVista</code>). El diseño, la agrupación, las propiedades y los ajustes se guardan al momento, como en Notion.
            </>,
            <>
              <strong>Agrupar</strong> (<code>AgruparMenu</code>): por cualquier campo que no sea texto; las fechas en tramos desde hoy (hoy, mañana, esta
              semana…), por día, semana o mes; los grupos en el orden de sus opciones o alfabético, los vacíos se esconden y cada uno se oculta con su ojo. Una
              fila con varias etiquetas sale en cada grupo.
            </>,
            <>
              <strong>Ordenar</strong> (<code>OrdenMenu</code>): varios criterios, arrastrables para decidir cuál manda. Sin criterios, orden a mano
              arrastrando filas.
            </>,
            <>
              <strong>Filtros</strong>: el constructor admite grupos dentro de grupos (hasta tres niveles, para mezclar Y con O) y fechas relativas a hoy
              (es hoy, esta semana, en los próximos N días, ya pasó…). Lo que se crea en una vista filtrada hereda los valores fijos del filtro (
              <code>valoresDeFiltro</code>).
            </>,
            <>
              <strong>Tabla</strong> (<code>TablaAgrupada</code>): grupos plegables, columnas que se ensanchan arrastrando su borde, primera columna fija,
              texto ajustado o cortado, menú en cada cabecera y cálculos al pie de cada grupo y del total (<code>calcular</code>: contar, vacías, %, suma,
              media, fecha más temprana…).
            </>,
            <>
              <strong>Arrastrar filas</strong> (<code>ArrastreFilas</code> + <code>useFilaArrastrable</code>): dentro del grupo coloca a mano; a otro grupo, la
              página decide qué valor ponerle (o dice que no se puede, como en un tramo «Vencidas»).
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Cómo se monta">
        <CodeBlock
          code={`const vistas = useVistas("tareas", VISTAS_DE_SERIE)          // pestañas guardadas
const vista = vistas.vista!
const filas = filtrarFilas(filtradasPorLaPagina, vista.filtro, campos, { hoy })
const grupos = agruparFilas(ordenarFilas(filas, vista.orden, campos), vista.agrupar, campos, { hoy })

<Section>
  <SectionHeader title="Todas" count={filas.length}>
    <VistasTabs api={vistas} crearBase={vistaNueva} />
    <FilterBuilder etiqueta="Filtro" variant="ghost" value={vista.filtro} onChange={(f) => vistas.cambiarSinGuardar({ filtro: f })} campos={campos} />
    <OrdenMenu orden={vista.orden} campos={campos} onChange={(orden) => vistas.cambiarSinGuardar({ orden })} />
    <AgruparMenu agrupar={vista.agrupar} campos={campos} grupos={gruposPosibles(filas, vista.agrupar, campos, { hoy })} onChange={(a) => vistas.actualizar({ agrupar: a })} />
    <ColumnSettings config={usePropiedadesDeVista(columnas, vista.propiedades, (ids) => vistas.actualizar({ propiedades: ids }))} label="Propiedades" variant="toolbar" />
    <AjustesVistaMenu vista={vista} disenos={["lista", "tabla", "tablero", "calendario"]} onCambiar={vistas.actualizar} />
  </SectionHeader>
  <CambiosVista visible={vistas.hayCambios} onGuardar={vistas.guardarCambios} onRestablecer={vistas.descartarCambios} />
  <TablaAgrupada grupos={grupos} columnas={columnas} getRowId={(f) => f.id} … arrastre={{ onSoltar }} pie={(col, filas) => …} />
</Section>`}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/database-views.json" />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/componentes/toolbar", label: "Toolbar", text: "Los filtros de la página, que se suman a los de la vista." },
          { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "Para listas sin vistas guardadas." },
          { href: "/ds/influencer/componentes#tareas", label: "Página de Tareas", text: "El primer uso, en el workspace de influencers." },
        ]}
      />
    </DocPage>
  )
}
