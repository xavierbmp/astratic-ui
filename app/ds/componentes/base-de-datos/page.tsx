import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { BaseDatosDemo } from "@/components/docs/examples/base-datos-demo"

export const metadata = { title: "Base de datos" }

const USO = `// La página pone los datos y lo que pasa al escribir; la base hace el resto.
const campos = React.useMemo(() => camposBaseMarcas({ marcas, contactos, resumenes, propios }), [...])
const base = useBase({ campos, deSerie: vistasDeSerieMarcas(campos), inicial: config, guardar })

<BaseDatos
  clave="ws-marcas"
  base={base}
  campos={campos}
  filas={marcas}
  getId={(m) => m.id}
  hoy={hoy}
  objeto={{ singular: "marca", plural: "marcas", nuevo: "Nueva marca" }}
  abiertoId={abiertaId}
  onAbrir={abrir}
  onEscribir={(cambios) => setMarcas((ms) => aplicarCambios(ms, cambios, escribirEnMarca))}
  onNuevo={() => setNueva(true)}          // o onCrear: el formulario de la base
  onBorrar={(ids) => borrar.pedir(ids)}
  propios={propios} onGuardarCampo={...} onBorrarCampo={...}
  onAbrirVinculo={(campo, id) => abrirMarca(id)}
>
  {(visibles, ficha) => <MarcaSheet lista={visibles} abiertaId={abiertaId} abrir={abrir} ficha={ficha} />}
</BaseDatos>`

const CAMPO = `// Un campo de serie: se oculta, no se borra. Lo calculado lleva soloLectura.
{ id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, opciones: opcionesDeMarcas(marcas), valor: (c) => c.marcaId ?? null }
{ id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_PROPUESTA), valor: (p) => p.estado }
{ id: "importe", nombre: "Importe", tipo: "moneda", soloLectura: true, valor: (p) => importeDe(p, tarifas) }`

/** Documentación de la base de datos al estilo Airtable: la pieza de toda lista de registros. */
export default function BaseDeDatosPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Base de datos"
      lead="Toda lista de registros es una base de datos con la colocación y el funcionamiento de Airtable, y los colores e iconos de Astratic UI: vistas personales (cuadrícula, kanban, galería y calendario), campos de muchos tipos que se ocultan y se crean, filtros anidados con los operadores de Airtable, grupos, orden, color, altura de fila, totales, selección y copiar y pegar como en Excel, y la ficha de siempre, encima o integrada a la derecha."
    >
      <DocSection id="demo" title="Pruébala">
        <Example padded={false} description="Las vistas, el ancho del lateral y lo que cambies se quedan en este navegador. En un portal, en su base de datos.">
          <BaseDatosDemo />
        </Example>
      </DocSection>

      <DocSection id="cuando" title="Cuándo se usa">
        <Prose>
          <p>
            <strong>Siempre que la página enseñe registros</strong>: contactos, marcas, propuestas, collabs, cobros, tareas, ideas. No hay otra forma de hacer
            una lista: ni toolbars de filtros sueltos, ni tablas con columnas a mano, ni vistas en pestañas. Lo único que queda fuera es una tabla corta y fija
            dentro de una ficha (las tarifas, las facturas de una collab), que es <code>DataTable</code>.
          </p>
          <p>
            Regla de Xavier (2026-10-13): <strong>la colocación es la de Airtable; los colores y los iconos, los nuestros</strong>. Y se sustituye lo que
            había, sin mezclar piezas viejas con nuevas. Cuando una página tiene algo propio que vale la pena (las carpetas de las ideas, el calendario de
            tareas a mano, el calendario de contenidos), la base entra entera y lo propio se queda en su lateral o al lado.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="anatomia" title="Anatomía">
        <SpecTable
          columns={["Parte", "Qué hace"]}
          rows={[
            ["Barra (BarraBase)", "Lateral, nombre de la vista con su menú (todas las vistas y «Crear vista»), y a la derecha lo que tiene su tipo: el campo del kanban o del calendario, ocultar campos, filtro, agrupar, ordenar, color, altura y buscar. Al final la acción principal y el botón de la ficha integrada."],
            ["Lateral (LateralVistas)", "«Crear vista» por tipo, buscar una vista y la lista, que se ordena arrastrando. Se ensancha arrastrando su borde. Una página puede poner el suyo (`lateral`): las carpetas, un calendario."],
            ["Vista", "Cuadrícula (Rejilla), kanban (el Kanban del kit), galería o calendario. En el móvil, una lista de tarjetas con los mismos filtros."],
            ["Pie", "En la cuadrícula: «+» para un registro nuevo, cuántos hay y el resumen de cada columna (suma, media, vacíos, únicos, fechas…)."],
            ["Ficha", "La de cada objeto (`DetailSheet`), encima o integrada a la derecha (ficha propia de la base o la columna del panel de `WorkGrid`)."],
          ]}
        />
      </DocSection>

      <DocSection id="campos" title="Campos">
        <Prose>
          <p>
            Cada base declara sus campos de serie en <code>lib/&lt;objeto&gt;/base-*.ts</code> como <code>DefCampo</code>: id, nombre, tipo, opciones y{" "}
            <code>valor(fila)</code>, y una función <code>escribirEn…</code> que pone un valor en el registro con sus reglas. Los de serie se ocultan, no se
            borran; lo calculado lleva <code>soloLectura</code>. Cada persona crea los suyos desde la cabecera (se guardan en <code>CampoPropio</code> y sus
            valores en la columna <code>valores</code> del registro).
          </p>
        </Prose>
        <CodeBlock code={CAMPO} lang="ts" />
        <Rules
          items={[
            <>Tipos que se crean: texto, texto largo, número, moneda, porcentaje, fecha, selección única y múltiple, casilla, URL, email, teléfono y calificación. Nada de fórmulas, adjuntos ni búsquedas.</>,
            <>
              <strong>Registro vinculado</strong> (<code>vinculo</code>): otro registro (la marca de un contacto). Se ve como ficha con sus iniciales, se elige
              de una lista con buscador y al pulsarlo abre su ficha (<code>onAbrirVinculo</code>). Solo lo ponen las páginas en sus campos de serie.
            </>,
            <>
              <strong>Estados</strong>: con <code>opcionesDeEstados(ESTADOS_…)</code> llevan su tono y se ven como <code>StatusBadge</code>. Las demás opciones,
              con los colores <code>opcion-*</code>.
            </>,
            <>El formulario de alta (<code>onCrear</code>) sale de los mismos campos y se configura desde su engranaje: qué campos salen y en qué orden. Si la página tiene su diálogo, <code>onNuevo</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="vistas" title="Vistas, filtros y el resto de la barra">
        <Rules
          items={[
            <>
              <strong>Personales</strong>: cada persona tiene las suyas (<code>useBase</code>, guardadas con <code>guardar</code>; en el portal, en{" "}
              <code>ConfigBase</code>). Cada cambio de la vista se guarda al momento, como en Airtable. Las de serie solo son el punto de partida.
            </>,
            <>
              <strong>Filtro</strong>: los operadores de Airtable por tipo (contiene, es, es cualquiera de, tiene todos, está vacío, es antes de…, fechas
              relativas a hoy) y grupos dentro de grupos hasta tres niveles. Un solo juego de operadores en todo el kit (<code>lib/filtros/core.ts</code>).
            </>,
            <>
              <strong>Agrupar</strong> hasta tres niveles, <strong>ordenar</strong> por varios campos, <strong>color</strong> por un campo de selección o por
              condiciones, <strong>altura</strong> de fila y encabezados con ajuste. Lo activo se marca en el tono de la marca.
            </>,
            <>
              <strong>Kanban</strong>: columnas de una selección o de un vínculo; arrastrar cambia el valor (la página puede pasarlo por sus acciones, como
              ganar o perder una propuesta). <code>kanban.resumen</code> pone lo que suma cada columna y <code>kanban.plegadas</code>, las que empiezan plegadas.
            </>,
            <>
              <strong>Galería</strong> con <code>portada</code> para la imagen de cada tarjeta. <strong>Calendario</strong> sobre un campo de fecha; si la fecha
              se puede escribir, se arrastra a otro día.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="cuadricula" title="La cuadrícula">
        <Rules
          items={[
            <>Celdas que se editan escribiendo o con doble clic; Enter, Tab y las flechas se mueven como en una hoja de cálculo; ⌘Z deshace.</>,
            <>Selección de celdas con Mayús o arrastrando, copiar y pegar con Excel (TSV y HTML), el tirador para rellenar hacia abajo.</>,
            <>Columnas que se arrastran y se ensanchan, columnas fijas con su asa, menú de cada cabecera (editar, insertar, ordenar, filtrar, agrupar, ocultar).</>,
            <>A la izquierda, el número de fila, la casilla para marcarla y el botón que abre la ficha. Lo marcado va a la <code>BulkBar</code>.</>,
            <>Miles de filas sin notarse: las filas son virtuales (<code>@tanstack/react-virtual</code>).</>,
          ]}
        />
      </DocSection>

      <DocSection id="pagina" title="En una página">
        <Prose>
          <p>
            Sola (Contactos), la base ocupa lo que queda de pantalla. Con cifras y panel (Pipeline, Marcas, Collabs, Cobros), va dentro de{" "}
            <code>WorkGrid</code>: las cifras arriba (pueden filtrar la vista con <code>base.cambiar</code>), el panel a la derecha y la ficha integrada usa la
            columna del panel (prop <code>ficha</code> con <code>usePanelFicha</code>). Las páginas con una vista propia que no es una base (un calendario a
            medida) usan <code>BarraFiltros</code>: la misma barra, solo con la vista, el filtro y buscar.
          </p>
        </Prose>
        <CodeBlock code={USO} lang="tsx" />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/componentes/toolbar", label: "Barra de la base", text: "BarraBase y BarraFiltros, botón a botón." },
          { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Los operadores por tipo y cómo se guardan las vistas." },
          { href: "/ds/componentes/detail-sheet", label: "Ficha", text: "Lo que se abre al pulsar un registro." },
        ]}
      />
    </DocPage>
  )
}
