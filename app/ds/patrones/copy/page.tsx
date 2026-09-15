import { ArchiveIcon, ArrowRightIcon, DownloadIcon, LayersIcon, PlusIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/app/states"
import { fmt, initials } from "@/lib/format"

export const metadata = { title: "Copy y formato" }

export default function CopyPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Copy y formato"
      lead="Cómo se escribe y cómo se formatea todo lo que el usuario lee: botones, títulos, mensajes, cifras y fechas. Las reglas son pocas y no admiten excepciones por gusto. Si un texto suena distinto al resto del portal, está mal."
    >
      <DocSection
        id="voz"
        title="Voz"
        lead="Español de España, de tú, frases cortas. Se escribe como se le explica algo a un compañero: sin ceremonias y sin entusiasmo fingido."
      >
        <Rules
          items={[
            <>
              Solo la <strong>primera palabra</strong> lleva mayúscula: «Nuevo registro», «Guardar cambios», «Próximos vencimientos». Nunca «Nuevo
              Registro».
            </>,
            <>
              Frases cortas y en presente. Una idea por frase. Si una descripción necesita dos frases, la segunda sobra o es una ayuda de campo.
            </>,
            <>
              De tú. En imperativo cuando se pide algo («Escribe un email válido») y en indicativo cuando se informa («Se ha archivado el registro»).
            </>,
            <>
              Sin guiones largos: se usan comas, dos puntos o un punto. Los puntos suspensivos solo en placeholders de búsqueda («Buscar registro…»)
              y en textos truncados, nunca como adorno. Sin exclamaciones ni saludos («¡Bienvenido!»): el portal no saluda, muestra el trabajo.
            </>,
            <>
              Sin anglicismos con equivalente en los textos que ve el usuario: «archivo» y no «file», «etiqueta» y no «tag», «plazo» y no «deadline»,
              «responsable» y no «owner». Se mantienen por convención del sector <strong>dashboard</strong>, <strong>CRM</strong> y{" "}
              <strong>roster</strong>.
            </>,
            <>Comillas angulares «así» para citar textos de la interfaz dentro de otro texto. Las comillas rectas quedan para el código.</>,
          ]}
        />
      </DocSection>

      <DocSection id="textos" title="Botones, títulos y etiquetas" lead="Cada tipo de texto tiene un patrón gramatical fijo. Si dudas, mira la tabla; no inventes.">
        <SpecTable
          columns={["Elemento", "Patrón", "Ejemplo"]}
          rows={[
            ["Botón", "Verbo + objeto, con icono lucide delante. Nunca «OK», «Aceptar», «Enviar» a secas ni «Sí».", "«Nuevo registro», «Exportar», «Guardar cambios», «Avanzar fase»"],
            ["Título de página", "Sustantivo plural del registro. Sin «Gestión de», sin «Listado de», sin icono.", "«Registros», «Campañas», «Facturas»"],
            ["Descripción de página", "Una línea: qué hay y qué se hace con ello.", "«Base de datos de registros y su fase, con vistas de tabla, lista y kanban.»"],
            ["Título de bloque", "Sustantivo. El bloque principal repite el título de la página.", "«Registros», «Por fase», «Próximos vencimientos»"],
            ["Cabecera de columna", "Sustantivo singular, sin dos puntos.", "«Registro», «Responsable», «Valor», «Actualizado»"],
            ["Etiqueta de campo", "Sustantivo sin dos puntos; la ayuda debajo, en una frase.", "«Vencimiento» y debajo «Fecha límite de pago»"],
            ["Placeholder", "Qué se busca o un ejemplo. Nunca sustituye a la etiqueta.", "«Buscar registro o código…», «nombre@empresa.com»"],
            ["Chip de filtro", "Dimensión, dos puntos, valor.", "«Fase: Propuesta», «Responsable: Usuario 2»"],
            ["Menú «…»", "Verbo, con objeto solo si hace falta.", "«Duplicar», «Archivar», «Eliminar»"],
            ["Tabs y segmentos", "Una o dos palabras.", "«Todos», «Míos», «Sin asignar», «Vencidos»"],
            ["Contador", "Solo el número, en pill.", "«12», nunca «12 items»"],
          ]}
        />
        <Example title="Botones bien nombrados" description="Verbo y objeto, icono delante. La jerarquía la da la variante, no el texto.">
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <PlusIcon /> Nuevo registro
            </Button>
            <Button variant="outline">
              <DownloadIcon /> Exportar
            </Button>
            <Button variant="outline">
              <LayersIcon /> Editar fases
            </Button>
            <Button variant="ghost">
              <ArrowRightIcon /> Avanzar fase
            </Button>
            <Button variant="ghost">
              <ArchiveIcon /> Archivar
            </Button>
          </div>
        </Example>
      </DocSection>

      <DocSection
        id="mensajes"
        title="Estados vacíos, errores, toasts y confirmaciones"
        lead="Los mensajes dicen qué hacer. El sistema no se disculpa, no celebra y no explica su funcionamiento interno."
      >
        <SpecTable
          columns={["Mensaje", "Patrón", "Ejemplo"]}
          rows={[
            ["Estado vacío", "Qué es y cómo poblarlo, con el botón de la acción debajo.", "«Aún no hay registros. Crea el primero con «Nuevo registro».»"],
            ["Vacío por filtro", "Qué ha pasado y cómo salir, con «Quitar filtros».", "«Ningún registro coincide. Prueba con otra búsqueda o quita algún filtro.»"],
            ["Error de campo", "Qué hacer, no qué falló. Nunca códigos ni «inválido».", "«Escribe un email válido», «Elige una fase»"],
            ["Error de carga", "Título fijo de ErrorState y botón «Reintentar».", "«No se ha podido cargar»"],
            ["Toast de éxito", "Participio, corto, con el objeto. «Deshacer» si la acción es reversible.", "«Registro archivado», «3 registros avanzados de fase», «Cambios guardados»"],
            ["Toast de error", "Qué hacer.", "«No se ha guardado. Revisa la conexión e inténtalo de nuevo.»"],
            ["Confirmación", "Pregunta con el nombre del objeto, consecuencia en una frase y botón con el verbo.", "«¿Eliminar Registro 3?» «Se borrará con sus notas y archivos. No se puede deshacer.» Botón: «Eliminar»"],
            ["Cargando", "Sin texto: skeleton con aria-label «Cargando».", "TableSkeleton, KanbanSkeleton, KpiSkeleton"],
          ]}
        />
        <Example title="Estado vacío bien escrito" description="Dice qué falta y cómo se resuelve; el botón repite la acción principal de la página." padded={false}>
          <EmptyState
            title="Aún no hay registros"
            description="Crea el primero con «Nuevo registro»."
            action={
              <Button size="sm">
                <PlusIcon /> Nuevo registro
              </Button>
            }
          />
        </Example>
      </DocSection>

      <DocSection
        id="formato"
        title="Cifras y fechas"
        lead="Todo pasa por lib/format.ts, que usa Intl con es-ES. Nada se formatea a mano y nada se escribe con formato fijo en el JSX."
      >
        <SpecTable
          columns={["Función", "Devuelve", "Uso"]}
          rows={[
            [<code key="eur">fmt.eur(799342)</code>, <span key="v" className="tabular-nums">{fmt.eur(799342)}</span>, "Importes en tablas, cifras y kanban. Sin decimales."],
            [<code key="eurd">fmt.eurDecimals(1234.5)</code>, <span key="v" className="tabular-nums">{fmt.eurDecimals(1234.5)}</span>, "Documentos, totales de factura y cualquier sitio donde el céntimo importa."],
            [<code key="num">fmt.num(12345)</code>, <span key="v" className="tabular-nums">{fmt.num(12345)}</span>, "Cantidades: registros, seguidores, unidades."],
            [<code key="pct">fmt.pct(32)</code>, <span key="v" className="tabular-nums">{fmt.pct(32)}</span>, "Porcentajes. Recibe puntos porcentuales (32, no 0,32), igual que KpiCard. Un decimal como máximo."],
            [<code key="delta">fmt.delta(8.4)</code>, <span key="v" className="tabular-nums">{fmt.delta(8.4)}</span>, "Variación con signo en tablas comparativas y texto de apoyo. Misma convención: puntos porcentuales."],
            [<code key="compact">fmt.compact(1200000)</code>, <span key="v" className="tabular-nums">{fmt.compact(1200000)}</span>, "Cifras grandes en KPI y ejes de gráficos. 640000 da «640 k»."],
            [<code key="date">fmt.date("2026-09-24")</code>, <span key="v" className="tabular-nums">{fmt.date("2026-09-24")}</span>, "Fecha corta en tablas, listas y chips."],
            [<code key="dateLong">fmt.dateLong("2026-10-11")</code>, <span key="v" className="tabular-nums">{fmt.dateLong("2026-10-11")}</span>, "Sheet, documentos y confirmaciones."],
            [<code key="time">fmt.time("2026-09-24T13:00")</code>, <span key="v" className="tabular-nums">{fmt.time("2026-09-24T13:00")}</span>, "Horas en formato de 24 h: eventos, plazos con hora, actividad."],
            [<code key="relative">fmt.relative(d)</code>, <span key="v" className="tabular-nums">hace 2 horas</span>, "Tiempo relativo solo en actividad; a partir de 30 días devuelve la fecha corta."],
            [<code key="initials">initials("Usuario Dos")</code>, <span key="v">{initials("Usuario Dos")}</span>, "Monogramas de AvatarInitials."],
          ]}
        />
        <Rules
          items={[
            <>
              Miles con punto y decimales con coma, siempre por Intl. El punto de miles se fuerza también en cifras de cuatro dígitos
              (<code>1.234 €</code>, <code>12.345 €</code>) para que las columnas alineen: <code>lib/format.ts</code> ya lo hace con{" "}
              <code>useGrouping: &quot;always&quot;</code>. No se formatea a mano.
            </>,
            <>
              Espacio antes de € y de %: lo pone Intl. Nunca <code>32%</code> ni <code>1234€</code> escritos a mano.
            </>,
            <>
              Los porcentajes circulan siempre como puntos porcentuales: <code>{"delta={{ value: 8.4 }}"}</code> en <code>KpiCard</code> y{" "}
              <code>fmt.delta(8.4)</code> pintan lo mismo, «+8,4 %». Si el dato viene como fracción (0,084), se multiplica por 100 en la capa de datos, no en el componente.
            </>,
            <>
              Fechas: corta en tablas, larga en sheet y documentos, relativa («hace 2 h», «ayer») <strong>solo en actividad</strong> y siempre con la fecha
              exacta en el <code>title</code>. Horas en formato de 24 h: <code>13:00</code>. Meses abreviados a tres letras sin punto
              (<code>sep</code>, no <code>sept</code>). Rangos: «12 sep a 30 sep». Nunca <code>24/09/2026</code> en una tabla.
            </>,
            <>
              Cifras siempre con <code>tabular-nums</code> y alineadas a la derecha en tablas (<code>align: &quot;right&quot;</code> en la columna). El
              cero se muestra (<code>0 €</code>); el dato que no existe se muestra como un guion corto en gris, nunca «N/A», «null» ni vacío.
            </>,
          ]}
        />
        <CodeBlock
          title="En una columna y en una cifra"
          code={`import { fmt } from "@/lib/format"

const columns: Column<Registro>[] = [
  { id: "value", header: "Valor", align: "right", sortValue: (r) => r.value, cell: (r) => <span className="font-semibold tabular-nums">{fmt.eur(r.value)}</span> },
  { id: "updated", header: "Actualizado", align: "right", sortValue: (r) => new Date(r.updatedAt), cell: (r) => <span className="text-xs text-muted-foreground">{fmt.date(r.updatedAt)}</span> },
]

<KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(total)} hint={\`\${fmt.num(filtered.length)} registros\`} delta={{ value: 8.4, label: "vs mes anterior" }} />`}
        />
      </DocSection>

      <DocSection id="terminos" title="Términos fijos" lead="Una palabra por concepto en todos los portales. La columna del medio son los sinónimos que no se usan.">
        <SpecTable
          columns={["Decimos", "No decimos", "Por qué"]}
          rows={[
            ["registro", "ítem, elemento, entrada", "La unidad genérica de un módulo. Cada portal la sustituye por el nombre real (campaña, factura), pero el genérico es «registro»."],
            ["fase", "etapa, stage, paso", "Posición en el pipeline. Es lo que se avanza y lo que pinta el kanban."],
            ["responsable", "owner, propietario, asignado", "Quien responde del registro. El verbo es «asignar»."],
            ["archivar", "borrar, eliminar (para lo reversible)", "Lo archivado se recupera desde «Archivados». El toast ofrece «Deshacer»."],
            ["eliminar", "borrar, suprimir (para lo permanente)", "Solo desde archivados y con confirmación. No se puede deshacer."],
            ["vencido", "atrasado (para fechas de pago o plazo)", "Una factura vence, un pago vence, un plazo vence."],
            ["atrasado", "vencido (para entregables)", "Un entregable o una tarea se atrasan cuando no llegan a su fecha."],
            ["en curso", "activo (para procesos)", "Una campaña, un evento o una negociación están en curso."],
            ["activo", "en curso (para entidades)", "Un talento, una marca o un usuario están activos o inactivos."],
            ["nuevo", "crear, añadir (en el botón)", "El botón que abre el formulario es «Nuevo registro». «Crear registro» es el botón del pie del formulario."],
            ["guardar cambios", "guardar, actualizar, OK", "Pie de los formularios de edición."],
            ["quitar filtro", "limpiar, borrar filtro", "Para un filtro. «Limpiar» solo cuando se quitan todos a la vez."],
            ["cifras", "KPIs, métricas, indicadores", "En la interfaz se dice cifras. «KPI» se queda en el código."],
          ]}
        />
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "«Nuevo registro», «Exportar», «Guardar cambios».",
            "«Aún no hay registros. Crea el primero con «Nuevo registro».»",
            "«Registro archivado» con «Deshacer» en el toast.",
            "799.342 €, 1.234 €, 32 %, +8,4 %, 24 sep.",
            "«¿Eliminar Registro 3?» con el botón «Eliminar».",
          ]}
          donts={[
            "«OK», «Aceptar», «Enviar», «Sí».",
            "«No hay datos» sin decir cómo poblarlo.",
            "«¡Registro archivado con éxito!»",
            "799342€, 32%, 8.4%, 24/09/2026 en una tabla.",
            "«¿Estás seguro?» con el botón «Sí».",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/buttons", label: "Botones", text: "Variantes, tamaños e iconos." },
            { href: "/ds/componentes/states", label: "Estados", text: "EmptyState, ErrorState y skeletons." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Toasts y diálogos de confirmación." },
            { href: "/ds/fundamentos/tipografia", label: "Tipografía", text: "Geist, escala y cifras tabulares." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
