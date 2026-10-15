import { CompartirEnlaceDemo, LinkGridDemo, ZonaSubidaDemo } from "@/components/docs/examples/archivos-demo"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Archivos y enlaces" }

export default function ArchivosYEnlacesPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Archivos y enlaces"
      lead="Subir archivos, mandar un enlace a alguien sin cuenta y tener a mano las webs de cada día. Tres piezas pequeñas que se repiten en cualquier portal."
    >
      <DocSection id="subir" title="Zona de subida">
        <Prose>
          <p>
            <code>ZonaSubida</code> es la forma de subir archivos en todo el kit: importar una hoja, adjuntar imágenes a un
            reporte, subir una versión o una factura. Se pulsa o se le suelta encima; quien la usa sube los archivos (en un
            portal, directos a su almacenamiento con una URL firmada). Nunca una zona de soltar hecha a mano.
          </p>
        </Prose>
        <Example title="Normal y compacta" code={`<ZonaSubida onArchivos={subir} ayuda="PDF o imágenes, hasta 20 MB cada uno." />
<ZonaSubida compacta accept="image/*" titulo="Arrastra aquí una imagen o elígela" onArchivos={subir} />`}>
          <ZonaSubidaDemo />
        </Example>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="o">onArchivos</code>, <code key="ot">{"(archivos: File[]) => void"}</code>, "Lo elegido o soltado; con multiple={false}, solo el primero."],
            [<code key="a">accept · multiple</code>, <code key="at">string · boolean</code>, "Como en un input de archivo."],
            [<code key="t">titulo · ayuda · compacta</code>, <code key="tt">string · boolean</code>, "El texto y la altura."],
            [<code key="d">desactivada</code>, <code key="dt">boolean</code>, "Mientras lee o cuando ya no caben más."],
          ]}
        />
        <Prose>
          <p>
            Si su contenedor también recibe archivos (un diálogo entero, para soltar en cualquier parte), comprueba{" "}
            <code>isDefaultPrevented()</code> en su <code>onDrop</code>: lo soltado en la zona ya lo ha recogido ella.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="compartir" title="Compartir un enlace">
        <Prose>
          <p>
            <code>CompartirEnlace</code> deja listo un enlace sin cuenta (una revisión, un formulario, un informe): copiar,
            WhatsApp, email desde el correo de quien lo manda y abrirlo como lo verá quien lo recibe. <code>CompartirEnlaceDialog</code>{" "}
            lo enseña justo después de crear el enlace. La ruta se pinta igual en servidor y navegador; el dominio lo pone{" "}
            <code>useOrigen</code> al copiar.
          </p>
        </Prose>
        <Example code={`<CompartirEnlace ruta="/revisar/…" mensaje="Hola, aquí tienes la versión para revisar:" asunto="Versión para revisar" verComo="Ver como el cliente" nota="El enlace caduca en 30 días." />`}>
          <CompartirEnlaceDemo />
        </Example>
      </DocSection>

      <DocSection id="enlaces" title="Directorio de enlaces">
        <Prose>
          <p>
            <code>LinkGrid</code> (mosaico) y <code>LinkRow</code> (una fila con «+N» y el lápiz) para las webs de uso diario de
            cada persona, con el icono de cada web. Se ordenan arrastrando, se editan y se borran con confirmación.
          </p>
        </Prose>
        <Example code={`<LinkGrid links={enlaces} onChange={setEnlaces} editing={false} />
<LinkRow links={enlaces} onChange={setEnlaces} editing={editando} onEditingChange={setEditando} />`}>
          <LinkGridDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            "Toda subida, con ZonaSubida; se puede soltar también sobre el diálogo entero si el diálogo es para eso.",
            "Un enlace para alguien de fuera se manda siempre con CompartirEnlace: nadie copia una URL a mano.",
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code={`npx shadcn@latest add https://ui.astraticnetwork.com/r/zona-subida.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/compartir-enlace.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/link-grid.json`} />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks links={[{ href: "/ds/componentes/revision", label: "Revisión con notas", text: "Lo que recibe quien abre el enlace." }]} />
      </DocSection>
    </DocPage>
  )
}
