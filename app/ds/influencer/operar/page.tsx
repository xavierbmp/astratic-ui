import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Páginas de operar · Influencer Workspace" }

export default function InfluencerOperarPage() {
  return (
    <DocPage
      eyebrow="Influencer Workspace · Patrones"
      title="Páginas de operar"
      lead="Donde se trabaja: Propuestas (su CRM), Collabs y la ficha de cada collab con su brief, sus contenidos, sus materiales y sus tareas. Detalladas y funcionales sin miedo, con el kit de Astratic UI dentro de bloques del hijo."
    >
      <DocSection id="estructura" title="Cómo se arma una página de operar">
        <Rules
          items={[
            <><strong>Sin cifras arriba.</strong> <code>PageHeader</code> con el título y una descripción que ya resume («5 abiertas por 4.016 €») y, debajo, <strong>un solo bloque</strong> (<code>Block className="p-0"</code>) con la toolbar y la lista.</>,
            <><strong>Toolbar del madre</strong>: buscador, <code>FilterMenu</code> por campo, <code>ViewSwitcher</code> y la acción principal negra, una por página. Los filtros activos, en chips debajo.</>,
            <><strong>Vistas</strong>: tablero, tabla y lista en Propuestas; tarjetas, tabla y agenda en Collabs. En el móvil la tabla cede el sitio a la lista o a las tarjetas (<code>usePageView</code>).</>,
            <><strong>Registro abierto</strong>: la propuesta se abre en <code>DetailSheet</code> con <code>?propuesta=id</code> en la URL; la collab es una página propia con pestañas (<code>PageTabs</code>), porque se trabaja durante semanas.</>,
            <><strong>Todo se edita donde se lee</strong> (<code>InlineField</code>); crear lleva diálogo (react-hook-form + zod); borrar, <code>ConfirmDialog</code> o toast con «Deshacer» si se puede recuperar.</>,
            <><strong>Nada se pide dos veces</strong>: el diálogo de tarea, la lista de tareas, la marca y las piezas de revisión son los mismos componentes en todas las páginas.</>,
          ]}
        />
        <CodeBlock
          code={`<PageBody className="gap-6 px-4 pb-28 md:px-[34px] md:pb-10">
  <PageHeader title="Propuestas" description="Tu CRM: 5 abiertas por 4.016 €." />
  <Block className="min-h-[560px] p-0">
    <div className="p-4 pb-3"><Toolbar>…búsqueda · filtros · ViewSwitcher · acción…</Toolbar><ActiveFilters … /></div>
    {view === "kanban" && <Kanban … />}
    {view === "table" && <DataTable … />}
    <BulkBar … />
  </Block>
  <PropuestaSheet … />   {/* DetailSheet con pestañas Resumen · Tareas · Actividad */}
</PageBody>`}
        />
      </DocSection>

      <DocSection id="propuestas" title="Propuestas (su CRM)">
        <SpecTable
          columns={["Pieza", "Qué hace"]}
          rows={[
            ["Tablero", "Nueva → Hablando → Enviada → Negociando → Ganada · Perdida. Tarjeta con la marca, qué piden, el importe (lo pedido o lo que ofrecen, con aviso si baja del mínimo), «Red Astratic» si viene de la red y la fecha del siguiente paso. Se arrastra de columna."],
            ["Tabla y lista", "Marca y campaña, piden, estado, origen, importe, siguiente paso y último contacto. Selección con casillas y barra de acciones: a «Hablando», perdidas, eliminar."],
            ["Ficha", "Campaña editable en el título, estado, marca con su atribución («tuya hasta…» o «de la red»), origen, piden, ofrecen, tu presupuesto, tu mínimo, fechas, siguiente paso, motivo si se perdió y notas. Pestañas Tareas (la lista de operar) y Actividad (apuntar contacto o email de un clic)."],
            ["Nueva propuesta", "Marca (o crearla), campaña, cómo ha llegado, qué piden por formato, lo que ofrecen, ventana de publicación y notas. Pensada para el móvil."],
            ["Preparar propuesta", "Líneas por formato a sus tarifas, extras que suben el fee (derechos, exclusividad, paid, urgencia), total y aviso si queda bajo el mínimo pactado o si lo que ofrece la marca está por debajo. Media kit con o sin precios. Al guardar se abre el documento."],
            ["Documento", "/propuesta/[id]: media kit (foto, cifras, redes, audiencia, marcas, tarifas si se quiere, sello de Astratic) y presupuesto (detalle, condiciones) en A4, listo para exportar a PDF o mandar como enlace."],
          ]}
        />
      </DocSection>

      <DocSection id="collabs" title="Collabs y la ficha de collab">
        <SpecTable
          columns={["Pestaña", "Qué hay"]}
          rows={[
            ["Collabs", "Tarjetas grandes (activas primero), tabla con piezas hechas, siguiente hito, importe y cobro, y la agenda del mes con los hitos de cada pieza, los cobros y las tareas con fecha."],
            ["Resumen", "Arriba el brief resumido (portada, objetivo, entregables, menciones, enlace y código, exclusividad y derechos, rondas, producto). Debajo, los entregables con su estado y lo que toca, el cronograma con la línea de hoy, las tareas pendientes, el cobro, el contacto y la actividad."],
            ["Brief", "Todo lo que hay que cumplir y las condiciones, editable donde se lee: objetivo, mensajes clave, menciones, hashtags, enlace, código, claims permitidos y prohibidos, hay que y evitar, producto, tipo, importe, fechas, pago, rondas, exclusividad, derechos y contacto. Los archivos de la marca al lado."],
            ["Contenidos", "La biblioteca de la collab: cada pieza con su miniatura, estado, qué toca y en qué versión van guion y vídeo. Filtros «Me toca», «Esperando a la marca», «Aprobadas», «Publicadas». Nueva pieza con su fecha de publicación, de la que salen el resto de fechas."],
            ["Pieza", "Guion y vídeo con sus versiones apiladas (v1, v2…), las notas de la marca en su sitio (cita del texto o segundo del vídeo) con progreso, el enlace de revisión sin cuenta (copiar, WhatsApp, email, caducidad) y la aprobación registrada (quién, cuándo, qué versión). Nueva versión del guion en el editor; subir el vídeo; enviar a revisión; marcar como publicada."],
            ["Materiales", "Lo que manda la marca (brief, logos, producto, claims) y lo suyo (contrato), en mosaico con vista previa, filtro por origen, subir archivos y añadir enlaces."],
            ["Tareas", "La lista de operar de esa collab, con las automáticas de las fechas del brief y las suyas; aparecen también en la lista general."],
          ]}
        />
      </DocSection>

      <DocSection id="revisar" title="La revisión de la marca, sin cuenta">
        <Prose>
          <p>
            <code>/revisar/[token]</code> es lo que abre la marca: la versión actual (y las anteriores para comparar), sus
            notas ancladas al texto seleccionado o al segundo del vídeo, «Pedir cambios» y «Aprobar» con su nombre. Sin
            sidebar, con el tema del hijo y el modo oscuro. Viene de la pantalla de revisión diseñada para la propuesta
            de Feedback Marketing, adaptada a una creadora y su marca: una pieza, una versión, un enlace.
          </p>
        </Prose>
        <DoDont
          dos={[
            <>Un enlace por versión, imposible de adivinar, con caducidad y revocable; enseña siempre la última versión.</>,
            <>La aprobación queda registrada con nombre, fecha y hora: es lo que vale si luego hay discusión.</>,
            <>Las rondas incluidas se ven («Ronda 1 de 2»): si la marca pide otra, se avisa de que va aparte.</>,
          ]}
          donts={[
            <>Pedir cuenta o contraseña a la marca para comentar.</>,
            <>Mezclar el chat del día a día aquí: lo rápido sigue en WhatsApp; esto es la revisión ordenada.</>,
          ]}
        />
      </DocSection>

      <DocSection id="datos" title="Datos y lo que falta">
        <Prose>
          <p>
            El modelo vive en <code>lib/influencer/modelo.ts</code> (en español, como la base de datos del portal) y la
            lógica pura en <code>collabs.ts</code>, <code>tareas.ts</code>, <code>presupuesto.ts</code> y <code>agenda.ts</code>.
            Las páginas piden los datos a <code>lib/influencer/consultas.ts</code>, que hoy devuelve los de ejemplo y en
            el Portal Astratic leerá de Prisma con las mismas funciones. Llevar el workspace al portal es copiar{" "}
            <code>app/workspace</code>, <code>app/revisar</code>, <code>app/propuesta</code>, <code>components/influencer</code> y{" "}
            <code>lib/influencer</code>, y cambiar ese archivo.
          </p>
          <p>
            Por construir: la página general de Tareas (todas las de collabs y propuestas más las suyas, con calendario),
            la biblioteca de Contenidos, Cobros, Perfil y tarifas, Biblia y Ajustes.
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/workspace/propuestas", label: "Propuestas", text: "El tablero con datos de ejemplo." },
          { href: "/workspace/collabs/vero", label: "Ficha de collab", text: "Maison Vero · Colección otoño." },
          { href: "/revisar/rv-vero-reel-v1", label: "Revisión de la marca", text: "Lo que ve la marca con el enlace." },
          { href: "/ds/influencer/componentes", label: "Componentes", text: "Las piezas de operar." },
        ]}
      />
    </DocPage>
  )
}
