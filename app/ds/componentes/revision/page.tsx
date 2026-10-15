import { RevisionDemo } from "@/components/docs/examples/revision-demo"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Revisión con notas" }

export default function RevisionPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Revisión con notas"
      lead="Alguien de fuera (un cliente, una marca) revisa un contenido como en Feedback: deja cada nota justo donde va (una frase, un segundo del vídeo, un punto de la foto) y quien lo hace las resuelve en la siguiente versión."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cuando un trabajo se entrega por versiones y alguien sin cuenta lo aprueba o pide cambios: un diseño, un vídeo, un
            texto. Dos piezas que se usan juntas: <code>VisorMedia</code>, el contenido sobre un lienzo de puntos con las notas
            clavadas en su sitio, y <code>Conversacion</code>, los mensajes y las notas en orden con su hilo y su estado. Los
            tipos (<code>Ancla</code>, <code>Mensaje</code>, <code>NotaRevision</code>, <code>VersionRevision</code>) viven en{" "}
            <code>lib/revision-notas.ts</code>. El texto se revisa con el editor del portal y la misma conversación.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Dos lados.</strong> <code>ladoAutor</code> hace la pieza: resuelve las notas («Hecha» o «Reabrir») y
              contesta aunque la versión esté cerrada. El otro lado revisa y deja notas, ancladas si ha marcado un sitio.
            </>,
            <>
              <strong>Cada nota con su número</strong>, el mismo en el visor y en la conversación; pulsarla en un sitio la marca en
              el otro. «Solo notas» deja lo que falta por resolver y abajo va el progreso.
            </>,
            <>
              <strong>Comparar versiones:</strong> con <code>anterior</code>, la versión previa al lado, atenuada.{" "}
              <code>zoom</code> de 50 a 200.
            </>,
            <>
              Los textos de la conversación se cambian con <code>textos</code> para que digan con quién se habla («Escribe a la
              marca…»).
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Un carrusel en revisión"
          description="Pulsa en una foto para proponer una nota ahí y escríbela en la conversación."
          padded={false}
          code={`<VisorMedia version={version} medio="imagen" notas={version.notas} seleccionada={sel} onSeleccionar={setSel} onMarcar={setPendiente} marcaPendiente={pendiente} />
<Conversacion notas={version.notas} mensajes={version.mensajes} lado="cliente" ladoAutor="equipo" anclaPendiente={pendiente} onEnviar={dejarNota} … />`}
        >
          <RevisionDemo />
        </Example>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="v">VisorMedia version · anterior</code>, <code key="vt">VersionRevision</code>, "La versión que se revisa y, opcional, la de antes para comparar."],
            [<code key="m">medio</code>, <code key="mt">{'"video" | "imagen"'}</code>, "Un vídeo con su línea de tiempo o una o varias fotos."],
            [<code key="mk">onMarcar · marcaPendiente</code>, <code key="mkt">Ancla</code>, "Pulsar en la foto o en la línea propone una nota ahí; la pendiente se pinta discontinua."],
            [<code key="e">estado · fondo</code>, <code key="et">{"(v) => string · string"}</code>, "El estado en palabras junto al número de versión y el fondo de cada archivo mientras carga."],
            [<code key="c">Conversacion lado · ladoAutor</code>, <code key="ct">string</code>, "Quién mira y qué lado hace la pieza."],
            [<code key="cr">onResolver · onResponder · onEnviar</code>, <code key="crt">funciones</code>, "Resolver una nota, contestar en su hilo y escribir (una nota anclada si hay ancla pendiente)."],
            [<code key="cc">cerrada</code>, <code key="cct">boolean</code>, "Versión aprobada o con cambios pedidos: se lee, no se escribe."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/revision.json" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/archivos-y-enlaces", label: "Archivos y enlaces", text: "Subir la versión y mandar el enlace de revisión." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "El registro de la pieza." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
