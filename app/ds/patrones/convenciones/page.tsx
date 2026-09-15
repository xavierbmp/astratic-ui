import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"

export const metadata = { title: "Convenciones" }

export default function ConvencionesPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Convenciones"
      lead="Las reglas fijas de ubicación y comportamiento. Valen para cualquier portal y cualquier página; si dos páginas del mismo portal las aplican, se sienten iguales aunque las haya hecho gente distinta en meses distintos."
    >
      <DocSection id="ubicacion" title="Dónde va cada cosa" lead="Orden de lectura de arriba abajo y de izquierda a derecha. Lo que se lee primero, arriba; lo que se hace, a la derecha.">
        <SpecTable
          columns={["Elemento", "Ubicación", "Regla"]}
          rows={[
            ["Navegación", "Sidebar izquierda, 256 px", "Grupos con etiqueta (por bloque o área), ítems con icono y contador ámbar de pendientes. Se colapsa a iconos."],
            ["Migas y buscador", "Cabecera de 48 px", "Migas «Bloque › Página › Registro» a la izquierda; buscador global ⌘K, campana y tema a la derecha."],
            ["Título y descripción", "Arriba de la página", "Título 27 px semibold y una línea de descripción. Sin icono."],
            ["Acciones de página", "Derecha del título", "Sub-navegación de la página (tabs) y acciones secundarias de toda la página (Exportar, Editar fases). Nunca la acción principal."],
            ["Cifras", "Fila bajo el título", "De 3 a 5 tarjetas, nunca más. Cada una: icono + etiqueta, cifra grande, una línea de apoyo (delta o alerta)."],
            ["Toolbar", "Justo encima del bloque de operación", "Buscador · filtros · [espacio] · conmutador de vistas · acción principal. En ese orden y sin excepciones."],
            ["Bloque de operación", "Centro, ocupa el resto de la altura", "Un solo bloque. Cabecera con icono, nombre, contador y acciones del bloque; cuerpo con la vista activa; pie con paginación."],
            ["Panel de información", "Derecha, 320 px, misma altura que el bloque", "Bloques de apoyo apilados y personalizables. Nunca contiene acciones sobre los registros."],
            ["Detalle de un registro", "Sheet lateral derecho, 440 px", "Se abre al pulsar la fila o la tarjeta, por encima de la página. La página sigue debajo con su estado."],
            ["Barra de selección", "Flotante, fija al pie de la ventana y centrada", "Aparece con la primera fila marcada: contador, acciones con icono y X para deseleccionar. Se ve aunque la tabla sea más larga que la pantalla."],
            ["Toasts", "Abajo a la derecha", "Éxito y error. Con «Deshacer» cuando la acción sea reversible."],
          ]}
        />
      </DocSection>

      <DocSection id="botones" title="Botones: cuál y dónde">
        <SpecTable
          columns={["Variante", "Uso", "Ubicación"]}
          rows={[
            ["Primario (negro)", "La única acción principal de la página: crear el registro que gestiona la página («Nuevo registro», «Nueva campaña»).", "Último elemento de la toolbar, a la derecha. Uno por página."],
            ["Outline", "Acciones secundarias con peso: Exportar, Importar, Editar fases, Configurar.", "Acciones de página (derecha del título) o cabecera del bloque."],
            ["Ghost", "Acciones dentro de listas y barras: acciones en bloque, acciones de fila al pasar el ratón, «Ver todas».", "Barra de selección, filas, cabeceras de sección."],
            ["Icono (ghost)", "Menú «más» (…), cerrar, ajustes de un panel.", "Extremo derecho del elemento al que afecta."],
            ["Destructivo", "Solo en el diálogo de confirmación, nunca como botón suelto en la página.", "Pie del diálogo, a la derecha."],
            ["Link", "Navegar a otra página desde texto («Ver registros»).", "Cabecera de sección o texto de apoyo."],
          ]}
        />
        <Rules
          items={[
            <>Todo botón lleva <strong>icono lucide + verbo + objeto</strong>: «Nuevo registro», «Exportar», «Avanzar fase». Nunca «OK», «Aceptar», «Click aquí».</>,
            <>Tamaño <code>default</code> (32 px) en toolbars, acciones de página y pies de sheet; <code>sm</code> (28 px) dentro de tablas, barras de selección y cabeceras de sección.</>,
            <>El botón principal aparece <strong>una vez</strong>. Si una página necesita dos acciones de creación, una es principal y la otra outline, o van en un menú desplegable del principal.</>,
            <>Los botones de icono solo llevan <code>aria-label</code>. Los de texto no llevan tooltip.</>,
          ]}
        />
      </DocSection>

      <DocSection id="vistas" title="Vistas del bloque de operación">
        <Prose>
          <p>
            Cuando la naturaleza de la página admite más de una forma de ver los mismos datos (una tabla para comparar,
            un kanban para mover por fase, un calendario para plazos), el <strong>conmutador de vistas</strong> es un control
            segmentado de iconos (fondo gris, la vista activa en blanco, igual que las pestañas), siempre en la toolbar, justo
            antes de la acción principal. Iconos fijos:
          </p>
        </Prose>
        <SpecTable
          columns={["Vista", "Icono", "Cuándo"]}
          rows={[
            ["Tabla", "table-2", "Comparar muchos campos, ordenar, seleccionar en bloque. Vista por defecto de las páginas de registros."],
            ["Lista", "list", "Pocos campos por fila, lectura rápida, móvil."],
            ["Kanban", "columns-3", "El registro tiene una fase y se mueve entre fases arrastrando."],
            ["Calendario", "calendar-days", "El registro tiene fecha y la fecha manda (eventos, plazos)."],
            ["Tarjetas", "layout-grid", "El registro es visual (personas, talentos, productos)."],
          ]}
        />
        <Rules
          items={[
            <>La vista elegida se recuerda por página con <code>usePageView</code> (en <code>localStorage</code> con la clave de la página). En móvil la tabla desaparece del conmutador y se usa la siguiente vista: lista o tarjetas.</>,
            <>Cambiar de vista <strong>no</strong> cambia búsqueda, filtros ni selección: los tres se comparten entre vistas.</>,
            <>El contador de la cabecera del bloque cuenta lo filtrado, no el total.</>,
            <>Los filtros de la toolbar se aplican a la vista; los ajustes de una vista (columnas visibles, agrupar) van en el menú «…» de la cabecera del bloque.</>,
          ]}
        />
      </DocSection>

      <DocSection id="interaccion" title="Interacciones fijas">
        <SpecTable
          columns={["Gesto", "Resultado"]}
          rows={[
            ["Pulsar una fila o tarjeta", "Abre el sheet de detalle del registro. La fila entera es clicable y muestra un chevron al pasar el ratón."],
            ["Marcar un checkbox", "Selecciona la fila sin abrir el detalle. Aparece la barra de selección."],
            ["Checkbox de la cabecera", "Selecciona o deselecciona todo lo visible en la página actual."],
            ["Pulsar una cabecera de columna", "Ordena ascendente → descendente → sin orden. Solo columnas con flecha."],
            ["Arrastrar una tarjeta de kanban", "Cambia la fase del registro. Se confirma con un toast si el cambio tiene efectos (facturas, avisos)."],
            ["Escape o clic fuera", "Cierra sheet, menú o diálogo sin guardar."],
            ["⌘K", "Abre el buscador global: páginas y registros."],
            ["Acción destructiva", "Siempre pide confirmación en un AlertDialog con el nombre de lo que se borra. Nunca window.confirm."],
            ["Acción reversible", "Se ejecuta al momento y el toast ofrece «Deshacer»."],
          ]}
        />
      </DocSection>

      <DocSection id="sheet" title="El sheet de detalle">
        <Prose>
          <p>
            El detalle de un registro se abre por encima de la página, en un panel lateral derecho de 440 px (400 para
            fichas simples). Tiene <strong>tres zonas</strong> fijas:
          </p>
        </Prose>
        <Rules
          items={[
            <><strong>Cabecera:</strong> avatar o monograma, nombre, subtítulo (código · categoría), badge de estado; debajo, acciones secundarias outline («Editar», «Copiar enlace») y el menú «…» con duplicar, archivar y eliminar.</>,
            <><strong>Cuerpo:</strong> pestañas de tipo línea si hay más de un bloque de información (Resumen, Actividad, Archivos). Dentro, secciones con título de 13 px y una lista definición «etiqueta · valor».</>,
            <><strong>Pie:</strong> «Cerrar» ghost a la izquierda de la acción principal del registro («Avanzar fase», «Enviar», «Cobrar»). Una sola acción principal.</>,
            <>Los campos editables inline (fase, responsable) se editan en el propio cuerpo con un <code>Select</code> pequeño; el resto se edita con «Editar», que abre un formulario en un <code>Dialog</code>.</>,
            <>Un registro con página propia (campaña, evento) usa el sheet como vista rápida y ofrece «Abrir página» en la cabecera.</>,
            <>El registro abierto se refleja en la URL (<code>?registro=id</code>) con <code>window.history.replaceState</code>, sin recargar: «Copiar enlace» copia esa dirección y cualquier otra página (el dashboard, un aviso, un email) puede enlazar directamente al registro. La página de servidor lee el parámetro y abre el sheet al cargar.</>,
          ]}
        />
      </DocSection>

      <DocSection id="formularios" title="Formularios">
        <Rules
          items={[
            <>Crear y editar registros sencillos: <code>Dialog</code> centrado, ancho 480 px, campos en una columna. Registros complejos: página propia con secciones.</>,
            <>Etiqueta encima del campo, ayuda debajo en gris, error debajo en rojo. Nunca placeholder como etiqueta.</>,
            <>Botones del pie: «Cancelar» ghost + acción principal («Guardar cambios», «Crear registro»). Deshabilitados hasta que el formulario cambie o mientras se envía.</>,
            <>Al guardar: toast de éxito, se cierra el diálogo y la fila afectada se actualiza en su sitio. Nunca recargar la página.</>,
            <>Validación con zod compartida entre cliente y servidor. Los mensajes de error dicen qué hacer, no qué falló: «Escribe un email válido».</>,
          ]}
        />
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Una acción principal negra al final de la toolbar.",
            "Fila clicable que abre el sheet; checkbox que selecciona.",
            "Badges de estado con los cinco tonos fijos.",
            "Confirmación en diálogo para borrar; toast con «Deshacer» para archivar.",
            "Contadores en pills grises junto al título del bloque.",
          ]}
          donts={[
            "Botones azules, verdes o de marca para acciones.",
            "Acciones en bloque en la parte superior de la tabla.",
            "Avisos de texto en la toolbar o encima de la tabla.",
            "Varios bloques de operación apilados en la misma página.",
            "Modales para ver un registro: el detalle es un sheet.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Las zonas y sus medidas." },
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Cómo son los filtros y cómo se combinan." },
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "El componente que implementa la fila de controles." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "Cabecera, cuerpo y pie." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
