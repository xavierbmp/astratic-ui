import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { ReportExample } from "@/components/docs/examples/report-demo"
import { StatusBadge } from "@/components/app/status-badge"

export const metadata = { title: "Sugerencias y problemas" }

const shellCode = `"use client"

import { AppShell } from "@/components/app/app-shell"
import { ReportButton } from "@/components/app/report-button"
import { enviarReporteAction, reportesEnviadosAction } from "./reportes-actions"

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brand={brand}
      user={user}
      nav={nav}
      report={<ReportButton onSubmit={enviarReporteAction} loadReports={reportesEnviadosAction} />}
    >
      {children}
    </AppShell>
  )
}`

const actionsCode = `"use server"

import type { ReportDraft, ReportItem } from "@/components/app/report-button"

/** Guarda el reporte con quien lo envía. Devuelve el error como texto, o nada. */
export async function enviarReporteAction(r: ReportDraft): Promise<string | void> {
  const usuario = await requireUsuario()
  if (!r.description.trim()) return "Cuenta qué pasa antes de enviarlo."
  await prisma.reporte.create({
    data: { descripcion: r.description, ruta: r.context.url, elemento: r.element ?? undefined, contexto: r.context, autorId: usuario.id },
  })
}

/** Los del usuario; los de todo el equipo si es administrador. */
export async function reportesEnviadosAction(): Promise<ReportItem[]> { … }`

export default function ReportButtonPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Sugerencias y problemas"
      lead="La bombilla de la cabecera. Quien usa el portal propone un cambio o cuenta qué falla y, si quiere, lo señala en la página, adjunta imágenes o lo marca en un lienzo; el reporte llega con todo lo necesario para resolverlo sin tener que preguntar."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En todos los portales y una sola vez: <code>ReportButton</code> se pasa al shell en la prop{" "}
            <code>report</code> y se pinta en la cabecera, entre el buscador y la campana. Así está en todas las
            páginas, siempre en el mismo sitio, sin botones flotantes que tapen la interfaz.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Diálogo de 480 px con dos pestañas.</strong> «Nuevo» pide la sugerencia o lo que falla y, opcionalmente, el elemento y
              las imágenes; «Enviados» enseña los reportes con su estado, sus miniaturas y la respuesta de quien los cerró.
            </>,
            <>
              <strong>Señalar en la página</strong> esconde el diálogo, resalta en <code>brand</code> lo que hay bajo el
              ratón con su nombre del kit y un clic lo elige. Esc cancela. Mientras se señala, la página no reacciona: no
              se abren menús, no se sigue un enlace y no se cierra la ficha. El diálogo vuelve con el borrador intacto.
            </>,
            <>
              <strong>Imágenes</strong>: con el botón, pegando una captura (⌘V) o arrastrándola al diálogo. Hasta seis por
              reporte; el navegador las reduce a 2.000 px en WebP antes de enviarlas.
            </>,
            <>
              <strong>El lienzo</strong> enseña la pantalla con un recuadro por cada elemento: se mueven, se estiran o se
              quitan (Supr) sin tocar la página, y en «Dibujar» se ponen flechas, trazos, rectángulos y textos. Clic derecho
              pulsa de verdad lo que hay debajo (abre un formulario o un menú) y «Usar la página» deja usarla con normalidad
              para llegar a la pantalla que se quiere marcar. Al guardar, la captura con lo marcado entra como una imagen
              más y viaja con la lista de cambios. Mientras está abierto, una ficha o un diálogo de debajo no se cierran.
            </>,
            <>
              <strong>⇧⌘X lo abre desde cualquier sitio</strong>, también con una ficha o un diálogo abiertos, que tapan
              la cabecera. Así se puede señalar algo dentro de un <code>DetailSheet</code>. Por eso cada ficha lleva
              además la bombilla en pequeño junto a sus flechas (<code>ReportTrigger</code>, ya incluido en{" "}
              <code>DetailHeader</code>), que abre el mismo diálogo.
            </>,
            <>
              <strong>El contexto va solo</strong>: la ruta con su query (el registro abierto), el tamaño de pantalla, el
              tema, el navegador y los últimos errores de la página. El diálogo dice qué se adjunta; nunca se le pide al
              usuario algo que la página ya sabe.
            </>,
            <>
              <strong>⌘↵ envía</strong> (en el lienzo, guarda). Si el guardado falla, un toast lo dice y el borrador se queda.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="Ejemplo"
        lead="La cabecera del shell en pequeño. Prueba a señalar algo de esta página y a mirar la pestaña «Enviados»: en la demo los reportes se quedan en memoria."
      >
        <Example title="Bombilla entre el buscador y la campana" description="Pulsa la bombilla. ⇧⌘X abre el de la cabecera de esta página: solo uno por pantalla lleva el atajo.">
          <ReportExample />
        </Example>
        <CodeBlock title="shell.tsx" code={shellCode} />
        <CodeBlock title="reportes-actions.ts" code={actionsCode} lang="ts" />
      </DocSection>

      <DocSection id="estados" title="Estados de un reporte">
        <Prose>
          <p>
            Un reporte no se borra: se resuelve o se descarta, y siempre con una respuesta de una frase que entienda quien
            lo envió («Las acciones bajan a su propia línea cuando no caben. Ya está publicado.»).
          </p>
        </Prose>
        <SpecTable
          columns={["Estado", "Valor", "Cuándo"]}
          rows={[
            [<StatusBadge key="o" tone="warning">Pendiente</StatusBadge>, <code key="o-v">open</code>, "Recién enviado; nadie lo ha mirado."],
            [<StatusBadge key="p" tone="info">En curso</StatusBadge>, <code key="p-v">in_progress</code>, "Alguien lo está arreglando, o ya está arreglado y falta publicarlo."],
            [<StatusBadge key="r" tone="success">Resuelto</StatusBadge>, <code key="r-v">resolved</code>, "Arreglado y publicado. La respuesta dice qué se hizo."],
            [<StatusBadge key="d" tone="neutral">Descartado</StatusBadge>, <code key="d-v">dismissed</code>, "No se va a hacer. La respuesta dice por qué."],
          ]}
        />
      </DocSection>

      <DocSection id="datos" title="Qué se envía">
        <SpecTable
          columns={["Campo", "Ejemplo", "Para qué"]}
          rows={[
            [<code key="d">description</code>, "«El filtro de línea no guarda la selección»", "Lo que cuenta el usuario, tal cual."],
            [<code key="u">context.url</code>, <code key="u-e">/crm/contactos?registro=ck…</code>, "Página y registro abierto: se reproduce entrando en esa ruta."],
            [<code key="v">context.viewport · theme</code>, "1440 × 900 · light", "Para los fallos de responsive y de contraste."],
            [<code key="e">context.errors</code>, "14:02 TypeError: …", "Los últimos 10 errores de la página (JS, promesas y console.error)."],
            [<code key="p">element.path</code>, <code key="p-e">{"sheet-content «Ana Ruiz» › detail-section «Contacto» › button"}</code>, "Los contenedores del kit por los que pasa, con su título: lleva directo al componente."],
            [<code key="s">element.selector · text · html</code>, "button[data-slot=\"button\"] · «Guardar»", "Para localizar el elemento exacto en la página."],
            [<code key="a">attachments[].dataUrl</code>, "data:image/webp;base64,…", "Cada imagen, ya reducida. El servidor comprueba que es de verdad una imagen antes de guardarla."],
            [<code key="c">attachments[].canvas</code>, "mover «Nueva plantilla»: de 129×28 en (639, 603) a 212×84 en (938, 436)", "Solo en los lienzos: cada elemento movido, estirado o quitado con su caja de antes y después, y los textos escritos encima."],
          ]}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <DoDont
          dos={[
            "Montarlo una vez en el shell de cada portal, también en los de clientes.",
            "Guardar cada reporte en la base de datos del proyecto con quien lo envía.",
            "Devolver el error como texto en onSubmit: el diálogo lo enseña y conserva el borrador.",
            "Cerrar cada reporte con una respuesta de una frase.",
          ]}
          donts={[
            "Un botón flotante o un enlace de «feedback» en cada página.",
            "Pedir datos que ya van solos: página, navegador, pantalla.",
            "Borrar reportes: se descartan con su motivo.",
            "Marcar «Resuelto» lo que aún no está publicado: eso es «En curso».",
          ]}
        />
        <Prose>
          <p>
            <strong>En los portales de Astratic</strong> los reportes van a la tabla <code>Reporte</code> y Claude los
            lee con la skill <code>reportes</code>: los reproduce, los arregla, y al publicar los cierra con su respuesta.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="s">onSubmit</code>, <code key="s-t">{"(r: ReportDraft) => Promise<string | void>"}</code>, "Guarda el reporte. Devuelve el mensaje de error o nada. Obligatoria."],
            [<code key="l">loadReports</code>, <code key="l-t">{"() => Promise<ReportItem[]>"}</code>, "Carga los enviados cada vez que se abre la pestaña. Sin ella no hay pestaña «Enviados»."],
            [<code key="e">onEditReport</code>, <code key="e-t">{"(id: string, texto: string) => Promise<string | void>"}</code>, "Cambia el texto de uno suyo que sigue pendiente (los que llegan con editable). Sin ella, no se edita."],
            [<code key="b">onDeleteReport</code>, <code key="b-t">{"(id: string) => Promise<string | void>"}</code>, "Borra uno suyo que sigue pendiente, tras confirmarlo. En curso ya no se borra."],
            [<code key="d">description</code>, <code key="d-t">ReactNode</code>, "Texto bajo el título del diálogo."],
            [<code key="k">shortcut</code>, <code key="k-t">boolean</code>, "⇧⌘X abre y cierra el diálogo. Por defecto true."],
          ]}
        />
        <Prose>
          <p>
            <code>ReportDraft</code>, <code>ReportElement</code>, <code>ReportContext</code>, <code>ReportAttachment</code>,{" "}
            <code>ReportCanvasData</code>, <code>ReportItem</code> y <code>reportStatus</code> (etiqueta y tono de cada
            estado) se exportan desde el mismo archivo. El lienzo se descarga solo la primera vez que se abre.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/report-button.json" />
        <Prose>
          <p>
            Instala <code>report-button.tsx</code> y sus piezas (<code>report-*.tsx</code>, con el lienzo y{" "}
            <code>lib/report-canvas.ts</code>), <code>states.tsx</code>, <code>status-badge.tsx</code>,{" "}
            <code>lib/status.ts</code> y <code>lib/format.ts</code>, los componentes base que usa (dialog, tabs, textarea,
            tooltip, kbd) y <code>modern-screenshot</code> para la captura. Necesita el <code>Toaster</code> de sonner en
            el layout raíz. Las imágenes llegan en data URL: el servidor las sube a su almacenamiento y guarda los enlaces.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/shell", label: "Shell de aplicación", text: "Dónde se monta, con la prop report." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Toasts y confirmaciones." },
            { href: "/ds/componentes/status-badge", label: "Badges de estado", text: "Los tonos de cada estado." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
