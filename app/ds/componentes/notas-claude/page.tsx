import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DemoNotasClaude } from "@/components/docs/examples/notas-demo"

export const metadata = { title: "Notas para Claude" }

const shellCode = `<AppShell
  brand={brand}
  user={user}
  nav={nav}
  notas={esAdmin && <NotasClaude cargar={listarNotasAction} enviar={enviarNotaAction} editar={editarNotaAction} borrar={borrarNotaAction} pendientes={pendientes} />}
  report={<ReportButton onSubmit={enviarReporteAction} loadReports={reportesEnviadosAction} />}
>`

export default function NotasClaudePage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Notas para Claude"
      lead="El chat de la cabecera para dejar cualquier dato operativo (las tarifas de una creadora, un email, un contacto) que no es una sugerencia. No es en directo: Claude lo recoge en su repaso y contesta en el mismo chat."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Solo para administradores y una vez por portal: <code>NotasClaude</code> se pasa al shell en la prop{" "}
            <code>notas</code> y se pinta justo antes de la bombilla. La bombilla es para cambiar el producto; las notas,
            para el trabajo del día.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Se abre como un chat de atención al cliente</strong>: una ventana de 400 px abajo a la derecha que
              deja seguir usando la página. El guion la minimiza y Esc también.
            </>,
            <>
              <strong>Cada nota sabe dónde se escribió</strong>: la ruta con su query y el título de la página van solos
              y salen en la nota como una etiqueta que lleva a esa página.
            </>,
            <>
              <strong>«Señalar»</strong> esconde el chat y deja elegir cualquier cosa de la página, como la bombilla
              (Esc cancela). Al volver, lo señalado sale como una etiqueta que se puede quitar.
            </>,
            <>
              <strong>Tus notas a la derecha, la respuesta de Claude a la izquierda</strong>, con Pendiente o Hecho. Se
              editan y se borran desde la nota; al editar una hecha vuelve a pendiente.
            </>,
            <>
              <strong>⌘↵ envía</strong>; Enter es salto de línea, porque lo normal es pegar textos largos. Con notas sin
              hacer, el botón lleva un punto.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo" lead="El botón de la cabecera de esta página es la demo: las notas se quedan en memoria.">
        <Example title="Botón y chat" description="Ábrelo, señala algo de la página y envía una nota.">
          <div className="flex items-center justify-end gap-1 rounded-xl border bg-card p-2">
            <DemoNotasClaude />
          </div>
        </Example>
        <CodeBlock title="shell.tsx" code={shellCode} />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <DoDont
          dos={["Montarlo en el shell solo para administradores.", "Guardar con cada nota su página y lo señalado.", "Cerrar cada nota con una respuesta que diga dónde ha quedado el dato."]}
          donts={["Usarlo para sugerencias o fallos: eso es la bombilla.", "Un chat en tiempo real: Claude contesta en su repaso.", "Un botón flotante fijo en la página: el chat sale de la cabecera."]}
        />
        <Prose>
          <p>
            <strong>En Astratic</strong> las notas de las dos apps van a la tabla <code>NotaClaude</code> del portal y
            Claude las procesa con la skill <code>notas-claude</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="c">cargar</code>, <code key="c-t">{"() => Promise<NotaItem[]>"}</code>, "Las notas, de la más antigua a la más nueva. Se llama al abrir y tras cada cambio."],
            [<code key="e">enviar</code>, <code key="e-t">{"(n: NotaNueva) => Promise<string | void>"}</code>, "Guarda el texto con su ruta, su página y el elemento señalado. Devuelve el error o nada."],
            [<code key="d">editar</code>, <code key="d-t">{"(id, texto) => Promise<string | void>"}</code>, "Cambia el texto; la nota vuelve a pendiente."],
            [<code key="b">borrar</code>, <code key="b-t">{"(id) => Promise<string | void>"}</code>, "La borra, tras confirmarlo."],
            [<code key="p">pendientes</code>, <code key="p-t">number</code>, "Las que esperan a Claude: el punto del botón."],
          ]}
        />
        <Prose>
          <p>
            <code>NotaItem</code>, <code>NotaNueva</code> y <code>nombreDeElemento</code> (el nombre corto de lo señalado,
            para guardarlo) se exportan desde el mismo archivo. Usa <code>ElementPicker</code> de la bombilla.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/report-button", label: "Sugerencias y problemas", text: "La bombilla, para cambios del producto." },
            { href: "/ds/componentes/shell", label: "Shell de aplicación", text: "Dónde se monta, con la prop notas." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
