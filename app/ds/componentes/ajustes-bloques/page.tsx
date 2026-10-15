import { AjustesBloquesBotonDemo, ListaBloquesDemo } from "@/components/docs/examples/ajustes-bloques-demo"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Ajustes de bloques" }

export default function AjustesBloquesPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Ajustes de bloques"
      lead="Cada persona ordena los bloques de una página o un documento arrastrándolos, esconde los que no usa y, dentro de cada uno, elige qué datos enseña. Se ajusta donde se ve, nunca en una página de ajustes."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En todo lo que está hecho de bloques que no a todos les importan igual: un documento que se manda (un media kit,
            una propuesta), una ficha larga, una portada de bloques. La lógica es pura y vive en <code>lib/bloques.ts</code>:
            los bloques en su orden con su <code>visible</code> y los datos escondidos por su clave «bloque.dato». Quien la usa
            guarda esos ajustes por persona (en un portal, en su base de datos).
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Dos formas, la misma lista.</strong> Un editor que ajusta los bloques todo el rato (el de un documento) pinta{" "}
              <code>ListaBloques</code> a la vista, junto a la vista previa. Una página o un panel pone{" "}
              <code>AjustesBloquesBoton</code> en la cabecera: el engranaje de la configuración in situ, que abre la lista en un
              desplegable.
            </>,
            <>
              <strong>Arrastrar por el asa</strong>, con ratón o teclado (<code>ArrastreFilas</code>, el mismo de las listas de
              tareas). El interruptor enseña o esconde; lo escondido se queda en la lista, tachado.
            </>,
            <>
              <strong>Los datos de un bloque</strong>, al desplegarlo, con <code>DatosBloque</code>: un interruptor por dato (cada
              red, cada marca, cada campo). Un bloque sin nada que elegir no se despliega.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="La lista a la vista"
          description="Arrastra un bloque, escóndelo o despliega Resumen para esconder alguno de sus datos: la columna de la derecha enseña cómo queda."
          code={`const [ajustes, setAjustes] = useState<AjustesBloques<Bloque>>(guardados)

<ListaBloques
  bloques={ajustes.bloques.map((b) => ({
    ...b,
    label: BLOQUES[b.id].label,
    descripcion: BLOQUES[b.id].descripcion,
    contenido: <DatosBloque datos={datosDe(b.id)} visible={(c) => seVe(ajustes, c)} onCambiar={(c, ver) => setAjustes(conDato(ajustes, c, ver))} />,
  }))}
  onMover={(desde, hasta) => setAjustes(moverBloque(ajustes, desde, hasta))}
  onVisible={(id, v) => setAjustes(conBloque(ajustes, id, v))}
/>`}
        >
          <ListaBloquesDemo />
        </Example>
        <Example title="En la cabecera de un bloque" description="El engranaje abre la misma lista." code={`<SectionHeader title="Ficha del cliente" action={<AjustesBloquesBoton bloques={lista} onMover={onMover} onVisible={onVisible} />} />`}>
          <AjustesBloquesBotonDemo />
        </Example>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="b">bloques</code>, <code key="bt">BloqueEnLista[]</code>, "Cada bloque con id, label, descripcion opcional, visible y contenido opcional (lo que sale al desplegarlo)."],
            [<code key="m">onMover</code>, <code key="mt">{"(desde, hasta) => void"}</code>, "Pone un bloque en el sitio de otro. Con moverBloque de lib/bloques.ts."],
            [<code key="v">onVisible</code>, <code key="vt">{"(id, visible) => void"}</code>, "Enseña o esconde un bloque. Con conBloque."],
            [<code key="l">label</code>, <code key="lt">string</code>, "Solo AjustesBloquesBoton: el nombre del engranaje («Ajustar los bloques»)."],
          ]}
        />
        <Prose>
          <p>
            <code>lib/bloques.ts</code>: <code>bloquesVisibles</code>, <code>conBloque</code>, <code>moverBloque</code>,{" "}
            <code>seVe</code> y <code>conDato</code>, con tests.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/ajustes-bloques.json" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/insights-panel", label: "Panel de información", text: "Sus bloques también se eligen y se ordenan." },
            { href: "/ds/componentes/section", label: "Sección", text: "La cabecera donde va el engranaje." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
