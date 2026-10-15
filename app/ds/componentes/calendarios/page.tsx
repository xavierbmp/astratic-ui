import { AgendaDemo, CalendarioPeriodoDemo, GanttDemo, MiniCalendarioDemo } from "@/components/docs/examples/calendarios-demo"
import { DocPage, DocSection, Example, NextLinks, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Agenda y calendarios" }

export default function CalendariosPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Agenda y calendarios"
      lead="Lo que tiene fecha, en su día: la agenda del mes, el calendario pequeño de un resumen, el calendario para planificar con arrastre y el cronograma en Gantt. Todos comparten las fechas de lib/base/calendario.ts y el mismo día de hoy."
    >
      <DocSection id="uso" title="Cuál se usa">
        <Rules
          items={[
            <>
              <strong>Una lista de registros con fecha</strong> es una base de datos: su vista calendario (<code>CalendarioBase</code>)
              ya lo hace. Estos son para lo que no es una base.
            </>,
            <>
              <strong><code>Agenda</code></strong>: el mes de cosas de varios tipos (hitos, cobros, tareas), cada una con su color y
              su detalle al pasar por encima. Con <code>onSelect</code> abre la ficha en la misma página; si no, lleva a su{" "}
              <code>href</code>. En el móvil, la lista del mes día a día.
            </>,
            <>
              <strong><code>MiniCalendario</code></strong>: el mismo mes en pequeño para un resumen o un inicio; crece hasta llenar
              su bloque y «+N» lleva al calendario completo (<code>hrefDia</code>).
            </>,
            <>
              <strong><code>CalendarioPeriodo</code></strong>: para planificar por mes o semana. Cada día recibe lo que se le suelta
              (<code>PREFIJO_DIA</code>) y el <code>DndContext</code> lo pone la página, que así también recibe lo de fuera; quien
              lo usa pinta cada cosa y los avisos del día (<code>AvisoDia</code>). Cambia de mes o de semana con un{" "}
              <code>Segmentado</code> en la cabecera de su bloque.
            </>,
            <>
              <strong><code>Gantt</code></strong>: una fila por proyecto o pieza con sus tramos de trabajo (coloreados por tipo,
              nunca por estado), el rombo de su hito y la línea de hoy. Arrastrar una fila, o las flechas con ella enfocada, la
              mueve entera.
            </>,
            <>
              Hoy siempre en el color de acento (<code>NumeroDia</code>), igual en todos. Las vistas reciben <code>hoy</code> por
              props: nada se decide con <code>new Date()</code> al pintar.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplos">
        <Example title="Agenda" code={`<Agenda eventos={eventos} hoy={hoy} onSelect={abrir} />`}>
          <AgendaDemo />
        </Example>
        <Example title="Calendario pequeño" code={`<MiniCalendario eventos={eventos} hoy={hoy} hrefDia={(dia) => \`/calendario?dia=\${dia}\`} />`}>
          <MiniCalendarioDemo />
        </Example>
        <Example
          title="Calendario para planificar"
          description="Arrastra un plan a otro día o pulsa el «+» de un día."
          code={`<DndContext onDragEnd={alSoltar}>
  <CalendarioPeriodo entradasDe={(dia) => planesDe(dia)} pintar={(p, { grande }) => <Tarjeta plan={p} grande={grande} />} hoy={hoy} ancla={ancla} modo={modo} onNuevo={planificar} />
</DndContext>`}
        >
          <CalendarioPeriodoDemo />
        </Example>
        <Example title="Cronograma" description="Arrastra una fila para mover sus fechas." code={`<Gantt filas={filas} hoy={hoy} onMover={mover} columna="Proyecto" nombreHito={{ pendiente: "Entrega", hecho: "Entregado" }} leyenda={leyenda} />`}>
          <GanttDemo />
        </Example>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Pieza", "Datos", "Descripción"]}
          rows={[
            [<code key="a">Agenda · MiniCalendario</code>, <code key="at">EventoCalendario[]</code>, "id, fecha, titulo, detalle (al pasar por encima), color (clases del chip), hecho y href."],
            [<code key="c">CalendarioPeriodo</code>, <code key="ct">entradasDe · pintar</code>, "Lo de cada día y cómo se pinta; avisosDe, onNuevo y etiquetaNuevo opcionales; finesDeSemana para quitar sábado y domingo."],
            [<code key="g">Gantt</code>, <code key="gt">FilaGantt[]</code>, "titulo, subtitulo, inicio (miniatura), tramos ({ label, desde, hasta, hecho, color }) e hito ({ fecha, hecho })."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/calendarios.json" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks links={[{ href: "/ds/componentes/base-de-datos", label: "Base de datos", text: "La vista calendario de una lista de registros." }]} />
      </DocSection>
    </DocPage>
  )
}
