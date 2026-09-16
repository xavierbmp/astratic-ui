import Link from "next/link"
import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Documentos y PDF" }

export default function DocumentosPage() {
  return (
    <DocPage
      eyebrow="Documentos"
      title="Documentos y PDF"
      lead="Las propuestas, presupuestos y cualquier PDF que sale de Astratic se maquetan con el mismo sistema que los portales: Geist, los tokens de color y componentes propios. Hay dos formatos según lo que se propone."
    >
      <DocSection id="cual-usar" title="Qué formato usar">
        <SpecTable
          columns={["Formato", "Para qué", "Extensión", "Referencia"]}
          rows={[
            [
              <Link key="e" href="/ds/documentos/elaborada">Propuesta elaborada</Link>,
              "Portales, software a medida y proyectos por bloques y páginas, con paquetes, plazos y aceptación.",
              "10 a 30 hojas",
              "Propuesta Twic",
            ],
            [
              <Link key="s" href="/ds/documentos/simple">Propuesta simple</Link>,
              "Webs, SEO, mensualidades, trabajos puntuales y presupuestos cortos.",
              "1 a 3 hojas",
              "Propuesta Feel The Diving",
            ],
          ]}
        />
        <Prose>
          <p>
            La pregunta es si el cliente tiene que <strong>elegir entre muchas piezas</strong> (páginas, bloques, paquetes) o
            solo <strong>aceptar un trabajo</strong>. Si hay que elegir, elaborada. Si no, simple, aunque el importe sea alto.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="principios" title="Principios comunes">
        <Rules
          items={[
            <><strong>A4 fijo.</strong> Cada hoja mide 210 × 297 mm y recorta lo que no cabe, sin avisar. Antes de enviar un PDF se revisa hoja a hoja.</>,
            <><strong>Siempre en claro.</strong> <code>DocViewer</code> fuerza el tema claro aunque el portal esté en oscuro.</>,
            <><strong>Los mismos tokens que el portal.</strong> Nada de hex ni colores sueltos. En la elaborada, índigo para numeración, destacados y checks, y negro para precios y bloques que hay que leer sí o sí. En la simple, sin acento: solo los badges de estado.</>,
            <><strong>Cifras con formato.</strong> <code>fmt.eur</code> para importes («1.200 €»), cifras tabulares, precios sin IVA indicados.</>,
            <><strong>Texto con la skill de redacción</strong>, en el idioma del cliente y sin inventar datos suyos: lo que no se sabe se pregunta o se deja fuera.</>,
            <><strong>Mockups con el kit</strong>, no capturas: se componen con <code>KpiCard</code>, <code>Section</code>, <code>StatusBadge</code>… y se escalan con <code>DocFigure</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="archivos" title="Archivos">
        <CodeBlock
          lang="bash"
          code={`components/document/
  sheet.tsx       DocViewer, DocSheet, DocCover, DocLogo, DocFigure, DocPageNumber…  (común)
  toolbar.tsx     DocToolbar: volver y «Exportar PDF»                                   (común)
  content.tsx     titulares, índice, bloques, funcionalidades                           (elaborada)
  commercial.tsx  paquetes, importes, plazos, pasos, aceptación                         (elaborada)
  simple.tsx      hoja, cifras clave, tablas, condiciones, aviso, conformidad           (simple)

app/documentos/propuesta-elaborada/   demo elaborada (14 hojas)
app/documentos/propuesta-simple/      demo simple (2 hojas)`}
        />
        <Prose>
          <p>
            Un documento es una ruta de servidor que devuelve <code>DocViewer</code> con sus hojas. Todo son componentes de
            servidor salvo <code>DocToolbar</code>. El número de hojas se pasa en <code>pages</code> y el pie numera solo.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="pdf" title="Exportar a PDF">
        <Prose>
          <p>
            El botón <strong>Exportar PDF</strong> de la barra abre el diálogo de impresión: destino «Guardar como PDF». El
            tamaño A4, los márgenes a cero y los fondos ya van fijados por CSS, y la barra no se imprime. Los enlaces internos
            (índice, «Ver paquetes») siguen funcionando dentro del PDF.
          </p>
          <p>Sin abrir el navegador, con Chrome en modo headless:</p>
        </Prose>
        <CodeBlock
          lang="bash"
          code={`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \\
  --no-pdf-header-footer --virtual-time-budget=10000 \\
  --print-to-pdf=propuesta.pdf http://localhost:3020/documentos/propuesta-simple`}
        />
        <DoDont
          dos={[
            "Revisar el PDF exportado, no solo la pantalla: el recorte por hoja solo se ve ahí.",
            "Nombrar el archivo como el entregable: «Propuesta Cliente x Astratic Network Devs.pdf».",
          ]}
          donts={[
            "Sombras difuminadas en el PDF: la Vista Previa de macOS las pinta como rectángulos (el CSS de impresión las quita).",
            "Encoger la letra para que algo quepa: se reparte en otra hoja.",
          ]}
        />
      </DocSection>

      <DocSection id="css" title="CSS necesario">
        <Prose>
          <p>
            Al instalar el kit en otro proyecto hay que copiar de <code>app/globals.css</code> el selector{" "}
            <code>.theme-light</code> junto a <code>:root</code> y el bloque «Documentos A4 y PDF»: numeración de hojas,{" "}
            <code>@page</code> y reglas de impresión.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="seguir" title="Por dónde seguir">
        <NextLinks
          links={[
            { href: "/ds/documentos/elaborada", label: "Propuesta elaborada", text: "Portada, índice, bloques, paquetes, plazos y aceptación." },
            { href: "/ds/documentos/simple", label: "Propuesta simple", text: "Una o dos hojas: cifras, situación, plan, condiciones y firma." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
