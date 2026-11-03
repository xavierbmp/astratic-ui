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
  paginaRegistro={{ clave: "marca", ruta: (id) => \`/marcas/\${id}\` }}
  onEscribir={(cambios) => setMarcas((ms) => aplicarCambios(ms, cambios, escribirEnMarca))}
  onNuevo={() => setNueva(true)}          // o onCrear: el formulario de la base
  ajustes={[{ id: "reglas", label: "Automatizaciones", icono: WorkflowIcon, onSelect: abrirReglas }]}
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

const INICIO = `// La primera celda de una base. \`valor\` sigue siendo su texto, para buscar, ordenar y copiar.
{
  id: "nombre", nombre: "Marca", tipo: "inicio", principal: true,
  inicio: (m) => ({
    nombre: m.nombre,
    secundario: dominioDe(m.web),
    imagen: m.logoUrl,
    forma: "entidad",
    enlaces: enlaces(enlaceWeb(m.web), enlaceInstagram(m.instagram, m.seguidores)),
  }),
  valor: (m) => m.nombre,
}
// Lo que va dentro se oculta como columna y sigue sirviendo para filtrar y ordenar.
{ id: "web", nombre: "Web", tipo: "url", enInicio: true, valor: (m) => m.web }`

/** Documentación de la base de datos al estilo Airtable: la pieza de toda lista de registros. */
export default function BaseDeDatosPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Base de datos"
      lead="Toda lista de registros es una base de datos: por fuera una tabla limpia, por dentro una hoja de cálculo. Vistas en pestañas como las de Chrome, vistas personales (cuadrícula, kanban, galería y calendario), campos de muchos tipos que se ocultan y se crean, filtros anidados con los operadores de Airtable, grupos, orden, color, altura de fila, totales, selección y copiar y pegar como en Excel, y la ficha de siempre, encima o integrada a la derecha."
    >
      <DocSection id="demo" title="Pruébala">
        <Example padded={false} description="Las vistas y lo que cambies se quedan en este navegador. En un portal, en su base de datos.">
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
            Cuando una página tiene algo propio que vale la pena (las carpetas de las ideas, el calendario de
            tareas a mano, el calendario de contenidos), la base entra entera y lo propio se queda en su lateral o al lado.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="anatomia" title="Anatomía">
        <SpecTable
          columns={["Parte", "Qué hace"]}
          rows={[
            ["Pestañas de vistas (PestanasVistas)", "Encima del bloque, como las de Chrome. La primera es la vista de base: no se borra y es la plantilla de las demás. «+» abre una nueva con la base como esté. Pasadas diez se difuminan; al pulsar la última se coloca en medio. A su derecha, los botones generales de la página."],
            ["Cabecera (BarraBase)", "Izquierda: icono y nombre de la vista, que se escribe ahí mismo; el icono abre su menú (ver como, cambiar el icono, duplicar, eliminar). Centro: el campo del kanban o del calendario, ocultar campos, filtro, agrupar, ordenar, color, altura y buscar. Derecha: los botones principales y, al final del todo, los ajustes de la base."],
            ["Vista", "Tabla (Rejilla), kanban (el Kanban del kit), galería o calendario. En el móvil, una lista de tarjetas con los mismos filtros."],
            ["Pie", "En la tabla: «+» para un registro nuevo, cuántos hay y el resumen de cada columna (suma, media, vacíos, únicos, fechas…)."],
            ["Registro", "Se abre desde su celda de inicio: en su página (paginaRegistro) o, sin ella, en la ficha de cada objeto (DetailSheet), encima o al lado de la tabla."],
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
            <>Tipos que se crean: texto, texto largo, número, moneda, porcentaje, fecha, selección única y múltiple, casilla, URL, email, teléfono, calificación y progreso (una barra de 0 a su total: «40 %» o «2 de 3»). Nada de fórmulas, adjuntos ni búsquedas.</>,
            <>
              <strong>Registro vinculado</strong> (<code>vinculo</code>): otro registro (la marca de un contacto). Se ve como ficha con sus iniciales, se elige
              de una lista con buscador y al pulsarlo abre su ficha (<code>onAbrirVinculo</code>). Solo lo ponen las páginas en sus campos de serie.
            </>,
            <>
              <strong>Estados</strong>: con <code>opcionesDeEstados(ESTADOS_…)</code> llevan su tono y en la tabla se ven con su icono y su texto (<code>EstadoEnLinea</code>). Las demás opciones, con el punto de su color (<code>OpcionEnLinea</code>); la selección múltiple, en fichas.
            </>,
            <>
              <strong>Ajustes de un campo</strong>: doble clic en su cabecera (o «Editar el campo» de su menú). Uno propio se edita entero (nombre, tipo,
              opciones con su color y su orden, formato y descripción); de uno de serie, cada persona ordena y colorea sus opciones (<code>AjusteCampo</code>,
              en <code>ConfigBase.ajustes</code>; los estados conservan su tono). En «Colores», reglas que pintan la celda o la fila según su valor. Dos campos
              no se llaman igual: el editor lo avisa al escribir y no deja crearlo.
            </>,
            <>
              El formulario de alta (<code>onCrear</code>) sale de los mismos campos y se configura desde su engranaje: qué campos salen y en qué orden. En los
              campos propios de selección, escribir una opción que no existe la crea, igual que en la celda. Si la página tiene su diálogo, <code>onNuevo</code>.
            </>,
            <>
              <strong>Importar</strong> (<code>onImportar</code>): «Importar» junto a la acción principal abre un Excel, un CSV o lo pegado de una hoja de
              cálculo; cada columna va al campo que se le parece por su nombre (se cambia a mano, con un ejemplo de cada una) y cada celda se lee como al
              pegarla. Lo que no se puede leer se queda vacío y se avisa. La página crea un registro por fila.
            </>,
            <>El «+» para crear un campo se queda pegado a la derecha cuando faltan columnas por ver, con lo de debajo difuminado: no hace falta ir al final.</>,
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
              <strong>Agrupar</strong> hasta tres niveles, <strong>ordenar</strong> por varios campos, <strong>color</strong> (la marca de la fila por un campo
              de selección y reglas que pintan la fila entera o solo la celda de su campo; manda la primera que se cumple), <strong>altura</strong> de fila y
              encabezados con ajuste. Lo activo se marca en el tono de la marca.
            </>,
            <>
              <strong>Kanban</strong>: columnas de una selección o de un vínculo; arrastrar cambia el valor (la página puede pasarlo por sus acciones, como
              ganar o perder una propuesta). <code>kanban.resumen</code> pone lo que suma cada columna, <code>kanban.plegadas</code>, las que empiezan plegadas, y
              <code>kanban.acciones</code>, botones al pie de una tarjeta para mover el registro sin abrirlo (ganada o perdida en las que se negocian).
            </>,
            <>
              <strong>Tarjetas</strong>: con celda de inicio, kanban y galería usan <code>TarjetaPerfil</code> (imagen grande, foto, nombre, frase, tres cifras y logos), con <code>portada</code> para la imagen. <strong>Calendario</strong> sobre un campo de fecha; si la fecha
              se puede escribir, se arrastra a otro día.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="inicio" title="Celda de inicio">
        <Prose>
          <p>
            La primera celda de toda base es de tipo <code>inicio</code>: junta en una sola celda, compacta, quién es el registro. Arriba, su nombre y su{" "}
            <code>@</code> o su dominio; debajo, sus logos reales con sus cifras. Pulsarla abre la página del registro; pulsar un logo abre ese enlace. Es el
            único campo que no se edita en la tabla. Lo que lleva dentro se declara con <code>enInicio</code>: sirve para filtrar y ordenar, y no sale como columna.
          </p>
        </Prose>
        <CodeBlock code={INICIO} lang="ts" />
      </DocSection>

      <DocSection id="cuadricula" title="La tabla">
        <Rules
          items={[
            <>Sin rayas entre columnas, una raya fina entre filas y la cabecera en gris con las flechas de ordenar. Al pasar el ratón, la fila se levanta (<code>shadow-fila</code>).</>,
            <>Toda celda se edita encima: una lista o una fecha al primer clic; un texto o un número pulsando la celda ya elegida o escribiendo; una casilla con su clic. Enter, Tab y las flechas se mueven como en una hoja de cálculo; ⌘Z deshace.</>,
            <>Selección de celdas con Mayús o arrastrando, copiar y pegar con Excel (TSV y HTML), el tirador para rellenar hacia abajo.</>,
            <>Columnas que se arrastran y se ensanchan, columnas fijas con su asa, menú de cada cabecera (editar, insertar, ordenar, filtrar, agrupar, ocultar).</>,
            <>A la izquierda, la casilla para marcar la fila. Lo marcado va a la <code>BulkBar</code>.</>,
            <>Miles de filas sin notarse: las filas son virtuales (<code>@tanstack/react-virtual</code>).</>,
          ]}
        />
      </DocSection>

      <DocSection id="pagina" title="En una página">
        <Prose>
          <p>
            La base va dentro de <code>WorkGrid</code> y ocupa lo que queda de pantalla, a todo el ancho. Las cifras de la cabecera pueden filtrar la vista con <code>base.cambiar</code>. Lo que se configura de vez en cuando va en sus ajustes (<code>ajustes</code> y <code>useBloquesEnAjustes</code>). La ficha se abre encima o, si alguien lo elige en los ajustes, al lado (prop <code>ficha</code> con <code>usePanelFicha</code>). Las páginas con una vista propia que no es una base (un calendario a
            medida) usan <code>BarraFiltros</code>: la misma barra, solo con la vista, el filtro y buscar. Las dos, y el encabezado de la página de un registro, se montan sobre <code>BarraBloque</code>: un solo encabezado de 48 px para todo bloque de trabajo.
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
